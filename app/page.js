"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Box, Button, Container, Grid, Heading, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

const facilityChips = [
  "CT",
  "Digital X-Ray",
  "Mammography",
  "DEXA",
  "Ultrasound & Doppler",
  "ECG / 2D-Echo",
  "EEG / ENMG",
  "TMT",
  "Spirometry",
  "Pathology"
];

const facilities = [
  {
    title: "Imaging",
    items: ["Multi-slice CT", "Digital X-Ray", "Mammography", "DEXA", "Ultrasound & Colour Doppler"]
  },
  {
    title: "Cardio & Neuro",
    items: ["ECG & 2D-Echo", "TMT (Stress Test)", "EEG & ENMG", "Spirometry (PFT)"]
  },
  {
    title: "Pathology Lab",
    items: ["Biochemistry & Endocrinology", "Haematology & Coagulation", "Clinical Pathology", "Microbiology & Serology", "Cytology & Histopathology"]
  }
];

const reviews = [
  {
    name: "Corporate Executive",
    text: "Quick reporting and very professional staff. Got my full body checkup and reports were easy to understand."
  },
  {
    name: "Consulting Physician",
    text: "We regularly use SDRC for diabetic and cardiac monitoring. The team is responsive and reports are reliable."
  },
  {
    name: "Resident of Secunderabad",
    text: "Home collection was convenient and the technician was courteous. Got reports on WhatsApp and email."
  }
];

const packagePreviewCards = [
  {
    title: "Executive Wellness Checkup",
    desc: "For young professionals and busy executives.",
    params: "62-75 parameters",
    price: "From INR 1,800",
    points: [
      "CBC, ESR, fasting sugar, HbA1c",
      "Lipid and liver profile",
      "Creatinine, TSH, urine analysis"
    ],
    href: "/packages#executive-wellness-checkup"
  },
  {
    title: "Master Wellness Checkup",
    desc: "Comprehensive annual health check with vitamins.",
    params: "77-80 parameters",
    price: "From INR 3,600",
    points: [
      "Full blood and metabolic profile",
      "Thyroid, Vitamin D and B12",
      "Ultrasound, X-Ray and ECG (Total pack)"
    ],
    href: "/packages#master-wellness-checkup"
  },
  {
    title: "Cardiac Wellness",
    desc: "For those with cardiac risk factors or family history.",
    params: "38-50 parameters",
    price: "From INR 3,100",
    points: [
      "Lipid profile, sugars, CBC",
      "2D Echo, TMT (Comprehensive)",
      "CPK, cardiac risk markers"
    ],
    href: "/packages#cardiac-wellness"
  }
];

