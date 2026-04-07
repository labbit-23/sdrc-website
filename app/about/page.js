"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Box, Container, Grid, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";

const approachCards = [
  {
    title: "Clinical context first",
    text: "We encourage patients and doctors to share clinical details and previous history wherever possible, so reports and impressions are meaningful and not just numbers or images."
  },
  {
    title: "Quality and standardisation",
    text: "Internal quality controls, calibration logs and participation in external quality programs help ensure reliability across disciplines."
  },
  {
    title: "Clear communication",
    text: "We keep reports readable and structured, with clear flags, comments and references to support treating physicians in decision-making."
  }
];

export default function AboutPage() {
  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr .95fr" }} gap={10} alignItems="center">
            <Box>
              <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="13ch" className="hero-title">
                SDRC Diagnostics
                <Box as="span" color="teal.700" className="hero-subline">
                  40 Years of Service
                </Box>
              </Heading>
              <Text mt={4} fontSize={{ base: "md", md: "lg" }} color="gray.700">
                SDRC (Secunderabad Diagnostic and Research Centre) is a multi-specialty diagnostic centre at Jade Arcade, Paradise, bringing together imaging, cardiology, neurology, pulmonology and a comprehensive laboratory under one roof.
              </Text>
              <Text mt={3} color="gray.600" fontSize="sm">
                Established in 1983, SDRC has grown from a standalone laboratory into a benchmark for diagnostics in Secunderabad, combining experienced professionals, calibrated equipment and structured reporting.
              </Text>
            </Box>

            <Box className="soft-card" p={6}>
              <Grid templateColumns={{ base: "1fr", sm: "1fr auto" }} gap={3} alignItems="start">
                <Heading size="md">At a glance</Heading>
                <Image src="/assets/sdrc-40-years.png" alt="Over 40 years" width={72} height={72} />
              </Grid>
              <VStack align="stretch" gap={2} mt={3} fontSize="sm" color="gray.700">
                <Text>✔ Serving Secunderabad since 1983</Text>
                <Text>✔ Multi-modality imaging (CT, X-Ray, Mammography, DEXA, Ultrasound and Doppler)</Text>
                <Text>✔ Cardio-pulmonary and neuro diagnostics (ECG, 2D-Echo, TMT, EEG, ENMG, Spirometry)</Text>
                <Text>✔ Comprehensive laboratory including biochemistry, haematology and microbiology</Text>
                <Text>✔ NABL accredited laboratory for select parameters</Text>
                <Text>✔ Online and WhatsApp report access with home sample collection</Text>
              </VStack>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <VStack align="stretch" gap={12}>
          <Box>
            <Heading size="xl" mb={4}>
              Our approach to diagnostics
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {approachCards.map((card) => (
                <Box key={card.title} className="soft-card" p={6}>
                  <Text fontWeight="700" mb={2}>
                    {card.title}
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {card.text}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Box>
            <Heading size="xl" mb={4}>
              Clinical & management team
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box className="soft-card" p={6}>
                <Text fontWeight="700" mb={2}>
                  Clinical leadership
                </Text>
                <Text fontSize="sm" color="gray.700" mb={3}>
                  SDRC reporting is led by experienced consultants across pathology, radiology, cardiology and other specialties, with long-standing hospital and academic backgrounds.
                </Text>
                <Text fontSize="sm" color="gray.700">• Pathology and laboratory medicine</Text>
                <Text fontSize="sm" color="gray.700">• Radiology and imaging (CT, Ultrasound, X-Ray, Mammography, DEXA)</Text>
                <Text fontSize="sm" color="gray.700">• Cardiology and pulmonology (ECG, 2D-Echo, TMT, Spirometry)</Text>
                <Text fontSize="sm" color="gray.700">• Neurology-related diagnostics (EEG and ENMG)</Text>
                <Text fontSize="xs" color="gray.500" mt={3}>
                  Detailed doctor profiles can be shared on request or through the referring physician.
                </Text>
              </Box>

              <Box className="soft-card" p={6}>
                <Text fontWeight="700" mb={2}>
                  Operations and quality
                </Text>
                <Text fontSize="sm" color="gray.700" mb={3}>
                  The management team oversees quality systems and technology adoption to keep turnaround times predictable and reporting consistent.
                </Text>
                <Text fontSize="sm" color="gray.700">• Standard operating procedures for each department</Text>
                <Text fontSize="sm" color="gray.700">• Internal audits and external quality participation</Text>
                <Text fontSize="sm" color="gray.700">• Digital report delivery via portal, email and WhatsApp</Text>
                <Text fontSize="sm" color="gray.700">• Continuous technical and customer-care training</Text>
              </Box>
            </SimpleGrid>
          </Box>

          <Box>
            <Heading size="xl" mb={4}>
              Our journey since 1983
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "1.4fr 1fr" }} gap={6} alignItems="center">
              <Box className="soft-card" p={6}>
                <Text fontSize="sm" color="gray.700" mb={3}>
                  SDRC began in 1983 as a focused diagnostic laboratory in Secunderabad. Over time, services expanded from routine pathology to specialised testing, imaging and cardio-pulmonary diagnostics.
                </Text>
                <Text fontSize="sm" color="gray.700" mb={3}>
                  Today, the main centre at Jade Arcade brings together CT, Ultrasound and Doppler, Digital X-Ray, Mammography, DEXA, ECG/2D-Echo, EEG/ENMG, TMT, Spirometry and a comprehensive laboratory under one roof.
                </Text>
                <Text fontSize="sm" color="gray.700">
                  SDRC has also expanded with collection centres and digital report delivery with online booking support.
                </Text>
              </Box>
              <Box display="flex" justifyContent={{ base: "center", md: "flex-end" }}>
                <Box className="soft-card" borderRadius="full" px={6} py={4}>
                  <Image src="/assets/sdrc-40-years.png" alt="40 years" width={120} height={120} />
                </Box>
              </Box>
            </Grid>
          </Box>

          <Box>
            <Heading size="xl" mb={4}>
              Centres & coverage
            </Heading>
            <Box className="soft-card" p={6}>
              <Text fontSize="sm" color="gray.700" mb={3}>
                The main SDRC Diagnostics centre is at Jade Arcade (Corporate Block), Paradise, MG Road, Secunderabad. From this hub we manage imaging, cardiology, neurology and an NABL accredited laboratory.
              </Text>
              <Text fontSize="sm" color="gray.700" mb={3}>
                SDRC also operates collection centres at SD Road, West Marredpally and Yapral, with home sample collection support.
              </Text>
              <Text fontSize="sm" color="gray.700">
                For full addresses, directions and centre-wise timings, visit the{" "}
                <Link href="/contact">
                  <Box as="span" color="teal.700" fontWeight="700">
                    Contact
                  </Box>
                </Link>{" "}
                page.
              </Text>
            </Box>
          </Box>

          <Box>
            <Heading size="xl" mb={4}>
              Reports and interpretation
            </Heading>
            <Box className="soft-card" p={6}>
              <Text fontSize="sm" color="gray.700" mb={3}>
                Reports are shared via print, email and WhatsApp. Our team can clarify report structure and technical aspects so clinical decisions remain with your treating physician.
              </Text>
              <Text fontSize="sm" color="gray.700">
                Many health panels are designed to be practical and clinically relevant. Additional tests can be added based on doctor advice.
              </Text>
            </Box>
          </Box>
        </VStack>
      </Container>
    </>
  );
}
