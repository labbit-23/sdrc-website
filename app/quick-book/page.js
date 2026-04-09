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
import { CART_UPDATED_EVENT, readCartItems } from "@/lib/cart";

function formatDateIso(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getNextDays(count = 5) {
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

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0.00";
  return `INR ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const dayOptions = useMemo(() => getNextDays(5), []);
  const [selectedDate, setSelectedDate] = useState(dayOptions[0]?.iso || "");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionMeta, setPrescriptionMeta] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const formBusy = submitting || uploadingPrescription;

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
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item?.price) || 0), 0),
    [cartItems]
  );
  const cartPackageName = useMemo(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return "";
    const lines = cartItems.map((item) => `[${item?.item_type === "package" ? "Package" : "Test"}] ${item?.name || ""}`.trim());
    return `Cart request (${cartItems.length} item${cartItems.length === 1 ? "" : "s"})\n${lines.join(" | ")}`.slice(0, 2000);
  }, [cartItems]);

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

  useEffect(() => {
    const syncCart = () => setCartItems(readCartItems());
    syncCart();
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    return () => window.removeEventListener(CART_UPDATED_EVENT, syncCart);
  }, []);

  async function uploadPrescription(file, phone) {
    const fd = new FormData();
    fd.append("action", "upload_prescription");
    fd.append("file", file);
    fd.append("patient_phone", phone || "");
    const res = await fetch("/api/quickbook", {
      method: "POST",
      body: fd
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Prescription upload failed");
    return data;
  }

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
      let uploadedPrescription = prescriptionMeta;
      if (prescriptionFile && !uploadedPrescription?.path) {
        setUploadingPrescription(true);
        uploadedPrescription = await uploadPrescription(prescriptionFile, phone);
        setPrescriptionMeta(uploadedPrescription);
      }

      const res = await fetch("/api/quickbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.patientName.trim(),
          phone,
          packageName: (cartPackageName || form.packageName || "").trim(),
          area: form.area.trim(),
          date: selectedDate,
          timeslot: selectedSlot,
          home_visit_required: true,
          prescription_url: uploadedPrescription?.url || "",
          prescription_path: uploadedPrescription?.path || "",
          prescription_file_name: uploadedPrescription?.file_name || "",
          persons: Number(form.persons || 1),
          whatsapp: form.whatsapp,
          agree: form.agree
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Quick booking failed");
      setSuccess("Booking request submitted. Our team will contact you shortly.");
      setSelectedSlot("");
      setPrescriptionFile(null);
      setPrescriptionMeta(null);
      setForm((prev) => ({ ...prev, patientName: "", phone: "", area: "" }));
    } catch (e) {
      setError(e.message || "Quick booking failed");
    } finally {
      setUploadingPrescription(false);
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

            <SimpleGrid columns={{ base: 5, md: 7 }} gap={2} mb={4}>
              {dayOptions.map((day) => {
                const active = selectedDate === day.iso;
                return (
                  <Button
                    key={day.iso}
                    variant={active ? "solid" : "outline"}
                    h={{ base: "74px", md: "84px" }}
                    borderRadius={{ base: "lg", md: "xl" }}
                    onClick={() => setSelectedDate(day.iso)}
                    px={{ base: 1, md: 2 }}
                  >
                    <VStack gap={0}>
                      <Text fontSize="10px" opacity={0.9}>{day.month}</Text>
                      <Text fontSize={{ base: "xl", md: "2xl" }} lineHeight="1" fontWeight="800">{day.day}</Text>
                      <Text fontSize="11px">{day.label}</Text>
                    </VStack>
                  </Button>
                );
              })}
            </SimpleGrid>

            {loadingSlots ? (
              <HStack py={8} justify="center">
                <Spinner color="teal.500" />
                <Text color="gray.600" fontSize="sm">Loading time slots...</Text>
              </HStack>
            ) : (
              <VStack align="stretch" gap={4}>
                {Object.entries(slotGroups).map(([groupName, groupSlots]) => (
                  <Box
                    key={groupName}
                    p={2.5}
                    borderRadius="xl"
                    bg={
                      groupName === "Morning"
                        ? "teal.50"
                        : groupName === "Afternoon"
                          ? "orange.50"
                          : "orange.100"
                    }
                  >
                    <Text fontSize="xs" fontWeight="700" color="teal.700" mb={2}>{groupName}</Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} gap={2}>
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
            {cartItems.length > 0 ? (
              <Box mb={4} p={3} borderRadius="lg" bg="teal.50" borderWidth="1px" borderColor="teal.100">
                <Text fontSize="sm" fontWeight="700" color="teal.800">
                  Items from Cart ({cartItems.length})
                </Text>
                <VStack align="start" gap={0.5} mt={1.5}>
                  {cartItems.slice(0, 6).map((item) => (
                    <Text key={item.id} fontSize="xs" color="gray.700">
                      • {item.name}
                    </Text>
                  ))}
                  {cartItems.length > 6 ? (
                    <Text fontSize="xs" color="gray.500">+ {cartItems.length - 6} more items</Text>
                  ) : null}
                </VStack>
                <Text fontSize="xs" color="teal.700" mt={2}>Estimated subtotal: {formatInr(cartSubtotal)}</Text>
              </Box>
            ) : null}
            <VStack align="stretch" gap={3}>
              <Input
                bg="white"
                placeholder="Patient name *"
                value={form.patientName}
                disabled={formBusy}
                onChange={(e) => setForm((prev) => ({ ...prev, patientName: e.target.value }))}
                autoComplete="name"
              />
              <Input
                bg="white"
                placeholder="Mobile number *"
                value={form.phone}
                disabled={formBusy}
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
                disabled={formBusy}
                onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
              />
              <Input
                bg="white"
                placeholder="Tests / package (optional)"
                value={cartPackageName || form.packageName}
                isReadOnly={Boolean(cartPackageName)}
                disabled={formBusy}
                onChange={(e) => {
                  if (cartPackageName) return;
                  setForm((prev) => ({ ...prev, packageName: e.target.value }));
                }}
              />
              <Box>
                <Input
                  bg="white"
                  type="file"
                  accept=".pdf,image/*"
                  disabled={formBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPrescriptionFile(file);
                    setPrescriptionMeta(null);
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Optional: upload prescription (PDF/JPG/PNG/WEBP, max 8 MB)
                </Text>
                {prescriptionFile ? (
                  <Text fontSize="xs" color="teal.700" mt={0.5}>
                    Selected: {prescriptionFile.name}
                  </Text>
                ) : null}
                {prescriptionMeta?.url ? (
                  <Text fontSize="xs" color="green.700" mt={0.5}>
                    Prescription uploaded and attached.
                  </Text>
                ) : null}
              </Box>

              <HStack spacing={2}>
                <Box
                  as="input"
                  type="checkbox"
                  checked={form.whatsapp}
                  disabled={formBusy}
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
                  disabled={formBusy}
                  onChange={(e) => setForm((prev) => ({ ...prev, agree: e.target.checked }))}
                  style={{ accentColor: "#008f82" }}
                />
                <Text fontSize="sm" color="gray.700">I consent to be contacted for booking confirmation *</Text>
              </HStack>

              {error ? <Text fontSize="sm" color="red.600">{error}</Text> : null}
              {success ? <Text fontSize="sm" color="green.700">{success}</Text> : null}
              {formBusy ? <Text fontSize="sm" color="teal.700">Submitting booking request...</Text> : null}

              <Button onClick={handleSubmit} isLoading={formBusy} loadingText="Submitting..." disabled={formBusy}>
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
