"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, Grid, HStack, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { FiDownload, FiHome, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { siteConfig } from "@/data/siteConfig";
import VisitDateTimeSelector from "@/components/booking/VisitDateTimeSelector";
import { trackEvent } from "@/lib/analytics";

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0.00";
  return `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatLinePrice(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "0.00";
  return Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateIso(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getNextDays(count = 5) {
  const out = [];
  const base = new Date();
  for (let i = 0; i < count; i += 1) {
    const dt = new Date(base);
    dt.setDate(base.getDate() + i + 1);
    out.push({
      iso: formatDateIso(dt),
      day: dt.getDate(),
      month: dt.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      weekday: dt.toLocaleString("en-US", { weekday: "short" }),
      label: `${dt.getDate()} ${dt.toLocaleString("en-US", { month: "short" })} (${dt.toLocaleString("en-US", { weekday: "short" })})`
    });
  }
  return out;
}

export default function CartRequestPanel({
  cartItems,
  subtotal,
  hasCenterOnlyItems,
  source = "cart",
  onRequestSuccess,
  onRemoveItem,
  onClearCart
}) {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientArea, setPatientArea] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [homeVisitRequested, setHomeVisitRequested] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState([]);
  const dateOptions = useMemo(() => getNextDays(7), []);
  const [preferredDate, setPreferredDate] = useState(dateOptions[0]?.iso || "");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [showDateTimeSelection, setShowDateTimeSelection] = useState(true);
  const formBusy = isSubmitting || loadingSlots;
  const hasCenterOnlyPackages = useMemo(
    () => cartItems.some((item) => item.item_type === "package" && item.home_collection === false),
    [cartItems]
  );
  const hasCenterOnlyTests = useMemo(
    () => cartItems.some((item) => item.item_type === "test" && item.home_collection === false),
    [cartItems]
  );
  const showCenterVisitAdvisory = homeVisitRequested && (hasCenterOnlyItems || hasCenterOnlyPackages || hasCenterOnlyTests);
  const preferredDateLabel = useMemo(
    () => dateOptions.find((d) => d.iso === preferredDate)?.label || preferredDate,
    [dateOptions, preferredDate]
  );
  const preferredSlotLabel = useMemo(() => {
    const matched = slots.find((s) => s.id === preferredSlot);
    return matched?.slot_name || (matched ? `${matched.start_time || ""} - ${matched.end_time || ""}` : preferredSlot);
  }, [slots, preferredSlot]);

  useEffect(() => {
    if (slots.length > 0) return;
    let cancelled = false;
    setLoadingSlots(true);
    fetch("/api/quickbook?type=slots", { cache: "no-store" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) throw new Error(data?.error || "Unable to load slots");
        setSlots(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setLeadError(e.message || "Unable to load slots");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slots.length]);

  useEffect(() => {
    if (!preferredSlot && Array.isArray(slots) && slots.length > 0) {
      setPreferredSlot(String(slots[0]?.id || ""));
    }
  }, [slots, preferredSlot]);

  useEffect(() => {
    if (hasCenterOnlyTests) {
      setHomeVisitRequested(false);
      setShowDateTimeSelection(false);
      return;
    }
    if (hasCenterOnlyPackages && !homeVisitRequested) {
      setShowDateTimeSelection(false);
    } else {
      setShowDateTimeSelection(true);
    }
  }, [hasCenterOnlyPackages, hasCenterOnlyTests, homeVisitRequested]);

  async function sendCartRequest() {
    trackEvent("submit_request_click", { source, item_count: cartItems.length }, { pagePath: source, phone: patientPhone });
    setLeadError("");

    if (!patientName.trim()) {
      setLeadError("Patient name is required.");
      return;
    }

    const normalizedPhone = normalizePhone(patientPhone);
    if (normalizedPhone.length < 10) {
      setLeadError("Enter a valid patient phone number.");
      return;
    }

    if (!preferredDate) {
      setLeadError(homeVisitRequested ? "Select preferred date for home visit." : "Select tentative date for center visit.");
      return;
    }
    if (!preferredSlot) {
      setLeadError(homeVisitRequested ? "Select preferred time slot for home visit." : "Select tentative time slot for center visit.");
      return;
    }

    const payload = {
      action: "send_whatsapp_lead",
      source,
      patient_name: patientName.trim(),
      patient_phone: normalizedPhone,
      patient_notes: patientNotes.trim(),
      patient_area: patientArea.trim(),
      home_visit_required: homeVisitRequested,
      preferred_date: preferredDate || null,
      preferred_timeslot: preferredSlot || null,
      subtotal,
      collection_fee: null,
      total: subtotal,
      items: cartItems.map((item) => ({
        id: item.id,
        item_type: item.item_type,
        name: item.name,
        internal_code: item.internal_code || null,
        price: item.price,
        home_collection: item.home_collection ?? null
      }))
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Unable to send request right now.");
      trackEvent("submit_request_success", { source, item_count: cartItems.length }, { pagePath: source, phone: normalizedPhone });
      const quickbookStatus = data?.quickbooking?.attempted
        ? " Home visit booking has been queued."
        : "";
      setToastMessage(`Request received successfully. Our team will connect shortly.${quickbookStatus}`);
      window.setTimeout(() => setToastMessage(""), 2600);
      if (typeof onRequestSuccess === "function") {
        onRequestSuccess();
      }
      window.setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.assign("/");
        }
      }, 900);
    } catch (e) {
      trackEvent("submit_request_fail", { source, error: String(e?.message || "Unable to send request right now") }, { pagePath: source, phone: patientPhone });
      setLeadError(e.message || "Unable to send request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={4}>
        <Box borderWidth="1px" borderColor="gray.100" borderRadius="lg" p={4} bg="white" display="flex" flexDirection="column">
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="700" color="gray.800">Your Cart</Text>
            <Text fontSize="xs" color="gray.600" fontWeight="700">{cartItems.length} item(s)</Text>
          </HStack>
          {cartItems.length === 0 ? (
            <Box borderWidth="1px" borderStyle="dashed" borderColor="gray.300" borderRadius="md" p={3} bg="gray.50">
              <Text fontSize="sm" color="gray.500">No items selected yet.</Text>
            </Box>
          ) : (
            <VStack align="stretch" gap={2}>
              {cartItems.map((item) => (
                <Box key={item.id} borderWidth="1px" borderColor="gray.100" borderRadius="md" p={2.5}>
                  <HStack justify="space-between" align="start" gap={2}>
                    <Box flex="1" minW={0}>
                      <HStack spacing={2} flexWrap="wrap" mb={0.5}>
                        <Badge colorPalette={item.item_type === "package" ? "orange" : "teal"} variant="subtle">
                          {item.item_type === "package" ? "Package" : "Test"}
                        </Badge>
                        {item.department ? <Text fontSize="xs" color="gray.500">{item.department}</Text> : null}
                        {item.home_collection === true ? (
                          <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="green.50" color="green.700">
                            <FiHome size={10} />
                            <Text fontSize="10px" fontWeight="700">Home</Text>
                          </HStack>
                        ) : item.home_collection === false ? (
                          <HStack spacing={1} px={2} py={0.5} borderRadius="full" bg="gray.100" color="gray.700">
                            <BsBuilding size={10} />
                            <Text fontSize="10px" fontWeight="700">Center</Text>
                          </HStack>
                        ) : null}
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color="gray.800" noOfLines={1}>{item.name}</Text>
                      <HStack justify="space-between" mt={0.5}>
                        <Text fontSize="xs" color="gray.500">
                          {item.internal_code ? item.internal_code : item.tests_count ? `Includes ${item.tests_count} tests` : ""}
                        </Text>
                        <Text fontSize="sm" fontWeight="700" color="orange.500">{formatLinePrice(item.price)}</Text>
                      </HStack>
                    </Box>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      color="gray.500"
                      aria-label="Remove item"
                      onClick={() => onRemoveItem?.(item.id)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </HStack>
                </Box>
              ))}
              <Button size="xs" variant="outline" color="gray.700" borderColor="gray.300" alignSelf="flex-end" onClick={() => onClearCart?.()}>
                Clear cart
              </Button>
            </VStack>
          )}
          <Box mt="auto" pt={4}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" color="gray.600">Subtotal</Text>
              <Text fontSize="sm" color="gray.600">{formatInr(subtotal)}</Text>
            </HStack>
            {homeVisitRequested ? (
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="gray.600">Collection Fee</Text>
                <Text fontSize="sm" color="gray.600">TBA</Text>
              </HStack>
            ) : null}
            <HStack justify="space-between" mt={2}>
              <Text fontWeight="700">Estimated Total</Text>
              <Text fontWeight="700" color="teal.700">{homeVisitRequested ? `${formatInr(subtotal)} + TBA` : formatInr(subtotal)}</Text>
            </HStack>
            <HStack mt={3} spacing={2} align="stretch">
              <Input
                bg="white"
                size="sm"
                placeholder="Coupon code (coming soon)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={formBusy}
              />
              <Button size="sm" variant="outline" disabled>
                Apply
              </Button>
            </HStack>
          </Box>
        </Box>

        <Box borderWidth="1px" borderColor="gray.100" borderRadius="lg" p={4} bg="white">
          <VisitDateTimeSelector
            allowVisitTypeToggle
            homeVisitRequested={homeVisitRequested}
            onHomeVisitChange={(next) => {
              setHomeVisitRequested(next);
              if (next) {
                setShowDateTimeSelection(true);
              } else if (hasCenterOnlyPackages || hasCenterOnlyTests) {
                setShowDateTimeSelection(false);
              } else {
                setShowDateTimeSelection(true);
              }
            }}
            lockCenterVisit={hasCenterOnlyTests}
            showDateTimeSelection={showDateTimeSelection}
            onRevealDateTimeSelection={() => setShowDateTimeSelection(true)}
            collapsedSlotLabel={`${preferredDateLabel} • ${preferredSlotLabel}`}
            dateOptions={dateOptions}
            preferredDate={preferredDate}
            onDateChange={setPreferredDate}
            loadingSlots={loadingSlots}
            slots={slots}
            preferredSlot={preferredSlot}
            onSlotChange={setPreferredSlot}
            formBusy={formBusy}
          />
        </Box>
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={5}>
        <Box borderWidth="1px" borderColor="gray.100" borderRadius="lg" p={4} bg="white">
          <VStack align="stretch" gap={2}>
          <Input
            bg="white"
            size="sm"
            placeholder="Patient name *"
            name="patient_name"
            autoComplete="name"
            disabled={formBusy}
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <Input
            bg="white"
            size="sm"
            placeholder="Patient phone number *"
            name="patient_phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            disabled={formBusy}
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
          />
          <Input
            bg="white"
            size="sm"
            placeholder="Area / locality"
            name="patient_area"
            autoComplete="street-address"
            disabled={formBusy}
            value={patientArea}
            onChange={(e) => setPatientArea(e.target.value)}
          />
          <Input
            bg="white"
            size="sm"
            placeholder="Optional note (timing/preferences)"
            disabled={formBusy}
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
          />
          </VStack>
        </Box>
        <Box borderWidth="1px" borderColor="gray.100" borderRadius="lg" p={4} bg="white">
          {showCenterVisitAdvisory ? (
            <Text fontSize="xs" color="orange.600" mt={1}>
              Some selected items include center-only imaging. Home collection can be done for eligible tests; center visit is needed to complete imaging items.
            </Text>
          ) : null}
          {homeVisitRequested && cartItems.length > 0 && !showCenterVisitAdvisory ? (
            <Text fontSize="xs" color="green.700" mt={1}>
              Tests can be done at home.
            </Text>
          ) : null}

          {leadError ? <Text fontSize="xs" color="red.600" mt={2}>{leadError}</Text> : null}
          {preferredDate && preferredSlot ? (
            <Box mt={2} px={3} py={2} borderRadius="md" bg="teal.50" borderWidth="1px" borderColor="teal.100">
              <Text fontSize="xs" color="gray.700">
                {homeVisitRequested ? "Selected home visit:" : "Tentative center visit:"} <strong>{preferredDateLabel}</strong> • <strong>{preferredSlotLabel}</strong>
              </Text>
            </Box>
          ) : null}
          {isSubmitting ? <Text fontSize="xs" color="teal.700" mt={2}>Submitting request...</Text> : null}
          <Button
            mt={3}
            w="full"
            onClick={sendCartRequest}
            isLoading={isSubmitting}
            loadingText="Sending..."
            disabled={formBusy}
          >
            Send Request to Lab
          </Button>
          <Text fontSize="xs" color="gray.600" mt={2}>
            * Prices shown are indicative. Final pricing and test availability are confirmed by the lab team after request review, including sample requirements and legacy/repeat test mappings.
          </Text>
          <HStack align="stretch" spacing={2} flexWrap="wrap" mt={2}>
            <Button
              as={Link}
              href={"https://wa.me/" + siteConfig.internalNotifyNumber}
              target="_blank"
              size="sm"
              variant="outline"
              title="Need help deciding tests?"
              leftIcon={<FiMessageCircle />}
            >
              Chat on WhatsApp
            </Button>
            <Button
              as={Link}
              href={siteConfig.reportsUrl}
              target="_blank"
              size="sm"
              variant="outline"
              title="Get our bot to send your reports. Chat using your registered mobile number."
              leftIcon={<FiDownload />}
            >
              Download Reports
            </Button>
          </HStack>
        </Box>
      </Grid>
      {toastMessage ? (
        <Box
          position="fixed"
          right={{ base: 4, md: 6 }}
          bottom={{ base: 4, md: 6 }}
          bg="teal.600"
          color="white"
          px={4}
          py={2}
          borderRadius="md"
          boxShadow="lg"
          zIndex={30}
          fontSize="sm"
          maxW={{ base: "84vw", md: "420px" }}
        >
          {toastMessage}
        </Box>
      ) : null}
    </>
  );
}
