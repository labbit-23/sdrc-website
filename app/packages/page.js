"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, TwContainer } from "@/components/site/tw-layout";
import PackagesExplorer from "@/components/site/PackagesExplorer";
import { siteConfig } from "@/data/siteConfig";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is included in a health check package?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SDRC health check packages include a combination of pathology tests (blood, urine), imaging studies (ultrasound, X-ray, CT, etc.) and sometimes specialist consultations. Each package is tailored for specific health goals — from quick screening to comprehensive wellness checks. Compare packages on this page to see exact inclusions."
        }
      },
      {
        "@type": "Question",
        name: "How do I choose the right health package for me?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SDRC offers specialized packages by health focus: Executive (quick screening), Master Wellness (comprehensive), Cardiac Wellness (heart health), Diabetic Panel (blood sugar/kidney/eye), Women's Wellness, and Lifestyle packages. Click 'View Included Tests' on any package to see details, or use the comparison tool to side-by-side compare variants."
        }
      },
      {
        "@type": "Question",
        name: "Can I customize a package or add/remove tests?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Many packages have multiple variants (Basic, Standard, Premium) with different test combinations and pricing. You can also add individual tests to your cart on the tests page (sdrc.in/tests) and request custom combinations. Contact our team via WhatsApp for bespoke packages."
        }
      },
      {
        "@type": "Question",
        name: "How much do health packages cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Package prices vary by scope and variant. Base packages start from ₹2,000–5,000 for screening, while comprehensive wellness checks range from ₹10,000–25,000+. Exact pricing is shown on each package card. Book online or contact us for corporate/family discounts."
        }
      },
      {
        "@type": "Question",
        name: "Do I need a doctor's prescription to book a package?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No prescription is required for routine health check packages. However, if your doctor has recommended specific tests, you can upload the prescription during booking for better guidance from our team."
        }
      },
      {
        "@type": "Question",
        name: "How soon are results available after a health package?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most pathology tests report within 24 hours; imaging studies (ultrasound, X-ray) often report same-day. Complex imaging (CT, DEXA) may take 24–48 hours. All reports are accessible online, via WhatsApp and email using your registered mobile number."
        }
      }
    ]
  }
];

export default function PackagesPage() {
  return (
    <>
      {structuredData.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <section className="brochure-bg functional-hero-cover py-10 md:py-14">
        <TwContainer>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div className="rise-in">
              <Chip tone="orange" className="mb-4">Health check packages</Chip>
              <h1 className="hero-title mt-2 text-slate-800">
                Master Health Check
                <span className="hero-subline text-[var(--sdrc-orange)]">Packages</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-700">
                From quick screening panels to in-depth cardiac, diabetic, women’s and lifestyle wellness plans — all under one roof.
              </p>
              <p className="mt-3 hidden text-sm leading-relaxed text-slate-600 md:block">
                Select <span className="font-bold">“Compare”</span> on two or more variants to see them side-by-side,
                or <span className="font-bold">“View Included Tests”</span> to see full details for a single package.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button as={Link} href={siteConfig.bookingUrl}>Book a package online</Button>
                <Button as={Link} href="/tests" variant="outline">Book A Test</Button>
                <Button as={Link} href={"https://wa.me/" + siteConfig.internalNotifyNumber} variant="outline" target="_blank" leftIcon={<FaWhatsapp />}>Talk to us on WhatsApp</Button>
              </div>
              <div className="mt-4 hidden flex-wrap gap-2 md:flex">
                <span className="shadow-soft rounded-full bg-white px-3 py-1 text-[11px] text-[var(--sdrc-teal-deep)]">
                  Fasting guidance shared in advance
                </span>
                <span className="shadow-soft rounded-full bg-white px-3 py-1 text-[11px] text-[var(--sdrc-teal-deep)]">
                  Doctor-friendly report formats
                </span>
                <span className="shadow-soft rounded-full bg-white px-3 py-1 text-[11px] text-[var(--sdrc-teal-deep)]">
                  Same-day results for most tests
                </span>
              </div>
            </div>

            <Card accent="orange" className="rise-in hidden p-6 lg:block" style={{ animationDelay: "120ms" }}>
              <h2 className="mb-2 text-xl font-bold leading-snug text-slate-900">Not sure which package is right for you?</h2>
              <p className="mb-3 text-sm leading-relaxed text-slate-700">
                You can compare packages or share your age, concerns and existing conditions on WhatsApp.
              </p>
              <p className="text-xs leading-relaxed text-slate-500">Many panels require 10–12 hours of fasting. Please confirm preparation instructions while booking.</p>
            </Card>
          </div>
        </TwContainer>
      </section>

      <PackagesExplorer />
    </>
  );
}
