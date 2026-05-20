"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

const metrics = [
  {
    label: "Body Fat %",
    value: "29.8",
    unit: "%",
    context: "Centile 80 vs peers",
    color: "#f26939",
    bg: "#fff5f0",
    border: "#ffd5c2",
    icon: "◉",
  },
  {
    label: "Lean Mass",
    value: "48.3",
    unit: "kg",
    context: "Arms + Trunk + Legs",
    color: "#008f82",
    bg: "#e6f6f4",
    border: "#bfe7e2",
    icon: "⬡",
  },
  {
    label: "Bone Density",
    value: "1.178",
    unit: "g/cm²",
    context: "T-score −0.5 · Normal",
    color: "#7c3aed",
    bg: "#f3f0ff",
    border: "#ddd6fe",
    icon: "◈",
  },
  {
    label: "Resting Metabolism",
    value: "1,413",
    unit: "kcal/day",
    context: "Katch-McArdle formula",
    color: "#0369a1",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: "⚡",
  },
];

const reportSections = [
  {
    num: "01",
    title: "Body Composition Summary",
    question: "What is my body actually made of?",
    items: [
      "Body fat %, fat mass (kg), lean mass (kg)",
      "Bone mineral content (BMC) and BMI",
      "Resting Metabolic Rate (Katch-McArdle)",
      "Fat Mass Index and Lean Mass Index",
    ],
    insight: "Baseline snapshot beyond just scale weight.",
    color: "#f26939",
    lightBg: "#fff5f0",
  },
  {
    num: "02",
    title: "Fat Distribution Analysis",
    question: "Where does my fat sit?",
    items: [
      "Android (abdominal) vs gynoid (hip-thigh) fat",
      "A/G ratio — central fat risk marker",
      "Age-matched fat centile vs peers",
      "Fat Mass Index with risk zone reference",
    ],
    insight: "Central fat drives metabolic risk more than total fat.",
    color: "#e11d48",
    lightBg: "#fff0f3",
  },
  {
    num: "03",
    title: "Regional Composition & Symmetry",
    question: "How balanced is my body?",
    items: [
      "Arms, trunk, legs: fat / lean / bone breakdown",
      "Appendicular Lean Mass (ALM) and ALMI",
      "Left-right lean, fat and bone symmetry",
      "Significant imbalance flags for clinical review",
    ],
    insight: "Detects muscle imbalance and tracks training response.",
    color: "#008f82",
    lightBg: "#e6f6f4",
  },
  {
    num: "04",
    title: "Bone Health & Density",
    question: "How strong are my bones?",
    items: [
      "Total body BMD in g/cm²",
      "T-score (vs age 30) and Z-score (vs peers)",
      "Regional BMD: spine, pelvis, ribs, arms, legs",
      "WHO osteoporosis classification reference",
    ],
    insight: "Identifies bone loss risk before fractures occur.",
    color: "#7c3aed",
    lightBg: "#f3f0ff",
  },
  {
    num: "05",
    title: "Clinical Summary",
    question: "What should I do with all this?",
    items: [
      "Plain-language summary of all findings",
      "Priority actions for fat, muscle and bone",
      "Daily calorie needs by activity level",
      "Trend framework for follow-up scans",
    ],
    insight: "Converts numbers into practical next steps.",
    color: "#0369a1",
    lightBg: "#eff6ff",
  },
];

const comparisons = [
  {
    method: "Weighing Scale",
    fat: "✗ No",
    lean: "✗ No",
    bone: "✗ No",
    regional: "✗ No",
  },
  {
    method: "BMI",
    fat: "Estimate only",
    lean: "✗ No",
    bone: "✗ No",
    regional: "✗ No",
  },
  {
    method: "BIA (Home scale)",
    fat: "± Estimate",
    lean: "± Estimate",
    bone: "✗ No",
    regional: "✗ No",
  },
  {
    method: "DEXA (SDRC)",
    fat: "✓ Precise",
    lean: "✓ Precise",
    bone: "✓ Precise",
    regional: "✓ Full",
    highlight: true,
  },
];

