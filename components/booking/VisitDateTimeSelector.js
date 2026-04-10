"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, HStack, SimpleGrid, Spinner, Text, VStack, useBreakpointValue } from "@chakra-ui/react";
import { FiHome } from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";

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
  allowVisitTypeToggle = false,
  lockCenterVisit = false,
  showDateTimeSelection = true,
  onRevealDateTimeSelection,
  collapsedSlotLabel = ""
}) {
  const maxVisibleDates = useBreakpointValue({ base: 5, md: 7 }) ?? 5;
  const visibleDateOptions = dateOptions.slice(0, maxVisibleDates);
  const orderedSlots = useMemo(
    () =>
      [...slots].sort((a, b) => {
        const ah = parseSlotHour(a);
        const bh = parseSlotHour(b);
        if (ah == null && bh == null) return getSlotLabel(a).localeCompare(getSlotLabel(b));
        if (ah == null) return 1;
        if (bh == null) return -1;
        if (ah !== bh) return ah - bh;
        return getSlotLabel(a).localeCompare(getSlotLabel(b));
      }),
    [slots]
  );
  const slotGroups = useMemo(
    () => ({
      Morning: orderedSlots.filter((slot) => getSlotPeriod(slot) === "Morning"),
      Afternoon: orderedSlots.filter((slot) => getSlotPeriod(slot) === "Afternoon"),
      Evening: orderedSlots.filter((slot) => getSlotPeriod(slot) === "Evening")
    }),
    [orderedSlots]
  );
  const periodTabs = useMemo(
    () => ["Morning", "Afternoon", "Evening"].filter((period) => slotGroups[period].length > 0),
    [slotGroups]
  );
  const [activePeriod, setActivePeriod] = useState("Morning");

  useEffect(() => {
    if (periodTabs.length === 0) return;
    if (!periodTabs.includes(activePeriod)) {
      setActivePeriod(periodTabs[0]);
    }
  }, [activePeriod, periodTabs]);

  return (
    <VStack align="stretch" gap={2}>
      {allowVisitTypeToggle ? (
        <VStack align="stretch" gap={1}>
          <Text fontSize="sm" color="gray.700" fontWeight="600">Visit Type</Text>
          <HStack spacing={2} p={2} borderRadius="full" bg="gray.50" borderWidth="1px" borderColor="gray.200" w="fit-content">
            <HStack
              spacing={1}
              px={2}
              py={1}
              borderRadius="full"
              bg={!homeVisitRequested ? "teal.50" : "gray.100"}
              color={!homeVisitRequested ? "teal.700" : "gray.600"}
            >
              <BsBuilding size={12} />
              <Text fontSize="xs" fontWeight="700">Center</Text>
            </HStack>
            <Box
              as="button"
              type="button"
              role="switch"
              aria-checked={homeVisitRequested}
              aria-label="Toggle home visit"
              disabled={formBusy || lockCenterVisit}
              onClick={() => {
                if (lockCenterVisit) return;
                onHomeVisitChange?.(!homeVisitRequested);
              }}
              position="relative"
              w="52px"
              h="30px"
              borderRadius="full"
              bg={homeVisitRequested ? "teal.600" : "gray.300"}
              borderWidth="1px"
              borderColor={homeVisitRequested ? "teal.600" : "gray.300"}
              transition="all .2s ease"
              opacity={formBusy || lockCenterVisit ? 0.6 : 1}
              cursor={formBusy || lockCenterVisit ? "not-allowed" : "pointer"}
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
            <HStack
              spacing={1}
              px={2}
              py={1}
              borderRadius="full"
              bg={homeVisitRequested ? "teal.50" : "gray.100"}
              color={homeVisitRequested ? "teal.700" : "gray.600"}
            >
              <FiHome size={12} />
              <Text fontSize="xs" fontWeight="700">Home</Text>
            </HStack>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {lockCenterVisit
              ? "One or more selected items require center visit."
              : "Select home collection or center visit for this request."}
          </Text>
        </VStack>
      ) : null}

      {showDateTimeSelection ? (
        <Text fontSize="xs" color="gray.600">
          {homeVisitRequested
            ? "Select preferred home-visit date and time."
            : "Select tentative center-visit date and time. Our team may adjust and confirm."}
        </Text>
      ) : (
        <Box px={3} py={2} borderRadius="md" bg="teal.50" borderWidth="1px" borderColor="teal.100">
          <Text fontSize="xs" color="gray.700">
            Center visit default slot: <strong>{collapsedSlotLabel}</strong>{" "}
            <Box
              as="button"
              type="button"
              onClick={() => onRevealDateTimeSelection?.()}
              color="teal.700"
              fontWeight="700"
              textDecoration="underline"
              ml={1}
            >
              Change
            </Box>
          </Text>
        </Box>
      )}

      {showDateTimeSelection ? (
        <SimpleGrid columns={{ base: 5, md: 7 }} gap={1.5}>
        {visibleDateOptions.map((day) => {
          const active = preferredDate === day.iso;
          const dayMonth = day.month || "";
          const dayNum = day.day ?? "";
          const dayWeek = day.weekday || "";
          return (
            <Button
              key={day.iso}
              variant={active ? "solid" : "outline"}
              h={{ base: "72px", md: "84px" }}
              px={1}
              borderRadius={{ base: "lg", md: "xl" }}
              disabled={formBusy}
              onClick={() => onDateChange?.(day.iso)}
            >
              <VStack gap={0}>
                <Text fontSize="10px" opacity={0.9}>{dayMonth}</Text>
                <Text fontSize={{ base: "xl", md: "2xl" }} lineHeight="1" fontWeight="800">{dayNum}</Text>
                <Text fontSize="11px" color={active ? "white" : "gray.600"}>{dayWeek}</Text>
              </VStack>
            </Button>
          );
        })}
        </SimpleGrid>
      ) : null}

      {showDateTimeSelection && loadingSlots ? (
        <HStack>
          <Spinner size="sm" color="teal.500" />
          <Text fontSize="xs" color="gray.600">Loading time slots...</Text>
        </HStack>
      ) : null}

      {showDateTimeSelection && !loadingSlots ? (
        <Box borderWidth="1px" borderColor="orange.100" borderRadius="xl" p={2} bg="orange.50">
          <HStack spacing={1.5} mb={2} flexWrap="wrap" p={1} borderRadius="md" bg="white" borderWidth="1px" borderColor="orange.100">
            {periodTabs.map((period) => (
              <Button
                key={period}
                size="xs"
                variant="solid"
                bg={activePeriod === period ? "orange.500" : "gray.100"}
                color={activePeriod === period ? "white" : "gray.700"}
                _hover={activePeriod === period ? { bg: "orange.600" } : { bg: "gray.200" }}
                onClick={() => setActivePeriod(period)}
                disabled={formBusy}
              >
                {period}
              </Button>
            ))}
          </HStack>
          <SimpleGrid columns={2} gap={1.5}>
            {(slotGroups[activePeriod] || []).map((slot) => {
              const active = preferredSlot === slot.id;
              const toneBg = activePeriod === "Morning" ? "teal.50" : activePeriod === "Afternoon" ? "orange.50" : "orange.100";
              return (
                <Button
                  key={slot.id}
                  h={{ base: "40px", md: "42px" }}
                  px={2}
                  borderRadius="md"
                  variant={active ? "solid" : "outline"}
                  bg={active ? undefined : toneBg}
                  justifyContent="center"
                  fontSize="xs"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  disabled={formBusy}
                  onClick={() => onSlotChange?.(slot.id)}
                >
                  {getSlotLabel(slot)}
                </Button>
              );
            })}
          </SimpleGrid>
        </Box>
      ) : null}
    </VStack>
  );
}
