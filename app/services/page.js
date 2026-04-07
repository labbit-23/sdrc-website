"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Container, Grid, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

const sections = [
  {
    id: "imaging",
    title: "Imaging",
    subtitle: "Multi-modality imaging with clear prep guidance and quick reporting.",
    items: [
      {
        title: "Ultra-Fast Multi-Slice CT",
        desc: "Cross-sectional imaging for head, chest, abdomen and more with low-dose protocols."
      },
      {
        title: "Digital X-Ray",
        desc: "High-resolution radiographs with faster image availability and lower repeat rates."
      },
      {
        title: "Digital Mammography",
        desc: "Focused breast imaging, useful for screening and diagnostic evaluation."
      },
      {
        title: "DEXA (Bone Mineral Densitometry)",
        desc: "Evaluation of bone mineral density to help assess osteoporosis risk."
      },
      {
        title: "Ultrasound & Colour Doppler",
        desc: "Abdominal, obstetric, pelvic, thyroid, breast and vascular Doppler studies.",
        notes: ["Fasting 6-8 hrs for upper abdomen scans", "Full bladder for pelvic ultrasound"]
      }
    ]
  },
  {
    id: "cardio-neuro",
    title: "Cardio-Pulmonary & Neurology",
    subtitle: "Non-invasive tests for heart, lungs and nervous system.",
    items: [
      {
        title: "ECG",
        desc: "Quick assessment of heart rhythm and basic electrical activity."
      },
      {
        title: "2D-Echo",
        desc: "Ultrasound-based evaluation of cardiac structure and function."
      },
      {
        title: "EEG",
        desc: "Recording of brain electrical activity; commonly used in seizure workup."
      },
      {
        title: "ENMG",
        desc: "Nerve and muscle function studies to evaluate neuropathy and related conditions."
      },
      {
        title: "TMT (Stress Test)",
        desc: "Exercise-based evaluation of cardiac performance under monitored load."
      },
      {
        title: "Spirometry (PFT)",
        desc: "Lung function testing for obstructive/restrictive airway assessment."
      }
    ]
  },
  {
    id: "pathology",
    title: "Pathology Laboratory",
    subtitle: "Comprehensive laboratory with internal quality checks and participation in external quality programs.",
    items: [
      {
        title: "Biochemistry",
        desc: "Liver, kidney, lipid, glucose and metabolic profiles."
      },
      {
        title: "Endocrinology",
        desc: "Thyroid profile, cortisol, reproductive and other hormones."
      },
      {
        title: "Haematology",
        desc: "CBC, ESR, coagulation studies and related tests."
      },
      {
        title: "Clinical Pathology",
        desc: "Urine, stool and body fluid examinations."
      },
      {
        title: "Microbiology & Serology",
        desc: "Cultures, sensitivity testing and rapid serological tests."
      },
      {
        title: "Cytopathology & Histopathology",
        desc: "FNAC and tissue biopsies, reported by specialists."
      }
    ]
  }
];

const chips = [
  { id: "imaging", label: "CT & Imaging" },
  { id: "imaging", label: "Digital X-Ray" },
  { id: "imaging", label: "Mammography & DEXA" },
  { id: "imaging", label: "Ultrasound & Doppler" },
  { id: "cardio-neuro", label: "ECG & 2D-Echo" },
  { id: "cardio-neuro", label: "TMT & Spirometry" },
  { id: "cardio-neuro", label: "EEG / ENMG" },
  { id: "pathology", label: "Pathology Lab" }
];

const gallery = [
  {
    src: "/assets/sdrc-exterior.jpg",
    alt: "SDRC exterior - Jade Arcade, Paradise",
    caption: "SDRC Exterior - Jade Arcade, Paradise"
  },
  {
    src: "/assets/sdrc-services-menu.jpg",
    alt: "SDRC services menu",
    caption: "Services - Jade Arcade, Paradise"
  },
  {
    src: "/assets/sdrc-main-door.jpg",
    alt: "SDRC main door",
    caption: "Imaging suite - CT, X-Ray and Mammography"
  },
  {
    src: "/assets/sdrc-waiting-area.jpg",
    alt: "SDRC waiting area",
    caption: "Interiors"
  }
];

