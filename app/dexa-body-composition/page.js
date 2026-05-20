"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Container, Grid, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { FadeIn, Counter } from "@/components/site/motionUtils";

/* ─── data ─── */
const bigStats = [
  { value: 29.8,  unit: "%",      decimals: 1, label: "Body Fat",          sub: "Centile 80 vs same-age males", color: "#f26939" },
  { value: 48.3,  unit: " kg",    decimals: 1, label: "Lean Mass",         sub: "Arms + trunk + legs combined", color: "#008f82" },
  { value: 1.178, unit: " g/cm²", decimals: 3, label: "Bone Density",      sub: "T-score −0.5 · Normal range",  color: "#7c3aed" },
  { value: 1413,  unit: " kcal",  decimals: 0, label: "Resting Metabolism", sub: "Katch-McArdle from lean mass", color: "#0369a1" },
];

const reportPages = [
  {
    n: "01", color: "#f26939", bg: "rgba(242,105,57,0.07)",
    title: "Body Composition Summary",
    q: "What is my body actually made of?",
    tags: ["Body fat %", "Lean mass", "Bone mineral content", "BMI · FMI · LMI", "Resting metabolic rate"],
    why: "Baseline snapshot beyond scale weight.",
    highlights: [
      { label: "Body Fat", value: "29.8%", sub: "Centile 80" },
      { label: "Lean Mass", value: "48.3 kg", sub: "Total" },
      { label: "Est. RMR", value: "1,413 kcal", sub: "At rest" },
    ],
  },
  {
    n: "02", color: "#e11d48", bg: "rgba(225,29,72,0.06)",
    title: "Fat Distribution Analysis",
    q: "Where does my fat sit — and does it matter?",
    tags: ["Android vs gynoid fat", "A/G ratio", "Age-matched fat centile", "Fat Mass Index zones"],
    why: "Central fat drives metabolic risk — location matters.",
    highlights: [
      { label: "Android Fat", value: "32.1%", sub: "High risk" },
      { label: "Gynoid Fat", value: "27.4%", sub: "Reference" },
      { label: "A/G Ratio", value: "1.17", sub: "Obese risk" },
    ],
  },
  {
    n: "03", color: "#008f82", bg: "rgba(0,143,130,0.07)",
    title: "Regional Composition & Symmetry",
    q: "How balanced is my body left to right?",
    tags: ["Arms · trunk · legs breakdown", "Appendicular Lean Mass", "ALMI vs muscle norms", "Left-right symmetry"],
    why: "Detects imbalance, tracks training over time.",
    highlights: [
      { label: "Trunk Lean", value: "27.2 kg", sub: "Largest region" },
      { label: "ALMI", value: "8.12 kg/m²", sub: "Normal" },
      { label: "L/R Arms", value: "49 / 51%", sub: "Symmetry" },
    ],
  },
  {
    n: "04", color: "#7c3aed", bg: "rgba(124,58,237,0.06)",
    title: "Bone Health & Density",
    q: "Am I at risk for osteoporosis?",
    tags: ["Total body BMD", "T-score & Z-score", "Regional BMD by zone", "WHO classification"],
    why: "Identifies bone loss before fractures happen.",
    highlights: [
      { label: "Total BMD", value: "1.178", sub: "g/cm²" },
      { label: "T-Score", value: "−0.5", sub: "Normal" },
      { label: "Z-Score", value: "+0.8", sub: "Age-matched" },
    ],
  },
  {
    n: "05", color: "#0369a1", bg: "rgba(3,105,161,0.06)",
    title: "Clinical Summary",
    q: "What should I actually do with all of this?",
    tags: ["Plain-language summary", "Priority action items", "Daily calorie targets", "Re-scan guidance"],
    why: "Converts numbers into practical direction.",
    highlights: [
      { label: "Priority", value: "↓ Android fat", sub: "Top action" },
      { label: "Target", value: "~1,900 kcal", sub: "Daily intake" },
      { label: "Re-scan", value: "6 months", sub: "Suggested" },
    ],
  },
];

const comparisons = [
  { method: "Weighing scale", cols: ["—", "—", "—", "—"] },
  { method: "BMI",            cols: ["Estimated", "—", "—", "—"] },
  { method: "BIA home scale", cols: ["Estimated ±", "Estimated ±", "—", "—"] },
  { method: "DEXA at SDRC",  cols: ["✓ Precise", "✓ Precise", "✓ Precise", "✓ Full breakdown"], highlight: true },
];

