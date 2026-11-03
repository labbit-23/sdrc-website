"use client";

import { useEffect, useMemo, useState } from "react";
import { FiHome } from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const visibleDateOptions = dateOptions.slice(0, 7);
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
    <div className="flex flex-col gap-3">
      {allowVisitTypeToggle ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-700">Visit Type</p>
          <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
                !homeVisitRequested ? "bg-[var(--sdrc-teal-soft)] text-[var(--sdrc-teal-deep)]" : "bg-slate-100 text-slate-600"
              )}
            >
              <BsBuilding size={12} />
              Center
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={homeVisitRequested}
              aria-label="Toggle home visit"
              disabled={formBusy || lockCenterVisit}
              onClick={() => {
                if (lockCenterVisit) return;
                onHomeVisitChange?.(!homeVisitRequested);
              }}
              className={cn(
                "relative h-[30px] w-[52px] rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60",
                homeVisitRequested ? "border-[var(--sdrc-teal-600)] bg-[var(--sdrc-teal-600)]" : "border-slate-300 bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-[3px] size-[22px] rounded-full bg-white shadow-sm transition-[left]",
                  homeVisitRequested ? "left-[25px]" : "left-[3px]"
                )}
              />
            </button>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
                homeVisitRequested ? "bg-[var(--sdrc-teal-soft)] text-[var(--sdrc-teal-deep)]" : "bg-slate-100 text-slate-600"
              )}
            >
              <FiHome size={12} />
              Home
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {lockCenterVisit
              ? "One or more selected items require center visit."
              : "Select home collection or center visit for this request."}
          </p>
        </div>
      ) : null}

      {showDateTimeSelection ? (
        <p className="text-xs text-slate-600">
          {homeVisitRequested
            ? "Select preferred home-visit date and time."
            : "Select tentative center-visit date and time. Our team may adjust and confirm."}
        </p>
      ) : (
        <div className="rounded-md border border-teal-100 bg-[var(--sdrc-teal-soft)] px-3 py-2">
          <p className="text-xs text-slate-700">
            Center visit default slot: <strong>{collapsedSlotLabel}</strong>{" "}
            <button
              type="button"
              onClick={() => onRevealDateTimeSelection?.()}
              className="ml-1 font-bold text-[var(--sdrc-teal-deep)] underline"
            >
              Change
            </button>
          </p>
        </div>
      )}

      {showDateTimeSelection ? (
        <div className="grid grid-cols-5 gap-1.5 md:grid-cols-7">
        {visibleDateOptions.map((day) => {
          const active = preferredDate === day.iso;
          const dayMonth = day.month || "";
          const dayNum = day.day ?? "";
          const dayWeek = day.weekday || "";
          return (
            <Button
              key={day.iso}
              variant={active ? "solid" : "outline"}
              className="h-[72px] flex-col gap-0 rounded-lg px-1 md:h-[84px] md:rounded-xl"
              disabled={formBusy}
              onClick={() => onDateChange?.(day.iso)}
            >
              <span className="text-[10px] opacity-90">{dayMonth}</span>
              <span className="text-xl font-extrabold leading-none md:text-2xl">{dayNum}</span>
              <span className={cn("text-[11px]", active ? "text-white" : "text-slate-600")}>{dayWeek}</span>
            </Button>
          );
        })}
        </div>
      ) : null}

      {showDateTimeSelection && loadingSlots ? (
        <div className="flex items-center gap-2">
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-[var(--sdrc-teal)] border-r-transparent" />
          <p className="text-xs text-slate-600">Loading time slots...</p>
        </div>
      ) : null}

      {showDateTimeSelection && !loadingSlots ? (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-2">
          <div className="mb-2 flex flex-wrap gap-1.5 rounded-md border border-orange-100 bg-white p-1">
            {periodTabs.map((period) => (
              <Button
                key={period}
                size="xs"
                variant={activePeriod === period ? "solid" : "ghost"}
                className={cn(
                  activePeriod === period
                    ? "border-[var(--sdrc-orange)] bg-[var(--sdrc-orange)] text-white hover:border-[#f05a2b] hover:bg-[#f05a2b]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
                onClick={() => setActivePeriod(period)}
                disabled={formBusy}
              >
                {period}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(slotGroups[activePeriod] || []).map((slot) => {
              const active = preferredSlot === slot.id;
              const toneBg = activePeriod === "Morning" ? "teal.50" : activePeriod === "Afternoon" ? "orange.50" : "orange.100";
              return (
                <Button
                  key={slot.id}
                  variant={active ? "solid" : "outline"}
                  size="sm"
                  className={cn(
                    "h-10 overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-2 text-xs md:h-[42px]",
                    !active && toneBg === "teal.50" && "bg-teal-50",
                    !active && toneBg === "orange.50" && "bg-orange-50",
                    !active && toneBg === "orange.100" && "bg-orange-100"
                  )}
                  disabled={formBusy}
                  onClick={() => onSlotChange?.(slot.id)}
                >
                  {getSlotLabel(slot)}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
