"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BsCartCheck, BsCartPlus } from "react-icons/bs";
import { FiHome, FiMapPin, FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, TwContainer } from "@/components/site/tw-layout";
import defaultPackagesData from "@/data/health-packages.json";
import { audienceFilters, extraCategoryIcons, packageGuidance } from "@/data/packageGuidance";
import { readCartItems, saveCartItems } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Group a variant's tests by body-system category, keeping the brochure-style icon per group.
function groupByCategory(tests, data) {
  const groups = new Map();
  (tests || []).forEach((test) => {
    const category = data.testCategoryMap?.[test] || "General Health";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(test);
  });
  return [...groups.entries()].map(([category, items]) => ({
    category,
    items,
    icon: data.categoryIconMap?.[category] || extraCategoryIcons[category] || "/assets/ads/icons/cbc.png",
  }));
}

function PackageCard({ pkg, guide, data, inCart, onAdd, centre = false }) {
  const homeVariants = pkg.variants.filter((v) => (centre ? !v.home_collection : v.home_collection));
  const [vIndex, setVIndex] = useState(0);
  const [openCategory, setOpenCategory] = useState(null);
  const variant = homeVariants[Math.min(vIndex, homeVariants.length - 1)];
  const groups = useMemo(() => groupByCategory(variant.tests, data), [variant, data]);
  const open = groups.find((g) => g.category === openCategory);
  const cartId = `pkg_${slugify(pkg.name)}_${slugify(variant.name)}`;
  const added = inCart.has(cartId);

  return (
    <Card accent="orange" className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.07em] text-[var(--sdrc-orange)]">{guide.tagline}</p>
          <h3 className="mt-1 text-lg font-bold leading-tight text-slate-800">{pkg.name}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--sdrc-teal-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--sdrc-teal-deep)]">
          {centre ? <FiMapPin /> : <FiHome />} {centre ? "Centre visit" : "Home"}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">{guide.forWho}</p>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-700">
        <FiUser className="shrink-0 text-[var(--sdrc-teal-deep)]" />
        <span>
          Recommended age: <strong className="text-slate-800">{guide.age}</strong>
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        <span className="font-semibold text-slate-700">Consider if: </span>
        {guide.history.join(" · ")}
      </p>

      {homeVariants.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Package variant">
          {homeVariants.map((v, i) => (
            <button
              key={v.name}
              type="button"
              role="tab"
              aria-selected={i === vIndex}
              onClick={() => { setVIndex(i); setOpenCategory(null); }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                i === vIndex
                  ? "border-[var(--sdrc-teal)] bg-[var(--sdrc-teal)] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[var(--sdrc-teal)]"
              )}
            >
              {v.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          {variant.parameters} parameters · tap a category to see the tests
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {groups.map((g) => {
            const active = g.category === openCategory;
            return (
              <button
                key={g.category}
                type="button"
                aria-expanded={active}
                onClick={() => {
                  setOpenCategory(active ? null : g.category);
                  if (!active) trackEvent("home_pkg_category_open", { package_name: pkg.name, variant_name: variant.name, category: g.category }, { pagePath: "/" });
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition",
                  active
                    ? "border-[var(--sdrc-teal)] bg-[var(--sdrc-teal-soft)]"
                    : "border-slate-200 bg-white hover:border-[var(--sdrc-teal)] hover:bg-[var(--sdrc-teal-soft)]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.icon} alt="" width={28} height={28} className="size-7 object-contain" />
                <span className="text-[10px] font-semibold leading-tight text-slate-700">{g.category}</span>
                <span className="text-[10px] text-slate-400">{g.items.length}</span>
              </button>
            );
          })}
        </div>

        {open ? (
          <div className="mt-2 rounded-xl border border-[#bfe7e2] bg-[var(--sdrc-teal-soft)]/50 p-3">
            <p className="text-xs font-bold text-[var(--sdrc-teal-deep)]">{open.category}</p>
            <ul className="mt-1.5 grid gap-1">
              {open.items.map((t) => (
                <li key={t} className="text-xs leading-[1.35] text-slate-700">• {t.replace(/\*$/, "")}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-black text-[var(--sdrc-teal-deep)]">{inr(variant.price)}</p>
          <Link href={guide.detailsHref || `/packages#${slugify(pkg.name)}`} className="text-xs font-bold text-[var(--sdrc-teal-deep)] underline">
            {guide.detailsLabel || "Full details"}
          </Link>
        </div>
        {added ? (
          <Button as={Link} href="/cart" size="md" variant="outline" className="mt-3 w-full" leftIcon={<BsCartCheck />}>
            In cart · View cart
          </Button>
        ) : (
          <Button size="md" variant="solid" className="mt-3 w-full" leftIcon={<BsCartPlus />} onClick={() => onAdd(pkg, variant, centre)}>
            Add to cart
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function HomePackages() {
  const [data, setData] = useState(defaultPackagesData);
  const [filter, setFilter] = useState("all");
  const [inCart, setInCart] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health-packages")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d && Array.isArray(d.packages)) setData({ ...defaultPackagesData, ...d }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setInCart(new Set(readCartItems().map((i) => i.id)));
  }, []);

  const cards = useMemo(
    () =>
      (data.packages || [])
        .flatMap((p) => {
          const out = [];
          if (packageGuidance[p.name] && (p.variants || []).some((v) => v.home_collection)) out.push({ pkg: p, guide: packageGuidance[p.name], centre: false });
          const cg = packageGuidance[`${p.name}|centre`];
          if (cg && (p.variants || []).some((v) => !v.home_collection)) out.push({ pkg: p, guide: cg, centre: true });
          return out;
        }),
    [data]
  );
  const visible = cards.filter((c) => filter === "all" || c.guide.audience.includes(filter));

  function addToCart(pkg, variant, centre = false) {
    const id = `pkg_${slugify(pkg.name)}_${slugify(variant.name)}`;
    const items = readCartItems();
    if (items.some((i) => i.id === id)) return;
    trackEvent("add_to_cart", { item_type: "package", package_name: pkg.name, variant_name: variant.name, price: variant.price }, { pagePath: "/" });
    const next = [
      ...items,
      {
        id,
        item_type: "package",
        name: variant.name ? `${pkg.name} - ${variant.name}` : pkg.name,
        internal_code: null,
        department: null,
        package_name: pkg.name,
        price: variant.price,
        home_collection: !centre,
        tests_count: Array.isArray(variant.tests) ? variant.tests.length : null,
      },
    ];
    saveCartItems(next);
    setInCart(new Set(next.map((i) => i.id)));
  }

  return (
    <section id="home-packages" className="py-10 md:py-14">
      <TwContainer>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Chip>Home sample collection</Chip>
            <h2 className="mt-3 text-2xl font-bold text-slate-800 md:text-3xl">Health packages, collected at your door</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              A trained phlebotomist visits at your chosen time. Reports reach you on WhatsApp and in the SDRC app. Pick by age or concern, and tap any category to see exactly which tests are inside.
            </p>
          </div>
          <Link href="/packages" className="text-sm font-bold text-[var(--sdrc-teal-deep)]">
            All packages incl. imaging & clinic visit →
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Choose by age or concern">
          {audienceFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                filter === f.id
                  ? "border-[var(--sdrc-teal-deep)] bg-[var(--sdrc-teal-deep)] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[var(--sdrc-teal)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ pkg, guide, centre }) => (
            <PackageCard key={`${pkg.name}|${centre ? "c" : "h"}`} pkg={pkg} guide={guide} data={data} inCart={inCart} onAdd={addToCart} centre={centre} />
          ))}
        </div>
        {!visible.length ? <p className="mt-6 text-sm text-slate-500">No home-collection package for this filter yet. See all packages.</p> : null}
        <p className="mt-4 text-xs text-slate-500">
          Guidance is general screening advice, not a diagnosis. Ask your doctor if you are unsure which package suits you.
        </p>
      </TwContainer>
    </section>
  );
}
