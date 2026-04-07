"use client";

import Link from "next/link";
import { useState } from "react";
import { Box, Button, Grid, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { siteConfig } from "@/data/siteConfig";

function normalizePhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "INR 0";
  return `INR ${Number(amount).toLocaleString("en-IN")}`;
}

export default function CartRequestPanel({ cartItems, subtotal, hasCenterOnlyItems, source = "cart" }) {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [homeVisitRequested, setHomeVisitRequested] = useState(false);
  const [leadError, setLeadError] = useState("");

  function sendCartRequest() {
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

    const payload = {
      action: "send_whatsapp_lead",
      source,
      patient_name: patientName.trim(),
      patient_phone: normalizedPhone,
      patient_notes: patientNotes.trim(),
      home_visit_required: homeVisitRequested,
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

    fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Unable to send request right now.");
      })
      .then(() => setLeadError(""))
      .catch((e) => setLeadError(e.message || "Unable to send request right now."));
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
        <Input bg="white" size="sm" placeholder="Patient name *" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
        <Input bg="white" size="sm" placeholder="Patient phone number *" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} />
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
        <Button onClick={sendCartRequest} isDisabled={cartItems.length === 0}>Send Request to Lab</Button>
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

