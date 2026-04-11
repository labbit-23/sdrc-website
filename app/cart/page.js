"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import CartRequestPanel from "@/components/cart/CartRequestPanel";
import { readCartItems, saveCartItems } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readCartItems());
    setLoaded(true);
  }, []);

  useEffect(() => {
    trackEvent("page_view", { page_type: "cart" }, { pagePath: "/cart" });
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
    trackEvent("remove_from_cart", { item_id: itemId }, { pagePath: "/cart" });
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1100px">
          <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" className="hero-title">
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
              <HStack mt={5} spacing={2} flexWrap="wrap">
                <Button as={Link} href="/tests" size="sm">Continue Adding</Button>
                <Button as={Link} href="/packages" variant="outline" size="sm">Browse Packages</Button>
                <Button
                  variant="outline"
                  color="gray.700"
                  borderColor="gray.300"
                  size="sm"
                  onClick={() => {
                    trackEvent("clear_cart", { item_count: items.length }, { pagePath: "/cart" });
                    setItems([]);
                  }}
                >
                  Clear Cart
                </Button>
              </HStack>

              <CartRequestPanel
                cartItems={items}
                subtotal={subtotal}
                hasCenterOnlyItems={hasCenterOnlyItems}
                source="/cart page"
                onRequestSuccess={() => setItems([])}
                onRemoveItem={removeItem}
                onClearCart={() => setItems([])}
              />
            </Box>
          </VStack>
        )}
      </Container>
    </>
  );
}
