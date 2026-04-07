"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, Container, Heading, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";
import CartRequestPanel from "@/components/cart/CartRequestPanel";
import { readCartItems, saveCartItems } from "@/lib/cart";

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0.00";
  return `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatLinePrice(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "0";
  return Number(amount).toLocaleString("en-IN");
}

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readCartItems());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveCartItems(items);
  }, [items, loaded]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.price) || 0), 0),
    [items]
  );
  const hasCenterOnlyItems = useMemo(
    () => items.some((item) => item.home_collection === false),
    [items]
  );

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
                    <HStack justify="space-between" align="start" gap={2} flexWrap="wrap">
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
                      <VStack align="end" gap={1} minW="96px" ml="auto">
                        <Text fontWeight="700" color="orange.500">{formatLinePrice(item.price)}</Text>
                        <IconButton size="xs" variant="ghost" color="gray.500" aria-label="Remove item" onClick={() => removeItem(item.id)}>
                          <FiTrash2 />
                        </IconButton>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              <HStack mt={5} spacing={2} flexWrap="wrap">
                <Button as={Link} href="/tests" size="sm">Continue Adding</Button>
                <Button as={Link} href="/packages" variant="outline" size="sm">Browse Packages</Button>
                <Button variant="outline" color="gray.700" borderColor="gray.300" size="sm" onClick={() => setItems([])}>Clear Cart</Button>
              </HStack>

              <CartRequestPanel
                cartItems={items}
                subtotal={subtotal}
                hasCenterOnlyItems={hasCenterOnlyItems}
                source="/cart page"
              />
            </Box>
          </VStack>
        )}
      </Container>
    </>
  );
}
