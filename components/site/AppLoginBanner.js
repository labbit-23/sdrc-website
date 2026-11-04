"use client";

import Image from "next/image";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TwContainer } from "@/components/site/tw-layout";
import { siteConfig } from "@/data/siteConfig";
import { trackEvent } from "@/lib/analytics";

const perks = ["Every report saved with trends over time", "Book home collection and pay by UPI", "Sign in with an OTP sent on WhatsApp"];

export default function AppLoginBanner() {
  const [phone, setPhone] = useState("");
  const valid = /^\d{10}$/.test(phone);

  function go(e) {
    e.preventDefault();
    if (!valid) return;
    trackEvent("app_login_start", { source: "home_banner" }, { pagePath: "/" });
    // The number goes in the URL fragment: it never reaches a server or log. The app reads it once to prefill its login screen.
    window.location.href = `${siteConfig.patientAppUrl}/#p=${phone}`;
  }

  return (
    <section className="py-10 md:py-14">
      <TwContainer>
        <div className="overflow-hidden rounded-3xl border border-[#bfe7e2] bg-white shadow-[0_18px_44px_rgba(15,23,42,.08)]">
          <div className="grid items-stretch lg:grid-cols-[1.1fr_.9fr]">
            <div className="relative aspect-video bg-[#f6fbfa] lg:aspect-auto lg:min-h-[340px]">
              <Image
                src="/assets/app/sdrc-health-summary-banner.jpg"
                alt="SDRC Health app: your health at a glance, with trends over time"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[.07em] text-[var(--sdrc-orange)]">SDRC Health app</p>
              <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-800">Your reports, bookings and trends in one place</h2>
              <ul className="mt-3 grid gap-1.5">
                {perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <FiCheck className="mt-0.5 shrink-0 text-[var(--sdrc-teal)]" /> {p}
                  </li>
                ))}
              </ul>
              <form onSubmit={go} className="mt-5">
                <label htmlFor="app-phone" className="text-xs font-semibold text-slate-600">Mobile number registered with SDRC</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <div className="flex min-w-[200px] flex-1 items-center rounded-full border-2 border-slate-200 bg-white px-4 focus-within:border-[var(--sdrc-teal)]">
                    <span className="text-sm font-semibold text-slate-500">+91</span>
                    <input
                      id="app-phone"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile"
                      className="min-h-11 w-full bg-transparent px-2 text-sm outline-none"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={!valid} leftIcon={<FaWhatsapp />}>
                    Get OTP on WhatsApp
                  </Button>
                </div>
              </form>
              <p className="mt-2 text-xs text-slate-500">New to SDRC? The same number creates your account. No password needed.</p>
            </div>
          </div>
        </div>
      </TwContainer>
    </section>
  );
}
