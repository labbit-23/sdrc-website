"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Box, Container, Grid, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

const qualityObjectives = [
  "Quality control",
  "Accurate results",
  "Timely results",
  "Client satisfaction",
  "Physician satisfaction",
  "Trained workforce",
  "Workflow integration",
  "Equipment performance"
];

const systems = [
  {
    title: "Internal quality control",
    text: "Daily internal quality control is run on key analysers with defined rules for accepting, troubleshooting and releasing patient runs."
  },
  {
    title: "External quality assurance",
    text: "The laboratory participates in proficiency testing and inter-lab comparisons to monitor analytical accuracy."
  },
  {
    title: "Standardised reporting",
    text: "Reports include biological reference intervals, flags and clinical context so treating doctors can interpret quickly."
  }
];

export default function AccreditationPage() {
  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={10} alignItems="center">
            <Box>
              <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="13ch" className="hero-title">
                Quality and
                <Box as="span" color="teal.700" className="hero-subline">NABL Accreditation</Box>
              </Heading>

              <Text mt={4} fontSize={{ base: "md", md: "lg" }} color="gray.700" display={{ base: "none", md: "block" }}>
                SDRC Diagnostics is committed to reliable, repeatable and clinically meaningful laboratory results for effective patient care.
              </Text>

              {siteConfig.nabl.enabled ? (
                <Text
                  mt={4}
                  display="inline-flex"
                  px={4}
                  py={2}
                  fontWeight="700"
                  fontSize="sm"
                  color="teal.700"
                  bg="white"
                  borderRadius="full"
                  className="shadow-soft"
                >
                  NABL accredited medical laboratory (ISO 15189:2022)
                </Text>
              ) : null}
            </Box>

            <Box className="soft-card" p={6}>
              <Grid templateColumns={{ base: "1fr", sm: "auto 1fr" }} gap={4} alignItems="start">
                <Image src="/assets/nabl-symbol.png" alt="NABL Accredited" width={68} height={68} />
                <Box>
                  <Heading size="md" mb={2}>
                    What NABL accreditation means
                  </Heading>
                  <Text color="gray.700" fontSize="sm">
                    Accreditation by the National Accreditation Board for Testing and Calibration Laboratories confirms quality and technical standards across pre-analytical, analytical and post-analytical phases.
                  </Text>
                  <Text color="gray.500" fontSize="xs" mt={3}>
                    Certificate no: {siteConfig.nabl.certNo} | Lab code: {siteConfig.nabl.labCode}
                  </Text>
                </Box>
              </Grid>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <Box>
          <Heading size="xl" mb={4}>
            NABL documents
          </Heading>
          <Text color="gray.700" fontSize="sm" mb={4}>
            You can verify accreditation status and scope through the official documents.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Link href={siteConfig.nabl.scopeUrl} target="_blank" rel="noopener noreferrer">
              <Box className="soft-card" p={4} border="1px solid" borderColor="teal.100">
                <Text fontWeight="700">Scope of accreditation</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  List of accredited parameters and disciplines.
                </Text>
                <Text fontSize="xs" color="teal.600" mt={2} fontWeight="700">
                  View PDF
                </Text>
              </Box>
            </Link>

            <Link href={siteConfig.nabl.certUrl} target="_blank" rel="noopener noreferrer">
              <Box className="soft-card" p={4} border="1px solid" borderColor="teal.100">
                <Text fontWeight="700">Accreditation certificate</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Current NABL certificate issued to SDRC Diagnostics.
                </Text>
                <Text fontSize="xs" color="teal.600" mt={2} fontWeight="700">
                  View PDF
                </Text>
              </Box>
            </Link>
          </SimpleGrid>
        </Box>

        <Box mt={12} display={{ base: "none", md: "block" }}>
          <Heading size="xl" mb={4}>
            Laboratory quality systems
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {systems.map((item) => (
              <Box key={item.title} className="soft-card" p={6}>
                <Text fontWeight="700" mb={2}>
                  {item.title}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {item.text}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Box mt={12}>
          <Heading size="xl" mb={4}>
            SDRC Quality Policy & Objectives
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "1.4fr 1fr" }} gap={6} alignItems="start">
            <Box className="soft-card" p={6}>
              <Text fontWeight="700" mb={2}>
                Quality policy
              </Text>
              <Text fontSize="sm" color="gray.700" mb={4}>
                The quality policy of SDRC is to serve diagnostic medicine with dedication, prioritising quality in delivering reliable, dependable and repeatable results for effective patient care.
              </Text>

              <Text fontWeight="700" mb={2}>
                Quality objectives
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={1}>
                {qualityObjectives.map((obj) => (
                  <Text key={obj} fontSize="sm" color="gray.700">
                    • {obj}
                  </Text>
                ))}
              </SimpleGrid>
            </Box>

            <Box className="soft-card" p={4}>
              <Image
                src="/assets/quality-policy.jpg"
                alt="SDRC quality policy"
                width={720}
                height={900}
                style={{ width: "100%", height: "auto", borderRadius: 12 }}
              />
              <Text fontSize="11px" color="gray.500" textAlign="center" mt={2}>
                SDRC Quality Policy and Quality Objectives as displayed in-centre.
              </Text>
            </Box>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
