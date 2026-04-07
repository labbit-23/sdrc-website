// components/PackagesSection.js - SDRC Packages Section (Accordion-free for compatibility)

'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  Text,
  Flex,
} from "@chakra-ui/react";

const packagesData = [
  {
    category: "Women's Health",
    items: [
      { name: "Comprehensive Women's Health", price: 2500 },
      { name: "Basic Wellness Check", price: 1800 },
    ],
  },
  {
    category: "Cardiac Care",
    items: [
      { name: "Full Cardiac Screening", price: 3000 },
      { name: "TMT + ECG", price: 1500 },
    ],
  },
];

export default function PackagesSection({ addToCart }) {
  return (
    <Box p="6" maxW="960px" mx="auto">
      <Heading size="lg" mb="6">
        Our Health Packages
      </Heading>

      {packagesData.map((pkgCategory, idx) => (
        <Box key={idx} mb="8">
          <Heading size="md" mb="4" color="teal.600">
            {pkgCategory.category}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
            {pkgCategory.items.map((pkg, index) => (
              <Flex
                key={index}
                direction="column"
                justify="space-between"
                borderWidth="1px"
                borderRadius="md"
                p="4"
                bg="white"
                shadow="sm"
              >
                <Box mb="3">
                  <Text fontWeight="bold" mb="1">
                    {pkg.name}
                  </Text>
                  <Text>₹ {pkg.price}</Text>
                </Box>
                <Button
                  size="sm"
                 
                  onClick={() => addToCart(pkg)}
                >
                  Add to Cart
                </Button>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Box>
  );
}
