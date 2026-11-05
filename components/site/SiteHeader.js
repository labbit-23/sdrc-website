"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { TwContainer } from "@/components/site/tw-layout";
import { navItems, siteConfig } from "@/data/siteConfig";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";
import { cn } from "@/lib/utils";

function IconPill({ children, className, ...props }) {
  return (
    <Link
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-[#67cbbf] bg-white text-[var(--sdrc-teal-deep)] transition hover:bg-[var(--sdrc-teal-soft)]",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

function NewBadge() {
  return (
    <span
      className="absolute -right-2 -top-2 z-10 rounded-full border border-white px-1.5 py-0.5 text-[8px] font-black leading-none tracking-[.04em] shadow-[0_4px_10px_rgba(242,105,57,.35)]"
      style={{ backgroundColor: "var(--sdrc-orange)", color: "#ffffff" }}
    >
      NEW
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const items = useMemo(
    () => navItems.filter((item) => item.flag == null || siteConfig[item.flag]),
    []
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function syncCartCount() {
      setCartCount(getCartCount());
    }

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener(CART_UPDATED_EVENT, syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount);
    };
  }, []);

  return (
    <>
      <div className="bg-[var(--sdrc-teal)] py-2 text-sm text-white">
        <TwContainer className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap">
            <Link href={"tel:" + siteConfig.phoneTel} className="font-medium text-white hover:text-white">
              {siteConfig.phoneDisplay}
            </Link>
            <Link href={"tel:" + siteConfig.phoneAltTel} className="hidden text-white/80 hover:text-white lg:inline">
              or {siteConfig.phoneAltDisplay}
            </Link>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Jade Arcade, Paradise, Secunderabad</span>
            <span className="hidden items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold sm:inline-flex">
              <span className="mr-2 inline-block size-[7px] rounded-full bg-[#22c55e]" />
              NABL Accredited Lab
            </span>
          </div>
          <div className="ml-auto hidden md:block">
            <Button
              as={Link}
              href={"https://wa.me/" + siteConfig.whatsappNumber}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="light"
            >
              WhatsApp
            </Button>
          </div>
        </TwContainer>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-[10px]">
        <TwContainer className="flex min-h-[68px] items-center justify-between gap-3 py-2.5 md:py-3">
          <Link href="/" aria-label="SDRC Home" className="inline-flex shrink-0 items-center">
            <Image
              src="/assets/sdrc-logo-full.png"
              alt="SDRC Diagnostics"
              width={148}
              height={48}
              priority
              style={{ width: "auto", height: 44 }}
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 text-sm text-slate-700 xl:flex">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap border-b-2 px-2.5 py-2 font-medium transition",
                    active
                      ? "border-[var(--sdrc-teal)] font-bold text-[var(--sdrc-teal-deep)]"
                      : "border-transparent text-slate-700 hover:text-[var(--sdrc-teal-deep)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <IconPill href="/cart" aria-label="Cart">
                <FiShoppingCart />
              </IconPill>
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--sdrc-orange)] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </div>

            <div className="relative inline-block lg:hidden">
              <IconPill
                href={siteConfig.patientAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the SDRC Health web app"
                title="Open the SDRC Health web app"
              >
                <FiDownload />
              </IconPill>
              <NewBadge />
            </div>

            <div className="hidden lg:block">
              <Button
                as={Link}
                href={siteConfig.reportsUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                variant="outline"
                className="px-3"
                title="Get our bot to send your reports. Chat using your registered mobile number."
              >
                Download Reports
              </Button>
            </div>
            <div className="relative hidden lg:inline-block">
              <Button
                as={Link}
                href={siteConfig.patientAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                variant="outline"
                className="px-3"
                title="Open the SDRC Health web app"
              >
                SDRC Health App
              </Button>
              <NewBadge />
            </div>
            <div className="hidden md:block">
              <Button as={Link} href="/tests" size="sm" variant="bookTest" className="px-3">
                Book A Test
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex min-h-9 min-w-10 items-center justify-center rounded-full border-2 border-[var(--sdrc-teal)] px-2 text-[var(--sdrc-teal-deep)] transition hover:bg-[var(--sdrc-teal-soft)] xl:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </TwContainer>

        {mobileOpen ? (
          <div className="border-t border-slate-100 bg-white xl:hidden">
            <TwContainer className="flex flex-col py-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-2 py-3 font-medium",
                    pathname === item.href ? "font-bold text-[var(--sdrc-teal-deep)]" : "text-slate-700"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-wrap items-center gap-2 px-2 py-2">
                <div className="relative">
                  <IconPill href="/cart" aria-label="Cart">
                    <FiShoppingCart />
                  </IconPill>
                  {cartCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--sdrc-orange)] px-1 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </div>
                <Button as={Link} href="/tests" size="sm" variant="bookTest">
                  Book A Test
                </Button>
                <Button
                  as={Link}
                  href={"https://wa.me/" + siteConfig.whatsappNumber}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  leftIcon={<FaWhatsapp />}
                >
                  WhatsApp
                </Button>
                <Button
                  as={Link}
                  href={siteConfig.reportsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  title="Get our bot to send your reports. Chat using your registered mobile number."
                  leftIcon={<FaWhatsapp />}
                >
                  Download Reports
                </Button>
                <div className="relative inline-block">
                  <Button
                    as={Link}
                    href={siteConfig.patientAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                    title="Open the SDRC Health web app"
                    leftIcon={<FiDownload />}
                  >
                    SDRC Health App
                  </Button>
                  <NewBadge />
                </div>
              </div>
            </TwContainer>
          </div>
        ) : null}
      </header>
    </>
  );
}
