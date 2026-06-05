"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Box, Button, Container, Grid, Heading, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { FadeIn } from "@/components/site/motionUtils";
import { getCurrentPromo } from "@/data/featuredPromo";
import healthPackagesData from "@/data/health-packages.json";

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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatInrFrom(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price on request";
  return `From INR ${amount.toLocaleString("en-IN")}`;
}

function getParameterRange(variants) {
  const params = (variants || [])
    .map((v) => Number(v.parameters))
    .filter((v) => Number.isFinite(v));
  if (params.length === 0) return "Parameters vary";
  const min = Math.min(...params);
  const max = Math.max(...params);
  return min === max ? `${min} parameters` : `${min}-${max} parameters`;
}

const homepagePreviewPackageNames = [
  "Executive Wellness Checkup",
  "Master Wellness Checkup",
  "Cardiac Wellness"
];

const packagePreviewCards = homepagePreviewPackageNames
  .map((name) => (healthPackagesData.packages || []).find((pkg) => pkg.name === name))
  .filter(Boolean)
  .map((pkg) => {
    const variants = Array.isArray(pkg.variants) ? pkg.variants : [];
    const minPrice = Math.min(
      ...variants.map((v) => Number(v.price)).filter((v) => Number.isFinite(v))
    );
    const firstVariant = variants[0] || {};
    const keyInclusions = Array.isArray(firstVariant.key_inclusions) && firstVariant.key_inclusions.length > 0
      ? firstVariant.key_inclusions
      : (firstVariant.tests || []).slice(0, 3);

    return {
      title: pkg.name,
      desc: pkg.description || "",
      params: getParameterRange(variants),
      price: formatInrFrom(minPrice),
      points: keyInclusions.slice(0, 3),
      href: `/packages#${slugify(pkg.name)}`
    };
  });

