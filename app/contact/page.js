"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form";
import { Chip, TwContainer } from "@/components/site/tw-layout";
import { FadeIn } from "@/components/site/motionUtils";
import { siteConfig } from "@/data/siteConfig";

const centres = [
  {
    name: "SD Road",
    address: ["1-1-58/7/3, Srinath Complex, SD Road", "Opp. Taj Mahal Hotel", "Secunderabad - 500003, Telangana"],
    map: siteConfig.locations.sdRoad,
  },
  {
    name: "West Marredpally",
    address: ["Plot No. 35 & 36, Santhoshima Colony, West Marredpally", "Next to Happy Women's Clinic", "Secunderabad - 500026, Telangana"],
    map: siteConfig.locations.marredpally,
  },
  {
    name: "Yapral",
    address: ["Ambey Nilayam, Ground Floor, Bhanu Enclave, Yapral", "Near Bhanu Enclave", "Secunderabad - 500087, Telangana"],
    map: siteConfig.locations.yapral,
  },
];

const mapEmbedSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13401.644712873018!2d78.4691960871582!3d17.441311199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a10b7ee2ab1%3A0xf08c95962eaf6b5b!2sSDRC%20-%20The%20Secunderabad%20Diagnostic%20and%20Research%20Centre!5e1!3m2!1sen!2sin!4v1764932257326!5m2!1sen!2sin";

function ContactCard({ title, children, note, className = "" }) {
  return (
    <Card className={`flex h-full flex-col p-4 ${className}`}>
      <h3 className="mb-1 font-bold leading-snug text-slate-800">{title}</h3>
      <div className="text-sm font-semibold leading-6 text-[var(--sdrc-teal-deep)]">{children}</div>
      <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">{note}</p>
    </Card>
  );
}

