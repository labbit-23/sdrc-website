"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, TwContainer } from "@/components/site/tw-layout";
import { FadeIn } from "@/components/site/motionUtils";
import { siteConfig } from "@/data/siteConfig";
import { getCurrentPromo } from "@/data/featuredPromo";
import healthPackagesData from "@/data/health-packages.json";

const facilityChips = ["CT", "Digital X-Ray", "Mammography", "DEXA", "Ultrasound & Doppler", "ECG / 2D-Echo", "EEG / ENMG", "TMT", "Spirometry", "Pathology"];
const facilities = [
  { title: "Imaging", items: ["Multi-slice CT", "Digital X-Ray", "Mammography", "DEXA", "Ultrasound & Colour Doppler"] },
  { title: "Cardio & Neuro", items: ["ECG & 2D-Echo", "TMT (Stress Test)", "EEG & ENMG", "Spirometry (PFT)"] },
  { title: "Pathology Lab", items: ["Biochemistry & Endocrinology", "Haematology & Coagulation", "Clinical Pathology", "Microbiology & Serology", "Cytology & Histopathology"] }
];
const reviews = [
  { name: "Corporate Executive", text: "Quick reporting and very professional staff. Got my full body checkup and reports were easy to understand." },
  { name: "Consulting Physician", text: "We regularly use SDRC for diabetic and cardiac monitoring. The team is responsive and reports are reliable." },
  { name: "Resident of Secunderabad", text: "Home collection was convenient and the technician was courteous. Got reports on WhatsApp and email." }
];
const previewNames = ["Executive Wellness Checkup", "Master Wellness Checkup", "Cardiac Wellness"];

