"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { FiDownload, FiHome, FiShare2, FiX } from "react-icons/fi";
import { BsBuilding, BsCartCheck, BsCartPlus } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { Chip, TwContainer } from "@/components/site/tw-layout";
import defaultPackagesData from "@/data/health-packages.json";
import { siteConfig } from "@/data/siteConfig";
import { readCartItems, saveCartItems } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { sortPackages, sortPackageVariants } from "@/lib/packageOrdering";
import { cn } from "@/lib/utils";

let html2CanvasLoader = null;

function getVariantKey(pkgName, variantName) {
  return String(pkgName) + "::" + String(variantName);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function variantShareUrl(pkgName) {
  return "/packages#" + slugify(pkgName);
}

function buildPackageEnquiryUrl(pkgName, variantName, price) {
  const message = [
    "New package enquiry from website",
    `Package: ${pkgName}`,
    `Variant: ${variantName}`,
    price != null ? `Price: INR ${Number(price).toLocaleString("en-IN")}` : null,
    "Source: /packages",
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${siteConfig.internalNotifyNumber}?text=${encodeURIComponent(message)}`;
}

function getVariantCaptureId(pkgName, variantName) {
  return `variant-capture-${slugify(pkgName)}-${slugify(variantName)}`;
}

function getApplicableNotesForTests(testNames, packagesData) {
  const notes = packagesData.globalNotes || [];
  const loweredTests = testNames.map((test) => String(test).toLowerCase());

  return notes.filter((note) => {
    const match = String(note).match(/^\*([^:]+):/);
    if (!match) return false;
    const key = match[1].trim().toLowerCase().replace(/\s+/g, " ");
    return loweredTests.some((test) => test.toLowerCase().includes(key));
  });
}

function IconButton({ as: Comp = "button", className, children, ...props }) {
  return (
    <Comp
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--sdrc-teal)] bg-white text-[var(--sdrc-teal-deep)] transition hover:bg-[var(--sdrc-teal-soft)] disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

function VisitBadge({ homeCollection }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        homeCollection ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-700"
      )}
      title={
        homeCollection
          ? "Home collection possible for this package."
          : "This package requires a centre visit."
      }
    >
      {homeCollection ? <FiHome size={11} /> : <BsBuilding size={11} />}
      {homeCollection ? "Home Collection" : "Center Visit"}
    </span>
  );
}

export default function PackagesExplorer() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const [activeVariant, setActiveVariant] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showAddLabel, setShowAddLabel] = useState(true);
  const [exportBusy, setExportBusy] = useState(false);
  const [cartIds, setCartIds] = useState(new Set());
  const [packagesData, setPackagesData] = useState(defaultPackagesData);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health-packages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.packages)) {
          setPackagesData(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setShowAddLabel(false), 4200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const ids = new Set(readCartItems().map((item) => item.id));
    setCartIds(ids);
  }, []);

  useEffect(() => {
    if (!search.trim()) return;
    trackEvent("search_packages", { query: search.trim() }, { pagePath: "/packages" });
  }, [search]);

  const filteredPackages = useMemo(() => {
    const q = search.trim().toLowerCase();
    const orderedPackages = sortPackages(packagesData.packages || []).map((pkg) => ({
      ...pkg,
      variants: sortPackageVariants(pkg.variants || []),
    }));
    if (q.length === 0) return orderedPackages;

    return orderedPackages
      .map((pkg) => {
        const variants = (pkg.variants || []).filter((v) => {
          const blob = [pkg.name, pkg.description, v.name, v.description, ...(v.tests || [])]
            .join(" ")
            .toLowerCase();
          return blob.includes(q);
        });
        return { ...pkg, variants };
      })
      .filter((pkg) => pkg.variants.length > 0);
  }, [search, packagesData]);

  const selectedVariants = useMemo(
    () => Object.keys(selected).map((key) => selected[key]).filter(Boolean),
    [selected]
  );

  const compareGrouped = useMemo(() => {
    const byCategory = new Map();

    selectedVariants.forEach((item) => {
      (item.tests || []).forEach((test) => {
        const category = packagesData.testCategoryMap[test] || "Others";
        if (!byCategory.has(category)) byCategory.set(category, new Set());
        byCategory.get(category).add(test);
      });
    });

    return Array.from(byCategory.entries())
      .map(([category, tests]) => ({
        category,
        tests: Array.from(tests).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [selectedVariants, packagesData]);

  const activeGrouped = useMemo(() => {
    if (!activeVariant) return [];
    const byCategory = new Map();
    (activeVariant.variant.tests || []).forEach((test) => {
      const category = packagesData.testCategoryMap[test] || "Others";
      if (!byCategory.has(category)) byCategory.set(category, []);
      byCategory.get(category).push(test);
    });
    return Array.from(byCategory.entries())
      .map(([category, tests]) => ({ category, tests }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [activeVariant, packagesData]);

  const compareAllTests = useMemo(
    () => compareGrouped.flatMap((group) => group.tests),
    [compareGrouped]
  );

  const activeNotes = useMemo(
    () => (activeVariant ? getApplicableNotesForTests(activeVariant.variant.tests || [], packagesData) : []),
    [activeVariant, packagesData]
  );

  const compareNotes = useMemo(
    () => getApplicableNotesForTests(compareAllTests, packagesData),
    [compareAllTests, packagesData]
  );

  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 1800);
  };

  const yieldAfterPaint = () => new Promise((resolve) => {
    window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });

  const addVariantToCart = (pkg, variant) => {
    trackEvent(
      "add_to_cart",
      { item_type: "package", package_name: pkg.name, variant_name: variant.name, price: variant.price },
      { pagePath: "/packages" }
    );
    const cartId = `pkg_${slugify(pkg.name)}_${slugify(variant.name)}`;
    const cartItems = readCartItems();
    if (cartItems.some((item) => item.id === cartId)) {
      showToast("Already in cart");
      return;
    }

    const next = [
      ...cartItems,
      {
        id: cartId,
        item_type: "package",
        name: variant.name ? `${pkg.name} - ${variant.name}` : pkg.name,
        internal_code: null,
        department: null,
        package_name: pkg.name,
        price: variant.price,
        home_collection: typeof variant.home_collection === "boolean" ? variant.home_collection : null,
        tests_count: Array.isArray(variant.tests) ? variant.tests.length : null,
      },
    ];

    saveCartItems(next);
    setCartIds(new Set(next.map((item) => item.id)));
    showToast("Added to cart");
  };

  const toggleCompare = (pkgName, variant) => {
    trackEvent("toggle_compare", { package_name: pkgName, variant_name: variant.name }, { pagePath: "/packages" });
    const key = getVariantKey(pkgName, variant.name);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else if (Object.keys(next).length < 3) {
        next[key] = {
          key,
          pkgName,
          variantName: variant.name,
          price: variant.price,
          parameters: variant.parameters,
          tests: variant.tests || [],
        };
      } else {
        showToast("You can compare up to 3 variants");
      }
      return next;
    });
  };

  async function ensureHtml2Canvas() {
    if (typeof window === "undefined") return null;
    if (window.html2canvas) return window.html2canvas;
    if (!html2CanvasLoader) {
      html2CanvasLoader = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        script.async = true;
        script.onload = () => resolve(window.html2canvas || null);
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
      });
    }
    return html2CanvasLoader;
  }

  async function nodeToCanvas(node) {
    const html2canvas = await ensureHtml2Canvas();
    if (!html2canvas || !node) return null;
    return html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 2.8,
      useCORS: true,
      width: node.scrollWidth,
      height: node.scrollHeight,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });
  }

  async function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.96));
  }

  async function shareCanvas(canvas, fileName, text) {
    const blob = await canvasToBlob(canvas);
    if (!blob) return false;

    const file = new File([blob], fileName, { type: "image/jpeg" });
    const canShareFiles = typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare({ files: [file] });
    if (canShareFiles) {
      await navigator.share({ files: [file], text });
      return true;
    }
    return false;
  }

  async function copyToClipboard(text) {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  }

  async function downloadCanvas(canvas, fileName) {
    const blob = await canvasToBlob(canvas);
    if (!blob) return false;
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.download = fileName;
    link.href = url;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawRoundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  async function drawImageSafe(ctx, src, x, y, width, height) {
    if (!src) return false;
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, x, y, width, height);
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function renderPackageSummaryCanvas(pkgName, variant, description) {
    if (typeof window === "undefined") return null;
    const grouped = (() => {
      const byCategory = new Map();
      (variant.tests || []).forEach((test) => {
        const category = packagesData.testCategoryMap[test] || "Others";
        if (!byCategory.has(category)) byCategory.set(category, []);
        byCategory.get(category).push(test);
      });
      return Array.from(byCategory.entries())
        .map(([category, tests]) => ({ category, tests }))
        .sort((a, b) => a.category.localeCompare(b.category));
    })();

    const width = 1080;
    const margin = 56;
    const colGap = 34;
    const colCount = 2;
    const colWidth = (width - (margin * 2) - colGap) / colCount;
    const rowHeight = 24;
    const groupHeaderHeight = 28;
    const desc = description || variant.description || "";

    const probe = document.createElement("canvas").getContext("2d");
    probe.font = "24px Arial";
    const descLines = wrapCanvasText(probe, desc, width - margin * 2).slice(0, 3);
    let contentHeight = 172 + descLines.length * 24;
    grouped.forEach((group) => {
      contentHeight += groupHeaderHeight + Math.ceil(group.tests.length / colCount) * rowHeight + 12;
    });
    contentHeight += 70;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = Math.max(640, contentHeight);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#008f82";
    ctx.fillRect(0, 0, canvas.width, 8);
    await drawImageSafe(ctx, "/assets/sdrc-logo.png", margin, 32, 138, 42);

    ctx.fillStyle = "#64748b";
    ctx.font = "700 18px Arial";
    ctx.fillText(pkgName, margin, 102);
    ctx.fillStyle = "#0f172a";
    ctx.font = "800 32px Arial";
    ctx.fillText(variant.name || pkgName, margin, 140);

    const priceText = `INR ${Number(variant.price).toLocaleString("en-IN")}`;
    ctx.font = "800 28px Arial";
    const priceWidth = ctx.measureText(priceText).width + 34;
    drawRoundRect(ctx, width - margin - priceWidth, 104, priceWidth, 48, 24);
    ctx.fillStyle = "#fff5f0";
    ctx.fill();
    ctx.fillStyle = "#f26939";
    ctx.fillText(priceText, width - margin - priceWidth + 17, 136);

    ctx.font = "700 17px Arial";
    const paramText = `${variant.parameters || (variant.tests || []).length} parameters`;
    const paramWidth = ctx.measureText(paramText).width + 28;
    drawRoundRect(ctx, width - margin - priceWidth - paramWidth - 12, 110, paramWidth, 34, 17);
    ctx.fillStyle = "#e6f6f4";
    ctx.fill();
    ctx.fillStyle = "#00695f";
    ctx.fillText(paramText, width - margin - priceWidth - paramWidth - 12 + 14, 133);

    let y = 178;
    ctx.fillStyle = "#475569";
    ctx.font = "20px Arial";
    descLines.forEach((line) => {
      ctx.fillText(line, margin, y);
      y += 24;
    });
    y += 20;

    grouped.forEach((group) => {
      ctx.fillStyle = "#00695f";
      ctx.font = "800 19px Arial";
      ctx.fillText(group.category, margin, y);
      y += groupHeaderHeight;
      ctx.fillStyle = "#1e293b";
      ctx.font = "19px Arial";
      group.tests.forEach((test, index) => {
        const col = index % colCount;
        const row = Math.floor(index / colCount);
        const x = margin + col * (colWidth + colGap);
        const lineY = y + row * rowHeight;
        ctx.fillText(`• ${test}`, x, lineY);
      });
      y += Math.ceil(group.tests.length / colCount) * rowHeight + 14;
    });

    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - 48);
    ctx.lineTo(canvas.width - margin, canvas.height - 48);
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.font = "16px Arial";
    ctx.fillText("SDRC Diagnostics · Jade Arcade, Paradise, Secunderabad · sdrc.in", margin, canvas.height - 22);
    return canvas;
  }

  const handleShare = async (pkgName, variant) => {
    if (exportBusy) return;
    const pageLink = `${window.location.origin}${variantShareUrl(pkgName)}`;
    const shareText = `${pkgName} - ${variant.name}\n${pageLink}`;
    const captureId = getVariantCaptureId(pkgName, variant.name);
    const node = document.getElementById("package-detail-capture") || document.getElementById(captureId);

    try {
      setExportBusy(true);
      showToast("Preparing package image...");
      await yieldAfterPaint();
      const canvas = (await renderPackageSummaryCanvas(pkgName, variant, activeVariant?.description)) || (await capturePackageCanvas()) || (await nodeToCanvas(node));
      if (canvas && await shareCanvas(canvas, `${slugify(pkgName)}-${slugify(variant.name)}.jpg`, shareText)) return;

      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `${pkgName} - ${variant.name}`, text: shareText, url: pageLink });
        return;
      }

      if (canvas && await downloadCanvas(canvas, `${slugify(pkgName)}-${slugify(variant.name)}.jpg`)) {
        showToast("Package image downloaded. Link copied separately if needed");
      }
      if (await copyToClipboard(pageLink)) {
        showToast("Image downloaded. Package link copied");
      } else {
        showToast("Image downloaded. Please share with /packages link");
      }
    } catch (err) {
      if (err && (err.name === "AbortError" || /cancel/i.test(String(err.message || "")))) return;
      showToast("Unable to share right now");
    } finally {
      setExportBusy(false);
    }
  };

  const handleDownload = async (pkgName, variant) => {
    if (exportBusy) return;
    const captureId = getVariantCaptureId(pkgName, variant.name);
    const node = document.getElementById("package-detail-capture") || document.getElementById(captureId);
    try {
      setExportBusy(true);
      showToast("Preparing package image...");
      await yieldAfterPaint();
      const canvas = (await renderPackageSummaryCanvas(pkgName, variant, activeVariant?.description)) || (await capturePackageCanvas()) || (await nodeToCanvas(node));
      if (!canvas) {
        showToast("Image export unavailable");
        return;
      }
      const downloaded = await downloadCanvas(canvas, `${slugify(pkgName)}-${slugify(variant.name)}.jpg`);
      showToast(downloaded ? "Package image downloaded" : "Image export unavailable");
    } catch (err) {
      showToast("Image export unavailable");
    } finally {
      setExportBusy(false);
    }
  };

  async function capturePackageCanvas() {
    const html2canvas = await ensureHtml2Canvas();
    if (!html2canvas) return null;
    const source = document.getElementById("package-detail-capture");
    if (!source) return null;

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "24px";
    wrapper.style.width = `${Math.min(760, Math.max(390, source.scrollWidth + 24))}px`;

    const clone = source.cloneNode(true);
    clone.style.maxHeight = "none";
    clone.style.height = "auto";
    clone.style.overflow = "visible";
    clone.style.width = "100%";
    clone.querySelectorAll('[data-export-hide="true"]').forEach((el) => el.remove());
    clone.querySelectorAll("img").forEach((img) => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.objectFit = "contain";
      img.style.display = "block";
    });
    clone.querySelectorAll("p, span, h3").forEach((el) => {
      const style = window.getComputedStyle(el);
      const current = Number.parseFloat(style.fontSize || "0");
      if (!Number.isNaN(current) && current < 13) el.style.fontSize = "13px";
      el.style.lineHeight = style.lineHeight === "normal" ? "1.45" : style.lineHeight;
    });
    clone.querySelectorAll('[data-export-content="package-tests"] section').forEach((el) => {
      el.style.breakInside = "avoid";
      el.style.marginBottom = "10px";
    });
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const width = wrapper.scrollWidth;
      const height = wrapper.scrollHeight;
      const maxDim = 14000;
      const scale = Math.min(3, maxDim / Math.max(width, height));
      return await html2canvas(wrapper, {
        backgroundColor: "#ffffff",
        scale: Math.max(1, scale),
        useCORS: true,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
      });
    } finally {
      wrapper.remove();
    }
  }

  async function captureCompareCanvas() {
    const html2canvas = await ensureHtml2Canvas();
    if (!html2canvas) {
      showToast("Image export unavailable");
      return null;
    }
    const source = document.getElementById("compare-capture");
    if (!source) return null;

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "28px";
    wrapper.style.width = `${Math.max(source.scrollWidth, 980)}px`;

    const clone = source.cloneNode(true);
    clone.style.overflow = "visible";
    clone.style.maxHeight = "none";
    clone.style.width = "100%";
    clone.querySelectorAll("th, td, div, span, p").forEach((el) => {
      const current = Number.parseFloat(window.getComputedStyle(el).fontSize || "0");
      if (!Number.isNaN(current) && current < 16) el.style.fontSize = "16px";
    });
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const width = wrapper.scrollWidth;
      const height = wrapper.scrollHeight;
      const maxDim = 14000;
      const scale = Math.min(3, maxDim / Math.max(width, height));

      return await html2canvas(wrapper, {
        backgroundColor: "#ffffff",
        scale: Math.max(1, scale),
        useCORS: true,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
      });
    } finally {
      wrapper.remove();
    }
  }

  const downloadCompareImage = async () => {
    if (exportBusy) return;
    try {
      setExportBusy(true);
      showToast("Preparing comparison image...");
      await yieldAfterPaint();
      const canvas = await captureCompareCanvas();
      if (!canvas) return;
      await downloadCanvas(canvas, "sdrc-package-comparison.jpg");
      showToast("Comparison downloaded as JPG");
    } finally {
      setExportBusy(false);
    }
  };

  const shareCompareImage = async () => {
    if (exportBusy) return;
    try {
      setExportBusy(true);
      showToast("Preparing comparison image...");
      await yieldAfterPaint();
      const canvas = await captureCompareCanvas();
      if (!canvas) return;
      const packagesLink = `${window.location.origin}/packages`;
      const shared = await shareCanvas(canvas, "sdrc-package-comparison.jpg", `Compare SDRC packages\n${packagesLink}`);
      if (!shared) {
        await downloadCanvas(canvas, "sdrc-package-comparison.jpg");
        if (await copyToClipboard(packagesLink)) {
          showToast("Image downloaded. Packages link copied");
        } else {
          showToast("Image downloaded. Please share with /packages link");
        }
      }
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <TwContainer className="py-10">
      <Script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js" strategy="afterInteractive" />

      <div className="flex flex-col gap-6">
        <Card accent="orange" className="rise-in p-6" interactive={false}>
          <Chip tone="orange" className="mb-3.5">Health Packages</Chip>
          <h2 className="mb-1 text-2xl font-bold leading-tight text-slate-900">Master Health Check Packages</h2>
          <p className="mb-4 text-sm text-slate-600">Browse, filter and compare package variants by included tests.</p>
          <Input
            placeholder="Search package / test — try: cardiac, vitamin, thyroid…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-orange-200 ring-2 ring-orange-100/80 focus:border-orange-400 focus:ring-orange-300"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {filteredPackages.map((pkg) => (
              <Link
                key={pkg.name}
                href={`#${slugify(pkg.name)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-[var(--sdrc-teal)] hover:bg-[var(--sdrc-teal-soft)] hover:text-[var(--sdrc-teal-deep)]"
              >
                {pkg.name}
              </Link>
            ))}
          </div>
        </Card>

        {filteredPackages.map((pkg) => (
          <section key={pkg.name} id={slugify(pkg.name)} className="rise-in scroll-mt-[110px]">
            <Chip tone="orange" className="mb-2.5">{pkg.name}</Chip>
            <h2 className="mb-1 text-xl font-bold leading-tight text-slate-900">{pkg.name}</h2>
            <p className="mb-4 max-w-4xl text-sm leading-6 text-slate-600">{pkg.description}</p>

            <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pkg.variants.map((variant) => {
                const key = getVariantKey(pkg.name, variant.name);
                const checked = Boolean(selected[key]);
                const cartId = `pkg_${slugify(pkg.name)}_${slugify(variant.name)}`;
                const added = cartIds.has(cartId);
                const description = variant.description || pkg.description;
                const keyInclusions = Array.isArray(variant.key_inclusions) && variant.key_inclusions.length > 0
                  ? variant.key_inclusions
                  : (variant.tests || []).slice(0, 4);
                const testsCount = (variant.tests || []).length;
                const remainingTestsCount = Math.max(0, testsCount - keyInclusions.length);

                return (
                  <Card
                    key={key}
                    id={getVariantCaptureId(pkg.name, variant.name)}
                    interactive={false}
                    className="relative flex h-full min-h-[376px] flex-col overflow-hidden p-4"
                  >
                    <div className="absolute inset-x-0 top-0 h-[5px] rounded-t-xl bg-[linear-gradient(90deg,#008f82_0%,#f46c3b_52%,#008f82_100%)] shadow-[0_1px_0_rgba(0,0,0,.06)]" />
                    <div className="absolute right-3 top-3 opacity-90">
                      <Image src="/assets/sdrc-logo.png" alt="SDRC" width={62} height={18} />
                    </div>

                    <div className="min-h-[92px] pr-20">
                      <h3 className="text-base font-bold leading-tight text-[var(--sdrc-teal-deep)]">{variant.name}</h3>
                      <p className="mt-1 line-clamp-3 text-sm leading-[1.65] text-slate-600">{description}</p>
                    </div>

                    <div className="mt-3 flex min-h-8 items-center justify-between gap-3 border-y border-slate-100 py-2">
                      <p className="font-bold text-[var(--sdrc-orange)]">INR {Number(variant.price).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-slate-500">{variant.parameters} parameters</p>
                    </div>
                    <div className="mt-2 flex">
                      <VisitBadge homeCollection={variant.home_collection} />
                    </div>

                    <div className="mt-3 rounded-md border border-[#cfeeea] border-l-[3px] border-l-[#2db5a5] bg-[var(--sdrc-teal-soft)] p-3">
                      <p className="mb-1 text-xs font-bold text-[var(--sdrc-teal-deep)]">Key inclusions</p>
                      <div className="space-y-1.5">
                        {keyInclusions.map((test) => (
                          <p key={test} className="flex gap-1.5 text-xs leading-[1.55] text-slate-700">
                            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-[var(--sdrc-teal)]" />
                            <span>{test}</span>
                          </p>
                        ))}
                      </div>
                      {testsCount > 0 ? (
                        <button
                          type="button"
                          className="mt-2 inline-flex min-h-7 items-center rounded-full border border-[var(--sdrc-teal)] bg-white px-2.5 text-xs font-bold leading-none text-[var(--sdrc-teal-deep)] transition hover:bg-[var(--sdrc-teal-soft)]"
                          onClick={() => {
                            trackEvent("view_package_details", { package_name: pkg.name, variant_name: variant.name }, { pagePath: "/packages" });
                            setActiveVariant({ pkgName: pkg.name, variant, description });
                          }}
                        >
                          {remainingTestsCount > 0
                            ? `+ ${remainingTestsCount} more tests`
                            : "View included tests"}
                        </button>
                      ) : null}
                      {variant.sample_report_url ? (
                        <Link href={variant.sample_report_url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs font-bold text-[var(--sdrc-teal-deep)] underline">
                          View Sample DEXA Report
                        </Link>
                      ) : null}
                    </div>

                    <div className="mt-auto">
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <label
                          htmlFor={`compare-${getVariantKey(pkg.name, variant.name)}`}
                          className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-600"
                          title="Select to compare this package variant"
                        >
                          <input
                            id={`compare-${getVariantKey(pkg.name, variant.name)}`}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCompare(pkg.name, variant)}
                            style={{ accentColor: "#008f82" }}
                          />
                          Compare
                        </label>
                        {showAddLabel && !added ? (
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label="Add package to cart"
                            title="Add to Cart"
                            className="h-9 min-w-[118px] px-3 [&>svg]:size-4"
                            onClick={() => addVariantToCart(pkg, variant)}
                            leftIcon={<BsCartPlus aria-hidden="true" />}
                          >
                            Add to Cart
                          </Button>
                        ) : (
                          <IconButton
                            as="button"
                            type="button"
                            aria-label={added ? "Package already in cart" : "Add package to cart"}
                            title={added ? "Already in cart" : "Add to Cart"}
                            className={cn(
                              "border-[var(--sdrc-teal)] text-[var(--sdrc-teal-deep)] [&>svg]:size-4",
                              added && "border-[var(--sdrc-teal-600)] bg-[var(--sdrc-teal-600)] text-white"
                            )}
                            onClick={() => addVariantToCart(pkg, variant)}
                            disabled={added}
                          >
                            {added ? <BsCartCheck aria-hidden="true" /> : <BsCartPlus aria-hidden="true" />}
                          </IconButton>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button
                          as={Link}
                          href={`/tests?q=${encodeURIComponent(variant.name)}`}
                          size="sm"
                          className="flex-1 bg-[linear-gradient(135deg,#008f82,#00a896)] font-bold text-white"
                          onClick={() =>
                            trackEvent(
                              "package_book_click",
                              { package_name: pkg.name, variant_name: variant.name, price: variant.price },
                              { pagePath: "/packages" }
                            )
                          }
                        >
                          Book Online
                        </Button>
                        <IconButton
                          as={Link}
                          href={buildPackageEnquiryUrl(pkg.name, variant.name, variant.price)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Chat on WhatsApp"
                          title="Have questions? Chat with us on WhatsApp"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                          onClick={() =>
                            trackEvent(
                              "package_whatsapp_click",
                              { package_name: pkg.name, variant_name: variant.name },
                              { pagePath: "/packages" }
                            )
                          }
                        >
                          <FaWhatsapp />
                        </IconButton>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selectedVariants.length > 0 ? (
        <Card
          interactive={false}
          className="fixed bottom-2 left-2 right-2 z-[25] flex flex-col gap-2 p-3 md:bottom-4 md:left-4 md:right-4 md:flex-row md:items-center md:justify-between"
        >
          <p className="text-sm font-semibold">{selectedVariants.length} variant(s) selected for compare</p>
          <div className="flex self-end gap-2 md:self-auto">
            <Button size="sm" variant="outline" onClick={() => setSelected({})}>Clear</Button>
            <Button
              size="sm"
              disabled={selectedVariants.length < 2}
              onClick={() => {
                trackEvent("open_compare_modal", { selected_count: selectedVariants.length }, { pagePath: "/packages" });
                setShowCompare(true);
              }}
            >
              Compare now
            </Button>
          </div>
        </Card>
      ) : null}

      {activeVariant ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-3"
          role="dialog"
          aria-modal="true"
          aria-labelledby="package-detail-title"
          onClick={() => setActiveVariant(null)}
        >
          <Card
            id="package-detail-capture"
            interactive={false}
            className="flex max-h-[88vh] w-full max-w-[680px] flex-col overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <img src="/assets/sdrc-logo.png" alt="SDRC" width="94" height="28" />
                <div>
                  <p className="text-[11px] leading-4 text-slate-500">{activeVariant.pkgName}</p>
                  <h3 id="package-detail-title" className="text-base font-extrabold leading-tight text-slate-900">{activeVariant.variant.name}</h3>
                </div>
              </div>
              <div className="flex gap-1" data-export-hide="true">
                {isMobile ? (
                  <IconButton
                    as="button"
                    type="button"
                    aria-label="Share package"
                    aria-busy={exportBusy}
                    disabled={exportBusy}
                    onClick={() => handleShare(activeVariant.pkgName, activeVariant.variant)}
                  >
                    <FiShare2 />
                  </IconButton>
                ) : (
                  <IconButton
                    as="button"
                    type="button"
                    aria-label="Download package summary"
                    aria-busy={exportBusy}
                    disabled={exportBusy}
                    onClick={() => handleDownload(activeVariant.pkgName, activeVariant.variant)}
                  >
                    <FiDownload />
                  </IconButton>
                )}
                <IconButton as="button" type="button" aria-label="Close modal" onClick={() => setActiveVariant(null)}>
                  <FiX />
                </IconButton>
              </div>
            </div>

            <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] leading-none text-[var(--sdrc-teal-deep)]">
                  {activeVariant.variant.parameters} parameters
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold leading-none text-[var(--sdrc-orange)]">
                  INR {Number(activeVariant.variant.price).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{activeVariant.description}</p>
            </div>

            <div className="min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-1.5 px-4 py-2.5" data-export-content="package-tests">
                {activeGrouped.map((group) => (
                  <section key={group.category}>
                    <div className="mb-0.5 flex items-center gap-1.5">
                      {packagesData.categoryIconMap?.[group.category] ? (
                        <img src={packagesData.categoryIconMap[group.category]} alt="" width={16} height={16} />
                      ) : null}
                      <p className="text-xs font-extrabold text-[var(--sdrc-teal-deep)]">{group.category}</p>
                    </div>
                    <div className="flex flex-col">
                      {group.tests.map((test) => (
                        <p key={test} className="text-[13px] leading-[1.4] text-slate-800">• {test}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
                {activeVariant.variant.sample_report_url ? (
                  <Link href={activeVariant.variant.sample_report_url} target="_blank" rel="noopener noreferrer" className="mb-2 block text-xs font-bold text-[var(--sdrc-teal-deep)] underline">
                    View Sample DEXA Report
                  </Link>
                ) : null}
                {activeNotes.length > 0 ? (
                  <div data-export-hide="true">
                    <p className="mb-1 text-xs font-bold text-slate-700">Important notes</p>
                    {activeNotes.map((note) => (
                      <p key={note} className="text-[11px] leading-4 text-slate-600">{note}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {showCompare ? (
        <div
          className="fixed inset-0 z-[45] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowCompare(false)}
        >
          <Card
            interactive={false}
            className="max-h-[84vh] w-full max-w-[1040px] overflow-y-auto p-3 md:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div />
              <div className="flex gap-1">
                {isMobile ? (
                  <IconButton as="button" type="button" aria-label="Share comparison" aria-busy={exportBusy} disabled={exportBusy} onClick={shareCompareImage}>
                    <FiShare2 />
                  </IconButton>
                ) : (
                  <IconButton as="button" type="button" aria-label="Download comparison JPG" aria-busy={exportBusy} disabled={exportBusy} onClick={downloadCompareImage}>
                    <FiDownload />
                  </IconButton>
                )}
                <IconButton as="button" type="button" aria-label="Close comparison modal" onClick={() => setShowCompare(false)}>
                  <FiX />
                </IconButton>
              </div>
            </div>

            <div id="compare-capture">
              <div className="mb-3 flex items-center gap-3">
                <img src="/assets/sdrc-logo.png" alt="SDRC" width="110" height="32" />
                <p className="font-bold text-slate-700">Package Comparison</p>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px", lineHeight: 1.4 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e2e8f0" }}>Test</th>
                      {selectedVariants.map((v) => (
                        <th key={v.key} style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid #e2e8f0" }}>
                          <div>{v.variantName}</div>
                          <div style={{ color: "#f26939", fontWeight: 800, fontSize: "18px" }}>INR {Number(v.price).toLocaleString("en-IN")}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareGrouped.map((group) => (
                      <Fragment key={group.category}>
                        <tr key={group.category + "-head"}>
                          <td colSpan={1 + selectedVariants.length} style={{ padding: "9px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 700 }}>
                            <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              {packagesData.categoryIconMap?.[group.category] ? (
                                <img src={packagesData.categoryIconMap[group.category]} alt={group.category} width="14" height="14" />
                              ) : null}
                              {group.category}
                            </span>
                          </td>
                        </tr>
                        {group.tests.map((test) => (
                          <tr key={group.category + "-" + test}>
                            <td style={{ padding: "8px 10px", borderBottom: "1px solid #edf2f7" }}>{test}</td>
                            {selectedVariants.map((v) => (
                              <td key={v.key + "-" + test} style={{ textAlign: "center", padding: "8px 10px", borderBottom: "1px solid #edf2f7", fontWeight: 700 }}>
                                {v.tests.includes(test) ? "✓" : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              {compareNotes.length > 0 ? (
                <div className="mt-3" data-export-hide="true">
                  <p className="mb-1 text-[11px] font-bold text-slate-500">Important notes</p>
                  {compareNotes.map((note) => (
                    <p key={note} className="text-[11px] text-slate-500">{note}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-md bg-slate-800 px-4 py-2 text-sm text-white md:bottom-6">
          {toastMessage}
        </div>
      ) : null}
    </TwContainer>
  );
}
