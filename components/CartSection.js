// components/CartSection.js - SDRC Cart & WhatsApp Checkout

'use client';

import { Box, Heading, Text, Button, Flex } from "@chakra-ui/react";

export default function CartSection({ cart, removeFromCart }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const checkoutWhatsApp = () => {
    const message = `I'd like to book the following packages:\n${cart
      .map((i) => `- ${i.name} (₹${i.price})`)
      .join("\n")}\nTotal: ₹${total}`;
    window.open(
      `https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (cart.length === 0) return null;

  return (
    <Box p="6" maxW="960px" mx="auto" bg="gray.50" borderRadius="md" my="6">
      <Heading size="md" mb="3">Your Cart</Heading>
      {cart.map((item, idx) => (
        <Flex
          key={idx}
          justify="space-between"
          align="center"
          mb="2"
          borderBottom="1px solid #ddd"
          pb="2"
        >
          <Text>{item.name} - ₹{item.price}</Text>
          <Button size="xs" onClick={() => removeFromCart(idx)}>Remove</Button>
        </Flex>
      ))}
      <Text fontWeight="bold" mt="3">Total: ₹{total}</Text>
      <Button mt="4" onClick={checkoutWhatsApp}>
        Checkout via WhatsApp
      </Button>
    </Box>
  );
}
