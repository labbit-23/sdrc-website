"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { TwContainer } from "@/components/site/tw-layout";

const terms = [
  "The reported results are for information and interpretation by qualified medical professionals who understand units, reference ranges and technology limitations. SDRC is not responsible for self-interpretation.",
  "It is presumed that the specimen(s)/sample(s) belong to the named patient/client. SDRC does not establish legal identity of the patient/client.",
  "Reported results are restricted to the submitted specimen(s)/sample(s) only.",
  "Results may vary across labs and across time due to assay methods, equipment, method specificity, sensitivity, interfering factors, and sample quality.",
  "Reports are to assist diagnosis along with clinical findings and related investigations; they should not be interpreted in isolation.",
  "Reports are generally preserved for 3 months from test date. Duplicate copies may be issued on request as a service and not as a binding obligation.",
  "Histopathology samples are preserved for one month from testing date; blocks for three months; blood samples are discarded after 24 hours; urine/stool samples are discarded after reports are issued.",
  "Neither SDRC nor its directors/employees/representatives assume liability for any loss or damage arising from interpretation/use of reports. Any claim, if maintainable, is limited to the test cost.",
  "This report shall not be reproduced, except in full, without prior written approval of SDRC.",
  "A Preliminary Report indicates some results are available while one or more tests remain pending. Final culture/identification/susceptibility may still be pending in microbiology until Final Report is issued.",
  "Tests are performed as per schedule in the patient information booklet. In case of kit non-availability, instrument breakdown, natural calamities, pandemics, etc., tests may be delayed or rescheduled.",
  "While care is taken to ensure correctness, SDRC does not accept responsibility for inadvertent errors or omissions.",
  "Some tests may be referred to NABL-accredited referral laboratories. Such outsourced testing may be reported directly or noted in SDRC reports at SDRC's discretion.",
  "Reports issued by SDRC are not valid for medicolegal purposes unless explicitly stated.",
  "All information collected and generated in SDRC is stored and distributed based on our privacy policy available at www.sdrc.in/privacy-policy.",
  "Claims, if any, are subject to Hyderabad, India jurisdiction."
];

export default function ReportingTermsPage() {
  return (
    <>
      <section className="brochure-bg py-10 md:py-14"><TwContainer>
          <h1 className="hero-title text-slate-800">Terms &amp; Conditions<span className="hero-subline text-[var(--sdrc-teal-deep)]">&nbsp;of Reporting</span></h1>
          <p className="mt-3 text-sm text-slate-600">
            Please review these reporting terms before using any report for medical decisions.
          </p>
      </TwContainer></section>

      <TwContainer className="py-10"><div className="soft-card p-5 md:p-8">
          <div className="flex flex-col gap-3">
            {terms.map((line, idx) => (
              <p key={line} className="text-sm leading-7 text-slate-700">
                <span className="mr-2 font-bold">{idx + 1}.</span>
                {idx === 14 ? (
                  <>
                    All information collected and generated in SDRC is stored and distributed based on our privacy policy available at{" "}
                    <Link href="/privacy-policy" className="text-[var(--sdrc-teal-deep)] underline">
                      www.sdrc.in/privacy-policy
                    </Link>
                    .
                  </>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div></TwContainer>
    </>
  );
}
