"use client";

import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { TwContainer } from "@/components/site/tw-layout";
import { siteConfig } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

function SocialLink({ href, label, children }) {
  return (
    <Link
      href={href}
      target="_blank"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-slate-600 text-white transition hover:border-slate-400 hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="flex flex-col items-start gap-2 text-sm text-slate-300">
      <p className="text-sm font-bold text-white">{title}</p>
      {children}
    </div>
  );
}

function FooterLink({ className, ...props }) {
  return (
    <Link
      className={cn(
        "text-slate-300 transition hover:text-white visited:text-slate-300",
        className
      )}
      {...props}
    />
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-[#0f172a] text-white">
      <TwContainer className="py-10">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
          <div className="flex max-w-[560px] flex-col items-start gap-3">
            <Link href="/" className="inline-flex">
              <Image
                src="/assets/sdrc-logo-full.png"
                alt="SDRC Diagnostics"
                width={188}
                height={60}
                style={{ width: "auto", height: 56 }}
              />
            </Link>
            <p className="max-w-[520px] text-sm text-slate-300">
              SDRC Diagnostics LLP is a multi-modality diagnostic centre at Jade Arcade, Paradise, offering imaging, cardio-pulmonary, neurology and a full-service NABL accredited laboratory.
            </p>
            <p className="text-xs text-slate-400">
              101, Jade Arcade (Corporate Block), Paradise, MG Road, Secunderabad - 500003, Telangana, India.
            </p>
          </div>

          <FooterColumn title="Quick links">
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/services">Services</FooterLink>
            <FooterLink href="/packages">Health Packages</FooterLink>
            <FooterLink href="/about">About SDRC</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href={siteConfig.feedbackUrl}>Feedback form</FooterLink>
          </FooterColumn>

          <FooterColumn title="Our centres">
            <FooterLink href={siteConfig.locations.main} target="_blank">Jade Arcade - Paradise (Main Centre)</FooterLink>
            <FooterLink href={siteConfig.locations.sdRoad} target="_blank">S.D. Road Collection Centre</FooterLink>
            <FooterLink href={siteConfig.locations.marredpally} target="_blank">West Marredpally Collection Centre</FooterLink>
            <FooterLink href={siteConfig.locations.yapral} target="_blank">Yapral Collection Centre</FooterLink>
          </FooterColumn>
        </div>
      </TwContainer>

      <div className="border-t border-white/30 py-4">
        <TwContainer className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} SDRC Diagnostics LLP. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <FooterLink href="/accreditation">NABL Accredited Laboratory</FooterLink>
              <span>•</span>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <span>•</span>
              <FooterLink href="/tnc">Reporting T&amp;C</FooterLink>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 md:justify-end">
              <FooterLink href={"tel:" + siteConfig.phoneTel}>Call: {siteConfig.phoneDisplay}</FooterLink>
              <span>•</span>
              <FooterLink href={"https://wa.me/" + siteConfig.whatsappNumber} className="inline-flex items-center gap-1">
                <FaWhatsapp />
                <span>WhatsApp</span>
              </FooterLink>
              <span>•</span>
              <FooterLink href={siteConfig.social.linktree} target="_blank">All links</FooterLink>
            </div>

            <div className="flex items-center gap-2">
              <SocialLink href={siteConfig.social.facebook} label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13 22v-8h3l1-4h-4V7.5A1.5 1.5 0 0 1 14.5 6H17V2h-3.5A5.5 5.5 0 0 0 8 7.5V10H5v4h3v8h5z" />
                </svg>
              </SocialLink>
              <SocialLink href={siteConfig.social.instagram} label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 .001 3.999A2 2 0 0 0 12 10z" />
                </svg>
              </SocialLink>
              <SocialLink href={siteConfig.social.x} label="X (Twitter)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4 4h4.5l3 4.5L15.5 4H20l-5.5 7.2L20 20h-4.5l-3.3-4.8L8.5 20H4l5.6-7.4z" />
                </svg>
              </SocialLink>
            </div>

            <div className="relative inline-block">
            <Link
              href={siteConfig.patientAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 py-1.5 pl-2 pr-4 text-white transition visited:text-white hover:border-[#22c55e] hover:bg-white/20"
            >
                <Image src="/assets/favicon-32x32.png" alt="" width={28} height={28} style={{ borderRadius: 6 }} />
                <span className="flex flex-col items-start">
                  <span className="text-[10px] leading-none text-slate-400">Try our web app</span>
                  <span className="text-sm font-bold leading-snug text-white">SDRC Health App</span>
                </span>
              </Link>
              <span className="absolute -right-1.5 -top-2 rounded-full bg-[#22c55e] px-2 py-px text-[9px] font-black tracking-[.05em] text-[#0f172a]">
                NEW
              </span>
            </div>
          </div>
        </TwContainer>
      </div>
    </footer>
  );
}
