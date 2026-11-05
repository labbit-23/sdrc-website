"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { CART_UPDATED_EVENT, readCartItems } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import VisitDateTimeSelector from "@/components/booking/VisitDateTimeSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { TwContainer } from "@/components/site/tw-layout";

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
      weekday: dt.toLocaleString("en-US", { weekday: "short" }),
      label: `${dt.getDate()} ${dt.toLocaleString("en-US", { month: "short" })} (${dt.toLocaleString("en-US", { weekday: "short" })})`
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

const OPEN_BOOKINGS_STORAGE_KEY = "sdrc_open_bookings_v1";

function readOpenBookings() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(OPEN_BOOKINGS_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((booking) => booking?.id && booking?.status === "open").slice(0, 5);
  } catch {
    return [];
  }
}

function saveOpenBooking(booking) {
  if (typeof window === "undefined") return [];
  const next = [booking, ...readOpenBookings().filter((item) => item.id !== booking.id)].slice(0, 5);
  window.localStorage.setItem(OPEN_BOOKINGS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "MedicalService",
    name: "Home Sample Collection",
    alternateName: "Home Phlebotomy Service",
    description: "SDRC offers convenient home-based blood and urine sample collection by trained phlebotomists. Book same-day or advance appointments online or via WhatsApp.",
    provider: {
      "@type": "MedicalBusiness",
      name: "SDRC Diagnostics",
      address: {
        "@type": "PostalAddress",
        streetAddress: "101, Jade Arcade (Corporate Block), Paradise, MG Road",
        addressLocality: "Secunderabad",
        addressRegion: "Telangana",
        postalCode: "500003",
        addressCountry: "IN"
      },
      telephone: "+91-80-6545-3111"
    },
    areaServed: [
      { "@type": "City", name: "Secunderabad" },
      { "@type": "City", name: "Hyderabad" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I book a home sample collection at SDRC?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can book a home visit through our website at sdrc.in/home-visit by selecting a convenient date and time slot, or contact us via WhatsApp at +91-40-6600-4200. A trained phlebotomist will visit your address for sample collection."
        }
      },
      {
        "@type": "Question",
        name: "Which tests are available for home collection?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Home collection is available for select blood tests, urine tests and other non-imaging diagnostics. Imaging tests (CT, ultrasound, DEXA, X-ray) and procedures requiring specialized equipment must be done at our collection centers."
        }
      },
      {
        "@type": "Question",
        name: "What is the service area for home collection in Hyderabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Home sample collection is available across Secunderabad and Hyderabad. Service is fastest in central areas (Secunderabad, Banjara Hills, Jubilee Hills) with extended coverage to surrounding localities. Check availability when booking."
        }
      },
      {
        "@type": "Question",
        name: "Do I need to fast for home sample collection?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Fasting requirements depend on the specific tests ordered. Guidance on fasting is provided when you book or add tests to your order. Our phlebotomist will confirm fasting status on arrival."
        }
      },
      {
        "@type": "Question",
        name: "How soon are reports available after home collection?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most tests report same-day or within 24 hours. Reports are sent via email, WhatsApp and are accessible online through the SDRC portal using your registered mobile number."
        }
      },
      {
        "@type": "Question",
        name: "Can I upload a prescription during home visit booking?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. During the booking process at sdrc.in/home-visit, you can upload a doctor's prescription. This ensures the correct tests are collected and helps our team prepare in advance."
        }
      }
    ]
  }
];

