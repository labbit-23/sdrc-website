"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Box, Button, Container, Grid, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

const services = [
  {
    icon: "/assets/recure/icon-ortho.png",
    title: "Orthopaedic Rehab",
    desc: "Back pain, neck pain, joint disorders, arthritis"
  },
  {
    icon: "/assets/recure/icon-neuro.png",
    title: "Neurological Rehab",
    desc: "Stroke, nerve injuries, neuro-muscular rehab"
  },
  {
    icon: "/assets/recure/icon-sports.png",
    title: "Sports Injury",
    desc: "Ligament injuries, muscle tears, return-to-sport"
  },
  {
    icon: "/assets/recure/icon-postop.png",
    title: "Post-Surgical Rehab",
    desc: "Joint replacement, spine and trauma recovery"
  },
  {
    icon: "/assets/recure/icon-geriatric.png",
    title: "Geriatric Care",
    desc: "Balance, mobility, fall prevention"
  },
  {
    icon: "/assets/recure/icon-womens.png",
    title: "Women's Health",
    desc: "Post-partum, pelvic floor, ergonomic care"
  }
];

const highlights = [
  "Integrated diagnostics + rehab workflow",
  "Evidence-based treatment protocols",
  "In-clinic and at-home care options"
];

const locations = [
  {
    name: "Jade Arcade - Paradise",
    desc: "Physiotherapy consultations (Recure x SDRC)",
    map: siteConfig.locations.main
  },
  {
    name: "S.D. Road Collection Centre",
    desc: "Physiotherapy consultations (Recure x SDRC)",
    map: siteConfig.locations.sdRoad
  },
  {
    name: "Yapral Centre",
    desc: "Physiotherapy treatment and rehabilitation sessions",
    map: siteConfig.locations.yapral
  }
];

export default function PhysiotherapyPage() {
  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr .95fr" }} gap={10} alignItems="center">
            <Box>
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
                Physiotherapy at SDRC
              </Text>

              <Heading mt={4} size={{ base: "2xl", md: "5xl" }} color="gray.800"  className="hero-title">
                Evidence-based Physiotherapy
                <Box as="span" color="orange.500" className="hero-subline">
                  with Recure
                </Box>
              </Heading>

              <Text mt={5} fontSize={{ base: "md", md: "lg" }} color="gray.700">
                Professional rehabilitation services delivered at SDRC Diagnostics in collaboration with Recure, India&apos;s structured physiotherapy platform.
              </Text>

              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, minmax(0,1fr))" }} gap={3} mt={7} maxW="560px">
                <Button as={Link} href={"https://wa.me/919963432132?text=" + encodeURIComponent("I wanted to know more about Recure Physiotherapy at SDRC") } target="_blank" size="lg">
                  Chat with an Expert
                </Button>
                <Button as={Link} href="tel:+919963432132" variant="outline" size="lg">
                  Call +91 99634 32132
                </Button>
              </Grid>
            </Box>

            <Box className="soft-card" p={6}>
              <Image
                src="/assets/recure/logo-recure.png"
                alt="Recure Physiotherapy"
                width={220}
                height={56}
                style={{ width: "auto", height: 54 }}
              />
              <Text fontSize="sm" color="gray.700" mt={4}>
                Structured care protocols, certified physiotherapists and measurable outcomes.
              </Text>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <Heading size="xl" mb={8}>
          Physiotherapy services offered
        </Heading>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
          {services.map((service) => (
            <Box key={service.title} className="soft-card" p={6}>
              <Image src={service.icon} alt={service.title} width={42} height={42} />
              <Text fontWeight="700" fontSize="lg" mt={3} mb={2}>
                {service.title}
              </Text>
              <Text fontSize="sm" color="gray.700">
                {service.desc}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Box bg="white" borderTop="1px solid" borderColor="gray.100">
        <Container maxW="1200px" py={12}>
          <Heading size="xl" mb={6}>
            Why Recure at SDRC?
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {highlights.map((item) => (
              <Box key={item} className="soft-card" p={5} bg="gray.50">
                <Text fontSize="sm" color="gray.700">
                  {item}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <Heading size="xl" mb={6}>
          Physiotherapy Locations
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {locations.map((location) => (
            <Box key={location.name} className="soft-card" p={6} border="1px solid" borderColor="teal.100">
              <Text fontWeight="700" fontSize="lg" mb={1}>
                {location.name}
              </Text>
              <Text fontSize="sm" color="gray.700" mb={3}>
                {location.desc}
              </Text>
              <Link href={location.map} target="_blank">
                <Text fontSize="sm" fontWeight="700" color="teal.600">
                  View on Google Maps →
                </Text>
              </Link>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Box bg="orange.50" borderTop="1px solid" borderBottom="1px solid" borderColor="orange.100">
        <Container maxW="1200px" py={6}>
          <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={4} alignItems="center">
            <Image
              src="/assets/recure/logo-recure.png"
              alt="Recure"
              width={140}
              height={42}
              style={{ width: "auto", height: 40 }}
            />
            <Text fontSize="sm" color="gray.700">
              To learn more about Recure&apos;s philosophy and nationwide programs, visit{" "}
              <Link href="https://recure.in" target="_blank">
                <Box as="span" color="teal.700" fontWeight="700" textDecoration="underline">
                  recure.in
                </Box>
              </Link>
            </Text>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
