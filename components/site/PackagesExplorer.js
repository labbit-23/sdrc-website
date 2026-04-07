"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  HStack,
  Input,
  Text,
  VStack
} from "@chakra-ui/react";
import { FiDownload, FiHome, FiShare2, FiX } from "react-icons/fi";
import { BsBuilding, BsCartPlus } from "react-icons/bs";
import packagesData from "@/data/health-packages.json";
import { siteConfig } from "@/data/siteConfig";
import { readCartItems, saveCartItems } from "@/lib/cart";

function getVariantKey(pkgName, variantName) {
  return String(pkgName) + "::" + String(variantName);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function variantShareUrl(pkgName) {
  return "/packages#" + slugify(pkgName);
}

function buildPackageEnquiryUrl(pkgName, variantName, price) {
  const message = [
    "New package enquiry from website",
    `Package: ${pkgName}`,
    `Variant: ${variantName}`,
    price != null ? `Price: INR ${Number(price).toLocaleString("en-IN")}` : null,
    "Source: /packages"
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${siteConfig.internalNotifyNumber}?text=${encodeURIComponent(message)}`;
}

function downloadTextFile(filename, content) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getApplicableNotesForTests(testNames) {
  const notes = packagesData.globalNotes || [];
  const loweredTests = testNames.map((test) => String(test).toLowerCase());

  return notes.filter((note) => {
    const match = String(note).match(/^\*([^:]+):/);
    if (!match) return false;
    const key = match[1].trim().toLowerCase().replace(/\s+/g, " ");
    return loweredTests.some((test) => test.toLowerCase().includes(key));
  });
}

export default function PackagesExplorer() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const [activeVariant, setActiveVariant] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);


  const filteredPackages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return packagesData.packages;

    return packagesData.packages
      .map((pkg) => {
        const variants = (pkg.variants || []).filter((v) => {
          const blob = [pkg.name, pkg.description, v.name, v.description, ...(v.tests || [])]
            .join(" ")
            .toLowerCase();
          return blob.includes(q);
        });
        return { ...pkg, variants };
      })
      .filter((pkg) => pkg.variants.length > 0);
  }, [search]);

  const selectedVariants = useMemo(
    () => Object.keys(selected).map((key) => selected[key]).filter(Boolean),
    [selected]
  );

  const compareGrouped = useMemo(() => {
    const byCategory = new Map();

    selectedVariants.forEach((item) => {
      (item.tests || []).forEach((test) => {
        const category = packagesData.testCategoryMap[test] || "Others";
        if (!byCategory.has(category)) byCategory.set(category, new Set());
        byCategory.get(category).add(test);
      });
    });

    return Array.from(byCategory.entries())
      .map(([category, tests]) => ({
        category,
        tests: Array.from(tests).sort((a, b) => a.localeCompare(b))
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [selectedVariants]);

  const activeGrouped = useMemo(() => {
    if (!activeVariant) return [];
    const byCategory = new Map();
    (activeVariant.variant.tests || []).forEach((test) => {
      const category = packagesData.testCategoryMap[test] || "Others";
      if (!byCategory.has(category)) byCategory.set(category, []);
      byCategory.get(category).push(test);
    });
    return Array.from(byCategory.entries())
      .map(([category, tests]) => ({ category, tests }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [activeVariant]);

  const compareAllTests = useMemo(
    () => compareGrouped.flatMap((group) => group.tests),
    [compareGrouped]
  );

  const activeNotes = useMemo(
    () => (activeVariant ? getApplicableNotesForTests(activeVariant.variant.tests || []) : []),
    [activeVariant]
  );

  const compareNotes = useMemo(
    () => getApplicableNotesForTests(compareAllTests),
    [compareAllTests]
  );

  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 1800);
  };

  const addVariantToCart = (pkg, variant) => {
    const cartId = `pkg_${slugify(pkg.name)}_${slugify(variant.name)}`;
    const cartItems = readCartItems();
    if (cartItems.some((item) => item.id === cartId)) {
      showToast("Already in cart");
      return;
    }

    const next = [
      ...cartItems,
      {
        id: cartId,
        item_type: "package",
        name: variant.name ? `${pkg.name} - ${variant.name}` : pkg.name,
        internal_code: null,
        department: null,
        package_name: pkg.name,
        price: variant.price,
        home_collection: typeof variant.home_collection === "boolean" ? variant.home_collection : null,
        tests_count: Array.isArray(variant.tests) ? variant.tests.length : null
      }
    ];

    saveCartItems(next);
    showToast("Added to cart");
  };

  const toggleCompare = (pkgName, variant) => {
    const key = getVariantKey(pkgName, variant.name);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else if (Object.keys(next).length < 3) {
        next[key] = {
          key,
          pkgName,
          variantName: variant.name,
          price: variant.price,
          parameters: variant.parameters,
          tests: variant.tests || []
        };
      } else {
        showToast("You can compare up to 3 variants");
      }
      return next;
    });
  };

  const handleShare = async (pkgName, variant) => {
    const url = variantShareUrl(pkgName);
    const text = `${pkgName} - ${variant.name} at SDRC Diagnostics`;

    if (typeof navigator === "undefined") return;

    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        showToast("Package link copied");
      }
    } catch (err) {
      if (err && (err.name === "AbortError" || /cancel/i.test(String(err.message || "")))) {
        return;
      }
      showToast("Unable to share right now");
    }
  };

  const handleDownload = (pkgName, variant, description) => {
    const fileName = `${slugify(pkgName)}-${slugify(variant.name)}.txt`;
    const lines = [
      "SDRC Diagnostics Package Snapshot",
      "",
      `Package: ${pkgName}`,
      `Variant: ${variant.name}`,
      `Price: INR ${Number(variant.price).toLocaleString("en-IN")}`,
      `Parameters: ${variant.parameters}`,
      `Description: ${description}`,
      "",
      "Included Tests:",
      ...(variant.tests || []).map((t) => "- " + t),
      "",
      "Important notes:",
      ...getApplicableNotesForTests(variant.tests || []),
      "",
      "Book Online:",
      siteConfig.bookingUrl
    ];
    downloadTextFile(fileName, lines.join("\n"));
    showToast("Package summary downloaded");
  };

  const downloadCompareImage = async () => {
    if (typeof window === "undefined" || !window.html2canvas) {
      showToast("Image export unavailable");
      return;
    }
    const source = document.getElementById("compare-capture");
    if (!source) return;

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "18px";
    wrapper.style.width = `${Math.max(source.scrollWidth, 960)}px`;

    const clone = source.cloneNode(true);
    clone.style.overflow = "visible";
    clone.style.maxHeight = "none";
    clone.style.width = "100%";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const width = wrapper.scrollWidth;
      const height = wrapper.scrollHeight;
      const maxDim = 14000;
      const scale = Math.min(2, maxDim / Math.max(width, height));

      const canvas = await window.html2canvas(wrapper, {
        backgroundColor: "#ffffff",
        scale: Math.max(0.65, scale),
        useCORS: true,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0
      });

      const link = document.createElement("a");
      link.download = "sdrc-package-comparison.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.96);
      link.click();
      showToast("Comparison downloaded as JPG");
    } finally {
      wrapper.remove();
    }
  };

  return (
    <Container maxW="1200px" py={10}>
      <Script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js" strategy="afterInteractive" />
      <VStack align="stretch" gap={6}>
        <Box className="soft-card" p={6}>
          <Heading size="lg" mb={2}>
            Master Health Check Packages
          </Heading>
          <Text color="gray.600" mb={4}>
            Browse, filter and compare package variants by included tests.
          </Text>
          <Input
            placeholder="Search package/test (example: cardiac, vitamin, thyroid)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

        {filteredPackages.map((pkg) => (
          <Box key={pkg.name} id={slugify(pkg.name)} scrollMarginTop="110px">
            <Heading size="md" mb={1}>
              {pkg.name}
            </Heading>
            <Text color="gray.600" mb={4}>
              {pkg.description}
            </Text>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
              {pkg.variants.map((variant) => {
                const key = getVariantKey(pkg.name, variant.name);
                const checked = Boolean(selected[key]);
                const description = variant.description || pkg.description;
                const keyInclusions = Array.isArray(variant.key_inclusions) && variant.key_inclusions.length > 0
                  ? variant.key_inclusions
                  : (variant.tests || []).slice(0, 4);

                return (
                  <Box key={key} className="soft-card no-hover-lift" p={4} position="relative" overflow="hidden" display="flex" flexDirection="column">
                    <Box position="absolute" top={0} left={0} right={0} h="4px" bgGradient="linear(to-r, teal.500, orange.400, teal.500)" />
                    <Heading size="sm" color="teal.700">
                      {variant.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {description}
                    </Text>

                    <HStack justify="space-between" mt={3}>
                      <Text fontWeight="700" color="orange.500">
                        INR {Number(variant.price).toLocaleString("en-IN")}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {variant.parameters} parameters
                      </Text>
                    </HStack>
                    <HStack mt={1}>
                      <HStack
                        spacing={1}
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        bg={variant.home_collection ? "green.50" : "gray.100"}
                        color={variant.home_collection ? "green.700" : "gray.700"}
                        title={
                          variant.home_collection
                            ? "Home sample collection available for this package"
                            : "Home collection not available for this package"
                        }
                      >
                        {variant.home_collection ? <FiHome size={11} /> : <BsBuilding size={11} />}
                        <Text fontSize="10px" fontWeight="700">
                          {variant.home_collection ? "Home Collection" : "Center Visit"}
                        </Text>
                      </HStack>
                    </HStack>

                    <Box mt={3} bg="gray.50" borderRadius="md" p={2}>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Key inclusions
                      </Text>
                      {keyInclusions.map((test) => (
                        <Text key={test} fontSize="xs" color="gray.600">
                          • {test}
                        </Text>
                      ))}
                      {(variant.tests || []).length > 4 ? (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          + {(variant.tests || []).length - 4} more tests
                        </Text>
                      ) : null}
                    </Box>

                    <Box mt="auto">
                      <HStack mt={4} justify="space-between" align="center">
                        <HStack spacing={2}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCompare(pkg.name, variant)}
                            style={{ accentColor: "#008f82" }}
                          />
                          <Text fontSize="xs" color="gray.600">Compare</Text>
                        </HStack>
                        <Box
                          as="button"
                          type="button"
                          onClick={() => setActiveVariant({ pkgName: pkg.name, variant, description })}
                          fontSize="xs"
                          fontWeight="700"
                          color="teal.700"
                          textDecoration="underline"
                        >
                          View included tests
                        </Box>
                        <Button
                          size="sm"
                          variant="outline"
                          bg="white"
                          color="teal.700"
                          borderColor="teal.300"
                          onClick={() => addVariantToCart(pkg, variant)}
                          px={0}
                          minW="38px"
                        >
                          <BsCartPlus />
                        </Button>
                      </HStack>

                    <Button
                      as={Link}
                      href={buildPackageEnquiryUrl(pkg.name, variant.name, variant.price)}
                      mt={3}
                      size="sm"
                      width="full"
                      target="_blank"
                      rel="noopener noreferrer"
                      textAlign="center"
                    >
                      Enquire / Book
                    </Button>
                    </Box>
                  </Box>
                );
              })}
            </Grid>
          </Box>
        ))}
      </VStack>

      {selectedVariants.length > 0 ? (
        <Flex
          position="fixed"
          bottom={{ base: 2, md: 4 }}
          left={{ base: 2, md: 4 }}
          right={{ base: 2, md: 4 }}
          zIndex={25}
          className="soft-card"
          p={3}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={2}
          direction={{ base: "column", md: "row" }}
        >
          <Text fontSize="sm" fontWeight="600">
            {selectedVariants.length} variant(s) selected for compare
          </Text>
          <HStack alignSelf={{ base: "flex-end", md: "auto" }}>
            <Button size="sm" variant="outline" onClick={() => setSelected({})}>
              Clear
            </Button>
            <Button
              size="sm"
              isDisabled={selectedVariants.length < 2}
              onClick={() => setShowCompare(true)}
            >
              Compare now
            </Button>
          </HStack>
        </Flex>
      ) : null}

      {activeVariant ? (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.700"
          zIndex={40}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={3}
          onClick={() => setActiveVariant(null)}
        >
          <Box
            className="soft-card"
            maxW={{ base: "100%", md: "680px" }}
            w="full"
            p={0}
            maxH="88vh"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex justify="space-between" align="center" px={4} py={3} borderBottom="1px solid" borderColor="gray.200">
              <HStack spacing={3}>
                <Image src="/assets/sdrc-logo.png" alt="SDRC" width={94} height={28} />
                <Box>
                  <Text fontSize="11px" color="gray.500">{activeVariant.pkgName}</Text>
                  <Heading size="sm">{activeVariant.variant.name}</Heading>
                </Box>
              </HStack>
              <HStack spacing={1}>
                {isMobile ? (
                  <IconButton
                    size="sm"
                    variant="outline"
                    aria-label="Share package"
                    onClick={() => handleShare(activeVariant.pkgName, activeVariant.variant)}
                  >
                    <FiShare2 />
                  </IconButton>
                ) : (
                  <IconButton
                    size="sm"
                    variant="outline"
                    aria-label="Download package summary"
                    onClick={() => handleDownload(activeVariant.pkgName, activeVariant.variant, activeVariant.description)}
                  >
                    <FiDownload />
                  </IconButton>
                )}
                <IconButton
                  size="sm"
                  variant="outline"
                  aria-label="Close modal"
                  onClick={() => setActiveVariant(null)}
                >
                  <FiX />
                </IconButton>
              </HStack>
            </Flex>

            <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100" bg="gray.50">
              <HStack spacing={2} flexWrap="wrap">
                <Text fontSize="11px" px={2.5} py={1} borderRadius="full" bg="white" color="teal.700">
                  {activeVariant.variant.parameters} parameters
                </Text>
                <Text fontSize="11px" px={2.5} py={1} borderRadius="full" bg="white" color="orange.500" fontWeight="700">
                  INR {Number(activeVariant.variant.price).toLocaleString("en-IN")}
                </Text>
              </HStack>
              <Text color="gray.600" fontSize="xs" mt={2}>{activeVariant.description}</Text>
            </Box>

            <VStack align="stretch" px={4} py={3} gap={2}>
              {activeGrouped.map((group) => (
                <Box key={group.category}>
                  <HStack mb={1.5} spacing={2}>
                    {packagesData.categoryIconMap?.[group.category] ? (
                      <img src={packagesData.categoryIconMap[group.category]} alt={group.category} width={16} height={16} />
                    ) : null}
                    <Text fontSize="12px" fontWeight="700" color="teal.700">{group.category}</Text>
                  </HStack>
                  <VStack align="stretch" gap={1}>
                    {group.tests.map((test) => (
                      <Text key={test} fontSize="sm" color="gray.800" lineHeight="1.25">
                        • {test}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>

            <Box px={4} py={3} borderTop="1px solid" borderColor="gray.200" bg="white">
              {activeNotes.length > 0 ? (
                <Box mb={3}>
                  <Text fontSize="11px" color="gray.500" fontWeight="700" mb={1}>Important notes</Text>
                  {activeNotes.map((note) => (
                    <Text key={note} fontSize="11px" color="gray.500">{note}</Text>
                  ))}
                </Box>
              ) : null}

              <Text fontSize="11px" color="gray.500">
                Use the top-right icons to share on mobile or download on desktop.
              </Text>
            </Box>
          </Box>
        </Box>
      ) : null}

      {showCompare ? (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.700"
          zIndex={45}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
          onClick={() => setShowCompare(false)}
        >
          <Box
            className="soft-card"
            maxW={{ base: "100%", md: "1040px" }}
            w="full"
            p={{ base: 3, md: 5 }}
            maxH="84vh"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
              <HStack spacing={3}>
                <Image src="/assets/sdrc-logo.png" alt="SDRC" width={96} height={28} />
                <Heading size="md">Compare packages</Heading>
              </HStack>
              <HStack spacing={1}>
                <IconButton
                  size="sm"
                  variant="outline"
                  aria-label="Download comparison JPG"
                  onClick={downloadCompareImage}
                >
                  <FiDownload />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="outline"
                  aria-label="Close comparison modal"
                  onClick={() => setShowCompare(false)}
                >
                  <FiX />
                </IconButton>
              </HStack>
            </Flex>

            <Box overflowX="auto" id="compare-capture">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", lineHeight: 1.3 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>Test</th>
                    {selectedVariants.map((v) => (
                      <th key={v.key} style={{ textAlign: "center", padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>
                        <div>{v.variantName}</div>
                        <div style={{ color: "#f26939", fontWeight: 700 }}>INR {Number(v.price).toLocaleString("en-IN")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareGrouped.map((group) => (
                    <Fragment key={group.category}>
                      <tr key={group.category + "-head"}>
                        <td colSpan={1 + selectedVariants.length} style={{ padding: "7px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 700 }}>
                          <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                            {packagesData.categoryIconMap?.[group.category] ? (
                              <img src={packagesData.categoryIconMap[group.category]} alt={group.category} width="14" height="14" />
                            ) : null}
                            {group.category}
                          </span>
                        </td>
                      </tr>
                      {group.tests.map((test) => (
                        <tr key={group.category + "-" + test}>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #edf2f7" }}>{test}</td>
                          {selectedVariants.map((v) => (
                            <td key={v.key + "-" + test} style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid #edf2f7", fontWeight: 700 }}>
                              {v.tests.includes(test) ? "✓" : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </Box>

            {compareNotes.length > 0 ? (
              <Box mt={3}>
                <Text fontSize="11px" color="gray.500" fontWeight="700" mb={1}>Important notes</Text>
                {compareNotes.map((note) => (
                  <Text key={note} fontSize="11px" color="gray.500">{note}</Text>
                ))}
              </Box>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {toastMessage ? (
        <Box
          position="fixed"
          bottom={{ base: 20, md: 6 }}
          left="50%"
          transform="translateX(-50%)"
          bg="gray.800"
          color="white"
          px={4}
          py={2}
          borderRadius="md"
          zIndex={60}
          fontSize="sm"
        >
          {toastMessage}
        </Box>
      ) : null}
    </Container>
  );
}
