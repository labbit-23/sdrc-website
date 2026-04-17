"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack
} from "@chakra-ui/react";
import { FiFilter, FiHome, FiShoppingCart } from "react-icons/fi";
import { BsBuilding, BsCartCheck, BsCartPlus } from "react-icons/bs";
import healthPackagesData from "@/data/health-packages.json";
import CartRequestPanel from "@/components/cart/CartRequestPanel";
import { readCartItems, saveCartItems } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { sortPackages, sortPackageVariants } from "@/lib/packageOrdering";

const PAGE_SIZE = 20;
const QUERY_DEBOUNCE_MS = 350;
const CLIENT_CACHE_TTL_MS = 20 * 1000;
const MOST_BOOKED_CACHE_KEY = "sdrc_tests_default_cache_v1";
const MOST_BOOKED_CACHE_TTL_MS = 15 * 60 * 1000;
const clientCache = new Map();
const defaultPagination = { page: 1, limit: PAGE_SIZE, total: 0, has_next: false };

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0.00";
  return `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function normalizeTestName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\bapolipoproteins\b/g, "apolipoprotein")
    .replace(/\bapo\b/g, "apolipoprotein")
    .replace(/\ba[\s-]?1\b/g, "a1")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function testTokens(value) {
  return normalizeTestName(value)
    .split(" ")
    .map((t) => (t.endsWith("s") && t.length > 3 ? t.slice(0, -1) : t))
    .filter(Boolean);
}

function isLikelySameTest(a, b) {
  const na = normalizeTestName(a);
  const nb = normalizeTestName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const [shorter, longer] = na.length < nb.length ? [na, nb] : [nb, na];
  if (shorter.length >= 8 && longer.includes(shorter)) return true;

  const ta = new Set(testTokens(a));
  const tb = new Set(testTokens(b));
  if (!ta.size || !tb.size) return false;
  let overlap = 0;
  ta.forEach((tok) => {
    if (tb.has(tok)) overlap += 1;
  });
  const score = overlap / Math.max(ta.size, tb.size);
  return score >= 0.55;
}

function flattenPackageVariants(data) {
  const out = [];
  const packages = sortPackages(data?.packages || []);

  packages.forEach((pkg, pIdx) => {
    sortPackageVariants(pkg.variants || []).forEach((variant, vIdx) => {
      out.push({
        id: `pkg_${pIdx}_${vIdx}`,
        item_type: "package",
        package_name: pkg.name,
        name: variant.name || pkg.name,
        short_description: variant.description || pkg.description || "",
        price: variant.price ?? null,
        parameters: variant.parameters ?? null,
        tests_count: Array.isArray(variant.tests) ? variant.tests.length : null,
        home_collection: typeof variant.home_collection === "boolean" ? variant.home_collection : true,
        is_most_booked: Boolean(variant.is_most_booked),
        tests: Array.isArray(variant.tests) ? variant.tests : []
      });
    });
  });

  return out;
}

function prioritizeSearchResults(items, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return items;

  const score = (item) => {
    let s = 0;
    const name = String(item?.name || "").toLowerCase();
    const code = String(item?.internal_code || "").toLowerCase();

    if (item?.is_most_popular) s += 1000;
    if (item?.is_most_common) s += 500;

    if (name === q) s += 300;
    else if (name.startsWith(q)) s += 220;
    else if (name.includes(q)) s += 120;

    if (code === q) s += 140;
    else if (code.startsWith(q)) s += 80;
    else if (code.includes(q)) s += 40;

    return s;
  };

  return [...items].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

export default function TestsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [mostCommonOnly, setMostCommonOnly] = useState(false);
  const [mostPopularOnly, setMostPopularOnly] = useState(true);
  const [homeCollectionFilter, setHomeCollectionFilter] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);

  const [cartItems, setCartItems] = useState([]);
  const [cartWarning, setCartWarning] = useState("");

  const [openPackageIncludesId, setOpenPackageIncludesId] = useState(null);
  const [showDepartmentFilters, setShowDepartmentFilters] = useState(false);
  const [showFullTestsMobile, setShowFullTestsMobile] = useState(false);

  const packageVariants = useMemo(() => flattenPackageVariants(healthPackagesData), []);
  const panelExpansionMap = useMemo(() => {
    const map = new Map();
    (healthPackagesData.globalNotes || []).forEach((note) => {
      const m = String(note).match(/^\*([^:]+):\s*(.+)$/);
      if (!m) return;
      const panel = m[1].trim();
      const expanded = m[2]
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      map.set(panel.toLowerCase(), expanded);
    });
    return map;
  }, []);
  const packageTestsById = useMemo(() => {
    const map = new Map();
    packageVariants.forEach((pkg) => {
      const tests = Array.isArray(pkg.tests) ? pkg.tests : [];
      const expanded = [];
      tests.forEach((testName) => {
        expanded.push(testName);
        const bare = String(testName).replace(/\*+$/g, "").trim().toLowerCase();
        const extra = panelExpansionMap.get(bare);
        if (extra?.length) expanded.push(...extra);
      });
      map.set(pkg.id, expanded);
    });
    return map;
  }, [packageVariants, panelExpansionMap]);
  const filteredPackageVariants = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const base = homeCollectionFilter ? packageVariants.filter((pkg) => pkg.home_collection) : packageVariants;
    if (!q) return base;
    return base.filter((pkg) => {
      const blob = [
        pkg.package_name,
        pkg.name,
        pkg.short_description,
        ...(Array.isArray(pkg.tests) ? pkg.tests : [])
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [packageVariants, homeCollectionFilter, debouncedQuery]);
  const groupedPackageVariants = useMemo(() => {
    const groups = new Map();
    filteredPackageVariants.forEach((pkg) => {
      if (!groups.has(pkg.package_name)) groups.set(pkg.package_name, []);
      groups.get(pkg.package_name).push(pkg);
    });
    return Array.from(groups.entries()).map(([packageName, variants]) => ({
      packageName,
      variants
    }));
  }, [filteredPackageVariants]);
  const mobileFeaturedPackages = useMemo(() => {
    const byName = new Map();
    filteredPackageVariants.forEach((pkg) => {
      if (!byName.has(pkg.package_name)) byName.set(pkg.package_name, []);
      byName.get(pkg.package_name).push(pkg);
    });

    return Array.from(byName.values())
      .map((variants) => variants.find((v) => v.home_collection) || variants[0])
      .filter(Boolean);
  }, [filteredPackageVariants]);
  const mobilePopularTests = useMemo(() => {
    const source = items.filter((test) => test.is_most_popular);
    return (source.length > 0 ? source : items).slice(0, 16);
  }, [items]);
  const isSearching = debouncedQuery.trim().length > 0;
  const mobileTestSectionTitle = isSearching ? "Matching Tests" : "Most Booked Tests";
  const mobileTestCards = useMemo(() => {
    if (isSearching) return items.slice(0, 16);
    return mobilePopularTests;
  }, [isSearching, items, mobilePopularTests]);
  const categoryFilters = useMemo(() => ["All", ...categories], [categories]);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0),
    [cartItems]
  );
  const itemCount = cartItems.length;
  const hasCenterOnlyItems = cartItems.some((item) => item.home_collection === false);

  function showCartWarning(message) {
    setCartWarning(message);
    window.setTimeout(() => setCartWarning(""), 3200);
  }

  useEffect(() => {
    const parsed = readCartItems();
    setCartItems(
      parsed.map((row) => ({
        id: row.id,
        item_type: row.item_type === "package" ? "package" : "test",
        name: row.name,
        internal_code: row.internal_code || null,
        department: row.department || null,
        package_name: row.package_name || null,
        price: row.price,
        home_collection: row.home_collection ?? null,
        tests_count: row.tests_count ?? null
      }))
    );
  }, []);

  useEffect(() => {
    trackEvent("page_view", { page_type: "tests" }, { pagePath: "/tests" });
  }, []);

  useEffect(() => {
    saveCartItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), QUERY_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) return;
    trackEvent("search_tests", { query: debouncedQuery, page }, { pagePath: "/tests" });
  }, [debouncedQuery, page]);

  useEffect(() => {
    const onDocClick = (event) => {
      const target = event.target;
      if (target?.closest?.("[data-includes-trigger]") || target?.closest?.("[data-includes-popup]")) return;
      setOpenPackageIncludesId(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let controller;

    async function run() {
      setLoading(true);
      setError("");
      try {
        const isDefaultMostBookedView =
          page === 1 &&
          !debouncedQuery &&
          activeCategory === "All" &&
          !mostCommonOnly &&
          mostPopularOnly &&
          !homeCollectionFilter;

        if (isDefaultMostBookedView && typeof window !== "undefined") {
          const raw = window.localStorage.getItem(MOST_BOOKED_CACHE_KEY);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Date.now() - Number(parsed?.ts || 0) < MOST_BOOKED_CACHE_TTL_MS) {
                if (!cancelled && parsed?.data) {
                  setItems(prioritizeSearchResults(parsed.data.items || [], debouncedQuery));
                  setCategories(parsed.data.filters?.categories || []);
                  setPagination(parsed.data.pagination || defaultPagination);
                  setLoading(false);
                  return;
                }
              }
            } catch {}
          }
        }

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          most_common: String(mostCommonOnly),
          most_popular: String(mostPopularOnly),
          home_collection: String(homeCollectionFilter)
        });

        if (debouncedQuery) params.set("q", debouncedQuery);
        if (activeCategory !== "All") params.set("category", activeCategory);

        const key = params.toString();
        const cached = clientCache.get(key);
        if (cached && Date.now() - cached.ts < CLIENT_CACHE_TTL_MS) {
          if (!cancelled) {
            setItems(prioritizeSearchResults(cached.data.items || [], debouncedQuery));
            setCategories(cached.data.filters?.categories || []);
            setPagination(cached.data.pagination || defaultPagination);
            setLoading(false);
          }
          return;
        }

        controller = new AbortController();
        const res = await fetch(`/api/tests?${key}`, { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch tests");
        if (cancelled) return;

        setItems(prioritizeSearchResults(data.items || [], debouncedQuery));
        setCategories(data.filters?.categories || []);
        setPagination(data.pagination || defaultPagination);
        clientCache.set(key, { ts: Date.now(), data });

        if (
          page === 1 &&
          !debouncedQuery &&
          activeCategory === "All" &&
          !mostCommonOnly &&
          mostPopularOnly &&
          !homeCollectionFilter &&
          typeof window !== "undefined"
        ) {
          try {
            window.localStorage.setItem(MOST_BOOKED_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
          } catch {}
        }
      } catch (e) {
        if (e?.name === "AbortError") return;
        if (!cancelled) {
          setError(e.message || "Unable to load tests right now.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      if (controller) controller.abort();
    };
  }, [page, debouncedQuery, activeCategory, mostCommonOnly, mostPopularOnly, homeCollectionFilter]);

  function isInCart(id) {
    return cartItems.some((item) => item.id === id);
  }

  function addTestToCart(test) {
    trackEvent("add_to_cart", { item_type: "test", test_id: test.id, name: test.name }, { pagePath: "/tests" });
    const overlapPackages = cartItems.filter((item) => {
      if (item.item_type !== "package") return false;
      const tests = packageTestsById.get(item.id) || [];
      return tests.some((pkgTest) => isLikelySameTest(pkgTest, test.name));
    });
    if (overlapPackages.length > 0) {
      const top = overlapPackages
        .slice(0, 2)
        .map((item) => (item.package_name ? `${item.package_name} (${item.name})` : item.name))
        .join(", ");
      const suffix = overlapPackages.length > 2 ? ` +${overlapPackages.length - 2} more` : "";
      showCartWarning(`Heads up: ${test.name} is likely already included in ${top}${suffix}.`);
    }
    setCartItems((prev) => {
      if (prev.some((item) => item.id === test.id)) return prev;
      return [
        ...prev,
        {
          id: test.id,
          item_type: "test",
          name: test.name,
          internal_code: test.internal_code || null,
          department: test.department || null,
          package_name: null,
          price: test.price,
          home_collection: test.home_collection ?? null,
          tests_count: null
        }
      ];
    });
  }

  function addPackageToCart(pkg) {
    trackEvent("add_to_cart", { item_type: "package", package_id: pkg.id, name: pkg.name }, { pagePath: "/tests" });
    const overlapTests = cartItems.filter((item) => {
      if (item.item_type !== "test") return false;
      return (pkg.tests || []).some((pkgTest) => isLikelySameTest(pkgTest, item.name));
    });
    if (overlapTests.length > 0) {
      const top = overlapTests
        .slice(0, 3)
        .map((item) => item.name)
        .join(", ");
      const suffix = overlapTests.length > 3 ? ` +${overlapTests.length - 3} more` : "";
      showCartWarning(`Heads up: ${pkg.name} already includes ${top}${suffix}.`);
    }
    setCartItems((prev) => {
      if (prev.some((item) => item.id === pkg.id)) return prev;
      return [
        ...prev,
        {
          id: pkg.id,
          item_type: "package",
          name: pkg.name,
          internal_code: null,
          department: null,
          package_name: pkg.package_name || null,
          price: pkg.price,
          home_collection: pkg.home_collection ?? null,
          tests_count: pkg.tests_count
        }
      ];
    });
  }

  function removeFromCart(itemId) {
    trackEvent("remove_from_cart", { item_id: itemId }, { pagePath: "/tests" });
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function clearCart() {
    trackEvent("clear_cart", { item_count: cartItems.length }, { pagePath: "/tests" });
    setCartItems([]);
  }

  function clearSearchAndFilters() {
    setPage(1);
    setQuery("");
    setActiveCategory("All");
    setMostCommonOnly(false);
    setMostPopularOnly(true);
    setHomeCollectionFilter(false);
  }

  function scrollToCart() {
    document.getElementById("cart-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr" }} gap={6} alignItems="center">
            <Box>
              <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" className="hero-title">
                Test Selection
                <Box as="span" color="teal.700" className="hero-subline">
                  Search, Compare, Add to Cart
                </Box>
              </Heading>
              <Text mt={3} color="gray.700" fontSize={{ base: "md", md: "lg" }}>
                Find tests and packages, then send one request to the lab team.
              </Text>
              <HStack mt={4} maxW={{ base: "100%", md: "720px" }}>
                <Input
                  bg="white"
                  placeholder="Search tests or packages (TSH, HbA1c, Lipid...)"
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPage(1);
                    setQuery(value);
                    if (value.trim().length > 0) {
                      setActiveCategory("All");
                      setMostCommonOnly(false);
                      setMostPopularOnly(false);
                      setHomeCollectionFilter(false);
                    }
                  }}
                />
                <Button size="sm" variant="outline" onClick={clearSearchAndFilters}>
                  Clear
                </Button>
              </HStack>
              <HStack mt={3} spacing={3} flexWrap="wrap">
                <HStack spacing={2}>
                  <Box
                    as="input"
                    type="checkbox"
                    checked={mostCommonOnly}
                    onChange={(e) => {
                      setPage(1);
                      setMostCommonOnly(e.target.checked);
                    }}
                    style={{ accentColor: "#008f82" }}
                  />
                  <Text fontSize="xs" fontWeight="600">Common tests</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box
                    as="input"
                    type="checkbox"
                    checked={mostPopularOnly}
                    onChange={(e) => {
                      setPage(1);
                      setMostPopularOnly(e.target.checked);
                    }}
                    style={{ accentColor: "#008f82" }}
                  />
                  <Text fontSize="xs" fontWeight="600">Most booked</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box
                    as="input"
                    type="checkbox"
                    checked={homeCollectionFilter}
                    onChange={(e) => {
                      setPage(1);
                      setHomeCollectionFilter(e.target.checked);
                    }}
                    style={{ accentColor: "#008f82" }}
                  />
                  <Text fontSize="xs" fontWeight="600">Home collection</Text>
                </HStack>
              </HStack>
            </Box>
          </Grid>
        </Container>
      </Box>

      <IconButton
        position="fixed"
        right={{ base: 4, md: 6 }}
        bottom={{ base: 5, md: 6 }}
        zIndex={30}
        size="lg"
        variant="outline"
        bg="white"
        color="teal.700"
        borderColor="teal.300"
        aria-label="Open cart"
        onClick={scrollToCart}
      >
        <FiShoppingCart />
      </IconButton>

      {itemCount > 0 ? (
        <Box
          position="fixed"
          right={{ base: 3, md: 5 }}
          bottom={{ base: 3, md: 4 }}
          zIndex={31}
          minW="20px"
          h="20px"
          px="4px"
          borderRadius="full"
          bg="orange.500"
          color="white"
          fontSize="11px"
          fontWeight="700"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          {itemCount}
        </Box>
      ) : null}

      <Container maxW="1200px" py={10}>
        <VStack display={{ base: "flex", lg: "none" }} align="stretch" gap={4} mb={6}>
          <Box className="soft-card no-hover-lift" p={4}>
            <HStack justify="space-between" mb={3}>
              <Heading size="sm">{isSearching ? "Matching Checkups" : "Popular Checkups"}</Heading>
              <Button as="a" href="/packages" size="xs" variant="outline">Compare</Button>
            </HStack>
            {mobileFeaturedPackages.length === 0 ? (
              <Box borderWidth="1px" borderStyle="dashed" borderColor="gray.200" borderRadius="lg" p={3}>
                <Text fontSize="sm" color="gray.500">No packages match this search.</Text>
              </Box>
            ) : (
              <HStack gap={3} overflowX="auto" pb={1} align="stretch">
                {mobileFeaturedPackages.map((pkg) => {
                const added = isInCart(pkg.id);
                return (
                  <Box key={pkg.id} minW="220px" borderWidth="1px" borderColor="gray.100" borderRadius="xl" p={3} bg="white">
                    <Text fontSize="sm" fontWeight="700" color="gray.800" lineHeight="1.2" noOfLines={2}>{pkg.package_name}</Text>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>{pkg.name}</Text>
                    <Text fontSize="xs" color="gray.600" mt={1} noOfLines={2}>{pkg.short_description}</Text>
                    <HStack spacing={1.5} mt={2} flexWrap="wrap">
                      {pkg.is_most_booked ? (
                        <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="orange.50" color="orange.700" title="Most booked package variant">
                          <Text fontSize="10px" fontWeight="700">Most booked</Text>
                        </HStack>
                      ) : null}
                      {pkg.home_collection ? (
                        <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="green.50" color="green.700" title="Home sample collection available for this package">
                          <FiHome size={11} />
                          <Text fontSize="10px" fontWeight="700">Home</Text>
                        </HStack>
                      ) : (
                        <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="gray.100" color="gray.700" title="Center visit required">
                          <BsBuilding size={11} />
                          <Text fontSize="10px" fontWeight="700">Center</Text>
                        </HStack>
                      )}
                    </HStack>
                    <HStack justify="space-between" mt={3}>
                      <Text fontSize="sm" fontWeight="800" color="orange.500">{formatInr(pkg.price)}</Text>
                      <IconButton
                        size="sm"
                        variant={added ? "solid" : "outline"}
                        bg={added ? "teal.600" : "white"}
                        color={added ? "white" : "teal.700"}
                        borderColor={added ? "teal.600" : "teal.300"}
                        aria-label={added ? "Added to cart" : "Add package to cart"}
                        onClick={() => addPackageToCart(pkg)}
                        disabled={added}
                      >
                        {added ? <BsCartCheck /> : <BsCartPlus />}
                      </IconButton>
                    </HStack>
                  </Box>
                );
                })}
              </HStack>
            )}
          </Box>

          <Box className="soft-card no-hover-lift" p={4}>
            <Heading size="sm" mb={3}>{mobileTestSectionTitle}</Heading>
            {loading ? (
              <HStack py={6} justify="center">
                <Spinner color="teal.500" />
                <Text fontSize="sm" color="gray.600">Loading tests...</Text>
              </HStack>
            ) : (
              <HStack gap={3} overflowX="auto" pb={1} align="stretch">
                {mobileTestCards.map((test) => {
                  const added = isInCart(test.id);
                  return (
                    <Box key={test.id} minW="230px" borderWidth="1px" borderColor="gray.100" borderRadius="xl" p={3} bg="white">
                      <Text fontSize="xs" color="gray.500">
                        {test.internal_code || "No code"} {test.department ? `• ${test.department}` : ""}
                      </Text>
                      <Text fontWeight="800" color="gray.800" lineHeight="1.2" mt={0.5} noOfLines={2}>{test.name}</Text>
                      <HStack justify="space-between" mt={3}>
                        <Text fontSize="sm" fontWeight="800" color="orange.500">{test.price == null ? "Price N/A" : formatInr(test.price)}</Text>
                        <IconButton
                          size="sm"
                          variant={added ? "solid" : "outline"}
                          bg={added ? "teal.600" : "white"}
                          color={added ? "white" : "teal.700"}
                          borderColor={added ? "teal.600" : "teal.300"}
                          aria-label={added ? "Added to cart" : "Add test to cart"}
                          onClick={() => addTestToCart(test)}
                          disabled={added}
                        >
                          {added ? <BsCartCheck /> : <BsCartPlus />}
                        </IconButton>
                      </HStack>
                    </Box>
                  );
                })}
              </HStack>
            )}
            <Button mt={3} size="sm" variant="outline" onClick={() => setShowFullTestsMobile((v) => !v)}>
              {showFullTestsMobile ? "Hide full list" : "See full test list"}
            </Button>
          </Box>

          {showFullTestsMobile ? (
            <Box className="soft-card no-hover-lift" p={4}>
              <Heading size="sm" mb={3}>All Matching Tests</Heading>
              <VStack align="stretch" gap={2}>
                {items.map((test) => {
                  const added = isInCart(test.id);
                  return (
                    <Box key={test.id} p={2.5} borderWidth="1px" borderColor="gray.100" borderRadius="md">
                      <HStack justify="space-between" gap={2} align="start">
                        <Box>
                          <Text fontSize="xs" color="gray.500">{test.internal_code || "No code"} {test.department ? `• ${test.department}` : ""}</Text>
                          <Text fontSize="sm" fontWeight="700" color="gray.800">{test.name}</Text>
                        </Box>
                        <VStack align="end" gap={1}>
                          <Text fontSize="xs" fontWeight="700" color="orange.500">{test.price == null ? "Price N/A" : formatInr(test.price)}</Text>
                          <IconButton
                            size="xs"
                            variant={added ? "solid" : "outline"}
                            bg={added ? "teal.600" : "white"}
                            color={added ? "white" : "teal.700"}
                            borderColor={added ? "teal.600" : "teal.300"}
                            aria-label={added ? "Added to cart" : "Add test to cart"}
                            onClick={() => addTestToCart(test)}
                            disabled={added}
                          >
                            {added ? <BsCartCheck /> : <BsCartPlus />}
                          </IconButton>
                        </VStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
              <HStack justify="space-between" mt={4}>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={loading || page <= 1}>
                  Previous
                </Button>
                <Text fontSize="xs" color="gray.600">
                  Page {page} of {Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)))}
                </Text>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={loading || !pagination.has_next}>
                  Next
                </Button>
              </HStack>
            </Box>
          ) : null}
        </VStack>

        <Grid display={{ base: "none", lg: "grid" }} templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} alignItems="start">
          <Box className="soft-card no-hover-lift" p={5}>
            <Heading size="md" mb={2}>
              Find Your Tests
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Search by test name or internal code.
            </Text>

            <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap={3} alignItems="center">
              <Text fontSize="sm" color="gray.600">
                Use the hero search above to find tests instantly.
              </Text>

              <Button size="sm" variant="outline" onClick={() => setShowDepartmentFilters((v) => !v)} leftIcon={<FiFilter />}>
                {showDepartmentFilters ? "Hide Departments" : "Show Departments"}
              </Button>
            </Grid>

            <HStack mt={3} spacing={2} flexWrap="wrap">
              <HStack spacing={2}>
                <Box
                  as="input"
                  type="checkbox"
                  checked={mostCommonOnly}
                  onChange={(e) => {
                    setPage(1);
                    setMostCommonOnly(e.target.checked);
                  }}
                  style={{ accentColor: "#008f82" }}
                />
                <Text fontSize="xs" fontWeight="600">
                  Common tests
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Box
                  as="input"
                  type="checkbox"
                  checked={mostPopularOnly}
                  onChange={(e) => {
                    setPage(1);
                    setMostPopularOnly(e.target.checked);
                  }}
                  style={{ accentColor: "#008f82" }}
                />
                <Text fontSize="xs" fontWeight="600">
                  Most booked
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Box
                  as="input"
                  type="checkbox"
                  checked={homeCollectionFilter}
                  onChange={(e) => {
                    setPage(1);
                    setHomeCollectionFilter(e.target.checked);
                  }}
                  style={{ accentColor: "#008f82" }}
                />
                <Text fontSize="xs" fontWeight="600">
                  Home collection only
                </Text>
              </HStack>

              {showDepartmentFilters ? (
                categoryFilters.map((cat) => (
                  <Button
                    key={cat}
                    size="xs"
                    variant={activeCategory === cat ? "solid" : "outline"}
                    onClick={() => {
                      setPage(1);
                      setQuery("");
                      setActiveCategory(cat);
                    }}
                  >
                    {cat}
                  </Button>
                ))
              ) : null}
            </HStack>

            <Box mt={4}>
              {loading ? (
                <HStack py={8} justify="center">
                  <Spinner color="teal.500" />
                  <Text fontSize="sm" color="gray.600">Loading tests...</Text>
                </HStack>
              ) : error ? (
                <Box p={4} borderWidth="1px" borderColor="red.100" borderRadius="md" bg="red.50">
                  <Text fontSize="sm" color="red.700">{error}</Text>
                </Box>
              ) : items.length === 0 ? (
                <Box p={4} borderWidth="1px" borderStyle="dashed" borderColor="gray.300" borderRadius="md" bg="gray.50">
                  <Text fontSize="sm" color="gray.600">No tests found.</Text>
                </Box>
              ) : (
                <VStack align="stretch" gap={3}>
                  {items.map((test) => {
                    const added = isInCart(test.id);
                    return (
                      <Box key={test.id} p={3} borderWidth="1px" borderColor="gray.100" borderRadius="md">
                        <HStack justify="space-between" align="start" gap={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.500">
                              {test.internal_code || "No code"} {test.department ? `• ${test.department}` : ""}
                            </Text>
                            <Text fontWeight="700" color="gray.800">{test.name}</Text>
                            {test.sample_type || test.tat_hours ? (
                              <Text fontSize="xs" color="gray.600" mt={1}>
                                {test.sample_type ? `Sample: ${test.sample_type}` : ""}
                                {test.sample_type && test.tat_hours ? " • " : ""}
                                {test.tat_hours ? `TAT: ${test.tat_hours}h` : ""}
                              </Text>
                            ) : null}
                            <HStack spacing={2} mt={1} flexWrap="wrap">
                              {test.is_most_common ? (
                                <Text fontSize="10px" px={2} py={0.5} borderRadius="full" bg="teal.50" color="teal.700" fontWeight="700">
                                  Most Common
                                </Text>
                              ) : null}
                              {test.is_most_popular ? (
                                <Text fontSize="10px" px={2} py={0.5} borderRadius="full" bg="teal.100" color="teal.700" fontWeight="700">
                                  Most booked
                                </Text>
                              ) : null}
                              {test.home_collection === true ? (
                                <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="green.50" color="green.700" title="Home sample collection available">
                                  <FiHome size={11} />
                                  <Text fontSize="10px" fontWeight="700">Home Collection</Text>
                                </HStack>
                              ) : (
                                <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="gray.100" color="gray.700" title="Center visit required">
                                  <BsBuilding size={11} />
                                  <Text fontSize="10px" fontWeight="700">Center Visit</Text>
                                </HStack>
                              )}
                            </HStack>
                          </Box>
                          <VStack align="end" gap={2}>
                            <Text fontSize="md" fontWeight="700" color="orange.500" whiteSpace="nowrap">{test.price == null ? "Price N/A" : formatInr(test.price)}</Text>
                            <IconButton
                              size="sm"
                              variant={added ? "solid" : "outline"}
                              bg={added ? "teal.600" : "white"}
                              color={added ? "white" : "teal.700"}
                              borderColor={added ? "teal.600" : "teal.300"}
                              aria-label={added ? "Added to cart" : "Add test to cart"}
                              onClick={() => addTestToCart(test)}
                              disabled={added}
                            >
                              {added ? <BsCartCheck /> : <BsCartPlus />}
                            </IconButton>
                          </VStack>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}

              <HStack justify="space-between" mt={5}>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={loading || page <= 1}>
                  Previous
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Page {page} of {Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)))}
                </Text>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={loading || !pagination.has_next}>
                  Next
                </Button>
              </HStack>
            </Box>
          </Box>

          <Box className="soft-card no-hover-lift" p={5}>
            <Heading size="md" mb={2}>Find Your Packages</Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>Add package variants to cart and review included tests.</Text>

            <VStack align="stretch" gap={4}>
              {groupedPackageVariants.map((group) => (
                <Box key={group.packageName}>
                  <Text fontWeight="700" color="gray.800" mb={2}>{group.packageName}</Text>
                  <VStack align="stretch" gap={3}>
                    {group.variants.map((pkg) => {
                      const added = isInCart(pkg.id);
                      const showIncludes = openPackageIncludesId === pkg.id;
                      return (
                        <Box key={pkg.id} p={3} borderWidth="1px" borderColor="gray.100" borderRadius="md" position="relative">
                          <HStack justify="space-between" align="start" gap={3}>
                            <Box>
                              <Text fontSize="xs" color="gray.500">{pkg.name}</Text>
                              {pkg.short_description ? (
                                <Text fontSize="xs" color="gray.600" mt={1} noOfLines={2}>
                                  {pkg.short_description}
                                </Text>
                              ) : null}
                              <HStack spacing={2} mt={1} flexWrap="wrap">
                                {pkg.parameters != null ? (
                                  <Text fontSize="10px" px={2} py={0.5} borderRadius="full" bg="gray.100" color="gray.700" fontWeight="700">
                                    {pkg.parameters} parameters
                                  </Text>
                                ) : null}

                                <Box
                                  as="button"
                                  type="button"
                                  fontSize="11px"
                                  fontWeight="700"
                                  color="teal.700"
                                  textDecoration="underline"
                                  data-includes-trigger
                                  onClick={() => setOpenPackageIncludesId((v) => (v === pkg.id ? null : pkg.id))}
                                >
                                  Includes {pkg.tests_count ?? 0} tests
                                </Box>

                                {pkg.home_collection ? (
                                  <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="green.50" color="green.700" title="Home sample collection available for this package">
                                    <Box w="6px" h="6px" borderRadius="full" bg="green.500" />
                                    <FiHome size={11} />
                                    <Text fontSize="10px" fontWeight="700">Home Collection</Text>
                                  </HStack>
                                ) : (
                                  <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="gray.100" color="gray.700" title="Center visit required">
                                    <BsBuilding size={11} />
                                    <Text fontSize="10px" fontWeight="700">Center Visit</Text>
                                  </HStack>
                                )}
                                {pkg.is_most_booked ? (
                                  <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="orange.50" color="orange.700" title="Most booked package variant">
                                    <Text fontSize="10px" fontWeight="700">Most booked</Text>
                                  </HStack>
                                ) : null}
                              </HStack>
                            </Box>
                            <VStack align="end" gap={2}>
                              <Text fontSize="md" fontWeight="700" color="orange.500" whiteSpace="nowrap">{formatInr(pkg.price)}</Text>
                              <IconButton
                                size="sm"
                                variant={added ? "solid" : "outline"}
                                bg={added ? "teal.600" : "white"}
                                color={added ? "white" : "teal.700"}
                                borderColor={added ? "teal.600" : "teal.300"}
                                aria-label={added ? "Added to cart" : "Add package to cart"}
                                onClick={() => addPackageToCart(pkg)}
                                disabled={added}
                              >
                                {added ? <BsCartCheck /> : <BsCartPlus />}
                              </IconButton>
                            </VStack>
                          </HStack>

                          {showIncludes ? (
                            <Box
                              data-includes-popup
                              position="absolute"
                              zIndex={8}
                              right={3}
                              top="68px"
                              w={{ base: "calc(100% - 24px)", md: "320px" }}
                              maxH="220px"
                              overflowY="auto"
                              bg="white"
                              borderWidth="1px"
                              borderColor="gray.200"
                              borderRadius="md"
                              p={3}
                              boxShadow="lg"
                            >
                              <Text fontSize="xs" color="gray.500" mb={1} fontWeight="700">Included tests</Text>
                              {pkg.tests.map((test) => (
                                <Text key={test} fontSize="xs" color="gray.700" lineHeight="1.35">• {test}</Text>
                              ))}
                            </Box>
                          ) : null}
                        </Box>
                      );
                    })}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </Grid>

        <Box id="cart-section" mt={8} className="soft-card no-hover-lift" p={5}>
          <HStack justify="space-between" mb={2}>
            <IconButton size="sm" variant="outline" aria-label="Cart">
              <FiShoppingCart />
            </IconButton>
          </HStack>
          <Text fontSize="sm" color="gray.600" mb={4}>Selected tests and packages for booking request.</Text>

          <CartRequestPanel
            cartItems={cartItems}
            subtotal={subtotal}
            hasCenterOnlyItems={hasCenterOnlyItems}
            source="/tests page"
            onRequestSuccess={clearCart}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
          />
        </Box>
      </Container>

      {cartWarning ? (
        <Box
          position="fixed"
          bottom={{ base: 3, md: 5 }}
          left="50%"
          transform="translateX(-50%)"
          zIndex={50}
          px={4}
          py={2.5}
          borderRadius="md"
          bg="orange.50"
          borderWidth="1px"
          borderColor="orange.200"
          color="orange.800"
          boxShadow="md"
          maxW={{ base: "92vw", md: "620px" }}
        >
          <Text fontSize="sm" fontWeight="600">{cartWarning}</Text>
        </Box>
      ) : null}
    </>
  );
}