const forWho = [
  { icon: "🏋️", label: "Body recomposition",    desc: "Track real fat loss vs muscle gain — not just the scale." },
  { icon: "🦴", label: "Osteoporosis screening", desc: "Post-menopausal women, men 50+, long-term steroid users." },
  { icon: "💉", label: "Metabolic conditions",   desc: "Diabetes, PCOD, thyroid — where body composition guides management." },
  { icon: "🏃", label: "Sports performance",     desc: "Athletes needing precise lean mass targets and bilateral data." },
  { icon: "📊", label: "Annual health baseline", desc: "A scan in your 30s gives you a personal trend line for life." },
  { icon: "💊", label: "Long-term medication",   desc: "Corticosteroids, hormone therapy, and bone-affecting drugs." },
];

const ranges = [
  {
    title: "Body Fat % — Men (ACE)",
    segments: [
      { label: "Athletic < 14%", flex: 14, color: "#22c55e" },
      { label: "Fit 14–18%",     flex: 4,  color: "#84cc16" },
      { label: "Normal 18–25%",  flex: 7,  color: "#f59e0b" },
      { label: "Excess > 25%",   flex: 10, color: "#ef4444" },
    ],
    note: "Women's ranges are ~5–8% higher.",
  },
  {
    title: "Bone Density T-Score (WHO)",
    segments: [
      { label: "Osteoporosis ≤ −2.5", flex: 2,   color: "#ef4444" },
      { label: "Osteopenia",          flex: 1.5, color: "#f59e0b" },
      { label: "Normal ≥ −1.0",       flex: 5,   color: "#22c55e" },
    ],
    note: "T-score compares you to healthy peak bone mass at age 30.",
  },
  {
    title: "Lean Mass Index ALMI — Men",
    segments: [
      { label: "Low < 7.26",      flex: 7.26, color: "#f59e0b" },
      { label: "Normal 7.26–9.2", flex: 2,    color: "#22c55e" },
      { label: "High > 9.2",      flex: 3,    color: "#3b82f6" },
    ],
    note: "Appendicular Lean Mass (arms + legs) in kg/m². Baumgartner 1998.",
  },
];

/* GLP-1 scan protocol timeline */
const glp1Timeline = [
  { when: "Before you start", label: "Baseline scan", desc: "Establish your fat/lean/bone baseline before the first dose. This is your reference point for every follow-up comparison.", color: "#008f82" },
  { when: "3 months in",      label: "First follow-up", desc: "Most visible change window. Assess whether weight loss is coming from fat or muscle — and catch early bone density changes.", color: "#f26939" },
  { when: "6 months in",      label: "Mid-course check", desc: "Protein intake and resistance training response. Adjust lifestyle if lean mass loss is exceeding 15% of total loss.", color: "#7c3aed" },
  { when: "12 months / ongoing", label: "Annual review", desc: "Cumulative bone density trend. GLP-1-related bone loss can accelerate silently — this is how you catch it.", color: "#0369a1" },
];