const indications = [
  {
    icon: "🏃",
    title: "Fitness & Body Recomposition",
    desc: "Track real fat loss vs muscle gain — not just scale weight changes.",
  },
  {
    icon: "🦴",
    title: "Osteoporosis Risk",
    desc: "Women post-menopause, men over 50, and anyone with fracture history.",
  },
  {
    icon: "💊",
    title: "Metabolic Conditions",
    desc: "Diabetes, PCOD, thyroid disorders — where body composition affects management.",
  },
  {
    icon: "🏋️",
    title: "Sports & Performance",
    desc: "Athletes needing precise lean mass targets and bilateral symmetry data.",
  },
  {
    icon: "💉",
    title: "Steroid or Long-term Medication",
    desc: "Corticosteroids, hormone therapy, and other bone-affecting medications.",
  },
  {
    icon: "📊",
    title: "Annual Health Benchmark",
    desc: "A baseline scan in your 30s gives you a personal trend line for life.",
  },
];

function RangeBar({ ranges, value, unit }) {
  return (
    <Box mt={3}>
      <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mb={2}>
        {ranges.map((r, i) => (
          <Box key={i} flex={r.flex} bg={r.color} />
        ))}
      </HStack>
      <HStack justify="space-between">
        {ranges.map((r, i) => (
          <Text key={i} fontSize="10px" color="gray.500" textAlign="center" flex={r.flex}>
            {r.label}
          </Text>
        ))}
      </HStack>
    </Box>
  );
}

function AnimatedNumber({ target, suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState("0");
  const hasRun = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const isFloat = String(target).includes(".");
          const numTarget = parseFloat(String(target).replace(/,/g, ""));
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = numTarget * eased;
            setDisplay(
              isFloat
                ? current.toFixed(1)
                : Math.round(current).toLocaleString("en-IN")
            );
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <Box as="span" ref={ref}>
      {display}
      {suffix}
    </Box>
  );
}