export default function QuickBookPage() {
  const whatsappQuickbookHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Home visit")}`;
  const dayOptions = useMemo(() => getNextDays(7), []);
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
  const [openBookings, setOpenBookings] = useState([]);
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

  useEffect(() => {
    setOpenBookings(readOpenBookings());
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
    trackEvent("submit_request_click", { source: "/home-visit" }, { pagePath: "/home-visit", phone: form.phone });
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
      setOpenBookings(saveOpenBooking({
        id: data?.quickbook_id || data?.id || `${Date.now()}-${phone}`,
        status: "open",
        patientName: form.patientName.trim(),
        phone,
        area: form.area.trim(),
        packageName: (cartPackageName || form.packageName || "General test booking").trim(),
        date: selectedDate,
        timeslot: selectedSlot,
        persons: Number(form.persons || 1),
        createdAt: new Date().toISOString()
      }));
      trackEvent("submit_request_success", { source: "/home-visit" }, { pagePath: "/home-visit", phone });
      setSuccess("Booking request submitted. Our team will contact you shortly.");
      setSelectedSlot("");
      setPrescriptionFile(null);
      setPrescriptionMeta(null);
      setForm((prev) => ({ ...prev, patientName: "", phone: "", area: "" }));
    } catch (e) {
      trackEvent("submit_request_fail", { source: "/home-visit", error: String(e?.message || "Quick booking failed") }, { pagePath: "/home-visit", phone });
      setError(e.message || "Quick booking failed");
    } finally {
      setUploadingPrescription(false);
      setSubmitting(false);
    }
  }

  return (
    <>
      {structuredData.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <section className="brochure-bg functional-hero-cover py-10 md:py-14">
        <TwContainer>
          <h1 className="hero-title text-slate-800">
            Home Visit Request
            <span className="hero-subline text-[var(--sdrc-teal-deep)]">Select Date and Time Slot</span>
          </h1>
          <p className="mt-3 text-base text-slate-700 md:text-lg">
            No test selection needed. Reserve a collection slot and our team will call to confirm.
          </p>
        </TwContainer>
      </section>

      <TwContainer className="py-10">
        {openBookings.length > 0 ? (
          <Card interactive={false} className="mb-6 border-t-[3px] border-t-[var(--sdrc-teal)] p-4 md:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.07em] text-[var(--sdrc-teal-deep)]">Open bookings</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Existing home visit requests</h2>
              </div>
              <span className="rounded-full bg-[var(--sdrc-teal-soft)] px-3 py-1 text-xs font-bold text-[var(--sdrc-teal-deep)]">
                Awaiting confirmation
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {openBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{booking.patientName || "Patient"}</p>
                      <p className="mt-1 text-xs text-slate-600">{booking.phone}</p>
                    </div>
                    <span className="rounded-full bg-[#fff5f0] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.06em] text-[#d44d1a]">
                      Open
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                    <p><span className="font-bold text-slate-500">Date:</span> {booking.date || "To confirm"}</p>
                    <p><span className="font-bold text-slate-500">Slot:</span> {booking.timeslot || "To confirm"}</p>
                    {booking.area ? <p><span className="font-bold text-slate-500">Area:</span> {booking.area}</p> : null}
                    <p><span className="font-bold text-slate-500">People:</span> {booking.persons || 1}</p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{booking.packageName}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <Card interactive={false} className="p-4 md:p-6">
            <h2 className="mb-1 text-xl font-bold text-slate-900">Collection Date & Time</h2>
            <p className="mb-4 text-sm text-slate-600">Choose preferred date and slot.</p>

            <VisitDateTimeSelector
              allowVisitTypeToggle={false}
              homeVisitRequested
              dateOptions={dayOptions}
              preferredDate={selectedDate}
              onDateChange={setSelectedDate}
              loadingSlots={loadingSlots}
              slots={slots}
              preferredSlot={selectedSlot}
              onSlotChange={setSelectedSlot}
              formBusy={formBusy}
            />
          </Card>

          <Card interactive={false} className="p-4 md:p-6">
            <h2 className="mb-3 text-xl font-bold text-slate-900">Patient Details</h2>
            {cartItems.length > 0 ? (
              <div className="mb-4 rounded-lg border border-teal-100 bg-[var(--sdrc-teal-soft)] p-3">
                <p className="text-sm font-bold text-[var(--sdrc-teal-deep)]">
                  Items from Cart ({cartItems.length})
                </p>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {cartItems.slice(0, 6).map((item) => (
                    <p key={item.id} className="text-xs text-slate-700">
                      • {item.name}
                    </p>
                  ))}
                  {cartItems.length > 6 ? (
                    <p className="text-xs text-slate-500">+ {cartItems.length - 6} more items</p>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[var(--sdrc-teal-deep)]">Estimated subtotal: {formatInr(cartSubtotal)}</p>
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Patient name *"
                value={form.patientName}
                disabled={formBusy}
                onChange={(e) => setForm((prev) => ({ ...prev, patientName: e.target.value }))}
                autoComplete="name"
              />
              <Input
                placeholder="Mobile number *"
                value={form.phone}
                disabled={formBusy}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                autoComplete="tel"
                inputMode="tel"
              />
              <Input
                placeholder="Area / locality"
                name="address_line1"
                autoComplete="street-address"
                value={form.area}
                disabled={formBusy}
                onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
              />
              <Input
                placeholder="Tests / package (optional)"
                value={cartPackageName || form.packageName}
                readOnly={Boolean(cartPackageName)}
                disabled={formBusy}
                onChange={(e) => {
                  if (cartPackageName) return;
                  setForm((prev) => ({ ...prev, packageName: e.target.value }));
                }}
              />
              <div>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  disabled={formBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPrescriptionFile(file);
                    setPrescriptionMeta(null);
                  }}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Optional: upload prescription (PDF/JPG/PNG/WEBP, max 8 MB)
                </p>
                {prescriptionFile ? (
                  <p className="mt-0.5 text-xs text-[var(--sdrc-teal-deep)]">
                    Selected: {prescriptionFile.name}
                  </p>
                ) : null}
                {prescriptionMeta?.url ? (
                  <p className="mt-0.5 text-xs text-green-700">
                    Prescription uploaded and attached.
                  </p>
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.whatsapp}
                  disabled={formBusy}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.checked }))}
                  style={{ accentColor: "#008f82" }}
                />
                Contact me on WhatsApp
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.agree}
                  disabled={formBusy}
                  onChange={(e) => setForm((prev) => ({ ...prev, agree: e.target.checked }))}
                  style={{ accentColor: "#008f82" }}
                />
                I consent to be contacted for booking confirmation *
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-green-700">{success}</p> : null}
              {formBusy ? <p className="text-sm text-[var(--sdrc-teal-deep)]">Submitting booking request...</p> : null}

              <Button onClick={handleSubmit} disabled={formBusy}>
                {formBusy ? "Submitting..." : "Submit Home Visit Request"}
              </Button>
              <Button as={Link} href="/tests" variant="outline">
                Search Tests Instead
              </Button>
              <Button as="a" href={whatsappQuickbookHref} target="_blank" rel="noopener noreferrer" variant="outline" leftIcon={<FaWhatsapp />}>
                Book Home Visit on WhatsApp
              </Button>
            </div>
          </Card>
        </div>
      </TwContainer>
    </>
  );
}
