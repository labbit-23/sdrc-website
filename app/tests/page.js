"use client";

import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiHome, FiSearch, FiShoppingCart, FiX } from "react-icons/fi";
import { BsBuilding, BsCartCheck, BsCartPlus } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { TwContainer } from "@/components/site/tw-layout";
import defaultHealthPackagesData from "@/data/health-packages.json";
import CartRequestPanel from "@/components/cart/CartRequestPanel";
import { readCartItems, saveCartItems } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { sortPackages, sortPackageVariants } from "@/lib/packageOrdering";
import { cn } from "@/lib/utils";

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
        tests: Array.isArray(variant.tests) ? variant.tests : [],
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

function IconButton({ className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--sdrc-teal)] bg-white text-[var(--sdrc-teal-deep)] transition hover:bg-[var(--sdrc-teal-soft)] disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return <span className="inline-block size-5 animate-spin rounded-full border-2 border-[var(--sdrc-teal)] border-r-transparent" />;
}

function VisitBadge({ homeCollection, compact = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold",
        compact ? "text-[10px]" : "text-[11px]",
        homeCollection ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-700"
      )}
      title={homeCollection ? "Home sample collection available" : "Center visit required"}
    >
      {homeCollection ? <FiHome size={11} /> : <BsBuilding size={11} />}
      {compact ? (homeCollection ? "Home" : "Center") : homeCollection ? "Home Collection" : "Center Visit"}
    </span>
  );
}

