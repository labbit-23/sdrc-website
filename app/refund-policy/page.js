import Link from "next/link";
import { TwContainer } from "@/components/site/tw-layout";
import { siteConfig } from "@/data/siteConfig";

export const metadata = {
  title: "Refunds & Cancellations | SDRC Diagnostics",
  description: "How cancellations, rescheduling and refunds work for tests and health packages booked and paid for with SDRC Diagnostics.",
  alternates: { canonical: "/refund-policy" },
};

const sections = [
  {
    title: "Cancelling a booking",
    points: [
      "Tests and health packages at our centre: you can cancel or reschedule free of charge any time before you are billed.",
      "Home sample collection: you can cancel free of charge until a collector is assigned to your visit. Once a collector is assigned, the visit is no longer free to cancel. Please call us and we will see what can be done.",
      "Imaging and scans (X-ray, ultrasound, CT, mammography, DEXA, echo and similar) and doctor-based services: free cancellation applies only until an appointment or slot is fixed with a doctor or technician, or the procedure has begun.",
      "To cancel, call us on " + siteConfig.phoneDisplay + " or message us on WhatsApp with your name, mobile number and booking details.",
    ],
  },
  {
    title: "When a refund is given",
    points: [
      "Booking cancelled within the free-cancellation window above (before billing at a centre, or before a collector is assigned for home collection): full refund of the amount paid.",
      "SDRC cancels or cannot complete the visit or test (for example a technician is unavailable, or the test cannot be performed): full refund of the affected amount, or free rescheduling if you prefer.",
      "Sample is rejected (for example insufficient, haemolysed or leaked sample) and a fresh sample cannot be collected: refund for the affected test(s).",
      "Payment debited but the booking was not confirmed, or the same booking was paid twice: the extra or unconfirmed amount is refunded in full.",
    ],
  },
  {
    title: "When a refund is not given",
    points: [
      "After the sample has been collected and processing has started, because the test has been performed and the sample cannot be reused.",
      "Imaging, scans and doctor-based services once a doctor appointment or slot has been fixed, or the procedure or any preparation for it has begun.",
      "For a test result that is simply different from what you expected. If you have a concern about a result, contact us and we will review it with the pathologist.",
      "For an offer or festival package that has been fully availed.",
    ],
  },
  {
    title: "How and when you are refunded",
    points: [
      "Refunds go back to the original payment method (UPI, card or net banking) used for the booking.",
      "Approved refunds are initiated within 2 working days and normally reach your account in 5 to 7 working days, depending on your bank.",
      "If a package is part-used, the refund is the amount paid less the price of the tests already performed.",
    ],
  },
  {
    title: "Pricing and payment",
    points: [
      "All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise.",
      "Home sample collection charges are always additional to the test or package price: Rs 200 minimum, up to Rs 400 depending on the distance. The exact charge is shown before you pay.",
      "Online payments are processed by Cashfree Payments. SDRC does not store your card or bank details.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      <section className="brochure-bg py-10 md:py-14">
        <TwContainer>
          <h1 className="hero-title text-slate-800">
            Refunds &amp; Cancellations
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            How cancellation, rescheduling and refunds work for tests and health packages booked with SDRC Diagnostics.
          </p>
        </TwContainer>
      </section>

      <TwContainer className="py-10">
        <div className="soft-card p-5 md:p-8">
          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-slate-800">{section.title}</h2>
                <ul className="mt-2 flex flex-col gap-2">
                  {section.points.map((point) => (
                    <li key={point} className="text-sm leading-7 text-slate-700">• {point}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-sm leading-7 text-slate-700">
              To cancel or ask about a refund: call <Link href={"tel:" + siteConfig.phoneTel} className="text-[var(--sdrc-teal-deep)] underline">{siteConfig.phoneDisplay}</Link>
              {" "}or message us on{" "}
              <Link href={"https://wa.me/" + siteConfig.whatsappNumber} target="_blank" rel="noopener noreferrer" className="text-[var(--sdrc-teal-deep)] underline">WhatsApp</Link>.
              See also our <Link href="/tnc" className="text-[var(--sdrc-teal-deep)] underline">Terms &amp; Conditions</Link> and{" "}
              <Link href="/privacy-policy" className="text-[var(--sdrc-teal-deep)] underline">Privacy Policy</Link>.
              Address: Jade Arcade, MG Road, Paradise, Secunderabad 500003.
            </p>
          </div>
        </div>
      </TwContainer>
    </>
  );
}
