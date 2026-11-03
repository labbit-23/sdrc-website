"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, TwContainer } from "@/components/site/tw-layout";
import { siteConfig } from "@/data/siteConfig";

const services = [
  ["/assets/recure/icon-ortho.png", "Orthopaedic Rehab", "Back pain, neck pain, joint disorders, arthritis"],
  ["/assets/recure/icon-neuro.png", "Neurological Rehab", "Stroke, nerve injuries, neuro-muscular rehab"],
  ["/assets/recure/icon-sports.png", "Sports Injury", "Ligament injuries, muscle tears, return-to-sport"],
  ["/assets/recure/icon-postop.png", "Post-Surgical Rehab", "Joint replacement, spine and trauma recovery"],
  ["/assets/recure/icon-geriatric.png", "Geriatric Care", "Balance, mobility, fall prevention"],
  ["/assets/recure/icon-womens.png", "Women's Health", "Post-partum, pelvic floor, ergonomic care"]
];
const highlights = ["Integrated diagnostics + rehab workflow", "Evidence-based treatment protocols", "In-clinic and at-home care options"];
const locations = [["Jade Arcade - Paradise", "Physiotherapy consultations (Recure x SDRC)", siteConfig.locations.main], ["S.D. Road Collection Centre", "Physiotherapy consultations (Recure x SDRC)", siteConfig.locations.sdRoad], ["Yapral Centre", "Physiotherapy treatment and rehabilitation sessions", siteConfig.locations.yapral]];

export default function PhysiotherapyPage() {
  const expertUrl = "https://wa.me/919963432132?text=" + encodeURIComponent("I wanted to know more about Recure Physiotherapy at SDRC");
  return <>
    <section className="brochure-bg py-10 md:py-14"><TwContainer className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-10"><div><Chip>Physiotherapy at SDRC</Chip><h1 className="hero-title mt-4 text-slate-800">Evidence-based Physiotherapy<span className="hero-subline text-[var(--sdrc-orange)]">with Recure</span></h1><p className="mt-5 text-base text-slate-700 md:text-lg">Professional rehabilitation services delivered at SDRC Diagnostics in collaboration with Recure, India&apos;s structured physiotherapy platform.</p><div className="mt-7 grid max-w-[560px] gap-3 sm:grid-cols-2"><Button as={Link} href={expertUrl} target="_blank" size="lg" leftIcon={<FaWhatsapp />}>Chat with an Expert</Button><Button as={Link} href="tel:+919963432132" variant="outline" size="lg">Call +91 99634 32132</Button></div></div><Card className="p-6"><Image src="/assets/recure/logo-recure.png" alt="Recure Physiotherapy" width={220} height={56} className="h-[54px] w-auto" /><p className="mt-4 text-sm text-slate-700">Structured care protocols, certified physiotherapists and measurable outcomes.</p></Card></TwContainer></section>
    <section className="py-12"><TwContainer><h2 className="mb-8 text-2xl font-bold text-slate-800">Physiotherapy services offered</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map(([icon, title, desc]) => <Card key={title} className="p-6"><Image src={icon} alt={title} width={42} height={42} /><h3 className="mt-3 text-lg font-bold text-slate-800">{title}</h3><p className="mt-2 text-sm text-slate-700">{desc}</p></Card>)}</div></TwContainer></section>
    <section className="border-y border-slate-100 bg-white py-12"><TwContainer><h2 className="mb-6 text-2xl font-bold text-slate-800">Why Recure at SDRC?</h2><div className="grid gap-6 md:grid-cols-3">{highlights.map((item) => <Card key={item} className="bg-slate-50 p-5"><p className="text-sm text-slate-700">{item}</p></Card>)}</div></TwContainer></section>
    <section className="py-12"><TwContainer><h2 className="mb-6 text-2xl font-bold text-slate-800">Physiotherapy Locations</h2><div className="grid gap-6 md:grid-cols-3">{locations.map(([name, desc, map]) => <Card key={name} accent="teal" className="p-6"><h3 className="text-lg font-bold text-slate-800">{name}</h3><p className="mb-3 mt-1 text-sm text-slate-700">{desc}</p><Link href={map} target="_blank" className="text-sm font-bold text-[var(--sdrc-teal-deep)]">View on Google Maps →</Link></Card>)}</div></TwContainer></section>
    <section className="border-y border-[#fed7aa] bg-[#fff7ed] py-6"><TwContainer className="grid items-center gap-4 md:grid-cols-[auto_1fr]"><Image src="/assets/recure/logo-recure.png" alt="Recure" width={140} height={42} className="h-10 w-auto" /><p className="text-sm text-slate-700">To learn more about Recure&apos;s philosophy and nationwide programs, visit <Link href="https://recure.in" target="_blank" className="font-bold text-[var(--sdrc-teal-deep)] underline">recure.in</Link></p></TwContainer></section>
  </>;
}
