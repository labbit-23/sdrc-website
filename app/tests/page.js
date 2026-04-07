"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
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
import { FiFilter, FiHome, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { BsBuilding, BsCartCheck, BsCartPlus } from "react-icons/bs";
import healthPackagesData from "@/data/health-packages.json";
import CartRequestPanel from "@/components/cart/CartRequestPanel";
import { readCartItems, saveCartItems } from "@/lib/cart";
import { sortPackages, sortPackageVariants } from "@/lib/packageOrdering";

const PAGE_SIZE = 20;
const QUERY_DEBOUNCE_MS = 350;
const CLIENT_CACHE_TTL_MS = 20 * 1000;
const clientCache = new Map();
const defaultPagination = { page: 1, limit: PAGE_SIZE, total: 0, has_next: false };

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0.00";
  return `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        tests: Array.isArray(variant.tests) ? variant.tests : []
      });
    });
  });

  return out;
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

  const [openPackageIncludesId, setOpenPackageIncludesId] = useState(null);
  const [showDepartmentFilters, setShowDepartmentFilters] = useState(false);
  const [showFullTestsMobile, setShowFullTestsMobile] = useState(false);

  const packageVariants = useMemo(() => flattenPackageVariants(healthPackagesData), []);
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
      .filter(Boolean)
      .slice(0, 8);
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
    saveCartItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), QUERY_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

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
            setItems(cached.data.items || []);
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

        setItems(data.items || []);
        setCategories(data.filters?.categories || []);
        setPagination(data.pagination || defaultPagination);
        clientCache.set(key, { ts: Date.now(), data });
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
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function clearCart() {
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
              <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="16ch" className="hero-title">
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
            <Heading size="sm" mb={3}>Search Tests or Packages</Heading>
            <HStack>
              <Input
                bg="white"
                placeholder="Search tests (TSH, HbA1c, Lipid...)"
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
              <Button size="sm" variant="outline" onClick={clearSearchAndFilters}>Clear</Button>
            </HStack>
            <HStack mt={3} spacing={3} flexWrap="wrap">
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

          <Box className="soft-card no-hover-lift" p={4}>
            <HStack justify="space-between" mb={3}>
              <Heading size="sm">{isSearching ? "Matching Checkups" : "Popular Checkups"}</Heading>
              <Button as="a" href="/packages" size="xs" variant="outline">View all</Button>
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
                    <Text fontSize="xs" color="gray.500">{pkg.package_name}</Text>
                    <Text fontWeight="800" color="gray.800" lineHeight="1.2" mt={0.5} noOfLines={2}>{pkg.name}</Text>
                    <Text fontSize="xs" color="gray.600" mt={1} noOfLines={2}>{pkg.short_description}</Text>
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
                        isDisabled={added}
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
                          isDisabled={added}
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
                            isDisabled={added}
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
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={loading || page <= 1}>
                  Previous
                </Button>
                <Text fontSize="xs" color="gray.600">
                  Page {page} of {Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)))}
                </Text>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} isDisabled={loading || !pagination.has_next}>
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
                                  Most Popular
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
                              isDisabled={added}
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
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={loading || page <= 1}>
                  Previous
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Page {page} of {Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)))}
                </Text>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} isDisabled={loading || !pagination.has_next}>
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
                                _disabled={{ bg: "gray.100", color: "gray.500", opacity: 1 }}
                                aria-label={added ? "Added to cart" : "Add package to cart"}
                                onClick={() => addPackageToCart(pkg)}
                                isDisabled={added}
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
            <Heading size="md">Your Cart</Heading>
            <Text fontSize="xs" color="gray.600" fontWeight="700">{itemCount} item(s)</Text>
          </HStack>
          <Text fontSize="sm" color="gray.600" mb={4}>Selected tests and packages for booking request.</Text>

          {cartItems.length === 0 ? (
            <Box borderWidth="1px" borderStyle="dashed" borderColor="gray.300" borderRadius="md" p={4} bg="gray.50">
              <Text fontSize="sm" color="gray.500">No items selected yet.</Text>
            </Box>
          ) : (
            <VStack align="stretch" gap={2}>
              {cartItems.map((item) => (
                <Box key={item.id} borderWidth="1px" borderColor="gray.100" borderRadius="md" p={3}>
                  <HStack justify="space-between" align="start" gap={2} flexWrap="wrap">
                    <Box>
                      <HStack spacing={2} mb={1}>
                        <Badge colorPalette={item.item_type === "package" ? "orange" : "teal"} variant="subtle">
                          {item.item_type === "package" ? "Package" : "Test"}
                        </Badge>
                        {item.department ? <Text fontSize="xs" color="gray.500">{item.department}</Text> : null}
                        {item.home_collection === true ? (
                          <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="green.50" color="green.700" title="Home sample collection available">
                            <FiHome size={11} />
                            <Text fontSize="10px" fontWeight="700">Home</Text>
                          </HStack>
                        ) : item.home_collection === false ? (
                          <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="gray.100" color="gray.700" title="Center visit required">
                            <BsBuilding size={11} />
                            <Text fontSize="10px" fontWeight="700">Center</Text>
                          </HStack>
                        ) : null}
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">{item.name}</Text>
                      {item.internal_code ? <Text fontSize="xs" color="gray.500">{item.internal_code}</Text> : null}
                      {item.tests_count ? <Text fontSize="xs" color="gray.500">Includes {item.tests_count} tests</Text> : null}
                    </Box>
                    <VStack align={{ base: "start", md: "end" }} gap={0.5} minW="80px" ml={{ base: "0", md: "auto" }}>
                      <Text fontSize="10px" color="gray.500" fontWeight="700">INR</Text>
                      <Text fontSize="sm" fontWeight="700" color="orange.500">{Number(item.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                      <IconButton size="xs" variant="ghost" color="gray.500" aria-label="Remove item" onClick={() => removeFromCart(item.id)}>
                        <FiTrash2 />
                      </IconButton>
                    </VStack>
                  </HStack>
                </Box>
              ))}
              <Button size="xs" variant="outline" color="gray.700" borderColor="gray.300" alignSelf="flex-end" onClick={clearCart}>Clear cart</Button>
            </VStack>
          )}

          <CartRequestPanel
            cartItems={cartItems}
            subtotal={subtotal}
            hasCenterOnlyItems={hasCenterOnlyItems}
            source="/tests page"
          />
        </Box>
      </Container>
    </>
  );
}