export default function DexaBodyCompositionPage() {
  return (
    <Box style={{ background: "#f8fafc" }}>

      {/* ════════════ HERO ════════════ */}
      <Box className="dark-hero" py={{ base: 14, md: 20 }}>
        {/* decorative blobs */}
        <Box style={{ position: "absolute", top: "-80px", right: "-80px", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,143,130,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box style={{ position: "absolute", bottom: "-100px", left: "-60px", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,105,57,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Container maxW="1200px" position="relative" zIndex={1}>
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 10, lg: 14 }} alignItems="center">
            <Box className="rise-in">
              <span className="chip chip-dark">WHO Gold Standard · DEXA Body Scan</span>
              <Heading
                color="white"
                fontSize={{ base: "3xl", md: "5xl" }}
                fontWeight="900"
                lineHeight="1.08"
                letterSpacing="-0.025em"
                mt={4}
              >
                See exactly what
                <Box as="span" display="block" className="gradient-text-orange">your body is made of</Box>
              </Heading>
              <Text mt={5} color="rgba(255,255,255,0.65)" fontSize={{ base: "md", md: "lg" }} lineHeight="1.7" maxW="480px">
                The only method that simultaneously and precisely measures body fat, lean muscle,
                and bone mineral density — separated by region, compared to your peers.
              </Text>
              <SimpleGrid mt={4} columns={2} spacing={2} maxW="380px" display={{ base: "none", md: "grid" }}>
                {["Body fat %", "Lean mass", "Bone density", "A/G ratio", "Bilateral symmetry", "Resting metabolic rate"].map(item => (
                  <HStack key={item} spacing={1.5}>
                    <Box w="5px" h="5px" borderRadius="full" bg="teal.400" flexShrink={0} />
                    <Text color="rgba(255,255,255,0.55)" fontSize="sm">{item}</Text>
                  </HStack>
                ))}
              </SimpleGrid>
              <HStack mt={8} spacing={3} flexWrap="wrap">
                <Button as={Link} href="/tests?q=DEXA" size="lg"
                  style={{ background: "linear-gradient(135deg, #008f82, #00b3a4)", color: "white", borderRadius: 99, fontWeight: 700 }}>
                  Book DEXA Scan
                </Button>
                <Button as={Link} href={"https://wa.me/" + siteConfig.whatsappNumber}
                  size="lg" leftIcon={<FaWhatsapp />}
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 99, fontWeight: 600 }}>
                  WhatsApp us
                </Button>
              </HStack>
              <Text mt={4} color="rgba(255,255,255,0.3)" fontSize="xs">
                Radiation &lt;1 μSv · Less than a 30-minute flight
              </Text>
            </Box>

            {/* stat cards */}
            <Box>
              <SimpleGrid columns={2} spacing={3}>
                {bigStats.map((m, i) => (
                  <FadeIn key={m.label} delay={i * 80}>
                    <Box style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 16, padding: "20px",
                      position: "relative", overflow: "hidden",
                      borderTop: `3px solid ${m.color}`,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                        {m.label}
                      </Text>
                      <Text style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: m.color, lineHeight: 1.1 }}>
                        <Counter to={m.value} decimals={m.decimals} />{m.unit}
                      </Text>
                      <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{m.sub}</Text>
                    </Box>
                  </FadeIn>
                ))}
              </SimpleGrid>
              <Text mt={3} style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
                Sample values from an actual DEXA scan · Individual results vary
              </Text>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* ════════════ SCAN IMAGES + WHAT IT SHOWS ════════════ */}
      <Box bg="white" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <FadeIn>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={10} alignItems="center">
              <Box>
                <span className="chip chip-orange" style={{ marginBottom: 16, display: "inline-flex" }}>What DEXA actually measures</span>
                <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800" lineHeight="1.2" mt={3}>
                  Three tissues. <Box as="span" color="teal.600">One scan.</Box>
                </Heading>
                <Text mt={4} color="gray.500" lineHeight="1.8">
                  Every gram of your body mass falls into one of three categories. DEXA is the only clinical tool
                  that directly and simultaneously measures all three — separated by region, with left-right comparison.
                </Text>
                <VStack mt={6} align="stretch" spacing={3}>
                  {[
                    { label: "Fat tissue",   pct: 30, color: "#f26939", desc: "Stored body fat — measured at each region separately, including android/gynoid split." },
                    { label: "Lean tissue",  pct: 66, color: "#008f82", desc: "Muscle, organs, water — your metabolically active tissue and the driver of your RMR." },
                    { label: "Bone mineral", pct: 4,  color: "#7c3aed", desc: "Bone mineral content and density by skeletal zone, with T-score and Z-score." },
                  ].map(t => (
                    <Box key={t.label}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="700" color="gray.700">{t.label}</Text>
                        <Text fontSize="sm" color="gray.400">~{t.pct}%</Text>
                      </HStack>
                      <Box h="8px" borderRadius="full" bg="gray.100" overflow="hidden">
                        <Box h="full" w={`${t.pct}%`} borderRadius="full" style={{ background: t.color }} />
                      </Box>
                      <Text fontSize="xs" color="gray.400" mt={1}>{t.desc}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* scan image pair */}
              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box className="soft-card" p={3} style={{ borderTop: "3px solid #f26939" }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#f26939", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Fat distribution
                  </Text>
                  <Box borderRadius="10px" overflow="hidden" bg="white">
                    <Image
                      src="/assets/dexa/fat-heatmap.webp"
                      alt="DEXA fat distribution heatmap — dense fat shown in pink/red, lean areas in blue"
                      width={951}
                      height={2977}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </Box>
                  <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
                    Pink/red = dense fat · Blue = lean
                  </Text>
                </Box>
                <Box className="soft-card" p={3} style={{ borderTop: "3px solid #7c3aed" }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Bone density scan
                  </Text>
                  <Box borderRadius="10px" overflow="hidden" bg="white">
                    <Image
                      src="/assets/dexa/bone-scan.webp"
                      alt="DEXA bone density skeletal scan showing full skeleton from posterior view"
                      width={919}
                      height={2962}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </Box>
                  <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
                    Full skeletal posterior view
                  </Text>
                </Box>
                <Box gridColumn="span 2">
                  <Text style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                    Actual scans from a SDRC DEXA report · GE Lunar DPX-NT · Individual results vary
                  </Text>
                </Box>
              </Grid>
            </Grid>
          </FadeIn>
        </Container>
      </Box>

      {/* ════════════ GLP-1 / SEMAGLUTIDE SECTION ════════════ */}
      <Box style={{ background: "#0f172a", position: "relative", overflow: "hidden" }} py={{ base: 10, md: 16 }}>
        {/* subtle orb */}
        <Box style={{ position: "absolute", top: "50%", left: "60%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,105,57,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Container maxW="1200px" position="relative" zIndex={1}>
          <FadeIn>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={10} alignItems="start">
              {/* left: context */}
              <Box>
                <span className="chip chip-dark" style={{ background: "rgba(242,105,57,0.18)", color: "#fb923c", display: "inline-flex", marginBottom: 16 }}>
                  On Ozempic, Mounjaro or any GLP-1?
                </span>
                <Heading color="white" fontWeight="900" fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1.2" mt={2}>
                  DEXA is essential
                  <Box as="span" display="block" className="gradient-text-orange">for GLP-1 users</Box>
                </Heading>
                <Text mt={4} color="rgba(255,255,255,0.6)" fontSize={{ base: "sm", md: "md" }} lineHeight="1.8">
                  GLP-1 receptor agonists — semaglutide (Ozempic, Wegovy), tirzepatide (Mounjaro) and others — drive
                  significant weight loss. But a scale shows only the total number. DEXA tells you what you&apos;re actually losing.
                </Text>
                <VStack mt={5} align="stretch" spacing={3}>
                  {[
                    { icon: "⚠️", title: "Up to 40% of GLP-1 weight loss can be lean mass", desc: "Studies show muscle loss ranging from 25–40% of total lost weight without adequate protein and resistance training. You need to know your number." },
                    { icon: "🦴", title: "GLP-1s accelerate bone mineral density loss", desc: "Rapid weight loss — especially without resistance exercise — reduces mechanical loading on bone. BMD can fall faster than expected, especially at the spine and hip." },
                    { icon: "📉", title: "Your RMR drops with muscle loss", desc: "Every kg of lean mass lost lowers your resting metabolic rate. DEXA tracks this so you can protect your metabolism." },
                  ].map(item => (
                    <Box key={item.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px" }}>
                      <HStack spacing={3} align="start">
                        <Text style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</Text>
                        <Box>
                          <Text style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{item.title}</Text>
                          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{item.desc}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* right: scan protocol timeline */}
              <Box>
                <Text style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                  Recommended DEXA scan protocol — GLP-1 users
                </Text>
                <VStack align="stretch" spacing={0}>
                  {glp1Timeline.map((step, i) => (
                    <Box key={step.when} style={{ display: "flex", gap: 16, paddingBottom: i < glp1Timeline.length - 1 ? 24 : 0 }}>
                      {/* timeline line */}
                      <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 32 }}>
                        <Box style={{ width: 32, height: 32, borderRadius: "50%", background: step.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Text style={{ fontSize: 13, fontWeight: 900, color: "white" }}>{i + 1}</Text>
                        </Box>
                        {i < glp1Timeline.length - 1 && (
                          <Box style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.06)", marginTop: 6 }} />
                        )}
                      </Box>
                      <Box pb={i < glp1Timeline.length - 1 ? 0 : 0}>
                        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{step.when}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: step.color, marginBottom: 4 }}>{step.label}</Text>
                        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{step.desc}</Text>
                      </Box>
                    </Box>
                  ))}
                </VStack>

                {/* what to watch */}
                <Box mt={6} style={{ background: "rgba(0,143,130,0.1)", border: "1px solid rgba(0,143,130,0.2)", borderRadius: 14, padding: "16px 18px" }}>
                  <Text style={{ fontSize: 12, fontWeight: 700, color: "#4dd9cb", marginBottom: 8 }}>
                    What to monitor on every scan
                  </Text>
                  {[
                    "Fat loss % vs lean mass loss % — target &gt;70% of loss from fat",
                    "ALMI (appendicular lean mass index) — flag if dropping below normal",
                    "Total body BMD and Z-score — catch accelerated bone loss early",
                    "Android fat % — visceral fat responds well to GLP-1s; confirm it",
                  ].map(point => (
                    <HStack key={point} spacing={2} align="start" mb={1.5}>
                      <Box style={{ width: 5, height: 5, borderRadius: "50%", background: "#4dd9cb", marginTop: 6, flexShrink: 0 }} />
                      <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: point }} />
                    </HStack>
                  ))}
                </Box>
              </Box>
            </Grid>
          </FadeIn>
        </Container>
      </Box>

      {/* ════════════ TWO SCAN TYPES ════════════ */}
      <Box bg="white" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <FadeIn>
            <span className="chip chip-purple" style={{ marginBottom: 16, display: "inline-flex" }}>BMD monitoring</span>
            <Heading size={{ base: "lg", md: "xl" }} color="gray.900" fontWeight="800" lineHeight="1.2" mt={2}>
              Two scan types.
              <Box as="span" color="purple.700"> Different clinical goals.</Box>
            </Heading>
            <Text mt={3} color="gray.500" fontSize="sm" lineHeight="1.8" maxW="640px">
              Total Body DEXA and dedicated Spine + Hip DEXA are separate scans with different purposes.
              Knowing which one you need — or whether you need both — is important before you book.
            </Text>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mt={8}>
              {/* Card 1: Total Body */}
              <Box style={{ background: "#e6f6f4", border: "1px solid rgba(0,143,130,0.2)", borderRadius: 18, padding: "24px", borderTop: "4px solid #008f82" }}>
                <HStack spacing={3} mb={4}>
                  <Box style={{ width: 40, height: 40, borderRadius: "50%", background: "#008f82", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Text style={{ color: "white", fontSize: 18 }}>⚖️</Text>
                  </Box>
                  <Box>
                    <Text style={{ fontSize: 11, color: "#008f82", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Scan type 1</Text>
                    <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Total Body DEXA</Text>
                  </Box>
                </HStack>
                <Text style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                  <strong>Primary purpose: body composition.</strong> Measures fat %, lean mass and regional breakdown across the whole body. Also includes a total body BMD overview on page 4 of the report — but this is not the clinical gold standard for osteoporosis diagnosis.
                </Text>
                <VStack align="stretch" spacing={1.5}>
                  {[
                    "Body fat % and lean mass (total and by region)",
                    "Android / gynoid fat split and A/G ratio",
                    "Resting metabolic rate estimate",
                    "Total body BMD overview — page 4 (not site-specific)",
                    "Left-right symmetry comparison",
                  ].map(item => (
                    <HStack key={item} spacing={2} align="start">
                      <Box style={{ width: 5, height: 5, borderRadius: "50%", background: "#008f82", marginTop: 6, flexShrink: 0 }} />
                      <Text style={{ fontSize: 12, color: "#334155" }}>{item}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Box mt={4} style={{ background: "rgba(0,143,130,0.08)", borderRadius: 10, padding: "10px 14px" }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#008f82" }}>Best for</Text>
                  <Text style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                    Weight management, body recomposition, GLP-1 monitoring, sports performance, metabolic conditions, annual health baseline.
                  </Text>
                </Box>
              </Box>

              {/* Card 2: Spine + Hip */}
              <Box style={{ background: "#f3f0ff", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 18, padding: "24px", borderTop: "4px solid #7c3aed" }}>
                <HStack spacing={3} mb={4}>
                  <Box style={{ width: 40, height: 40, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Text style={{ color: "white", fontSize: 18 }}>🦴</Text>
                  </Box>
                  <Box>
                    <Text style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Scan type 2</Text>
                    <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Dedicated Spine + Hip DEXA</Text>
                  </Box>
                </HStack>
                <Text style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                  <strong>Primary purpose: bone density.</strong> Targeted BMD measurement of the lumbar spine (L1–L4) and femoral neck — the two sites required for WHO osteoporosis classification. Also provides some body composition estimates, but that is not its primary use.
                </Text>
                <VStack align="stretch" spacing={1.5}>
                  {[
                    "L1–L4 lumbar spine BMD (T-score, Z-score)",
                    "Femoral neck and total hip BMD",
                    "WHO classification: normal / osteopenia / osteoporosis",
                    "Fracture risk context",
                    "Monitoring response to treatment or supplementation",
                  ].map(item => (
                    <HStack key={item} spacing={2} align="start">
                      <Box style={{ width: 5, height: 5, borderRadius: "50%", background: "#7c3aed", marginTop: 6, flexShrink: 0 }} />
                      <Text style={{ fontSize: 12, color: "#334155" }}>{item}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Box mt={4} style={{ background: "rgba(124,58,237,0.07)", borderRadius: 10, padding: "10px 14px" }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed" }}>Best for</Text>
                  <Text style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                    Post-menopausal women, men 50+, long-term corticosteroid use, GLP-1 users (bone monitoring), osteopenia follow-up.
                  </Text>
                </Box>
              </Box>
            </Grid>

            <Box mt={5} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "16px 20px" }}>
              <HStack spacing={2} align="start">
                <Text style={{ fontSize: "1.1rem", flexShrink: 0 }}>💡</Text>
                <Text style={{ fontSize: 13, color: "#92400e", lineHeight: 1.7 }}>
                  <strong>Many clinicians recommend both.</strong> The Total Body scan tracks composition over time; the Spine + Hip scan provides the clinically validated BMD numbers for osteoporosis assessment.
                  If you&apos;re on a GLP-1 or managing bone health, ask about doing both scans in the same visit.
                </Text>
              </HStack>
            </Box>

            {/* recommended schedule */}
            <Box mt={8} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px" }}>
              <Text style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Recommended scan schedule by profile
              </Text>
              <VStack align="stretch" spacing={2}>
                {[
                  { who: "GLP-1 / semaglutide users",       freq: "Total Body: every 6 months · Spine+Hip: annually" },
                  { who: "Post-menopausal women",            freq: "Spine+Hip: annually or every 2 years" },
                  { who: "Men over 50",                      freq: "Spine+Hip: every 2–3 years, annually if at risk" },
                  { who: "Long-term corticosteroid use",     freq: "Spine+Hip: baseline then every 12 months" },
                  { who: "Athletes / body recomposition",    freq: "Total Body: annually for composition trend" },
                  { who: "Osteopenia (T-score −1 to −2.5)", freq: "Spine+Hip: every 12–18 months" },
                ].map(row => (
                  <HStack key={row.who} justify="space-between" align="start" gap={3} pb={2} style={{ borderBottom: "1px solid #f0f2f5" }}>
                    <Text style={{ fontSize: 12, color: "#64748b" }}>{row.who}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 700, color: "#008f82", textAlign: "right", flexShrink: 0 }}>{row.freq}</Text>
                  </HStack>
                ))}
              </VStack>
              <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                Schedule guidance only. Follow your clinician&apos;s specific recommendation.
              </Text>
            </Box>
          </FadeIn>
        </Container>
      </Box>

      {/* ════════════ WHY DEXA ════════════ */}
      <Box style={{ background: "#0f172a" }} py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <FadeIn>
            <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={10} alignItems="start">
              <Box>
                <span className="chip" style={{ background: "rgba(242,105,57,0.15)", color: "#fb923c", marginBottom: 16, display: "inline-flex" }}>Why not just BMI?</span>
                <Heading color="white" fontWeight="800" fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1.2" mt={2}>
                  DEXA vs everything else
                </Heading>
                <Text mt={3} color="rgba(255,255,255,0.45)" fontSize="sm" lineHeight="1.7">
                  Most methods estimate. DEXA directly measures. That difference matters when you&apos;re making health decisions.
                </Text>
              </Box>

              <Box style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", background: "rgba(255,255,255,0.05)", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Method", "Body Fat", "Lean Mass", "Bone Density", "Regional"].map((h, i) => (
                    <Text key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.35)", textAlign: i > 0 ? "center" : "left" }}>{h}</Text>
                  ))}
                </Box>
                {comparisons.map((row) => (
                  <Box key={row.method} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: row.highlight ? "rgba(0,143,130,0.12)" : "transparent", alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: row.highlight ? 700 : 500, color: row.highlight ? "#4dd9cb" : "rgba(255,255,255,0.6)" }}>
                      {row.method}
                      {row.highlight && <Box as="span" style={{ marginLeft: 8, background: "rgba(0,143,130,0.3)", color: "#4dd9cb", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>SDRC</Box>}
                    </Text>
                    {row.cols.map((c, i) => (
                      <Text key={i} style={{ fontSize: 12, textAlign: "center", color: c.startsWith("✓") ? "#4dd9cb" : c === "—" ? "rgba(255,255,255,0.15)" : "#f59e0b", fontWeight: c.startsWith("✓") ? 700 : 400 }}>{c}</Text>
                    ))}
                  </Box>
                ))}
              </Box>
            </Grid>
          </FadeIn>
        </Container>
      </Box>

      {/* ════════════ 5-PAGE REPORT ════════════ */}
      <Box bg="white" py={{ base: 10, md: 16 }}>
        <Container maxW="1200px">
          <FadeIn>
            <Box mb={8} maxW="600px">
              <span className="chip chip-teal" style={{ marginBottom: 16, display: "inline-flex" }}>5 pages · every answer covered</span>
              <Heading fontWeight="900" fontSize={{ base: "2xl", md: "3xl" }} color="gray.900" lineHeight="1.2" mt={3}>
                What your DEXA report contains
              </Heading>
              <Text mt={3} color="gray.500">Each page answers a specific question. Designed for clarity, not just data.</Text>
            </Box>
          </FadeIn>

          <VStack spacing={4} align="stretch">
            {reportPages.map((page, i) => (
              <FadeIn key={page.n} delay={i * 55}>
                <Box
                  _hover={{ boxShadow: "0 8px 32px rgba(15,23,42,0.09)", transform: "translateY(-1px)" }}
                  style={{ border: `1px solid ${page.color}22`, borderRadius: 18, overflow: "hidden", transition: "box-shadow 200ms ease, transform 200ms ease", borderLeft: `4px solid ${page.color}` }}>

                  {/* header row */}
                  <Box style={{ background: page.bg, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                    <Box style={{ width: 38, height: 38, borderRadius: "50%", background: page.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>{page.n}</Text>
                    </Box>
                    <Box>
                      <Text style={{ fontSize: 10, color: page.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Page {page.n}</Text>
                      <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{page.title}</Text>
                    </Box>
                  </Box>

                  <Box px={5} py={4}>
                    <Text style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", marginBottom: 14 }}>{page.q}</Text>

                    {/* sample highlights from the report */}
                    <SimpleGrid columns={3} spacing={3} mb={4}>
                      {page.highlights.map(h => (
                        <Box key={h.label} style={{ background: page.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                          <Text style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{h.label}</Text>
                          <Text style={{ fontSize: 15, fontWeight: 900, color: page.color, lineHeight: 1.1 }}>{h.value}</Text>
                          <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{h.sub}</Text>
                        </Box>
                      ))}
                    </SimpleGrid>

                    {/* tags */}
                    <HStack spacing={1.5} flexWrap="wrap" mb={3}>
                      {page.tags.map(tag => (
                        <Box key={tag} style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 99, fontSize: 11, background: page.bg, color: page.color, fontWeight: 600, border: `1px solid ${page.color}30` }}>{tag}</Box>
                      ))}
                    </HStack>

                    {/* why */}
                    <Text style={{ fontSize: 12, color: page.color, fontWeight: 700, borderTop: `1px solid ${page.color}15`, paddingTop: 10 }}>
                      → {page.why}
                    </Text>
                  </Box>
                </Box>
              </FadeIn>
            ))}
          </VStack>
        </Container>
      </Box>

      {/* ════════════ REFERENCE RANGES ════════════ */}
      <Box style={{ background: "#f8fafc" }} py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <FadeIn>
            <Box mb={8} maxW="520px">
              <span className="chip chip-purple" style={{ marginBottom: 16, display: "inline-flex" }}>Understanding your numbers</span>
              <Heading fontWeight="900" fontSize={{ base: "2xl", md: "3xl" }} color="gray.900" mt={3}>Reference ranges explained</Heading>
            </Box>
          </FadeIn>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            {ranges.map((r, i) => (
              <FadeIn key={r.title} delay={i * 80}>
                <Box className="soft-card" p={5} style={{ height: "100%" }}>
                  <Text fontWeight="700" color="gray.800" fontSize="sm" mb={4}>{r.title}</Text>
                  <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mb={2}>
                    {r.segments.map((seg) => (
                      <Box key={seg.label} style={{ flex: seg.flex, background: seg.color }} />
                    ))}
                  </HStack>
                  <HStack justify="space-between" spacing={1}>
                    {r.segments.map((seg) => (
                      <Text key={seg.label} style={{ fontSize: 10, color: "#94a3b8", flex: seg.flex, textAlign: "center" }}>{seg.label}</Text>
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="gray.400" mt={4} lineHeight="1.6">{r.note}</Text>
                </Box>
              </FadeIn>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ════════════ WHO SHOULD SCAN ════════════ */}
      <Box bg="white" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <FadeIn>
            <Grid templateColumns={{ base: "1fr", lg: "260px 1fr" }} gap={10} alignItems="start">
              <Box>
                <span className="chip chip-teal" style={{ marginBottom: 16, display: "inline-flex" }}>Is this right for you?</span>
                <Heading fontWeight="900" fontSize={{ base: "2xl", md: "3xl" }} color="gray.900" lineHeight="1.2" mt={3}>Who benefits from DEXA</Heading>
                <Text mt={3} color="gray.500" fontSize="sm" lineHeight="1.7">
                  DEXA is useful whenever you need to go beyond a scale — whether you&apos;re training, managing a condition, or simply want an honest baseline.
                </Text>
              </Box>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                {forWho.map((item, i) => (
                  <FadeIn key={item.label} delay={i * 55}>
                    <Box className="soft-card" p={5} style={{ height: "100%" }}>
                      <Text fontSize="2xl" mb={2}>{item.icon}</Text>
                      <Text fontWeight="700" color="gray.800" fontSize="sm" mb={1}>{item.label}</Text>
                      <Text fontSize="sm" color="gray.500" lineHeight="1.6">{item.desc}</Text>
                    </Box>
                  </FadeIn>
                ))}
              </SimpleGrid>
            </Grid>
          </FadeIn>
        </Container>
      </Box>

      {/* ════════════ SCAN DETAILS ════════════ */}
      <Box style={{ background: "#f8fafc" }} py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            <FadeIn>
              <Box className="soft-card" p={6} style={{ height: "100%" }}>
                <Text style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#008f82", marginBottom: 16 }}>Scan details</Text>
                <VStack align="stretch" spacing={0}>
                  {[
                    ["Duration",     "15–20 minutes"],
                    ["Radiation",    "<1 μSv · equivalent to ~30 min background"],
                    ["Preparation",  "No fasting · avoid calcium supplements 24 hr before"],
                    ["Report",       "5-page PDF · same day in most cases"],
                    ["Scanner",      "GE Lunar DPX-NT Densitometer · ID 152585"],
                    ["Location",     "101 Jade Arcade, Paradise, Secunderabad"],
                  ].map(([k, v]) => (
                    <Box key={k} py={3} style={{ borderBottom: "1px solid #f0f2f5" }}>
                      <HStack justify="space-between" align="start" gap={4}>
                        <Text style={{ fontSize: 13, color: "#94a3b8", flexShrink: 0 }}>{k}</Text>
                        <Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, textAlign: "right" }}>{v}</Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </FadeIn>
            <FadeIn delay={80}>
              <Box className="soft-card" p={6} style={{ height: "100%" }}>
                <Text style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#f26939", marginBottom: 16 }}>Important to know</Text>
                <VStack align="start" spacing={4}>
                  {[
                    "Reference population is White/Caucasian (GE Lunar). South Asian-specific norms are not available — this may underestimate bone loss risk in South Asian individuals.",
                    "Visceral fat (VAT) estimation is not available on this scanner model (GE Lunar DPX-NT).",
                    "Trend comparison is meaningful after a repeat scan on the same machine.",
                    "DEXA reports are clinical decision support and should be interpreted with a qualified clinician.",
                  ].map((note, i) => (
                    <HStack key={i} spacing={3} align="start">
                      <Box style={{ width: 5, height: 5, borderRadius: "50%", background: "#f26939", marginTop: 6, flexShrink: 0 }} />
                      <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{note}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </FadeIn>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ════════════ CTA ════════════ */}
      <Box className="dark-hero-cta" py={{ base: 14, md: 20 }}>
        <Box style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,143,130,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Container maxW="800px" textAlign="center" position="relative" zIndex={1}>
          <FadeIn>
            <span className="chip chip-dark" style={{ marginBottom: 20, display: "inline-flex" }}>Available at SDRC · Jade Arcade, Paradise</span>
            <Heading color="white" fontWeight="900" fontSize={{ base: "2xl", md: "4xl" }} lineHeight="1.15" letterSpacing="-0.02em" mt={3}>
              Know exactly what
              <Box as="span" display="block" className="gradient-text-orange">your body is made of</Box>
            </Heading>
            <Text mt={4} color="rgba(255,255,255,0.5)" fontSize={{ base: "md", md: "lg" }} maxW="480px" mx="auto" lineHeight="1.7">
              Book a DEXA scan online or send your prescription on WhatsApp. Reports typically ready the same day.
            </Text>
            <HStack mt={8} spacing={4} justify="center" flexWrap="wrap">
              <Button as={Link} href="/tests?q=DEXA" size="lg"
                style={{ background: "linear-gradient(135deg, #008f82, #00b3a4)", color: "white", borderRadius: 99, fontWeight: 700, padding: "0 32px" }}>
                Book DEXA Scan
              </Button>
              <Button as={Link} href={"https://wa.me/" + siteConfig.whatsappNumber}
                size="lg" leftIcon={<FaWhatsapp />}
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, fontWeight: 600 }}>
                WhatsApp SDRC
              </Button>
            </HStack>
            <Text mt={5} style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              SDRC Diagnostics · 040 6600 4200 · 101 Jade Arcade, Paradise, Secunderabad
            </Text>
          </FadeIn>
        </Container>
      </Box>

    </Box>
  );
}
