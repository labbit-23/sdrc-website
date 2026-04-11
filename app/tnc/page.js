"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";

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
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" className="hero-title">
            Terms & Conditions
            <Box as="span" color="teal.700" className="hero-subline">&nbsp;of Reporting</Box>
          </Heading>
          <Text mt={3} color="gray.600" fontSize="sm">
            Please review these reporting terms before using any report for medical decisions.
          </Text>
        </Container>
      </Box>

      <Container maxW="1200px" py={10}>
        <Box className="soft-card" p={{ base: 5, md: 8 }}>
          <VStack align="stretch" gap={3}>
            {terms.map((line, idx) => (
              <Text key={line} fontSize="sm" color="gray.700" lineHeight={1.75}>
                <Box as="span" fontWeight="700" mr={2}>{idx + 1}.</Box>
                {idx === 14 ? (
                  <>
                    All information collected and generated in SDRC is stored and distributed based on our privacy policy available at{" "}
                    <Link href="/privacy-policy" style={{ color: "#00695f", textDecoration: "underline" }}>
                      www.sdrc.in/privacy-policy
                    </Link>
                    .
                  </>
                ) : (
                  line
                )}
              </Text>
            ))}
          </VStack>
        </Box>
      </Container>
    </>
  );
}
