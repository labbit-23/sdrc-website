"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, Container, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

export default function SiteFooter() {
  return (
    <Box bg="#0f172a" color="white" mt={16}>
      <Container maxW="1200px" py={10}>
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={8}>
          <VStack align="start" spacing={3}>
            <Link href="/" style={{ display: "inline-flex" }}>
              <Image src="/assets/sdrc-logo-full.png" alt="SDRC Diagnostics" width={148} height={48} style={{ width: "auto", height: 44 }} />
            </Link>
            <Text color="gray.300" fontSize="sm" maxW="520px">
              SDRC Diagnostics LLP is a multi-modality diagnostic centre at Jade Arcade, Paradise, offering imaging, cardio-pulmonary, neurology and a full-service NABL accredited laboratory.
            </Text>
            <Text color="gray.400" fontSize="xs">
              101, Jade Arcade (Corporate Block), Paradise, MG Road, Secunderabad - 500003, Telangana, India.
            </Text>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="700" fontSize="sm">
              Quick links
            </Text>
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/packages">Health Packages</Link>
            <Link href="/about">About SDRC</Link>
            <Link href="/contact">Contact</Link>
            <Link href={siteConfig.feedbackUrl} target="_blank">
              Feedback form
            </Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="700" fontSize="sm">
              Our centres
            </Text>
            <Link href={siteConfig.locations.main} target="_blank">Jade Arcade - Paradise (Main Centre)</Link>
            <Link href={siteConfig.locations.sdRoad} target="_blank">S.D. Road Collection Centre</Link>
            <Link href={siteConfig.locations.marredpally} target="_blank">West Marredpally Collection Centre</Link>
            <Link href={siteConfig.locations.yapral} target="_blank">Yapral Collection Centre</Link>
          </VStack>
        </Grid>
      </Container>

      <Box borderTop="1px solid" borderColor="whiteAlpha.300" py={4}>
        <Container maxW="1200px" display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="gray.400">
              © {new Date().getFullYear()} SDRC Diagnostics LLP. All rights reserved.
            </Text>
            <HStack spacing={2} fontSize="xs" color="gray.300" flexWrap="wrap">
              <Link href="/accreditation">NABL Accredited Laboratory</Link>
              <Text>•</Text>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Text>•</Text>
              <Link href="/tnc">Reporting T&amp;C</Link>
            </HStack>
          </VStack>

          <VStack align={{ base: "start", md: "end" }} spacing={2}>
            <HStack spacing={3} fontSize="xs" color="gray.300" flexWrap="wrap" justify={{ md: "flex-end" }}>
              <Link href={"tel:" + siteConfig.phoneTel}>Call: {siteConfig.phoneDisplay}</Link>
              <Text>•</Text>
              <Link href={"https://wa.me/" + siteConfig.whatsappNumber}>WhatsApp</Link>
              <Text>•</Text>
              <Link href={siteConfig.social.linktree} target="_blank">All links</Link>
            </HStack>

            <HStack spacing={2}>
              <Link href={siteConfig.social.facebook} target="_blank" aria-label="Facebook">
                <Box w="9" h="9" borderRadius="full" border="1px solid" borderColor="gray.600" display="flex" alignItems="center" justifyContent="center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13 22v-8h3l1-4h-4V7.5A1.5 1.5 0 0 1 14.5 6H17V2h-3.5A5.5 5.5 0 0 0 8 7.5V10H5v4h3v8h5z"/>
                  </svg>
                </Box>
              </Link>
              <Link href={siteConfig.social.instagram} target="_blank" aria-label="Instagram">
                <Box w="9" h="9" borderRadius="full" border="1px solid" borderColor="gray.600" display="flex" alignItems="center" justifyContent="center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 .001 3.999A2 2 0 0 0 12 10z"/>
                  </svg>
                </Box>
              </Link>
              <Link href={siteConfig.social.x} target="_blank" aria-label="X (Twitter)">
                <Box w="9" h="9" borderRadius="full" border="1px solid" borderColor="gray.600" display="flex" alignItems="center" justifyContent="center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 4h4.5l3 4.5L15.5 4H20l-5.5 7.2L20 20h-4.5l-3.3-4.8L8.5 20H4l5.6-7.4z"/>
                  </svg>
                </Box>
              </Link>
            </HStack>

            <HStack spacing={2} flexWrap="wrap" justify={{ md: "flex-end" }}>
              <Link href={siteConfig.apps.android} target="_blank">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" width={120} height={36} style={{ width: "auto", height: 32 }} unoptimized />
              </Link>
              <Link href={siteConfig.apps.ios} target="_blank">
                <Image src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" width={108} height={36} style={{ width: "auto", height: 32 }} unoptimized />
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