export default function ContactPage() {
  const whatsappDisplay = "+91 " + siteConfig.whatsappNumber.slice(2);

  return (
    <>
      <section className="brochure-bg py-10 md:py-14">
        <TwContainer className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rise-in">
            <Chip>Jade Arcade, Paradise · Secunderabad</Chip>
            <h1 className="hero-title mt-4 text-slate-800">
              Contact SDRC Diagnostics
              <span className="hero-subline text-[var(--sdrc-teal-deep)]">Main Centre and Collection Centres</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              Reach us for appointments, health packages, home sample collection or report-related queries.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ContactCard title="Call" note="Centre timings apply." className="hidden sm:flex">
                <Link href={`tel:${siteConfig.phoneTel}`}>{siteConfig.phoneDisplay}</Link>
              </ContactCard>
              <ContactCard title="WhatsApp" note="Share prescriptions or booking queries.">
                <Link href={`https://wa.me/${siteConfig.whatsappNumber}`}>{whatsappDisplay}</Link>
              </ContactCard>
              <ContactCard title="Email" note="For formal communication.">
                <Link href="mailto:info@sdrc.in">info@sdrc.in</Link>
              </ContactCard>
            </div>
            <Button as={Link} href="/feedback" variant="outline" size="sm" className="mt-5">
              Share Feedback
            </Button>
          </div>

          <Card accent="teal" className="hero-side-card hidden p-6 lg:block">
            <h2 className="text-lg font-bold leading-snug text-slate-800">Quick enquiry</h2>
            <p className="mb-4 mt-2 text-sm leading-6 text-slate-600">
              This form opens your mail app with the enquiry details.
            </p>
            <form className="flex flex-col gap-3" action="mailto:info@sdrc.in" method="post" encType="text/plain">
              <Input placeholder="Name" name="Name" required />
              <Input placeholder="Mobile number" name="Mobile" />
              <Textarea placeholder="Query / message" name="Message" rows={4} />
              <Button type="submit">Send via email</Button>
            </form>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              For urgent medical issues, please contact your treating doctor or nearest hospital.
            </p>
          </Card>
        </TwContainer>
      </section>

      <main className="py-12">
        <TwContainer>
          <FadeIn>
            <section>
              <h2 className="mb-4 text-xl font-semibold text-slate-800">Main centre - Jade Arcade, Paradise</h2>
              <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                <Card accent="teal" className="p-6">
                  <h3 className="font-bold leading-snug text-slate-800">Address</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    101, Jade Arcade (Corporate Block), Paradise,<br />
                    MG Road (Next to Dadus)<br />
                    Secunderabad - 500003, Telangana, India
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    <strong>Phone:</strong> <Link className="font-semibold text-[var(--sdrc-teal-deep)]" href={`tel:${siteConfig.phoneTel}`}>{siteConfig.phoneDisplay}</Link><br />
                    <strong>Email:</strong> <Link className="font-semibold text-[var(--sdrc-teal-deep)]" href="mailto:info@sdrc.in">info@sdrc.in</Link><br />
                    <strong>WhatsApp:</strong> <Link className="font-semibold text-[var(--sdrc-teal-deep)]" href={`https://wa.me/${siteConfig.whatsappNumber}`}>{whatsappDisplay}</Link>
                  </p>
                  <h3 className="mb-2 mt-5 font-bold leading-snug text-slate-800">Centre timings</h3>
                  <div className="grid gap-1 text-sm leading-6 text-slate-700 sm:max-w-[420px]">
                    <div className="flex justify-between gap-4"><span>Monday - Saturday</span><span>7:00 AM - 9:00 PM</span></div>
                    <div className="flex justify-between gap-4"><span>Sunday/Holidays</span><span>7:00 AM - 2:00 PM</span></div>
                  </div>
                </Card>

                <Card className="overflow-hidden p-0">
                  <div className="h-[260px] w-full md:h-[320px]">
                    <iframe
                      title="SDRC Main Centre map"
                      src={mapEmbedSrc}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="p-4">
                    <Button as={Link} href={siteConfig.locations.main} target="_blank" className="w-full">
                      Open in Google Maps
                    </Button>
                  </div>
                </Card>
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={60}>
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold text-slate-800">Our centres</h2>
              <p className="mb-4 text-sm text-slate-700">You can give samples or enquire about home collection at these SDRC centres.</p>
              <div className="grid gap-6 md:grid-cols-3">
                {centres.map((centre) => (
                  <Card key={centre.name} className="p-6">
                    <h3 className="text-lg font-bold leading-snug text-slate-800">{centre.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {centre.address.map((line) => <span key={line} className="block">{line}</span>)}
                    </p>
                    <Link href={centre.map} target="_blank" className="mt-4 inline-block text-sm font-bold text-[var(--sdrc-teal-deep)]">
                      View on Google Maps
                    </Link>
                  </Card>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">Centre timings and available tests may vary by location. Please call or WhatsApp before visiting.</p>
            </section>
          </FadeIn>

          <FadeIn delay={60}>
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold text-slate-800">WhatsApp and Reports Guide</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card accent="teal" className="p-6">
                  <p className="mb-2 font-bold">Test booking help (human support)</p>
                  <p className="text-sm text-slate-700">For package or test selection help, chat with our team on WhatsApp.</p>
                  <Button as={Link} href={"https://wa.me/" + siteConfig.whatsappNumber} target="_blank" className="mt-3" leftIcon={<FaWhatsapp />}>Chat on WhatsApp</Button>
                </Card>
                <Card className="p-6">
                  <p className="mb-2 font-bold">Download reports (bot-assisted)</p>
                  <p className="text-sm text-slate-700">Use your registered mobile number to retrieve reports through our report flow.</p>
                  <Button as={Link} href={siteConfig.reportsUrl} target="_blank" variant="outline" className="mt-3" leftIcon={<FaWhatsapp />} title="Get our bot to send your reports. Chat using your registered mobile number.">Download Reports</Button>
                </Card>
              </div>
            </section>
          </FadeIn>
        </TwContainer>
      </main>
    </>
  );
}
