"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { TwContainer } from "@/components/site/tw-layout";
import bannerData from "@/data/banners.json";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function isLive(b, today) {
  return (!b.start || b.start <= today) && (!b.end || b.end >= today);
}

// Image banners (festival offers, campaigns). Edit data/banners.json to add or retire one.
// 1 banner = full width; 2+ = swipeable row.
export default function HomeBanners() {
  const live = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (bannerData.banners || []).filter((b) => b.image && isLive(b, today));
  }, []);
  if (!live.length) return null;
  const single = live.length === 1;

  return (
    <section className="pt-8 md:pt-10" aria-label="Offers and announcements">
      <TwContainer>
        <div className={cn("flex gap-4", single ? "" : "snap-x snap-mandatory overflow-x-auto pb-2")}>
          {live.map((b) => {
            const external = /^https?:/.test(b.href || "");
            const img = (
              <Image
                src={b.image}
                alt={b.alt || b.title || "SDRC offer"}
                width={b.width || 1600}
                height={b.height || 600}
                sizes="(min-width: 1200px) 1136px, 100vw"
                className="h-auto w-full rounded-2xl border border-slate-200 shadow-[0_10px_28px_rgba(15,23,42,.08)]"
              />
            );
            return (
              <div key={b.id} className={cn(single ? "w-full" : "w-[88%] shrink-0 snap-start md:w-[48%]")}>
                {b.href ? (
                  <Link
                    href={b.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    onClick={() => trackEvent("banner_click", { banner_id: b.id }, { pagePath: "/" })}
                  >
                    {img}
                  </Link>
                ) : (
                  img
                )}
              </div>
            );
          })}
        </div>
      </TwContainer>
    </section>
  );
}