export default function ServicesPage() {
  const [activeIndex, setActiveIndex] = useState(2);

  const activeImage = useMemo(() => gallery[activeIndex] || gallery[0], [activeIndex]);

  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr .95fr" }} gap={10} alignItems="start">
            <Box>
              <Text
                display="inline-flex"
                bg="teal.50"
                color="teal.700"
                fontSize="xs"
                fontWeight="700"
                px={3}
                py={1}
                borderRadius="full"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Imaging • Cardio & Neuro • Pathology
              </Text>

              <Heading mt={4} size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="14ch" className="hero-title">
                A New Centre backed by
                <Box as="span" color="teal.700" className="hero-subline">
                  40 Years of Trusted Care
                </Box>
              </Heading>

              <Text mt={4} fontSize="lg" color="gray.700" display={{ base: "none", md: "block" }}>
                Imaging, cardio-pulmonary, neurology and a full-service pathology lab at Jade Arcade, Paradise.
              </Text>

              <HStack mt={5} spacing={2} flexWrap="wrap" display={{ base: "none", md: "flex" }}>
                {chips.map((chip) => (
                  <Link key={chip.label} href={"#" + chip.id}>
                    <Box
                      px={3}
                      py={1.5}
                      bg="white"
                      border="1px solid"
                      borderColor="teal.100"
                      borderRadius="full"
                      fontSize="xs"
                      className="shadow-soft"
                      transition="all .15s ease"
                      _hover={{ borderColor: "teal.400", color: "teal.700" }}
                    >
                      {chip.label}
                    </Box>
                  </Link>
                ))}
              </HStack>
            </Box>

            <Box className="soft-card" p={{ base: 3, md: 4 }}>
              <Box borderRadius="xl" overflow="hidden" bg="gray.50" position="relative">
                <Box position="relative" w="full" h={{ base: "240px", sm: "300px", md: "340px" }}>
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, 520px"
                    priority
                  />
                </Box>
                <Box position="absolute" bottom={0} left={0} right={0} bg="blackAlpha.600" px={3} py={2}>
                  <Text color="white" fontSize="xs" fontWeight="600">
                    {activeImage.caption}
                  </Text>
                </Box>
              </Box>

              <SimpleGrid columns={4} spacing={2} mt={3} display={{ base: "none", md: "grid" }}>
                {gallery.map((img, idx) => (
                  <Box
                    as="button"
                    type="button"
                    key={img.src}
                    borderRadius="md"
                    overflow="hidden"
                    borderWidth={idx === activeIndex ? "2px" : "1px"}
                    borderColor={idx === activeIndex ? "teal.500" : "gray.200"}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={"Show " + img.caption}
                  >
                    <Box position="relative" w="full" h={{ base: "52px", md: "62px" }}>
                      <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} sizes="120px" />
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <VStack align="stretch" gap={10}>
          {sections.map((section) => (
            <Box key={section.id} id={section.id} scrollMarginTop="110px">
              <Heading size="xl" mb={2}>
                {section.title}
              </Heading>
              <Text color="gray.700" mb={6}>
                {section.subtitle}
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {section.items.map((item) => (
                  <Box key={item.title} className="soft-card" p={5}>
                    <Text fontWeight="700" color="gray.800">
                      {item.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      {item.desc}
                    </Text>
                    {Array.isArray(item.notes) && item.notes.length > 0 ? (
                      <VStack align="start" gap={1} mt={3}>
                        {item.notes.map((note) => (
                          <Text key={note} fontSize="xs" color="gray.600">
                            • {note}
                          </Text>
                        ))}
                      </VStack>
                    ) : null}
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      </Container>

      <Container maxW="1200px" py={4}>
        <Box textAlign="center" mt={2} mb={10}>
          <Heading size="lg" mb={3}>
            Need help choosing the right test?
          </Heading>
          <Text color="gray.700" mb={6}>
            Call us or WhatsApp your prescription and our team will guide you.
          </Text>
          <HStack justify="center" flexWrap="wrap" gap={3}>
            <Button as={Link} href={"tel:" + siteConfig.phoneTel}>
              Call {siteConfig.phoneDisplay}
            </Button>
            <Button as={Link} href={"https://wa.me/" + siteConfig.whatsappNumber} variant="outline">
              WhatsApp Us
            </Button>
          </HStack>
        </Box>
      </Container>
    </>
  );
}
