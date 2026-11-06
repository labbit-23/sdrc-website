"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiHome, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { BsBuilding } from "react-icons/bs";
import { siteConfig } from "@/data/siteConfig";
import VisitDateTimeSelector from "@/components/booking/VisitDateTimeSelector";
import { trackEvent } from "@/lib/analytics";
import { buildAppHandoffUrl } from "@/lib/appHandoff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

// Home-visit charge is owned by labit-core; the site only displays what the relay returns.
// Off until NEXT_PUBLIC_HOME_CHARGE_ENABLED=1 (set once the relay is live).
const HOME_CHARGE_ENABLED = process.env.NEXT_PUBLIC_HOME_CHARGE_ENABLED === "1";
const HOME_CHARGE_URL = process.env.NEXT_PUBLIC_HOME_CHARGE_URL || "https://lab.sdrc.in/api/public/home-visit-charge";

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
  const [pincode, setPincode] = useState("");
  const [homeCharge, setHomeCharge] = useState(null); // { pincode, charge, basis } | null
  const [chargeState, setChargeState] = useState("idle"); // idle | loading | ok | failed
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

  async function lookupCharge() {
    if (!HOME_CHARGE_ENABLED) return;
    const pin = pincode.trim();
    setHomeCharge(null);
    if (!/^\d{6}$/.test(pin)) {
      setChargeState("idle");
      return;
    }
    setChargeState("loading");
    try {
      const res = await fetch(`${HOME_CHARGE_URL}?pincode=${pin}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data.charge !== "number" || data.pincode !== pin) throw new Error("no charge");
      setHomeCharge({ pincode: pin, charge: data.charge, basis: data.basis });
      setChargeState("ok");
    } catch {
      setChargeState("failed");
    }
  }

  const chargeShown = HOME_CHARGE_ENABLED && homeVisitRequested && chargeState === "ok" && homeCharge && homeCharge.pincode === pincode.trim();
  const estimated = chargeShown && homeCharge.basis !== "exact";
  const total = chargeShown ? Number(subtotal || 0) + homeCharge.charge : subtotal;

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
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-slate-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-bold text-slate-800">Your Cart</p>
            <p className="text-xs font-bold text-slate-600">{cartItems.length} item(s)</p>
          </div>
          {cartItems.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
              <p className="text-sm text-slate-500">No items selected yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-100 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold",
                            item.item_type === "package" ? "bg-orange-50 text-orange-700" : "bg-[var(--sdrc-teal-soft)] text-[var(--sdrc-teal-deep)]"
                          )}
                        >
                          {item.item_type === "package" ? "Package" : "Test"}
                        </span>
                        {item.department ? <span className="text-xs text-slate-500">{item.department}</span> : null}
                        {item.home_collection === true ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                            <FiHome size={10} />
                            Home
                          </span>
                        ) : item.home_collection === false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            <BsBuilding size={10} />
                            Center
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-sm font-bold text-slate-800">{item.name}</p>
                      <div className="mt-0.5 flex justify-between gap-2">
                        <p className="text-xs text-slate-500">
                          {item.internal_code ? item.internal_code : item.tests_count ? `Includes ${item.tests_count} tests` : ""}
                        </p>
                        <p className="whitespace-nowrap text-sm font-bold text-[var(--sdrc-orange)]">{formatLinePrice(item.price)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                      aria-label="Remove item"
                      onClick={() => onRemoveItem?.(item.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
              <Button size="xs" variant="outline" className="self-end border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => onClearCart?.()}>
                Clear cart
              </Button>
            </div>
          )}
          <div className="mt-auto pt-4">
            <div className="mb-1 flex justify-between gap-3">
              <p className="text-sm text-slate-600">Subtotal</p>
              <p className="text-sm text-slate-600">{formatInr(subtotal)}</p>
            </div>
            {homeVisitRequested ? (
              <div className="mb-1 flex justify-between gap-3">
                <p className="text-sm text-slate-600">Home collection charge{estimated ? " (estimated)" : ""}</p>
                <p className="text-sm text-slate-600">
                  {chargeShown ? formatInr(homeCharge.charge) : HOME_CHARGE_ENABLED && chargeState === "loading" ? "Checking..." : "TBA"}
                </p>
              </div>
            ) : null}
            {HOME_CHARGE_ENABLED && homeVisitRequested && chargeState === "failed" ? (
              <p className="mb-1 text-xs text-slate-500">Home collection charge confirmed at booking.</p>
            ) : null}
            <div className="mt-2 flex justify-between gap-3">
              <p className="font-bold">Estimated Total</p>
              <p className="font-bold text-[var(--sdrc-teal-deep)]">
                {chargeShown ? formatInr(total) : homeVisitRequested ? `${formatInr(subtotal)} + TBA` : formatInr(subtotal)}
              </p>
            </div>
            <div className="mt-3 flex items-stretch gap-2">
              <Input
                placeholder="Coupon code (coming soon)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={formBusy}
              />
              <Button size="sm" variant="outline" disabled>
                Apply
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-4">
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
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-white p-4">
          <div className="flex flex-col gap-2">
          <Input
            placeholder="Patient name *"
            name="patient_name"
            autoComplete="name"
            disabled={formBusy}
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <Input
            placeholder="Patient phone number *"
            name="patient_phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            disabled={formBusy}
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
          />
          {HOME_CHARGE_ENABLED && homeVisitRequested ? (
            <Input
              placeholder="Pincode (6 digits) for home collection charge"
              name="postal_code"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              disabled={formBusy}
              value={pincode}
              onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setHomeCharge(null); setChargeState("idle"); }}
              onBlur={lookupCharge}
            />
          ) : null}
          <Input
            placeholder="Area / locality"
            name="patient_area"
            autoComplete="street-address"
            disabled={formBusy}
            value={patientArea}
            onChange={(e) => setPatientArea(e.target.value)}
          />
          <Input
            placeholder="Optional note (timing/preferences)"
            disabled={formBusy}
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
          />
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-4">
          {showCenterVisitAdvisory ? (
            <p className="mt-1 text-xs text-orange-600">
              Some selected items include center-only imaging. Home collection can be done for eligible tests; center visit is needed to complete imaging items.
            </p>
          ) : null}
          {homeVisitRequested && cartItems.length > 0 && !showCenterVisitAdvisory ? (
            <p className="mt-1 text-xs text-green-700">
              Tests can be done at home.
            </p>
          ) : null}

          {leadError ? <p className="mt-2 text-xs text-red-600">{leadError}</p> : null}
          {preferredDate && preferredSlot ? (
            <div className="mt-2 rounded-md border border-teal-100 bg-[var(--sdrc-teal-soft)] px-3 py-2">
              <p className="text-xs text-slate-700">
                {homeVisitRequested ? "Selected home visit:" : "Tentative center visit:"} <strong>{preferredDateLabel}</strong> • <strong>{preferredSlotLabel}</strong>
              </p>
            </div>
          ) : null}
          {isSubmitting ? <p className="mt-2 text-xs text-[var(--sdrc-teal-deep)]">Submitting request...</p> : null}
          <Button
            as={Link}
            href={buildAppHandoffUrl(cartItems, { home: homeVisitRequested, pin: chargeShown ? homeCharge.pincode : undefined })}
            className="mt-3 w-full"
            onClick={() => trackEvent("app_checkout_click", { source, item_count: cartItems.length }, { pagePath: source })}
          >
            Sign in to pay and continue
          </Button>
          <p className="mt-1 text-center text-xs text-slate-500">Opens the SDRC Health app. Sign in with an OTP, pick your slot and pay online.</p>
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">or send us a request and we will call you</p>
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={sendCartRequest}
            disabled={formBusy}
          >
            {isSubmitting ? "Sending..." : "Send Request to Lab"}
          </Button>
          <p className="mt-2 text-xs text-slate-600">
            * Prices shown are indicative. Final pricing and test availability are confirmed by the lab team after request review, including sample requirements and legacy/repeat test mappings.
          </p>
          <div className="mt-2 flex flex-wrap items-stretch gap-2">
            <Button
              as={Link}
              href={"https://wa.me/" + siteConfig.internalNotifyNumber}
              target="_blank"
              size="sm"
              variant="outline"
              title="Need help deciding tests?"
              leftIcon={<FaWhatsapp />}
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
          </div>
        </div>
      </div>
      {toastMessage ? (
        <div className="fixed bottom-4 right-4 z-30 max-w-[84vw] rounded-md bg-[var(--sdrc-teal-600)] px-4 py-2 text-sm text-white shadow-lg md:bottom-6 md:right-6 md:max-w-[420px]">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