export default function HomePage() {
  const [reportCount, setReportCount] = useState(0);
  const promo = getCurrentPromo();

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
      <Box className="brochure-bg home-hero-cover" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr .95fr" }} gap={{ base: 8, lg: 10 }} alignItems="center">
            <Box className="rise-in">
              <Text display="inline-flex" bg="teal.50" color="teal.700" fontSize="xs" fontWeight="700" px={3} py={1} borderRadius="full" textTransform="uppercase" letterSpacing="wide">
                Secunderabad Diagnostic and Research Centre
              </Text>

              <Heading mt={4} size={{ base: "2xl", md: "5xl" }} color="gray.800" className="hero-title">
                Advanced Diagnostic Care
                <Box as="span" color="orange.500" className="hero-subline">
                  at{" "}
                  <Box as="span">
                    Jade Arcade, Paradise
                  </Box>
                </Box>
              </Heading>

              <Text mt={4} fontSize={{ base: "md", md: "lg" }} color="gray.800" fontWeight="500" maxW="2xl" display={{ base: "none", md: "block" }}>
                Ultrasound and Doppler, CT, Digital X-Ray, Mammography, DEXA, ECG/2D-Echo,
                EEG/ENMG, TMT, Spirometry and a full-service pathology lab with preventive health packages.
              </Text>
              <Text mt={2} fontSize="sm" color="gray.500" maxW="2xl" display={{ base: "none", md: "block" }}>
                SDRC (Secunderabad Diagnostic and Research Centre) is a NABL accredited multi-specialty diagnostic centre established in 1983, serving Secunderabad, Hyderabad and Telangana from Jade Arcade, Paradise.
              </Text>

              <HStack mt={5} spacing={2} flexWrap="wrap" display={{ base: "none", md: "flex" }}>
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
                <Button
                  as={Link}
                  href={siteConfig.bookingUrl}
                  size="lg"
                  leftIcon={<FiSearch />}
                  className="book-test-cta"
                >
                  <Text>Book a Test</Text>
                  <Box as="span" className="book-test-ribbon" display={{ base: "inline-block", md: "none" }}>NEW</Box>
                </Button>
              </HStack>

              <SimpleGrid mt={4} columns={{ base: 1, sm: 3 }} spacing={3} maxW="760px">
                <Box as={Link} href={"https://wa.me/" + siteConfig.internalNotifyNumber} target="_blank" className="soft-card no-hover-lift" p={3}>
                  <Text fontSize="xs" color="gray.500">Need help selecting tests?</Text>
                  <HStack spacing={1.5}>
                    <FaWhatsapp />
                    <Text fontSize="sm" color="teal.700" fontWeight="700">Chat with lab team</Text>
                  </HStack>
                </Box>
                <Box as={Link} href={siteConfig.reportsUrl} target="_blank" className="soft-card no-hover-lift" p={3}>
                  <Text fontSize="xs" color="gray.500">Already tested with SDRC?</Text>
                  <HStack spacing={1.5}>
                    <FaWhatsapp />
                    <Text
                      fontSize="sm"
                      color="teal.700"
                      fontWeight="700"
                      title="Get our bot to send your reports. Chat using your registered mobile number."
                    >
                      Download Reports
                    </Text>
                  </HStack>
                </Box>
                <Box as={Link} href={siteConfig.quickBookingUrl} className="soft-card no-hover-lift home-visit-card-cta" p={3} position="relative">
                  <Text fontSize="xs" color="gray.500">Want to book a home visit?</Text>
                  <Text fontSize="sm" color="teal.700" fontWeight="700">Request Home Visit</Text>
                </Box>
              </SimpleGrid>

              <Text mt={3} fontSize="xs" color="gray.500">
                NABL accredited laboratory. Reports available online and on WhatsApp.
              </Text>

              <SimpleGrid mt={8} columns={{ base: 1, sm: 3 }} spacing={4} maxW="760px" display={{ base: "none", sm: "grid" }}>
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

            <Box position="relative" overflow="hidden" className="hero-visual-reveal" style={{ animationDelay: "220ms" }}>
              <Box className="float-slow" position="absolute" top="-24px" right="-24px" w="260px" h="260px" bg="teal.200" borderRadius="full" filter="blur(46px)" opacity={0.35} />
              <Box className="float-slow" position="absolute" bottom="-24px" left="-20px" w="280px" h="280px" bg="orange.200" borderRadius="full" filter="blur(52px)" opacity={0.35} style={{ animationDelay: "1.2s" }} />
              <Box className="soft-card" p={3} position="relative" zIndex={2}>
                <Image src="/assets/sdrc-services.png" alt="SDRC Services" width={720} height={920} style={{ width: "100%", height: "auto", borderRadius: 14 }} />
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* ── Monthly featured service promo ── */}
      {promo && (
        <Box py={{ base: 10, md: 14 }} style={{ background: "linear-gradient(135deg, #0f172a 0%, #0f2a27 55%, #0f172a 100%)", position: "relative", overflow: "hidden" }}>
          {/* decorative blobs */}
          <Box style={{ position: "absolute", top: "-60px", right: "-60px", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${promo.accent}26 0%, transparent 70%)`, pointerEvents: "none" }} />
          <Box style={{ position: "absolute", bottom: "-60px", left: "-40px", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,105,57,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <Container maxW="1200px" position="relative" zIndex={1}>
            <FadeIn>
              <Grid templateColumns={{ base: "1fr", lg: "1fr auto" }} gap={{ base: 6, lg: 12 }} alignItems="center">
                <Box>
                  <HStack spacing={3} mb={4} flexWrap="wrap">
                    <Box style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                      {promo.badge}
                    </Box>
                    <Box style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", background: `${promo.accent}30`, color: "#4dd9cb" }}>
                      {promo.eyebrow}
                    </Box>
                  </HStack>

                  <Heading color="white" fontWeight="900" fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1.15" letterSpacing="-0.02em">
                    {promo.headline}
                  </Heading>
                  <Text mt={1} style={{ fontSize: "clamp(1rem,2vw,1.25rem)", fontWeight: 700, background: "linear-gradient(90deg, #f26939, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {promo.subline}
                  </Text>

                  <Text mt={3} color="rgba(255,255,255,0.55)" fontSize={{ base: "sm", md: "md" }} maxW="560px" lineHeight="1.7">
                    {promo.body}
                  </Text>

                  <SimpleGrid mt={4} columns={1} spacing={2.5} maxW="560px" display={{ base: "none", sm: "grid" }}>
                    {promo.bullets.map(b => (
                      <HStack key={b} spacing={2} align="start">
                        <Box w="5px" h="5px" borderRadius="full" flexShrink={0} style={{ background: promo.accent, marginTop: "5px" }} />
                        <Text color="rgba(255,255,255,0.5)" fontSize="sm" lineHeight="1.5">{b}</Text>
                      </HStack>
                    ))}
                  </SimpleGrid>

                  <HStack mt={6} spacing={3} flexWrap="wrap">
                    <Button as={Link} href={promo.bookHref} size={{ base: "md", md: "lg" }}
                      style={{ background: `linear-gradient(135deg, ${promo.accent}, #00b3a4)`, color: "white", borderRadius: 99, fontWeight: 700 }}>
                      {promo.bookLabel}
                    </Button>
                    <Button as={Link} href={promo.href} size={{ base: "md", md: "lg" }}
                      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, fontWeight: 600 }}>
                      {promo.ctaLabel}
                    </Button>
                  </HStack>
                </Box>

                {/* promo image — desktop only */}
                <Box display={{ base: "none", lg: "flex" }} alignItems="center" justifyContent="center">
                  <Box style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "16px", width: 200 }}>
                    <Image
                      src={promo.image}
                      alt={promo.imageAlt}
                      width={951}
                      height={2977}
                      style={{ width: "100%", height: "auto", borderRadius: 12 }}
                    />
                    <Text mt={2} style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                      {promo.imageAlt}
                    </Text>
                  </Box>
                </Box>
              </Grid>
            </FadeIn>
          </Container>
        </Box>
      )}

      <Container maxW="1200px" py={12} display={{ base: "none", md: "block" }}>
        <FadeIn>
          <Heading size="xl" mb={6}>All facilities under one roof</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {facilities.map((group) => (
              <Box key={group.title} className="soft-card-teal" p={6}>
                <Heading size="md" mb={3}>{group.title}</Heading>
                {group.items.map((item) => (
                  <Text key={item} fontSize="sm" color="gray.700">• {item}</Text>
                ))}
              </Box>
            ))}
          </SimpleGrid>
        </FadeIn>
      </Container>

      <Container maxW="1200px" py={6} display={{ base: "none", md: "block" }}>
        <FadeIn>
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
            {packagePreviewCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 60}>
                <Box className="soft-card-orange" p={5} display="flex" flexDirection="column" style={{ height: "100%" }}>
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
              </FadeIn>
            ))}
          </SimpleGrid>
        </FadeIn>
      </Container>

      <Container maxW="1200px" py={12} display={{ base: "none", md: "block" }}>
        <FadeIn>
          <Heading size="xl" mb={6}>What patients say</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {reviews.map((review, i) => (
              <FadeIn key={review.name} delay={i * 70}>
                <Box className="soft-card" p={6}>
                  <Text mt={2} color="gray.700" fontSize="sm">&ldquo;{review.text}&rdquo;</Text>
                  <Text mt={3} fontWeight="600" color="teal.700">- {review.name}</Text>
                </Box>
              </FadeIn>
            ))}
          </SimpleGrid>
        </FadeIn>
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
              leftIcon={<FaWhatsapp />}
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
              className="book-test-cta"
            >
              Book tests online
              <Box as="span" className="book-test-ribbon">NEW</Box>
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
