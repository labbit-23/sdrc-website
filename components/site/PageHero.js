"use client";

import { Box, Container, Heading, Text } from "@chakra-ui/react";

export default function PageHero({ title, subtitle }) {
  return (
    <Box className="page-hero" py={{ base: 12, md: 16 }}>
      <Container maxW="1200px">
        <Heading size="2xl" color="teal.800" mb={3}>{title}</Heading>
        {subtitle ? <Text fontSize={{ base: "md", md: "lg" }} color="gray.700" maxW="3xl">{subtitle}</Text> : null}
      </Container>
    </Box>
  );
}
