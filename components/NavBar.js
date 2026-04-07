// components/NavBar.js - SDRC Navigation Bar

'use client';

import { Box, Button, Flex, Heading, IconButton, Badge } from "@chakra-ui/react";
import { FiShoppingCart } from "react-icons/fi";

export default function NavBar({ cartCount }) {
  return (
    <Box bg="teal.600" color="white" px="6" py="3">
      <Flex align="center" justify="space-between">
        <Heading size="md">SDRC</Heading>
        <Flex align="center" gap="4">
          <Button 
            as="a" 
            href="/login" 
            variant="outline" 
            colorScheme="whiteAlpha">
            Login
          </Button>
          <Box position="relative">
            <IconButton
              icon={<FiShoppingCart />}
              variant="outline"
              aria-label="Cart"
              colorScheme="whiteAlpha"
            />
            {cartCount > 0 && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                borderRadius="full"
                bg="red.500"
                color="white"
              >
                {cartCount}
              </Badge>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
