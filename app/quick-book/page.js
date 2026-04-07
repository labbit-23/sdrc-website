"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack
} from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

function formatDateIso(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getNextDays(count = 7) {
  const days = [];
  const base = new Date();
  for (let i = 0; i < count; i += 1) {
    const dt = new Date(base);
    dt.setDate(base.getDate() + i + 1);
    days.push({
      iso: formatDateIso(dt),
      day: dt.getDate(),
      month: dt.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      label: dt.toLocaleString("en-US", { weekday: "short" })
    });
  }
  return days;
}

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
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

export default function QuickBookPage() {
  const whatsappQuickbookHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Home visit")}`;
  const dayOptions = useMemo(() => getNextDays(7), []);
  const [selectedDate, setSelectedDate] = useState(dayOptions[0]?.iso || "");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    area: "",
    packageName: "General test booking",
    persons: 1,
    whatsapp: true,
    agree: true
  });
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
        if (!cancelled) setError(e.message || "Unable to load slots");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    setError("");
    setSuccess("");

    const phone = normalizePhone(form.phone);
    if (!form.patientName.trim()) {
      setError("Patient name is required.");
      return;
    }
    if (phone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!selectedDate) {
      setError("Please select date.");
      return;
    }
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    if (!form.agree) {
      setError("Consent is required to submit booking.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quickbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.patientName.trim(),
          phone,
          packageName: form.packageName.trim(),
          area: form.area.trim(),
          date: selectedDate,
          timeslot: selectedSlot,
          persons: Number(form.persons || 1),
          whatsapp: form.whatsapp,
          agree: form.agree
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Quick booking failed");
      setSuccess("Booking request submitted. Our team will contact you shortly.");
      setSelectedSlot("");
      setForm((prev) => ({ ...prev, patientName: "", phone: "", area: "" }));
    } catch (e) {
      setError(e.message || "Quick booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Box className="brochure-bg" py={{ base: 10, md: 14 }}>
        <Container maxW="1100px">
          <Heading size={{ base: "2xl", md: "5xl" }} color="gray.800" maxW="14ch" className="hero-title">
            Home Visit Request
            <Box as="span" color="teal.700" className="hero-subline">Select Date and Time Slot</Box>
          </Heading>
          <Text mt={3} color="gray.700" fontSize={{ base: "md", md: "lg" }}>
            No test selection needed. Reserve a collection slot and our team will call to confirm.
          </Text>
        </Container>
      </Box>

      <Container maxW="1100px" py={10}>
        <Grid templateColumns={{ base: "1fr", lg: "1.1fr .9fr" }} gap={6} alignItems="start">
          <Box className="soft-card no-hover-lift" p={{ base: 4, md: 6 }}>
            <Heading size="md" mb={1}>Collection Date & Time</Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>Choose preferred date and slot.</Text>

            <HStack gap={2} overflowX="auto" pb={1} mb={4} align="stretch">
              {dayOptions.map((day) => {
                const active = selectedDate === day.iso;
                return (
                  <Button
                    key={day.iso}
                    variant={active ? "solid" : "outline"}
                    minW="82px"
                    h="84px"
                    borderRadius="xl"
                    onClick={() => setSelectedDate(day.iso)}
                    px={2}
                  >
                    <VStack gap={0}>
                      <Text fontSize="10px" opacity={0.9}>{day.month}</Text>
                      <Text fontSize="2xl" lineHeight="1" fontWeight="800">{day.day}</Text>
                      <Text fontSize="11px">{day.label}</Text>
                    </VStack>
                  </Button>
                );
              })}
            </HStack>

            {loadingSlots ? (
              <HStack py={8} justify="center">
                <Spinner color="teal.500" />
                <Text color="gray.600" fontSize="sm">Loading time slots...</Text>
              </HStack>
            ) : (
              <VStack align="stretch" gap={4}>
                {Object.entries(slotGroups).map(([groupName, groupSlots]) => (
                  <Box key={groupName}>
                    <Text fontSize="xs" fontWeight="700" color="teal.700" mb={2}>{groupName}</Text>
                    <SimpleGrid columns={{ base: 2, sm: 3 }} gap={2}>
                      {groupSlots.map((slot) => {
                        const active = selectedSlot === slot.id;
                        return (
                          <Button
                            key={slot.id}
                            variant={active ? "solid" : "outline"}
                            h="42px"
                            borderRadius="lg"
                            onClick={() => setSelectedSlot(slot.id)}
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            fontSize="sm"
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
          </Box>

          <Box className="soft-card no-hover-lift" p={{ base: 4, md: 6 }}>
            <Heading size="md" mb={3}>Patient Details</Heading>
            <VStack align="stretch" gap={3}>
              <Input
                bg="white"
                placeholder="Patient name *"
                value={form.patientName}
                onChange={(e) => setForm((prev) => ({ ...prev, patientName: e.target.value }))}
                autoComplete="name"
              />
              <Input
                bg="white"
                placeholder="Mobile number *"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                autoComplete="tel"
                inputMode="tel"
              />
              <Input
                bg="white"
                placeholder="Area / locality"
                name="address_line1"
                autoComplete="street-address"
                value={form.area}
                onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
              />
              <Input
                bg="white"
                placeholder="Tests / package (optional)"
                value={form.packageName}
                onChange={(e) => setForm((prev) => ({ ...prev, packageName: e.target.value }))}
              />

              <HStack spacing={2}>
                <Box
                  as="input"
                  type="checkbox"
                  checked={form.whatsapp}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.checked }))}
                  style={{ accentColor: "#008f82" }}
                />
                <Text fontSize="sm" color="gray.700">Contact me on WhatsApp</Text>
              </HStack>
              <HStack spacing={2}>
                <Box
                  as="input"
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => setForm((prev) => ({ ...prev, agree: e.target.checked }))}
                  style={{ accentColor: "#008f82" }}
                />
                <Text fontSize="sm" color="gray.700">I consent to be contacted for booking confirmation *</Text>
              </HStack>

              {error ? <Text fontSize="sm" color="red.600">{error}</Text> : null}
              {success ? <Text fontSize="sm" color="green.700">{success}</Text> : null}

              <Button onClick={handleSubmit} isLoading={submitting}>
                Submit Home Visit Request
              </Button>
              <Button as={Link} href="/tests" variant="outline">
                Search Tests Instead
              </Button>
              <Button as="a" href={whatsappQuickbookHref} target="_blank" rel="noopener noreferrer" variant="outline">
                Book Home Visit on WhatsApp
              </Button>
            </VStack>
          </Box>
        </Grid>
      </Container>
    </>
  );
}
