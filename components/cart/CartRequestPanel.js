"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, HStack, Input, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0.00";
  return `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      label: `${dt.getDate()} ${dt.toLocaleString("en-US", { month: "short" })} (${dt.toLocaleString("en-US", { weekday: "short" })})`
    });
  }
  return out;
}

function parseSlotHour(slot) {
  const candidate = String(slot?.start_time || slot?.slot_name || "");
  const m24 = candidate.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
  if (m24) return Number(m24[1]);
  const m12 = candidate.match(/\b(1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(AM|PM)\b/i);
  if (!m12) return null;
  let h = Number(m12[1]);
  const mer = String(m12[2]).toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h;
}

export default function CartRequestPanel({ cartItems, subtotal, hasCenterOnlyItems, source = "cart" }) {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [homeVisitRequested, setHomeVisitRequested] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [leadSuccess, setLeadSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState([]);
  const dateOptions = useMemo(() => getNextDays(5), []);
  const [preferredDate, setPreferredDate] = useState(dateOptions[0]?.iso || "");
  const [preferredSlot, setPreferredSlot] = useState("");
  const slotGroups = useMemo(() => {
    const groups = { Morning: [], Afternoon: [], Evening: [] };
    slots.forEach((slot) => {
      const hour = parseSlotHour(slot);
      if (hour == null || hour < 12) groups.Morning.push(slot);
      else if (hour < 17) groups.Afternoon.push(slot);
      else groups.Evening.push(slot);
    });
    return groups;
  }, [slots]);

  useEffect(() => {
    if (!homeVisitRequested) return;
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
  }, [homeVisitRequested, slots.length]);

  async function sendCartRequest() {
    setLeadError("");
    setLeadSuccess("");

    if (cartItems.length === 0) {
      setLeadError("Add at least one test or package before sending.");
      return;
    }

    if (!patientName.trim()) {
      setLeadError("Patient name is required.");
      return;
    }

    const normalizedPhone = normalizePhone(patientPhone);
    if (normalizedPhone.length < 10) {
      setLeadError("Enter a valid patient phone number.");
      return;
    }

    if (homeVisitRequested && !preferredDate) {
      setLeadError("Select preferred date for home visit.");
      return;
    }
    if (homeVisitRequested && !preferredSlot) {
      setLeadError("Select preferred time slot for home visit.");
      return;
    }

    const payload = {
      action: "send_whatsapp_lead",
      source,
      patient_name: patientName.trim(),
      patient_phone: normalizedPhone,
      patient_notes: patientNotes.trim(),
      home_visit_required: homeVisitRequested,
      preferred_date: homeVisitRequested ? preferredDate : null,
      preferred_timeslot: homeVisitRequested ? preferredSlot : null,
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
      const quickbookStatus = data?.quickbooking?.attempted
        ? " Home visit booking has been queued."
        : "";
      setLeadSuccess(`Request received successfully.${quickbookStatus}`);
    } catch (e) {
      setLeadError(e.message || "Unable to send request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={4}>
      <Box>
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
      </Box>

      <VStack align="stretch" gap={2}>
        <Input
          bg="white"
          size="sm"
          placeholder="Patient name *"
          name="patient_name"
          autoComplete="name"
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
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
        />
        <Input bg="white" size="sm" placeholder="Optional note (timing/preferences)" value={patientNotes} onChange={(e) => setPatientNotes(e.target.value)} />

        <HStack spacing={2} mt={1} align="start">
          <Box
            as="input"
            type="checkbox"
            checked={homeVisitRequested}
            onChange={(e) => setHomeVisitRequested(e.target.checked)}
            style={{ accentColor: "#008f82", marginTop: "2px" }}
          />
          <VStack align="start" gap={0}>
            <Text fontSize="sm" color="gray.700" fontWeight="600">Request Home Visit</Text>
            <Text fontSize="xs" color="gray.500">Uncheck if you plan to visit the center.</Text>
          </VStack>
        </HStack>

        {homeVisitRequested ? (
          <>
            <SimpleGrid columns={{ base: 5, md: 5 }} gap={1.5}>
              {dateOptions.map((day) => {
                const active = preferredDate === day.iso;
                const [dayNum] = day.label.split(" ");
                const meta = day.label.slice(dayNum.length + 1);
                return (
                  <Button
                    key={day.iso}
                    variant={active ? "solid" : "outline"}
                    h="64px"
                    px={1}
                    borderRadius="lg"
                    onClick={() => setPreferredDate(day.iso)}
                  >
                    <VStack gap={0}>
                      <Text fontSize="lg" lineHeight="1" fontWeight="800">{dayNum}</Text>
                      <Text fontSize="10px" color={active ? "white" : "gray.600"}>{meta}</Text>
                    </VStack>
                  </Button>
                );
              })}
            </SimpleGrid>
            {loadingSlots ? (
              <HStack>
                <Spinner size="sm" color="teal.500" />
                <Text fontSize="xs" color="gray.600">Loading time slots...</Text>
              </HStack>
            ) : (
              <VStack align="stretch" gap={2}>
                {Object.entries(slotGroups).map(([groupName, groupSlots]) => (
                  <Box
                    key={groupName}
                    p={2}
                    borderRadius="lg"
                    bg={groupName === "Morning" ? "teal.50" : groupName === "Afternoon" ? "orange.50" : "orange.100"}
                  >
                    <Text fontSize="xs" fontWeight="700" color="teal.700" mb={1.5}>{groupName}</Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} gap={1.5}>
                      {groupSlots.map((slot) => {
                        const active = preferredSlot === slot.id;
                        return (
                          <Button
                            key={slot.id}
                            variant={active ? "solid" : "outline"}
                            h="34px"
                            px={2}
                            borderRadius="md"
                            fontSize="xs"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            onClick={() => setPreferredSlot(slot.id)}
                          >
                            {slot.slot_name || `${slot.start_time || ""} - ${slot.end_time || ""}`}
                          </Button>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            )}
          </>
        ) : null}

        {homeVisitRequested && hasCenterOnlyItems ? (
          <Text fontSize="xs" color="orange.600">
            Some selected items require center visit. Lab team will confirm final feasibility.
          </Text>
        ) : null}

        {cartItems.length > 0 && !hasCenterOnlyItems ? (
          <Text fontSize="xs" color="green.700">
            Tests can be done at home.
          </Text>
        ) : null}

        {leadError ? <Text fontSize="xs" color="red.600">{leadError}</Text> : null}
        {leadSuccess ? <Text fontSize="xs" color="green.700">{leadSuccess}</Text> : null}
        <Button onClick={sendCartRequest} isLoading={isSubmitting} isDisabled={cartItems.length === 0}>Send Request to Lab</Button>
        <VStack align="stretch" gap={0.5}>
          <Link href={"https://wa.me/" + siteConfig.internalNotifyNumber} target="_blank">
            <Text fontSize="xs" color="teal.700" fontWeight="600">
              Need help deciding tests? Chat with our team on WhatsApp
            </Text>
          </Link>
          <Link href={siteConfig.reportsUrl} target="_blank">
            <Text
              fontSize="xs"
              color="teal.700"
              fontWeight="600"
              title="Get our bot to send your reports. Chat using your registered mobile number."
            >
              Download Reports (bot-assisted)
            </Text>
          </Link>
        </VStack>
      </VStack>
    </Grid>
  );
}
