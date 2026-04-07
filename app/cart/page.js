"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, Container, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { readCartItems, saveCartItems } from "@/lib/cart";

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0";
  return `INR ${Number(amount).toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readCartItems());
  }, []);

  useEffect(() => {
    saveCartItems(items);
  }, [items]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.price) || 0), 0),
    [items]
  );
  const collectionFee = 0;
  const total = subtotal + collectionFee;

  function removeItem(itemId) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1100px">
          <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="12ch" className="hero-title">
            Your Cart
            <Box as="span" color="teal.700" className="hero-subline">Review Tests and Packages</Box>
          </Heading>
          <Text mt={3} color="gray.700" fontSize={{ base: "md", md: "lg" }}>
            Returning users on this browser will continue to see these selected items.
          </Text>
        </Container>
      </Box>

      <Container maxW="1100px" py={10}>
        {items.length === 0 ? (
          <Box className="soft-card" p={6}>
            <Text color="gray.600" mb={4}>Your cart is empty.</Text>
            <Button as={Link} href="/tests">Browse tests and packages</Button>
          </Box>
        ) : (
          <VStack align="stretch" gap={4}>
            <Box className="soft-card" p={5}>
              <Heading size="md" mb={3}>Selected Items ({items.length})</Heading>
              <VStack align="stretch" gap={2}>
                {items.map((item) => (
                  <Box key={item.id} borderWidth="1px" borderColor="gray.100" borderRadius="md" p={3}>
                    <HStack justify="space-between" align="start" gap={2}>
                      <Box>
                        <HStack spacing={2} mb={1}>
                          <Badge colorPalette={item.item_type === "package" ? "orange" : "teal"} variant="subtle">
                            {item.item_type === "package" ? "Package" : "Test"}
                          </Badge>
                          {item.department ? <Text fontSize="xs" color="gray.500">{item.department}</Text> : null}
                        </HStack>
                        <Text fontWeight="700" color="gray.800">{item.name}</Text>
                        {item.internal_code ? <Text fontSize="xs" color="gray.500">{item.internal_code}</Text> : null}
                        {item.tests_count ? <Text fontSize="xs" color="gray.500">Includes {item.tests_count} tests</Text> : null}
                      </Box>
                      <VStack align="end" gap={1}>
                        <Text fontWeight="700" color="orange.500">{formatInr(item.price)}</Text>
                        <Button size="xs" variant="ghost" color="red.600" onClick={() => removeItem(item.id)}>
                          Remove
                        </Button>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              <HStack mt={4} justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.100">
                <Text color="gray.600">Subtotal</Text>
                <Text color="gray.600">{formatInr(subtotal)}</Text>
              </HStack>
              <HStack mt={1} justify="space-between">
                <Text color="gray.600">Collection Fee</Text>
                <Text color="gray.600">{formatInr(collectionFee)}</Text>
              </HStack>
              <HStack mt={2} justify="space-between">
                <Text fontWeight="700">Total</Text>
                <Text fontWeight="700" color="teal.700">{formatInr(total)}</Text>
              </HStack>

              <HStack mt={5} spacing={2}>
                <Button as={Link} href="/tests">Continue Adding</Button>
                <Button variant="outline" onClick={() => setItems([])}>Clear Cart</Button>
              </HStack>
            </Box>
          </VStack>
        )}
      </Container>
    </>
  );
}