export default function HomePage() {
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    const target = 1000;
    const durationMs = 1400;
    const start = performance.now();
    let frameId = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setReportCount(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr .95fr" }} gap={{ base: 8, lg: 10 }} alignItems="center">
            <Box className="rise-in">
              <Text display="inline-flex" bg="teal.50" color="teal.700" fontSize="xs" fontWeight="700" px={3} py={1} borderRadius="full" textTransform="uppercase" letterSpacing="wide">
                Secunderabad Diagnostic and Research Centre
              </Text>

              <Heading mt={4} size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="14ch" className="hero-title">
                Advanced Diagnostic Care
                <Box as="span" color="orange.500" className="hero-subline">at Jade Arcade, Paradise</Box>
              </Heading>

              <Text mt={4} fontSize={{ base: "md", md: "lg" }} color="gray.700" maxW="2xl">
                Ultrasound and Doppler, CT, Digital X-Ray, Mammography, DEXA, ECG/2D-Echo,
                EEG/ENMG, TMT, Spirometry and a full-service pathology lab with preventive health packages.
              </Text>

              <HStack mt={5} spacing={2} flexWrap="wrap">
                {facilityChips.map((chip) => (
                  <Link key={chip} href="/services">
                    <Box px={3} py={1.5} bg="white" border="1px solid" borderColor="teal.100" borderRadius="full" fontSize="xs" fontWeight="500" color="gray.700" className="shadow-soft">
                      {chip}
                    </Box>
                  </Link>
                ))}
              </HStack>

              <HStack mt={7} spacing={3} flexWrap="wrap">
                <Button as={Link} href="/packages" size="lg">
                  View Health Packages
                </Button>
                <Button as={Link} href={siteConfig.bookingUrl} variant="outline" size="lg" target="_blank">
                  Book a Test
                </Button>
              </HStack>

              <SimpleGrid mt={4} columns={{ base: 1, sm: 3 }} spacing={3} maxW="760px">
                <Box as={Link} href={"https://wa.me/" + siteConfig.internalNotifyNumber} target="_blank" className="soft-card no-hover-lift" p={3}>
                  <Text fontSize="xs" color="gray.500">Need help selecting tests?</Text>
                  <Text fontSize="sm" color="teal.700" fontWeight="700">Chat with lab team</Text>
                </Box>
                <Box as={Link} href={siteConfig.reportsUrl} target="_blank" className="soft-card no-hover-lift" p={3}>
                  <Text fontSize="xs" color="gray.500">Already tested with SDRC?</Text>
                  <Text
                    fontSize="sm"
                    color="teal.700"
                    fontWeight="700"
                    title="Get our bot to send your reports. Chat using your registered mobile number."
                  >
                    Download Reports
                  </Text>
                </Box>
                <Box as={Link} href={siteConfig.quickBookingUrl} className="soft-card no-hover-lift" p={3}>
                  <Text fontSize="xs" color="gray.500">Need only date and time slot booking?</Text>
                  <Text fontSize="sm" color="teal.700" fontWeight="700">Home Visit Request</Text>
                </Box>
              </SimpleGrid>

              <Text mt={3} fontSize="xs" color="gray.500">
                NABL accredited laboratory. Reports available online and on WhatsApp.
              </Text>

              <SimpleGrid mt={8} columns={{ base: 1, sm: 3 }} spacing={4} maxW="760px">
                <Box className="soft-card" p={4} textAlign="center">
                  <Text fontSize="sm" color="gray.600">Reports/day</Text>
                  <Heading size="lg" color="teal.700">{reportCount.toLocaleString("en-IN")}+</Heading>
                </Box>
                <Box className="soft-card" p={4} textAlign="center">
                  <Text fontSize="sm" color="gray.600">Experience</Text>
                  <Image src="/assets/sdrc-40-years.png" alt="40 years" width={72} height={72} style={{ width: 72, height: "auto", margin: "8px auto 0" }} />
                </Box>
                <Box className="soft-card" p={4} textAlign="center">
                  <Text fontSize="sm" color="gray.600">Avg. TAT</Text>
                  <Heading size="md" color="teal.700">Same-day*</Heading>
                </Box>
              </SimpleGrid>
            </Box>

            <Box position="relative" className="rise-in" style={{ animationDelay: "120ms" }}>
              <Box className="float-slow" position="absolute" top="-24px" right="-24px" w="260px" h="260px" bg="teal.200" borderRadius="full" filter="blur(46px)" opacity={0.35} />
              <Box className="float-slow" position="absolute" bottom="-24px" left="-20px" w="280px" h="280px" bg="orange.200" borderRadius="full" filter="blur(52px)" opacity={0.35} style={{ animationDelay: "1.2s" }} />
              <Box className="soft-card" p={3} position="relative" zIndex={2}>
                <Image src="/assets/sdrc-services.png" alt="SDRC Services" width={720} height={920} style={{ width: "100%", height: "auto", borderRadius: 14 }} />
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <Heading size="xl" mb={6}>All facilities under one roof</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {facilities.map((group) => (
            <Box key={group.title} className="soft-card" p={6}>
              <Heading size="md" mb={3}>{group.title}</Heading>
              {group.items.map((item) => (
                <Text key={item} fontSize="sm" color="gray.700">• {item}</Text>
              ))}
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Container maxW="1200px" py={6}>
        <HStack justify="space-between" align="end" mb={6} flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="xl">Popular health check packages</Heading>
            <Text color="gray.700" fontSize="sm">A few of our most commonly chosen panels. View the full list on the packages page.</Text>
          </Box>
          <Link href="/packages">
            <Text color="teal.700" fontWeight="700" fontSize="sm">View all packages</Text>
          </Link>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {packagePreviewCards.map((card) => (
            <Box key={card.title} className="soft-card rise-in" p={5} display="flex" flexDirection="column">
              <Heading size="sm" color="teal.700">{card.title}</Heading>
              <Text mt={2} fontSize="sm" color="gray.600">{card.desc}</Text>
              <Text mt={2} fontSize="xs" color="gray.500">{card.params}</Text>
              <Text mt={2} color="orange.500" fontWeight="700">{card.price}</Text>
              <Box mt={2} flex="1">
                {card.points.map((point) => (
                  <Text key={point} mt={1} fontSize="xs" color="gray.700">• {point}</Text>
                ))}
              </Box>
              <Button as={Link} href={card.href} mt={4} size="sm" w="full" textAlign="center" display="inline-flex" alignItems="center" justifyContent="center" lineHeight="1">
                View details
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Container maxW="1200px" py={12}>
        <Heading size="xl" mb={6}>What patients say</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {reviews.map((review) => (
            <Box key={review.name} className="soft-card" p={6}>
              <Text mt={2} color="gray.700" fontSize="sm">&ldquo;{review.text}&rdquo;</Text>
              <Text mt={3} fontWeight="600" color="teal.700">- {review.name}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Box bg="teal.700" color="white" py={12}>
        <Container maxW="1200px" textAlign="center">
          <Heading size={{ base: "lg", md: "xl" }} mb={3}>Ready to schedule your tests?</Heading>
          <Text fontSize={{ base: "md", md: "lg" }} mb={6}>
            Share prescription on WhatsApp or book directly through our online portal.
          </Text>
          <HStack justify="center" spacing={4} flexWrap="wrap">
            <Button
              as={Link}
              href={"https://wa.me/" + siteConfig.whatsappNumber}
              variant="light"
              size="lg"
              lineHeight="1"
              alignItems="center"
              justifyContent="center"
            >
              WhatsApp SDRC
            </Button>
            <Button
              as={Link}
              href={siteConfig.bookingUrl}
              variant="outlineLight"
              size="lg"
              lineHeight="1"
              alignItems="center"
              justifyContent="center"
              target="_blank"
            >
              Book tests online
            </Button>
          </HStack>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <Heading size="xl" mb={6}>NABL Accredited and CGHS Approved</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box className="soft-card" p={6}>
            <HStack spacing={4} align="start">
              <Image src="/assets/nabl-symbol.png" alt="NABL" width={74} height={74} style={{ width: 74, height: "auto" }} />
              <Text mt={1} fontSize="sm" color="gray.700">
                Laboratory tests included in the accredited scope at SDRC are NABL accredited (ISO 15189:2022). Imaging and other non-laboratory services are not covered.{" "}
                <Link href="/accreditation">
                  <Box as="span" color="teal.700" fontWeight="700" textDecoration="underline">
                    View details
                  </Box>
                </Link>
              </Text>
            </HStack>
          </Box>
          <Box className="soft-card" p={6}>
            <HStack spacing={4} align="start">
              <Image src="/assets/cghs-logo.png" alt="CGHS" width={74} height={74} style={{ width: 74, height: "auto" }} />
              <Text mt={1} fontSize="sm" color="gray.700">
                SDRC Diagnostics is a CGHS empanelled diagnostic centre for eligible beneficiaries in Hyderabad and Secunderabad.
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>
      </Container>
    </>
  );
}
