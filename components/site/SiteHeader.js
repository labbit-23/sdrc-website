"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { FiShoppingCart } from "react-icons/fi";
import { navItems, siteConfig } from "@/data/siteConfig";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const items = useMemo(
    () => navItems.filter((item) => item.flag == null || siteConfig[item.flag]),
    []
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function syncCartCount() {
      setCartCount(getCartCount());
    }

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener(CART_UPDATED_EVENT, syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount);
    };
  }, []);

  return (
    <>
      <Box bg="#008f82" color="white" fontSize="sm" px={{ base: 3, md: 4 }} py={2}>
        <Flex maxW="1200px" mx="auto" justify="space-between" align="center" gap={3}>
          <HStack spacing={2} flexWrap="nowrap" minW={0} flex="1" overflow="hidden">
            <Link href={"tel:" + siteConfig.phoneTel}>{siteConfig.phoneDisplay}</Link>
            <Text display={{ base: "none", md: "inline" }}>•</Text>
            <Text display={{ base: "none", md: "inline" }}>Jade Arcade, Paradise, Secunderabad</Text>
            <Text
              px={2.5}
              py={1}
              borderRadius="full"
              bg="whiteAlpha.200"
              fontSize="11px"
              fontWeight="700"
              display={{ base: "none", sm: "inline-flex" }}
              alignItems="center"
            >
              <Box as="span" w="7px" h="7px" borderRadius="full" bg="#22c55e" display="inline-block" mr={2} />
              NABL Accredited Lab
            </Text>
          </HStack>
          <Button
            as={Link}
            href={"https://wa.me/" + siteConfig.whatsappNumber}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="light"
            display={{ base: "none", md: "inline-flex" }}
            flexShrink={0}
            lineHeight="1"
            alignItems="center"
            justifyContent="center"
            ml="auto"
          >
            WhatsApp
          </Button>
        </Flex>
      </Box>

      <Box
        position="sticky"
        top={0}
        zIndex={40}
        bg="rgba(255,255,255,.96)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Flex maxW="1200px" mx="auto" px={{ base: 3, md: 4 }} py={{ base: 2.5, md: 3 }} align="center" justify="space-between" gap={4}>
          <Link href="/" aria-label="SDRC Home" style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
            <Image src="/assets/sdrc-logo.png" alt="SDRC Diagnostics" width={132} height={44} style={{ width: "auto", height: 40 }} />
          </Link>

          <HStack spacing={1} display={{ base: "none", xl: "flex" }} fontSize="14px" color="gray.700" flex={1} justify="center">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: active ? "#00695f" : "#334155",
                    fontWeight: active ? 700 : 500,
                    borderBottom: active ? "2px solid #008f82" : "2px solid transparent",
                    padding: "8px 12px",
                    whiteSpace: "nowrap"
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </HStack>

          <HStack spacing={2} flexShrink={0}>
            <Box position="relative">
              <IconButton
                as={Link}
                href="/cart"
                size="sm"
                variant="outline"
                bg="white"
                color="teal.700"
                borderColor="teal.300"
                aria-label="Cart"
              >
                <FiShoppingCart />
              </IconButton>
              {cartCount > 0 ? (
                <Box
                  position="absolute"
                  top="-6px"
                  right="-6px"
                  minW="18px"
                  h="18px"
                  px="4px"
                  borderRadius="full"
                  bg="orange.500"
                  color="white"
                  fontSize="10px"
                  fontWeight="700"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {cartCount}
                </Box>
              ) : null}
            </Box>
            <Button
              as={Link}
              href={siteConfig.reportsUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="outline"
              display={{ base: "none", lg: "inline-flex" }}
              title="Get our bot to send your reports. Chat using your registered mobile number."
            >
              Download Reports
            </Button>
            <Button
              as={Link}
              href="/tests"
              size="sm"
              display={{ base: "none", md: "inline-flex" }}
              className="book-test-cta"
            >
              <Text>Book A Test</Text>
              <Box as="span" className="book-test-ribbon">NEW</Box>
            </Button>
            <Button
              onClick={() => setMobileOpen((v) => !v)}
              variant="outline"
              size="sm"
              display={{ base: "inline-flex", xl: "none" }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              minW="40px"
              px={2}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </Button>
          </HStack>
        </Flex>

        {mobileOpen ? (
          <Box borderTop="1px solid" borderColor="gray.100" bg="white" display={{ xl: "none" }}>
            <VStack align="stretch" spacing={0} px={3} py={2}>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "12px 8px",
                    color: pathname === item.href ? "#00695f" : "#334155",
                    fontWeight: pathname === item.href ? 700 : 500,
                    borderRadius: "8px"
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <HStack px={2} py={2} spacing={2} flexWrap="wrap">
                <Box position="relative">
                  <IconButton
                    as={Link}
                    href="/cart"
                    size="sm"
                    variant="outline"
                    bg="white"
                    color="teal.700"
                    borderColor="teal.300"
                    aria-label="Cart"
                  >
                    <FiShoppingCart />
                  </IconButton>
                  {cartCount > 0 ? (
                    <Box
                      position="absolute"
                      top="-6px"
                      right="-6px"
                      minW="18px"
                      h="18px"
                      px="4px"
                      borderRadius="full"
                      bg="orange.500"
                      color="white"
                      fontSize="10px"
                      fontWeight="700"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {cartCount}
                    </Box>
                  ) : null}
                </Box>
                <Button as={Link} href="/tests" size="sm" className="book-test-cta">
                  <Text>Book A Test</Text>
                  <Box as="span" className="book-test-ribbon">NEW</Box>
                </Button>
                <Button as={Link} href={"https://wa.me/" + siteConfig.whatsappNumber} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                  WhatsApp
                </Button>
                <Button
                  as={Link}
                  href={siteConfig.reportsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  title="Get our bot to send your reports. Chat using your registered mobile number."
                >
                  Download Reports
                </Button>
              </HStack>
            </VStack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
