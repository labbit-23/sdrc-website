"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  Textarea,
  VStack
} from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

const centres = [
  {
    name: "SD Road",
    address: [
      "1-1-58/7/3, Srinath Complex, SD Road",
      "Opp. Taj Mahal Hotel",
      "Secunderabad - 500003, Telangana"
    ],
    map: siteConfig.locations.sdRoad
  },
  {
    name: "West Marredpally",
    address: [
      "Plot No. 35 & 36, Santhoshima Colony, West Marredpally",
      "Next to Happy Women's Clinic",
      "Secunderabad - 500026, Telangana"
    ],
    map: siteConfig.locations.marredpally
  },
  {
    name: "Yapral",
    address: [
      "Ambey Nilayam, Ground Floor, Bhanu Enclave, Yapral",
      "Near Bhanu Enclave",
      "Secunderabad - 500087, Telangana"
    ],
    map: siteConfig.locations.yapral
  }
];

export default function ContactPage() {
  const whatsappDisplay = "+91 " + siteConfig.whatsappNumber.slice(2);

  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1200px">
          <Grid templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }} gap={8}>
            <Box>
              <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="14ch" className="hero-title">
                Contact SDRC Diagnostics
                <Box as="span" color="teal.700" className="hero-subline">
                  Main Centre and Collection Centres
                </Box>
              </Heading>
              <Text mt={3} color="gray.700" fontSize={{ base: "md", md: "lg" }}>
                Reach us for appointments, health packages, home sample collection or report-related queries.
              </Text>

              <SimpleGrid mt={6} columns={{ base: 1, sm: 3 }} spacing={4}>
                <Box className="soft-card" p={4}>
                  <Text fontWeight="700" mb={1}>
                    Call
                  </Text>
                  <Link href={"tel:" + siteConfig.phoneTel}>{siteConfig.phoneDisplay}</Link>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Centre timings apply.
                  </Text>
                </Box>

                <Box className="soft-card" p={4}>
                  <Text fontWeight="700" mb={1}>
                    WhatsApp
                  </Text>
                  <Link href={"https://wa.me/" + siteConfig.whatsappNumber}>{whatsappDisplay}</Link>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Share prescriptions or booking queries.
                  </Text>
                </Box>

                <Box className="soft-card" p={4}>
                  <Text fontWeight="700" mb={1}>
                    Email
                  </Text>
                  <Link href="mailto:info@sdrc.in">info@sdrc.in</Link>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    For formal communication.
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Box className="soft-card" p={6}>
              <Heading size="md" mb={2}>
                Quick enquiry
              </Heading>
              <Text fontSize="xs" color="gray.500" mb={4}>
                This form mirrors the live site behavior and opens your mail app with details.
              </Text>
              <VStack as="form" align="stretch" spacing={3} action="mailto:info@sdrc.in" method="post" encType="text/plain">
                <Input placeholder="Name" name="Name" required />
                <Input placeholder="Mobile number" name="Mobile" />
                <Textarea placeholder="Query / message" name="Message" rows={4} />
                <Button type="submit">
                  Send via email
                </Button>
              </VStack>
              <Text fontSize="11px" color="gray.500" mt={3}>
                For urgent medical issues, please contact your treating doctor or nearest hospital.
              </Text>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Container maxW="1200px" py={12}>
        <VStack align="stretch" gap={12}>
          <Box>
            <Heading size="xl" mb={4}>
              Main centre - Jade Arcade, Paradise
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "1.5fr 1fr" }} gap={6}>
              <Box className="soft-card" p={6}>
                <Text fontWeight="700" mb={2}>
                  Address
                </Text>
                <Text color="gray.700" fontSize="sm">
                  101, Jade Arcade (Corporate Block), Paradise, MG Road
                  <br />
                  Secunderabad - 500003, Telangana, India
                </Text>

                <Text color="gray.700" fontSize="sm" mt={4}>
                  <strong>Phone:</strong>{" "}
                  <Link href={"tel:" + siteConfig.phoneTel}>{siteConfig.phoneDisplay}</Link>
                  <br />
                  <strong>Email:</strong> <Link href="mailto:info@sdrc.in">info@sdrc.in</Link>
                  <br />
                  <strong>WhatsApp:</strong>{" "}
                  <Link href={"https://wa.me/" + siteConfig.whatsappNumber}>{whatsappDisplay}</Link>
                </Text>

                <Text fontWeight="700" mt={4} mb={1}>
                  Centre timings
                </Text>
                <VStack align="stretch" gap={1} fontSize="sm" color="gray.700">
                  <HStack justify="space-between">
                    <Text>Monday - Saturday</Text>
                    <Text>7:00 AM - 9:00 PM</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Sunday/Holidays</Text>
                    <Text>7:00 AM - 2:00 PM</Text>
                  </HStack>
                </VStack>
              </Box>

              <Box className="soft-card" p={6}>
                <Text fontWeight="700" mb={2}>
                  Location map
                </Text>
                <Box borderRadius="md" overflow="hidden" h="220px" mb={3}>
                  <iframe
                    title="SDRC Main Centre map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13401.644712873018!2d78.4691960871582!3d17.441311199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a10b7ee2ab1%3A0xf08c95962eaf6b5b!2sSDRC%20-%20The%20Secunderabad%20Diagnostic%20and%20Research%20Centre!5e1!3m2!1sen!2sin!4v1764932257326!5m2!1sen!2sin"
                    style={{ border: 0, width: "100%", height: "100%" }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Box>
                <Button as={Link} href={siteConfig.locations.main} target="_blank" w="full">
                  Open in Google Maps
                </Button>
              </Box>
            </Grid>
          </Box>

          <Box>
            <Heading size="xl" mb={4}>
              Collection centres
            </Heading>
            <Text fontSize="sm" color="gray.700" mb={4}>
              You can give samples or enquire about home collection at these SDRC centres.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {centres.map((centre) => (
                <Box key={centre.name} className="soft-card" p={6}>
                  <Text fontWeight="700" mb={2}>
                    {centre.name}
                  </Text>
                  <Text color="gray.700" fontSize="sm">
                    {centre.address.join("\n")}
                  </Text>
                  <Link href={centre.map} target="_blank" style={{ display: "inline-flex", marginTop: 12 }}>
                    <Text fontSize="xs" color="teal.600" fontWeight="600">
                      View on Google Maps
                    </Text>
                  </Link>
                </Box>
              ))}
            </SimpleGrid>

            <Text fontSize="xs" color="gray.500" mt={4}>
              Centre timings and available tests may vary by location. Please call or WhatsApp before visiting.
            </Text>
          </Box>
        </VStack>
      </Container>
    </>
  );
}
