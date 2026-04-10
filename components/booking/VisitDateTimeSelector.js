"use client";

import { Box, Button, HStack, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";

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

function getSlotLabel(slot) {
  return slot?.slot_name || `${slot?.start_time || ""} - ${slot?.end_time || ""}`.trim();
}

function getSlotPeriod(slot) {
  const hour = parseSlotHour(slot);
  if (hour == null || hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default function VisitDateTimeSelector({
  dateOptions = [],
  preferredDate = "",
  onDateChange,
  slots = [],
  preferredSlot = "",
  onSlotChange,
  loadingSlots = false,
  formBusy = false,
  homeVisitRequested = true,
  onHomeVisitChange,
  allowVisitTypeToggle = false
}) {
  const orderedSlots = [...slots].sort((a, b) => {
    const ah = parseSlotHour(a);
    const bh = parseSlotHour(b);
    if (ah == null && bh == null) return getSlotLabel(a).localeCompare(getSlotLabel(b));
    if (ah == null) return 1;
    if (bh == null) return -1;
    if (ah !== bh) return ah - bh;
    return getSlotLabel(a).localeCompare(getSlotLabel(b));
  });

  return (
    <VStack align="stretch" gap={2}>
      {allowVisitTypeToggle ? (
        <VStack align="stretch" gap={1}>
          <Text fontSize="sm" color="gray.700" fontWeight="600">Visit Type</Text>
          <HStack spacing={3}>
            <Text fontSize="xs" fontWeight="700" color={!homeVisitRequested ? "teal.700" : "gray.500"}>
              Center Visit
            </Text>
            <Box
              as="button"
              type="button"
              role="switch"
              aria-checked={homeVisitRequested}
              aria-label="Toggle home visit"
              disabled={formBusy}
              onClick={() => onHomeVisitChange?.(!homeVisitRequested)}
              position="relative"
              w="52px"
              h="30px"
              borderRadius="full"
              bg={homeVisitRequested ? "teal.600" : "gray.300"}
              borderWidth="1px"
              borderColor={homeVisitRequested ? "teal.600" : "gray.300"}
              transition="all .2s ease"
              opacity={formBusy ? 0.6 : 1}
              cursor={formBusy ? "not-allowed" : "pointer"}
            >
              <Box
                position="absolute"
                top="3px"
                left={homeVisitRequested ? "25px" : "3px"}
                w="22px"
                h="22px"
                borderRadius="full"
                bg="white"
                boxShadow="sm"
                transition="left .2s ease"
              />
            </Box>
            <Text fontSize="xs" fontWeight="700" color={homeVisitRequested ? "teal.700" : "gray.500"}>
              Home Visit
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            Select home collection or center visit for this request.
          </Text>
        </VStack>
      ) : null}

      <Text fontSize="xs" color="gray.600">
        {homeVisitRequested
          ? "Select preferred home-visit date and time."
          : "Select tentative center-visit date and time. Our team may adjust and confirm."}
      </Text>

      <SimpleGrid columns={{ base: 5, md: 5 }} gap={1.5}>
        {dateOptions.map((day) => {
          const active = preferredDate === day.iso;
          const [dayNum] = String(day.label || "").split(" ");
          const meta = String(day.label || "").slice(dayNum.length + 1);
          return (
            <Button
              key={day.iso}
              variant={active ? "solid" : "outline"}
              h="64px"
              px={1}
              borderRadius="lg"
              disabled={formBusy}
              onClick={() => onDateChange?.(day.iso)}
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
        <HStack spacing={2} overflowX="auto" pb={1} align="stretch" sx={{ scrollbarWidth: "thin" }}>
          {orderedSlots.map((slot) => {
            const active = preferredSlot === slot.id;
            const period = getSlotPeriod(slot);
            const toneBg = period === "Morning" ? "teal.50" : period === "Afternoon" ? "orange.50" : "orange.100";
            return (
              <Button
                key={slot.id}
                minW={{ base: "122px", md: "136px" }}
                h="44px"
                px={3}
                borderRadius="lg"
                variant={active ? "solid" : "outline"}
                bg={active ? undefined : toneBg}
                whiteSpace="nowrap"
                fontSize="sm"
                disabled={formBusy}
                onClick={() => onSlotChange?.(slot.id)}
              >
                {getSlotLabel(slot)}
              </Button>
            );
          })}
        </HStack>
      )}
    </VStack>
  );
}