function SmallBadge({ children, tone = "teal" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold",
        tone === "orange"
          ? "bg-orange-50 text-orange-700"
          : tone === "slate"
            ? "bg-slate-100 text-slate-700"
            : "bg-[var(--sdrc-teal-soft)] text-[var(--sdrc-teal-deep)]"
      )}
    >
      {children}
    </span>
  );
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

  const [healthPackagesData, setHealthPackagesData] = useState(defaultHealthPackagesData);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/health-packages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.packages)) {
          setHealthPackagesData(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const packageVariants = useMemo(() => flattenPackageVariants(healthPackagesData), [healthPackagesData]);
  const panelExpansionMap = useMemo(() => {
    const map = new Map();
    (healthPackagesData.globalNotes || []).forEach((note) => {
      const m = String(note).match(/^\*([^:]+):\s*(.+)$/);
      if (!m) return;
      const panel = m[1].trim();
      const expanded = m[2].split(",").map((x) => x.trim()).filter(Boolean);
      map.set(panel.toLowerCase(), expanded);
    });
    return map;
  }, [healthPackagesData]);
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
      const blob = [pkg.package_name, pkg.name, pkg.short_description, ...(Array.isArray(pkg.tests) ? pkg.tests : [])]
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
    return Array.from(groups.entries()).map(([packageName, variants]) => ({ packageName, variants }));
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

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0), [cartItems]);
  const itemCount = cartItems.length;
  const hasCenterOnlyItems = cartItems.some((item) => item.home_collection === false);

  function showCartWarning(message) {
    setCartWarning(message);
    window.setTimeout(() => setCartWarning(""), 3200);
  }

  useEffect(() => {
    const parsed = readCartItems();
    setCartItems(parsed.map((row) => ({
      id: row.id,
      item_type: row.item_type === "package" ? "package" : "test",
      name: row.name,
      internal_code: row.internal_code || null,
      department: row.department || null,
      package_name: row.package_name || null,
      price: row.price,
      home_collection: row.home_collection ?? null,
      tests_count: row.tests_count ?? null,
    })));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      setDebouncedQuery(q);
      setPage(1);
      setMostPopularOnly(false);
      setActiveCategory("All");
      setMostCommonOnly(false);
    }
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
          home_collection: String(homeCollectionFilter),
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

        if (isDefaultMostBookedView && typeof window !== "undefined") {
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
    setCartItems((prev) => {
      if (prev.some((item) => item.id === test.id)) return prev;
      const overlapPackages = prev.filter((item) => {
        if (item.item_type !== "package") return false;
        const tests = packageTestsById.get(item.id) || [];
        return tests.some((pkgTest) => isLikelySameTest(pkgTest, test.name));
      });
      if (overlapPackages.length > 0) {
        const top = overlapPackages.slice(0, 2).map((item) => (item.package_name ? `${item.package_name} (${item.name})` : item.name)).join(", ");
        const suffix = overlapPackages.length > 2 ? ` +${overlapPackages.length - 2} more` : "";
        showCartWarning(`Heads up: ${test.name} is likely already included in ${top}${suffix}.`);
      }
      return [...prev, {
        id: test.id,
        item_type: "test",
        name: test.name,
        internal_code: test.internal_code || null,
        department: test.department || null,
        package_name: null,
        price: test.price,
        home_collection: test.home_collection ?? null,
        tests_count: null,
      }];
    });
  }

  function addPackageToCart(pkg) {
    trackEvent("add_to_cart", { item_type: "package", package_id: pkg.id, name: pkg.name }, { pagePath: "/tests" });
    setCartItems((prev) => {
      if (prev.some((item) => item.id === pkg.id)) return prev;
      const overlapTests = prev.filter((item) => {
        if (item.item_type !== "test") return false;
        return (pkg.tests || []).some((pkgTest) => isLikelySameTest(pkgTest, item.name));
      });
      if (overlapTests.length > 0) {
        const top = overlapTests.slice(0, 3).map((item) => item.name).join(", ");
        const suffix = overlapTests.length > 3 ? ` +${overlapTests.length - 3} more` : "";
        showCartWarning(`Heads up: ${pkg.name} already includes ${top}${suffix}.`);
      }
      return [...prev, {
        id: pkg.id,
        item_type: "package",
        name: pkg.name,
        internal_code: null,
        department: null,
        package_name: pkg.package_name || null,
        price: pkg.price,
        home_collection: pkg.home_collection ?? null,
        tests_count: pkg.tests_count,
      }];
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

  const searchInput = (
    <Input
      placeholder="Search tests or packages (TSH, HbA1c, Lipid...)"
      value={query}
      inputMode="search"
      enterKeyHint="search"
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
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          setDebouncedQuery(query.trim());
        }
      }}
      className="border-teal-200 ring-2 ring-teal-100/80 focus:border-teal-400 focus:ring-teal-300"
    />
  );

  return (
    <>
      <section className="brochure-bg functional-hero-cover py-10 md:py-14">
        <TwContainer>
          <h1 className="hero-title text-slate-800">
            Test Selection
            <span className="hero-subline text-[var(--sdrc-teal-deep)]">
              Search, Compare, <span className="text-[var(--sdrc-orange)]">Add to Cart</span>
            </span>
          </h1>
          <p className="mt-3 text-base text-slate-700 md:text-lg">
            Find tests and packages, then send one request to the lab team.
          </p>
          <div className="mt-4 flex max-w-[720px] gap-2">
            {searchInput}
            <span className="hidden md:block">
              <Button
                size="sm"
                variant="outline"
                className="px-3"
                onClick={query ? clearSearchAndFilters : () => setDebouncedQuery(query.trim())}
                aria-label={query ? "Clear search" : "Search"}
              >
                {query ? <FiX /> : <FiSearch />}
              </Button>
            </span>
            <span className="md:hidden">
              <Button
                size="sm"
                variant="outline"
                className="px-3"
                onClick={() => setDebouncedQuery(query.trim())}
                aria-label="Search"
              >
                <FiSearch />
              </Button>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              ["Common tests", mostCommonOnly, setMostCommonOnly],
              ["Most booked", mostPopularOnly, setMostPopularOnly],
              ["Home collection", homeCollectionFilter, setHomeCollectionFilter],
            ].map(([label, checked, setter]) => (
              <label key={label} className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    setPage(1);
                    setter(e.target.checked);
                  }}
                  style={{ accentColor: "#008f82" }}
                />
                {label}
              </label>
            ))}
          </div>
        </TwContainer>
      </section>

      <IconButton
        className="fixed bottom-5 right-4 z-30 size-11 shadow-lg md:bottom-6 md:right-6"
        aria-label="Open cart"
        onClick={scrollToCart}
      >
        <FiShoppingCart />
      </IconButton>
      {itemCount > 0 ? (
        <span className="pointer-events-none fixed bottom-3 right-3 z-[31] inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--sdrc-orange)] px-1 text-[11px] font-bold text-white md:bottom-4 md:right-5">
          {itemCount}
        </span>
      ) : null}

      <TwContainer className="py-10">
        <div className="mb-6 flex flex-col gap-4 lg:hidden">
          <Card interactive={false} className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{isSearching ? "Matching Checkups" : "Popular Checkups"}</h2>
              <Button as="a" href="/packages" size="xs" variant="outline">Compare</Button>
            </div>
            {mobileFeaturedPackages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-3">
                <p className="text-sm text-slate-500">No packages match this search.</p>
              </div>
            ) : (
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                {mobileFeaturedPackages.map((pkg) => {
                  const added = isInCart(pkg.id);
                  return (
                    <div key={pkg.id} className="min-w-[220px] rounded-xl border border-slate-100 bg-white p-3">
                      <p className="line-clamp-2 text-sm font-bold leading-tight text-slate-800">{pkg.package_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{pkg.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{pkg.short_description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {pkg.is_most_booked ? <SmallBadge tone="orange">Most booked</SmallBadge> : null}
                        <VisitBadge homeCollection={pkg.home_collection} compact />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-extrabold text-[var(--sdrc-orange)]">{formatInr(pkg.price)}</p>
                        <IconButton
                          className={cn(added && "border-[var(--sdrc-teal-600)] bg-[var(--sdrc-teal-600)] text-white")}
                          aria-label={added ? "Added to cart" : "Add package to cart"}
                          onClick={() => addPackageToCart(pkg)}
                          disabled={added}
                        >
                          {added ? <BsCartCheck /> : <BsCartPlus />}
                        </IconButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card interactive={false} className="p-4">
            <h2 className="mb-3 text-lg font-bold">{mobileTestSectionTitle}</h2>
            {loading ? (
              <div className="flex justify-center gap-2 py-6">
                <Spinner />
                <p className="text-sm text-slate-600">Loading tests...</p>
              </div>
            ) : (
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                {mobileTestCards.map((test) => {
                  const added = isInCart(test.id);
                  return (
                    <div key={test.id} className="min-w-[230px] rounded-xl border border-slate-100 bg-white p-3">
                      <p className="text-xs text-slate-500">{test.internal_code || "No code"} {test.department ? `• ${test.department}` : ""}</p>
                      <p className="mt-0.5 line-clamp-2 font-extrabold leading-tight text-slate-800">{test.name}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-extrabold text-[var(--sdrc-orange)]">{test.price == null ? "Price N/A" : formatInr(test.price)}</p>
                        <IconButton
                          className={cn(added && "border-[var(--sdrc-teal-600)] bg-[var(--sdrc-teal-600)] text-white")}
                          aria-label={added ? "Added to cart" : "Add test to cart"}
                          onClick={() => addTestToCart(test)}
                          disabled={added}
                        >
                          {added ? <BsCartCheck /> : <BsCartPlus />}
                        </IconButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Button className="mt-3" size="sm" variant="outline" onClick={() => setShowFullTestsMobile((v) => !v)}>
              {showFullTestsMobile ? "Hide full list" : "See full test list"}
            </Button>
          </Card>

          {showFullTestsMobile ? (
            <Card interactive={false} className="p-4">
              <h2 className="mb-3 text-lg font-bold">All Matching Tests</h2>
              <div className="flex flex-col gap-2">
                {items.map((test) => {
                  const added = isInCart(test.id);
                  return (
                    <div key={test.id} className="rounded-md border border-slate-100 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500">{test.internal_code || "No code"} {test.department ? `• ${test.department}` : ""}</p>
                          <p className="text-sm font-bold text-slate-800">{test.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="whitespace-nowrap text-xs font-bold text-[var(--sdrc-orange)]">{test.price == null ? "Price N/A" : formatInr(test.price)}</p>
                          <IconButton
                            className={cn("size-8", added && "border-[var(--sdrc-teal-600)] bg-[var(--sdrc-teal-600)] text-white")}
                            aria-label={added ? "Added to cart" : "Add test to cart"}
                            onClick={() => addTestToCart(test)}
                            disabled={added}
                          >
                            {added ? <BsCartCheck /> : <BsCartPlus />}
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <PaginationControls page={page} pagination={pagination} loading={loading} setPage={setPage} />
            </Card>
          ) : null}
        </div>

        <div className="hidden grid-cols-2 items-start gap-6 lg:grid">
          <Card interactive={false} className="p-5">
            <div className="mb-4">
              <h2 className="mb-2 text-xl font-bold">Find Your Tests</h2>
              <p className="text-sm text-slate-600">Search by test name or internal code.</p>
            </div>

            <div className="grid items-center gap-3 md:grid-cols-[1fr_auto]">
              <p className="text-sm text-slate-600">Use the hero search above to find tests instantly.</p>
              <Button size="sm" variant="outline" onClick={() => setShowDepartmentFilters((v) => !v)} leftIcon={<FiFilter />}>
                {showDepartmentFilters ? "Hide Departments" : "Show Departments"}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["Common tests", mostCommonOnly, setMostCommonOnly],
                ["Most booked", mostPopularOnly, setMostPopularOnly],
                ["Home collection only", homeCollectionFilter, setHomeCollectionFilter],
              ].map(([label, checked, setter]) => (
                <label key={label} className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setPage(1);
                      setter(e.target.checked);
                    }}
                    style={{ accentColor: "#008f82" }}
                  />
                  {label}
                </label>
              ))}

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
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="flex justify-center gap-2 py-8">
                  <Spinner />
                  <p className="text-sm text-slate-600">Loading tests...</p>
                </div>
              ) : error ? (
                <div className="rounded-md border border-red-100 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">No tests found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((test) => <TestRow key={test.id} test={test} added={isInCart(test.id)} addTestToCart={addTestToCart} />)}
                </div>
              )}

              <PaginationControls page={page} pagination={pagination} loading={loading} setPage={setPage} />
            </div>
          </Card>

          <Card interactive={false} className="p-5">
            <div className="mb-4">
              <h2 className="mb-2 text-xl font-bold">Find Your Packages</h2>
              <p className="text-sm text-slate-600">Add package variants to cart and review included tests.</p>
            </div>

            <div className="flex flex-col gap-4">
              {groupedPackageVariants.map((group) => (
                <div key={group.packageName}>
                  <p className="mb-2 font-bold text-slate-800">{group.packageName}</p>
                  <div className="flex flex-col gap-3">
                    {group.variants.map((pkg) => {
                      const added = isInCart(pkg.id);
                      const showIncludes = openPackageIncludesId === pkg.id;
                      return (
                        <PackageVariantRow
                          key={pkg.id}
                          pkg={pkg}
                          added={added}
                          showIncludes={showIncludes}
                          setOpenPackageIncludesId={setOpenPackageIncludesId}
                          addPackageToCart={addPackageToCart}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card id="cart-section" interactive={false} className="mt-8 p-5">
          <div className="mb-2 flex justify-between">
            <IconButton aria-label="Cart">
              <FiShoppingCart />
            </IconButton>
          </div>
          <p className="mb-4 text-sm text-slate-600">Selected tests and packages for booking request.</p>
          <CartRequestPanel
            cartItems={cartItems}
            subtotal={subtotal}
            hasCenterOnlyItems={hasCenterOnlyItems}
            source="/tests page"
            onRequestSuccess={clearCart}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
          />
        </Card>
      </TwContainer>

      {cartWarning ? (
        <div className="fixed bottom-3 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-md border border-orange-200 bg-orange-50 px-4 py-2.5 text-orange-800 shadow-md md:bottom-5 md:max-w-[620px]">
          <p className="text-sm font-semibold">{cartWarning}</p>
        </div>
      ) : null}
    </>
  );
}

function PaginationControls({ page, pagination, loading, setPage }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={loading || page <= 1}>
        Previous
      </Button>
      <p className="text-sm text-slate-600">
        Page {page} of {Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)))}
      </p>
      <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={loading || !pagination.has_next}>
        Next
      </Button>
    </div>
  );
}

function TestRow({ test, added, addTestToCart }) {
  return (
    <div className="rounded-md border border-slate-100 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{test.internal_code || "No code"} {test.department ? `• ${test.department}` : ""}</p>
          <p className="font-bold text-slate-800">{test.name}</p>
          {test.sample_type || test.tat_hours ? (
            <p className="mt-1 text-xs text-slate-600">
              {test.sample_type ? `Sample: ${test.sample_type}` : ""}
              {test.sample_type && test.tat_hours ? " • " : ""}
              {test.tat_hours ? `TAT: ${test.tat_hours}h` : ""}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2">
            {test.is_most_common ? <SmallBadge>Most Common</SmallBadge> : null}
            {test.is_most_popular ? <SmallBadge>Most booked</SmallBadge> : null}
            <VisitBadge homeCollection={test.home_collection === true} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-base font-bold text-[var(--sdrc-orange)]">{test.price == null ? "Price N/A" : formatInr(test.price)}</p>
          <IconButton
            className={cn(added && "border-[var(--sdrc-teal-600)] bg-[var(--sdrc-teal-600)] text-white")}
            aria-label={added ? "Added to cart" : "Add test to cart"}
            onClick={() => addTestToCart(test)}
            disabled={added}
          >
            {added ? <BsCartCheck /> : <BsCartPlus />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function PackageVariantRow({ pkg, added, showIncludes, setOpenPackageIncludesId, addPackageToCart }) {
  return (
    <div className="relative rounded-md border border-slate-100 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{pkg.name}</p>
          {pkg.short_description ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{pkg.short_description}</p> : null}
          <div className="mt-1 flex flex-wrap gap-2">
            {pkg.parameters != null ? <SmallBadge tone="slate">{pkg.parameters} parameters</SmallBadge> : null}
            <button
              type="button"
              className="text-[11px] font-bold text-[var(--sdrc-teal-deep)] underline"
              data-includes-trigger
              onClick={() => setOpenPackageIncludesId((v) => (v === pkg.id ? null : pkg.id))}
            >
              Includes {pkg.tests_count ?? 0} tests
            </button>
            <VisitBadge homeCollection={pkg.home_collection} />
            {pkg.is_most_booked ? <SmallBadge tone="orange">Most booked</SmallBadge> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-base font-bold text-[var(--sdrc-orange)]">{formatInr(pkg.price)}</p>
          <IconButton
            className={cn(added && "border-[var(--sdrc-teal-600)] bg-[var(--sdrc-teal-600)] text-white")}
            aria-label={added ? "Added to cart" : "Add package to cart"}
            onClick={() => addPackageToCart(pkg)}
            disabled={added}
          >
            {added ? <BsCartCheck /> : <BsCartPlus />}
          </IconButton>
        </div>
      </div>

      {showIncludes ? (
        <div
          data-includes-popup
          className="absolute left-3 right-3 top-[68px] z-[8] max-h-[220px] overflow-y-auto rounded-md border border-slate-200 bg-white p-3 shadow-lg md:left-auto md:w-80"
        >
          <p className="mb-1 text-xs font-bold text-slate-500">Included tests</p>
          {pkg.tests.map((test) => (
            <p key={test} className="text-xs leading-snug text-slate-700">• {test}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
