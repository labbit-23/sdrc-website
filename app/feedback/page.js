"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form";
import { TwContainer } from "@/components/site/tw-layout";

export const dynamic = "force-dynamic";
const ratingScale = [{ value: 5, label: "Excellent", color: "#22c55e" }, { value: 4, label: "Good", color: "#008f82" }, { value: 3, label: "Okay", color: "#eab308" }, { value: 2, label: "Poor", color: "#f26939" }, { value: 1, label: "Very Poor", color: "#ef4444" }];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState(""); const [phone, setPhone] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const low = rating > 0 && rating <= 2;
  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setSuccess(""); const comment = feedback.trim(); const number = phone.trim();
    if (rating < 1 || rating > 5) return setError("Please select a rating.");
    if (low && !comment) return setError("Comments are required for ratings 1-2.");
    if (low && !number) return setError("Phone is required for ratings 1-2.");
    setBusy(true);
    try { const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, feedback: comment, patient_phone: number }) }); const data = await res.json().catch(() => ({})); if (!res.ok || data?.ok === false) throw new Error(data?.error || "Unable to submit feedback right now."); setSuccess("Thanks for your feedback. We have received it."); setRating(0); setFeedback(""); setPhone(""); } catch (err) { setError(err?.message || "Unable to submit feedback right now."); } finally { setBusy(false); }
  }
  return <section className="brochure-bg py-5 md:py-7"><TwContainer size="narrow"><Card className="p-4 md:p-5"><h1 className="hero-title text-slate-800">Share your<span className="hero-subline text-[var(--sdrc-teal-deep)]">Feedback</span></h1><p className="mt-2 text-sm text-slate-700 md:text-base">Your feedback helps us improve the website and booking experience.</p><form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3"><div><p className="mb-1.5 text-sm font-bold text-slate-700">Rating</p><div className="mb-1.5 flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((value) => { const meta = ratingScale.find((item) => item.value === value); return <button key={value} type="button" disabled={busy} onClick={() => setRating(value)} className="inline-flex min-h-9 items-center justify-center rounded-full border-2 px-4 text-sm font-semibold transition disabled:opacity-60" style={{ borderColor: meta.color, color: rating === value ? "white" : "#334155", background: rating === value ? meta.color : "transparent" }}>{value}</button>; })}</div><div className="flex justify-between gap-1 py-0.5">{ratingScale.slice().reverse().map((item) => <span key={item.value} className="flex shrink-0 items-center gap-1 text-[9px] text-slate-600 md:text-[11px]"><i className="size-[7px] rounded-full" style={{ background: item.color }} />{item.value} - {item.label}</span>)}</div></div><label className="text-sm font-bold text-slate-700">Comments {low ? "*" : "(optional)"}<Textarea className="mt-1.5" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder={low ? "Please tell us what went wrong" : "Tell us what we should improve"} rows={3} maxLength={500} disabled={busy} /></label><label className="text-sm font-bold text-slate-700">Phone {low ? "*" : "(optional)"}<Input className="mt-1.5" type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={low ? "Required for low rating follow-up" : "For follow-up if needed"} disabled={busy} /></label>{error && <p className="text-sm text-red-600">{error}</p>}{success && <p className="text-sm text-green-700">{success}</p>}<Button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit Feedback"}</Button></form></Card></TwContainer></section>;
}
