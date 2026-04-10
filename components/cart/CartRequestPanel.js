"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";
import VisitDateTimeSelector from "@/components/booking/VisitDateTimeSelector";

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

export default function CartRequestPanel({ cartItems, subtotal, hasCenterOnlyItems, source = "cart", onRequestSuccess }) {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientArea, setPatientArea] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [homeVisitRequested, setHomeVisitRequested] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState([]);
  const dateOptions = useMemo(() => getNextDays(5), []);
  const [preferredDate, setPreferredDate] = useState(dateOptions[0]?.iso || "");
  const [preferredSlot, setPreferredSlot] = useState("");
  const formBusy = isSubmitting || loadingSlots;
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

  async function sendCartRequest() {
    setLeadError("");

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
      setLeadError(e.message || "Unable to send request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
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

        <VisitDateTimeSelector
          allowVisitTypeToggle
          homeVisitRequested={homeVisitRequested}
          onHomeVisitChange={setHomeVisitRequested}
          dateOptions={dateOptions}
          preferredDate={preferredDate}
          onDateChange={setPreferredDate}
          loadingSlots={loadingSlots}
          slots={slots}
          preferredSlot={preferredSlot}
          onSlotChange={setPreferredSlot}
          formBusy={formBusy}
        />

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
        {preferredDate && preferredSlot ? (
          <Text fontSize="xs" color="gray.700">
            {homeVisitRequested ? "Selected home visit:" : "Tentative center visit:"} <strong>{preferredDateLabel}</strong> • <strong>{preferredSlotLabel}</strong>
          </Text>
        ) : null}
        {isSubmitting ? <Text fontSize="xs" color="teal.700">Submitting request...</Text> : null}
        <Button
          onClick={sendCartRequest}
          isLoading={isSubmitting}
          loadingText="Sending..."
          disabled={cartItems.length === 0 || formBusy}
        >
          Send Request to Lab
        </Button>
        <HStack align="stretch" spacing={2} flexWrap="wrap">
          <Button
            as={Link}
            href={"https://wa.me/" + siteConfig.internalNotifyNumber}
            target="_blank"
            size="xs"
            variant="outline"
            title="Need help deciding tests?"
          >
            Chat on WhatsApp
          </Button>
          <Button
            as={Link}
            href={siteConfig.reportsUrl}
            target="_blank"
            size="xs"
            variant="outline"
            title="Get our bot to send your reports. Chat using your registered mobile number."
          >
            Download Reports
          </Button>
        </HStack>
        </VStack>
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
