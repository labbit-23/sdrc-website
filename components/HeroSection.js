// components/HeroSection.js - SDRC Hero Banner

'use client';

import { Box, Button, Heading, Text } from "@chakra-ui/react";

export default function HeroSection() {
  const openWhatsApp = () => {
    window.open("https://wa.me/YOUR_NUMBER", "_blank");
  };

  return (
    <Box
      bgImage="url('/images/hero-clinic.jpg')"
      bgSize="cover"
      bgPos="center"
      h={{ base: "350px", md: "500px" }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      color="white"
      px="4"
    >
      <Heading fontSize={{ base: "2xl", md: "4xl" }} mb="4">
        Your Health. Our Care.
      </Heading>
      <Text fontSize={{ base: "md", md: "xl" }} maxW="600px" mb="6">
        Backed by 40+ Years of Trusted Diagnostics in Hyderabad
      </Text>
      <Button size="lg" onClick={openWhatsApp}>
        Book Health Package
      </Button>
    </Box>
  );
}