export default function DexaBodyCompositionPage() {
  return (
    <>
      {/* ── HERO ── */}
      <Box className="brochure-bg" py={{ base: 10, md: 16 }}>
        <Container maxW="1200px">
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 8, lg: 12 }}
            alignItems="center"
          >
            <Box className="rise-in">
              <Text
                display="inline-flex"
                px={3}
                py={1}
                borderRadius="full"
                bg="teal.50"
                color="teal.700"
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Gold Standard · WHO Endorsed
              </Text>

              <Heading mt={4} className="hero-title" color="gray.800">
                See what's really
                <Box as="span" className="hero-subline" color="orange.500">
                  inside your body
                </Box>
              </Heading>

              <Text mt={4} color="gray.700" fontSize={{ base: "md", md: "lg" }}>
                DEXA (Dual-Energy X-ray Absorptiometry) is the only method that
                simultaneously and precisely measures body fat, lean muscle mass,
                and bone mineral density — separated by region.
              </Text>

              <SimpleGrid mt={5} columns={2} spacing={3} maxW="440px">
                {[
                  "Body fat % by region",
                  "Lean & muscle mass",
                  "Bone mineral density",
                  "Android/gynoid ratio",
                  "Left-right symmetry",
                  "Metabolic rate estimate",
                ].map((item) => (
                  <HStack key={item} spacing={2}>
                    <Box
                      w="6px"
                      h="6px"
                      borderRadius="full"
                      bg="teal.500"
                      flexShrink={0}
                    />
                    <Text fontSize="sm" color="gray.700">
                      {item}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>

              <HStack mt={7} spacing={3} flexWrap="wrap">
                <Button as={Link} href="/tests" size="lg">
                  Book DEXA Scan
                </Button>
                <Button
                  as={Link}
                  href={"https://wa.me/" + siteConfig.whatsappNumber}
                  size="lg"
                  variant="outline"
                  leftIcon={<FaWhatsapp />}
                >
                  Ask a question
                </Button>
              </HStack>

              <Text mt={3} fontSize="xs" color="gray.400">
                Radiation dose &lt;1 μSv · Less than one day of background exposure
              </Text>
            </Box>

            {/* Stats Grid */}
            <Box
              className="hero-visual-reveal"
              style={{ animationDelay: "200ms" }}
            >
              <SimpleGrid columns={2} spacing={4}>
                {metrics.map((m) => (
                  <Box
                    key={m.label}
                    className="soft-card"
                    p={5}
                    borderTop="3px solid"
                    borderTopColor={m.color}
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top="-18px"
                      right="-10px"
                      fontSize="64px"
                      opacity={0.07}
                      fontWeight="900"
                      lineHeight="1"
                      color={m.color}
                      pointerEvents="none"
                      userSelect="none"
                    >
                      {m.icon}
                    </Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wide">
                      {m.label}
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontWeight="800"
                      color={m.color}
                      lineHeight="1.1"
                      mt={1}
                    >
                      <AnimatedNumber target={m.value} /> {m.unit}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      {m.context}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
              <Text
                mt={3}
                fontSize="xs"
                color="gray.400"
                textAlign="center"
              >
                Sample values from a real DEXA report · Individual results vary
              </Text>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* ── WHY DEXA ── */}
      <Box bg="white" py={{ base: 10, md: 14 }} borderBottom="1px solid" borderBottomColor="gray.100">
        <Container maxW="1200px">
          <Box textAlign={{ base: "left", md: "center" }} mb={8}>
            <Text
              display="inline-flex"
              px={3}
              py={1}
              borderRadius="full"
              bg="orange.50"
              color="orange.600"
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Why not just BMI?
            </Text>
            <Heading mt={3} size={{ base: "lg", md: "xl" }} color="gray.800">
              DEXA vs other methods
            </Heading>
            <Text mt={2} color="gray.600" maxW="600px" mx={{ md: "auto" }}>
              BMI and home scales estimate. DEXA directly measures — the difference matters.
            </Text>
          </Box>

          <Box className="soft-card" overflow="hidden" p={0}>
            <Box overflowX="auto">
              <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
                <Box as="thead" bg="gray.50">
                  <Box as="tr">
                    {["Method", "Body Fat", "Lean Mass", "Bone Density", "Regional Breakdown"].map(
                      (col, i) => (
                        <Box
                          as="th"
                          key={col}
                          px={4}
                          py={3}
                          textAlign={i === 0 ? "left" : "center"}
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.500"
                          textTransform="uppercase"
                          letterSpacing="wide"
                          borderBottom="2px solid"
                          borderBottomColor="gray.100"
                        >
                          {col}
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
                <Box as="tbody">
                  {comparisons.map((row) => (
                    <Box
                      as="tr"
                      key={row.method}
                      bg={row.highlight ? "teal.50" : "transparent"}
                      _hover={{ bg: row.highlight ? "teal.50" : "gray.50" }}
                      style={{ transition: "background 180ms ease" }}
                    >
                      <Box
                        as="td"
                        px={4}
                        py={3}
                        fontSize="sm"
                        fontWeight={row.highlight ? "700" : "500"}
                        color={row.highlight ? "teal.700" : "gray.700"}
                        borderBottom="1px solid"
                        borderBottomColor="gray.100"
                      >
                        {row.method}
                        {row.highlight && (
                          <Box
                            as="span"
                            ml={2}
                            px={2}
                            py={0.5}
                            bg="teal.100"
                            color="teal.700"
                            fontSize="10px"
                            fontWeight="700"
                            borderRadius="full"
                          >
                            SDRC
                          </Box>
                        )}
                      </Box>
                      {[row.fat, row.lean, row.bone, row.regional].map((cell, i) => (
                        <Box
                          as="td"
                          key={i}
                          px={4}
                          py={3}
                          fontSize="sm"
                          textAlign="center"
                          color={
                            cell === "✓ Precise" || cell === "✓ Full"
                              ? "teal.600"
                              : cell?.startsWith("✗")
                              ? "gray.300"
                              : "orange.500"
                          }
                          fontWeight={cell?.startsWith("✓") ? "700" : "400"}
                          borderBottom="1px solid"
                          borderBottomColor="gray.100"
                        >
                          {cell}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── 5-PAGE REPORT ── */}
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Box mb={8}>
            <Text
              display="inline-flex"
              px={3}
              py={1}
              borderRadius="full"
              bg="teal.50"
              color="teal.700"
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              5 pages · Every answer covered
            </Text>
            <Heading mt={3} size={{ base: "lg", md: "xl" }} color="gray.800">
              What your DEXA report contains
            </Heading>
            <Text mt={2} color="gray.600">
              Each page answers a specific question — designed for clarity, not just data.
            </Text>
          </Box>

          <VStack spacing={4} align="stretch">
            {reportSections.map((s) => (
              <Box key={s.num} className="soft-card" p={0} overflow="hidden">
                <Grid
                  templateColumns={{ base: "1fr", md: "auto 1fr auto" }}
                  gap={0}
                >
                  {/* Number badge */}
                  <Box
                    bg={s.lightBg}
                    px={{ base: 4, md: 6 }}
                    py={{ base: 3, md: 5 }}
                    display="flex"
                    alignItems={{ base: "center", md: "flex-start" }}
                    justifyContent="center"
                    minW={{ md: "80px" }}
                    borderRight={{ md: "1px solid" }}
                    borderRightColor={{ md: "gray.100" }}
                    borderBottom={{ base: "1px solid", md: "none" }}
                    borderBottomColor={{ base: "gray.100", md: "transparent" }}
                  >
                    <Text
                      fontSize="2xl"
                      fontWeight="900"
                      color={s.color}
                      opacity={0.9}
                      letterSpacing="-0.02em"
                    >
                      {s.num}
                    </Text>
                  </Box>

                  {/* Content */}
                  <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
                    <Text fontSize="xs" color="gray.400" fontStyle="italic" mb={1}>
                      {s.question}
                    </Text>
                    <Text fontWeight="800" color="gray.800" fontSize="md" mb={3}>
                      {s.title}
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={1}>
                      {s.items.map((item) => (
                        <HStack key={item} spacing={2} align="start">
                          <Box
                            w="5px"
                            h="5px"
                            borderRadius="full"
                            bg={s.color}
                            mt="7px"
                            flexShrink={0}
                          />
                          <Text fontSize="sm" color="gray.600">
                            {item}
                          </Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </Box>

                  {/* Insight pill */}
                  <Box
                    px={{ base: 4, md: 5 }}
                    py={{ base: 3, md: 5 }}
                    display="flex"
                    alignItems={{ base: "flex-start", md: "center" }}
                    borderLeft={{ md: "1px solid" }}
                    borderLeftColor={{ md: "gray.100" }}
                    borderTop={{ base: "1px solid", md: "none" }}
                    borderTopColor={{ base: "gray.100", md: "transparent" }}
                    minW={{ md: "240px" }}
                    bg={s.lightBg}
                  >
                    <Text fontSize="xs" color={s.color} fontWeight="700" maxW="200px">
                      {s.insight}
                    </Text>
                  </Box>
                </Grid>
              </Box>
            ))}
          </VStack>
        </Container>
      </Box>

      {/* ── REFERENCE RANGES ── */}
      <Box bg="white" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Box mb={8}>
            <Text
              display="inline-flex"
              px={3}
              py={1}
              borderRadius="full"
              bg="purple.50"
              color="purple.700"
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              How to read your numbers
            </Text>
            <Heading mt={3} size={{ base: "lg", md: "xl" }} color="gray.800">
              Reference ranges explained
            </Heading>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {/* Body Fat % — Men */}
            <Box className="soft-card" p={5}>
              <Text fontWeight="700" color="gray.800" fontSize="sm">
                Body Fat % (Men · ACE)
              </Text>
              <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mt={3} mb={2}>
                <Box flex={14} bg="#22c55e" />
                <Box flex={4} bg="#84cc16" />
                <Box flex={7} bg="#f59e0b" />
                <Box flex={10} bg="#ef4444" />
              </HStack>
              <HStack justify="space-between" fontSize="10px" color="gray.400">
                <Text>Athletic &lt;14%</Text>
                <Text>Fit 14-18%</Text>
                <Text>Normal 18-25%</Text>
                <Text>Excess &gt;25%</Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={3}>
                ACE guidelines. Women's ranges are higher by ~5–8%.
              </Text>
            </Box>

            {/* Bone Density T-Score */}
            <Box className="soft-card" p={5}>
              <Text fontWeight="700" color="gray.800" fontSize="sm">
                Bone Density T-Score (WHO)
              </Text>
              <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mt={3} mb={2}>
                <Box flex={2} bg="#ef4444" />
                <Box flex={1.5} bg="#f59e0b" />
                <Box flex={5} bg="#22c55e" />
              </HStack>
              <HStack justify="space-between" fontSize="10px" color="gray.400">
                <Text>≤−2.5 Osteoporosis</Text>
                <Text>−2.5 to −1 Osteopenia</Text>
                <Text>≥−1 Normal</Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={3}>
                T-score compares you to a healthy 30-year-old peak bone mass.
              </Text>
            </Box>

            {/* ALMI */}
            <Box className="soft-card" p={5}>
              <Text fontWeight="700" color="gray.800" fontSize="sm">
                Lean Mass Index — ALMI (Men)
              </Text>
              <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mt={3} mb={2}>
                <Box flex={7.26} bg="#f59e0b" />
                <Box flex={1.94} bg="#22c55e" />
                <Box flex={3} bg="#3b82f6" />
              </HStack>
              <HStack justify="space-between" fontSize="10px" color="gray.400">
                <Text>&lt;7.26 Low</Text>
                <Text>7.26–9.2 Normal</Text>
                <Text>&gt;9.2 High</Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={3}>
                Appendicular Lean Mass Index in kg/m². Baumgartner 1998 criteria.
              </Text>
            </Box>

            {/* FMI */}
            <Box className="soft-card" p={5}>
              <Text fontWeight="700" color="gray.800" fontSize="sm">
                Fat Mass Index — FMI (Men)
              </Text>
              <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mt={3} mb={2}>
                <Box flex={6} bg="#22c55e" />
                <Box flex={3} bg="#f59e0b" />
                <Box flex={4} bg="#ef4444" />
              </HStack>
              <HStack justify="space-between" fontSize="10px" color="gray.400">
                <Text>Normal &lt;6</Text>
                <Text>Elevated 6–9</Text>
                <Text>Obese &gt;9</Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={3}>
                Fat mass (kg) ÷ height² (m²). More precise than BMI for fat load.
              </Text>
            </Box>

            {/* A/G Ratio */}
            <Box className="soft-card" p={5}>
              <Text fontWeight="700" color="gray.800" fontSize="sm">
                Android / Gynoid Fat Ratio
              </Text>
              <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mt={3} mb={2}>
                <Box flex={0.8} bg="#22c55e" />
                <Box flex={0.2} bg="#f59e0b" />
                <Box flex={1} bg="#ef4444" />
              </HStack>
              <HStack justify="space-between" fontSize="10px" color="gray.400">
                <Text>&lt;0.80 Gynoid</Text>
                <Text>0.80–1.0 Mixed</Text>
                <Text>&gt;1.0 Android</Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={3}>
                Android (abdominal) fat pattern carries higher cardiovascular risk.
              </Text>
            </Box>

            {/* Z-Score */}
            <Box className="soft-card" p={5}>
              <Text fontWeight="700" color="gray.800" fontSize="sm">
                Bone Density Z-Score
              </Text>
              <Box
                bg="gray.50"
                borderRadius="lg"
                p={3}
                mt={3}
                border="1px solid"
                borderColor="gray.100"
              >
                <Text fontSize="xs" color="gray.600" lineHeight="1.6">
                  Z-score compares you to same-age, same-sex peers. A low T-score with
                  a normal Z-score means bone loss is age-related, not accelerated.
                  Z below −2.0 = "below expected for age."
                </Text>
              </Box>
              <Text fontSize="xs" color="gray.500" mt={3}>
                Both T and Z scores are provided in your DEXA report.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── WHO SHOULD GET A DEXA ── */}
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Box mb={8}>
            <Text
              display="inline-flex"
              px={3}
              py={1}
              borderRadius="full"
              bg="teal.50"
              color="teal.700"
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Is this right for you?
            </Text>
            <Heading mt={3} size={{ base: "lg", md: "xl" }} color="gray.800">
              Who benefits from a DEXA scan
            </Heading>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
            {indications.map((ind) => (
              <Box key={ind.title} className="soft-card" p={5}>
                <Text fontSize="2xl" mb={2}>{ind.icon}</Text>
                <Text fontWeight="700" color="gray.800" fontSize="sm" mb={1}>
                  {ind.title}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {ind.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── SCAN DETAILS ── */}
      <Box bg="white" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box className="soft-card" p={6}>
              <Text
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wide"
                color="teal.600"
                mb={3}
              >
                Scan details
              </Text>
              <VStack align="start" spacing={3}>
                {[
                  ["Scan duration", "~15–20 minutes"],
                  ["Radiation dose", "<1 μSv · equivalent to ~30 min of background"],
                  ["Preparation", "No fasting needed · avoid calcium supplements 24hr before"],
                  ["Report", "5-page PDF · same day in most cases"],
                  ["Technology", "GE Lunar DPX-NT Densitometer"],
                  ["Scanner ID", "152585"],
                ].map(([label, value]) => (
                  <Box key={label} w="full">
                    <HStack justify="space-between" align="start" gap={4}>
                      <Text fontSize="sm" color="gray.500" flexShrink={0}>
                        {label}
                      </Text>
                      <Text fontSize="sm" color="gray.800" fontWeight="500" textAlign="right">
                        {value}
                      </Text>
                    </HStack>
                    <Box mt={2} h="1px" bg="gray.50" />
                  </Box>
                ))}
              </VStack>
            </Box>

            <Box className="soft-card" p={6}>
              <Text
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="wide"
                color="teal.600"
                mb={3}
              >
                Important to know
              </Text>
              <VStack align="start" spacing={3}>
                {[
                  "Reference population is White/Caucasian (GE Lunar normative). South Asian-specific norms are not available on this platform.",
                  "Visceral fat (VAT) estimation is not available on this scanner model.",
                  "Trend comparison becomes available after a repeat scan on the same machine.",
                  "DEXA reports are for clinical use and should be interpreted with a qualified clinician.",
                  "Report does not constitute a diagnosis — it is decision support.",
                ].map((note) => (
                  <HStack key={note} spacing={3} align="start">
                    <Box
                      w="5px"
                      h="5px"
                      borderRadius="full"
                      bg="orange.400"
                      mt="7px"
                      flexShrink={0}
                    />
                    <Text fontSize="sm" color="gray.600">
                      {note}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── CTA BAND ── */}
      <Box
        py={14}
        style={{
          background:
            "linear-gradient(135deg, #00695f 0%, #008f82 50%, #00b3a4 100%)",
        }}
      >
        <Container maxW="1200px" textAlign="center">
          <Text
            display="inline-flex"
            px={3}
            py={1}
            borderRadius="full"
            bg="whiteAlpha.200"
            color="white"
            fontSize="xs"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={4}
          >
            Available at SDRC Jade Arcade, Paradise
          </Text>
          <Heading
            size={{ base: "lg", md: "xl" }}
            color="white"
            mb={3}
            fontWeight="800"
          >
            Know your body composition today
          </Heading>
          <Text
            color="whiteAlpha.800"
            fontSize={{ base: "md", md: "lg" }}
            mb={7}
            maxW="520px"
            mx="auto"
          >
            Book a DEXA scan online or share your prescription on WhatsApp.
            Reports typically available the same day.
          </Text>
          <HStack justify="center" spacing={4} flexWrap="wrap">
            <Button
              as={Link}
              href="/tests"
              size="lg"
              bg="white"
              color="teal.700"
              _hover={{ bg: "gray.50" }}
            >
              Book DEXA Scan
            </Button>
            <Button
              as={Link}
              href={"https://wa.me/" + siteConfig.whatsappNumber}
              size="lg"
              variant="outline"
              borderColor="whiteAlpha.600"
              color="white"
              leftIcon={<FaWhatsapp />}
              _hover={{ bg: "whiteAlpha.100" }}
            >
              WhatsApp SDRC
            </Button>
          </HStack>
        </Container>
      </Box>
    </>
  );
}
