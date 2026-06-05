"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Box, Button, Container, Grid, Heading, HStack, Text } from "@chakra-ui/react";
import PackagesExplorer from "@/components/site/PackagesExplorer";
import { siteConfig } from "@/data/siteConfig";
import { FadeIn } from "@/components/site/motionUtils";

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
      <Box className="brochure-bg functional-hero-cover" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr .95fr" }} gap={10} alignItems="center">
            <Box>
              <span className="chip chip-orange" style={{ marginBottom: 16, display: "inline-flex" }}>Health check packages</span>
              <Heading color="gray.800" className="hero-title" mt={2}>
                Master Health Check
                <Box as="span" color="orange.500" className="hero-subline">Packages</Box>
              </Heading>
              <Text mt={4} fontSize="lg" color="gray.700">
                From quick screening panels to in-depth cardiac, diabetic, women’s and lifestyle wellness plans — all under one roof.
              </Text>
              <Text mt={3} color="gray.600" fontSize="sm" display={{ base: "none", md: "block" }}>
                Select <Box as="span" fontWeight="700">“Compare”</Box> on two or more variants to see them side-by-side,
                or <Box as="span" fontWeight="700">“View Included Tests”</Box> to see full details for a single package.
              </Text>
              <HStack mt={5} spacing={3} flexWrap="wrap">
                <Button as={Link} href={siteConfig.bookingUrl}>Book a package online</Button>
                <Button as={Link} href="/tests" variant="outline">Book A Test</Button>
                <Button as={Link} href={"https://wa.me/" + siteConfig.internalNotifyNumber} variant="outline" target="_blank" leftIcon={<FaWhatsapp />}>Talk to us on WhatsApp</Button>
              </HStack>
              <HStack mt={4} spacing={2} flexWrap="wrap" display={{ base: "none", md: "flex" }}>
                <Text px={3} py={1} borderRadius="full" bg="white" className="shadow-soft" fontSize="11px" color="teal.700">
                  Fasting guidance shared in advance
                </Text>
                <Text px={3} py={1} borderRadius="full" bg="white" className="shadow-soft" fontSize="11px" color="teal.700">
                  Doctor-friendly report formats
                </Text>
                <Text px={3} py={1} borderRadius="full" bg="white" className="shadow-soft" fontSize="11px" color="teal.700">
                  Same-day results for most tests
                </Text>
              </HStack>
            </Box>

            <Box className="soft-card-orange" p={6} display={{ base: "none", lg: "block" }}>
              <Heading size="md" mb={2}>Not sure which package is right for you?</Heading>
              <Text color="gray.700" fontSize="sm" mb={3}>
                You can compare packages or share your age, concerns and existing conditions on WhatsApp.
              </Text>
              <Text color="gray.500" fontSize="xs">Many panels require 10–12 hours of fasting. Please confirm preparation instructions while booking.</Text>
            </Box>
          </Grid>
        </Container>
      </Box>

      <PackagesExplorer />
    </>
  );
}