function slugify(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function formatPrice(value) { const amount = Number(value); return Number.isFinite(amount) ? `From INR ${amount.toLocaleString("en-IN")}` : "Price on request"; }
function parameterRange(variants) {
  const values = (variants || []).map((item) => Number(item.parameters)).filter(Number.isFinite);
  if (!values.length) return "Parameters vary";
  const min = Math.min(...values); const max = Math.max(...values);
  return min === max ? `${min} parameters` : `${min}-${max} parameters`;
}
function buildPreviewCards(data) {
  return previewNames.map((name) => (data.packages || []).find((pkg) => pkg.name === name)).filter(Boolean).map((pkg) => {
    const variants = Array.isArray(pkg.variants) ? pkg.variants : [];
    const prices = variants.map((item) => Number(item.price)).filter(Number.isFinite);
    const first = variants[0] || {};
    const points = Array.isArray(first.key_inclusions) && first.key_inclusions.length ? first.key_inclusions : (first.tests || []).slice(0, 3);
    return { title: pkg.name, desc: pkg.description || "", params: parameterRange(variants), price: formatPrice(prices.length ? Math.min(...prices) : null), points: points.slice(0, 3), href: `/packages#${slugify(pkg.name)}` };
  });
}
const defaultCards = buildPreviewCards(healthPackagesData);

function QuickLink({ href, title, label, children, className = "", dark = false }) {
  const external = href.startsWith("http");
  const darkLink = dark || className.includes("bg-[var(--sdrc-teal-deep)]");
  const toneClass = darkLink
    ? "border-[var(--sdrc-teal-deep)] bg-[var(--sdrc-teal-deep)] text-white"
    : "border-slate-200 bg-white text-[var(--sdrc-teal-deep)]";
  return <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={`relative flex min-h-[74px] flex-col justify-center rounded-xl border px-3 py-2.5 shadow-[0_8px_20px_rgba(15,23,42,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(15,23,42,.1)] ${toneClass} ${className}`}><span className={`text-xs ${darkLink ? "text-white/75" : "text-slate-500"}`}>{title}</span><span className={`mt-1 inline-flex items-center gap-1.5 text-sm font-bold ${darkLink ? "text-white" : "text-[var(--sdrc-teal-deep)]"}`}>{children}{label}</span></Link>;
}

export default function HomePage() {
  const [reportCount, setReportCount] = useState(0);
  const [packagePreviewCards, setPackagePreviewCards] = useState(defaultCards);
  const promo = getCurrentPromo();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health-packages").then((res) => res.ok ? res.json() : null).then((data) => { if (!cancelled && data && Array.isArray(data.packages)) setPackagePreviewCards(buildPreviewCards(data)); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const start = performance.now(); const duration = 1400; let frame = 0;
    const tick = (now) => { const progress = Math.min((now - start) / duration, 1); setReportCount(Math.round(1000 * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, []);

  return <>
    <section className="home-hero-cover py-10 md:py-14"><TwContainer className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-10"><div className="rise-in"><Chip>Secunderabad Diagnostic and Research Centre</Chip><h1 className="hero-title mt-4 text-slate-800">Advanced Diagnostic Care <span className="hero-subline text-[var(--sdrc-orange)]">at <span>Jade Arcade, Paradise</span></span></h1><p className="mt-4 hidden max-w-2xl text-lg font-medium text-slate-700 md:block">Ultrasound and Doppler, CT, Digital X-Ray, Mammography, DEXA, ECG/2D-Echo, EEG/ENMG, TMT, Spirometry and a full-service pathology lab with preventive health packages.</p><p className="mt-2 hidden max-w-2xl text-sm text-slate-500 md:block">SDRC is a NABL accredited multi-specialty diagnostic centre established in 1983, serving Secunderabad, Hyderabad and Telangana from Jade Arcade, Paradise.</p><div className="mt-5 hidden flex-wrap gap-2 md:flex">{facilityChips.map((chip) => <Link key={chip} href="/services" className="rounded-full border border-[#bfe7e2] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,.06)] hover:text-[var(--sdrc-teal-deep)]">{chip}</Link>)}</div><div className="mt-7 flex flex-wrap gap-3"><Button as={Link} href="/packages" size="lg">View Health Packages</Button><Button as={Link} href={siteConfig.bookingUrl} size="lg" leftIcon={<FiSearch />}>Book a Test</Button></div><div className="mt-4 grid max-w-[960px] gap-3 sm:grid-cols-2 lg:grid-cols-4"><QuickLink href={`https://wa.me/${siteConfig.internalNotifyNumber}`} title="Need help selecting tests?" label="Chat with lab team"><FaWhatsapp /></QuickLink><QuickLink href={siteConfig.reportsUrl} title="Already tested with SDRC?" label="Download Reports"><FaWhatsapp /></QuickLink><QuickLink href={siteConfig.quickBookingUrl} title="Want to book a home visit?" label="Request Home Visit" /><QuickLink href={siteConfig.patientAppUrl} title="Manage everything in one place" label="SDRC Health App" dark><FiDownload color="white" /><span className="absolute -right-1.5 -top-2 rounded-full border border-white bg-[var(--sdrc-orange)] px-2 py-px text-[9px] font-black text-white shadow-[0_4px_10px_rgba(242,105,57,.35)]">NEW</span></QuickLink></div><p className="mt-3 text-xs text-slate-500">NABL accredited laboratory. Reports available online and on WhatsApp.</p><div className="mt-8 hidden max-w-[760px] grid-cols-3 gap-4 sm:grid"><Card className="p-4 text-center"><p className="text-sm text-slate-600">Reports/day</p><p className="mt-1 text-2xl font-bold text-[var(--sdrc-teal-deep)]">{reportCount.toLocaleString("en-IN")}+</p></Card><Card className="p-4 text-center"><p className="text-sm text-slate-600">Experience</p><Image src="/assets/sdrc-40-years.png" alt="40 years" width={72} height={72} className="mx-auto mt-2 h-auto" /></Card><Card className="p-4 text-center"><p className="text-sm text-slate-600">Avg. TAT</p><p className="mt-2 text-lg font-bold text-[var(--sdrc-teal-deep)]">Same-day*</p></Card></div></div><div className="hero-visual-reveal relative" style={{ animationDelay: "220ms" }}><Card className="relative p-3"><Image src="/assets/sdrc-services.png" alt="SDRC Services" width={720} height={920} priority className="h-auto w-full rounded-[14px]" /></Card></div></TwContainer></section>
    {promo && <section className="overflow-hidden bg-[#0f172a] py-10 text-white md:py-14"><TwContainer><FadeIn><div className="grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-12"><div><div className="mb-4 flex flex-wrap gap-3"><Chip className="bg-white/10 text-white/70">{promo.badge}</Chip><Chip className="bg-[#008f82]/30 text-[#4dd9cb]">{promo.eyebrow}</Chip></div><h2 className="text-2xl font-black leading-tight md:text-3xl">{promo.headline}</h2><p className="mt-1 text-lg font-bold text-[#f59e0b]">{promo.subline}</p><p className="mt-3 max-w-[560px] text-sm leading-7 text-white/60 md:text-base">{promo.body}</p><div className="mt-4 hidden max-w-[560px] gap-2.5 sm:grid">{promo.bullets.map((bullet) => <p key={bullet} className="text-sm leading-6 text-white/50"><span className="mr-2 text-[#4dd9cb]">•</span>{bullet}</p>)}</div><div className="mt-6 flex flex-wrap gap-3"><Button as={Link} href={promo.bookHref} size="lg" className="border-[#008f82] bg-[#008f82] text-white hover:bg-[#007b70]">{promo.bookLabel}</Button><Button as={Link} href={promo.href} size="lg" variant="outlineLight">{promo.ctaLabel}</Button></div></div><div className="hidden w-[200px] rounded-[20px] border border-white/10 bg-white/[.04] p-4 lg:block"><Image src={promo.image} alt={promo.imageAlt} width={951} height={2977} className="h-auto w-full rounded-xl" /><p className="mt-2 text-center text-[10px] text-white/25">{promo.imageAlt}</p></div></div></FadeIn></TwContainer></section>}
    <section className="hidden py-12 md:block"><TwContainer><FadeIn><h2 className="mb-6 text-2xl font-bold text-slate-800">All facilities under one roof</h2><div className="grid gap-6 md:grid-cols-3">{facilities.map((group) => <Card key={group.title} accent="teal" className="p-6"><h3 className="mb-3 text-lg font-bold text-slate-800">{group.title}</h3>{group.items.map((item) => <p key={item} className="text-sm leading-7 text-slate-700">• {item}</p>)}</Card>)}</div></FadeIn></TwContainer></section>
    <section className="hidden py-6 md:block"><TwContainer><FadeIn><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold text-slate-800">Popular health check packages</h2><p className="text-sm text-slate-700">A few commonly chosen panels. View the full list on the packages page.</p></div><Link href="/packages" className="text-sm font-bold text-[var(--sdrc-teal-deep)]">View all packages</Link></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{packagePreviewCards.map((card, index) => <FadeIn key={card.title} delay={index * 60}><Card accent="orange" className="flex h-full flex-col p-5"><h3 className="text-sm font-bold text-[var(--sdrc-teal-deep)]">{card.title}</h3><p className="mt-2 text-sm text-slate-600">{card.desc}</p><p className="mt-2 text-xs text-slate-500">{card.params}</p><p className="mt-2 font-bold text-[var(--sdrc-orange)]">{card.price}</p><div className="mt-2 flex-1">{card.points.map((point) => <p key={point} className="mt-1 text-xs text-slate-700">• {point}</p>)}</div><Button as={Link} href={card.href} size="sm" className="mt-4 w-full">View details</Button></Card></FadeIn>)}</div></FadeIn></TwContainer></section>
    <section className="hidden py-12 md:block"><TwContainer><FadeIn><h2 className="mb-6 text-2xl font-bold text-slate-800">What patients say</h2><div className="grid gap-6 md:grid-cols-3">{reviews.map((review, index) => <FadeIn key={review.name} delay={index * 70}><Card className="p-6"><p className="text-sm leading-7 text-slate-700">“{review.text}”</p><p className="mt-3 font-semibold text-[var(--sdrc-teal-deep)]">- {review.name}</p></Card></FadeIn>)}</div></FadeIn></TwContainer></section>
    <section className="bg-[var(--sdrc-teal-deep)] py-12 text-white"><TwContainer className="text-center"><h2 className="text-xl font-bold md:text-2xl">Ready to schedule your tests?</h2><p className="mt-3 text-base md:text-lg">Share prescription on WhatsApp or book directly through our online portal.</p><div className="mt-6 flex flex-wrap justify-center gap-4"><Button as={Link} href={`https://wa.me/${siteConfig.whatsappNumber}`} variant="light" size="lg" leftIcon={<FaWhatsapp />}>WhatsApp SDRC</Button><Button as={Link} href={siteConfig.bookingUrl} variant="outlineLight" size="lg">Book tests online</Button></div></TwContainer></section>
    <section className="py-12"><TwContainer><h2 className="mb-6 text-2xl font-bold text-slate-800">NABL Accredited and CGHS Approved</h2><div className="grid gap-6 md:grid-cols-2"><Card className="p-6"><div className="flex items-start gap-4"><Image src="/assets/nabl-symbol.png" alt="NABL" width={74} height={74} className="h-auto w-[74px] shrink-0" /><p className="mt-1 text-sm leading-7 text-slate-700">Laboratory tests included in the accredited scope at SDRC are NABL accredited (ISO 15189:2022). Imaging and other non-laboratory services are not covered. <Link href="/accreditation" className="font-bold text-[var(--sdrc-teal-deep)] underline">View details</Link></p></div></Card><Card className="p-6"><div className="flex items-start gap-4"><Image src="/assets/cghs-logo.png" alt="CGHS" width={74} height={74} className="h-auto w-[74px] shrink-0" /><p className="mt-1 text-sm leading-7 text-slate-700">SDRC Diagnostics is a CGHS empanelled diagnostic centre for eligible beneficiaries in Hyderabad and Secunderabad.</p></div></Card></div></TwContainer></section>
  </>;
}
