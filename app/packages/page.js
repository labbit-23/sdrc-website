"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Box, Button, Container, Grid, Heading, HStack, Text } from "@chakra-ui/react";
import PackagesExplorer from "@/components/site/PackagesExplorer";
import { siteConfig } from "@/data/siteConfig";

export default function PackagesPage() {
  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr .95fr" }} gap={10} alignItems="center">
            <Box>
              <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="13ch" className="hero-title">
                Master Health Check
                <Box as="span" color="orange.500" className="hero-subline">Packages</Box>
              </Heading>
              <Text mt={4} fontSize="lg" color="gray.700">
                From quick screening panels to in-depth cardiac, diabetic, women’s and lifestyle wellness plans — all under one roof.
              </Text>
              <Text mt={3} color="gray.600" fontSize="sm">
                Select <Box as="span" fontWeight="700">“Compare”</Box> on two or more variants to see them side-by-side,
                or <Box as="span" fontWeight="700">“View Included Tests”</Box> to see full details for a single package.
              </Text>
              <HStack mt={5} spacing={3} flexWrap="wrap">
                <Button as={Link} href={siteConfig.bookingUrl}>Book a package online</Button>
                <Button as={Link} href="/tests" variant="outline">Book A Test</Button>
                <Button as={Link} href={"https://wa.me/" + siteConfig.internalNotifyNumber} variant="outline" target="_blank">Talk to us on WhatsApp</Button>
              </HStack>
              <HStack mt={4} spacing={2} flexWrap="wrap">
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

            <Box className="soft-card" p={6}>
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
