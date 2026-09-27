"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { trips } from "@/lib/trips";

export default function InquiryForm({ initialTrip }: { initialTrip: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", tripSlug: initialTrip, startDate: "", groupSize: "2", message: "", website: "" });

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please try again.");
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <section className="inquiry-success"><CheckCircle2 size={30} /><p className="travel-kicker">MESSAGE RECEIVED</p><h2>We’ll be in touch.</h2><p>Thanks for telling us about your trip. Our Kathmandu team will reply to the email you shared.</p></section>;

  return <form className="inquiry-form" onSubmit={submitInquiry}><div className="form-pair"><label>Your name<input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" placeholder="Name" /></label><label>Email address<input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" placeholder="you@example.com" /></label></div><div className="form-pair"><label>Journey<select value={form.tripSlug} onChange={(event) => setForm({ ...form, tripSlug: event.target.value })}><option value="">I’m still deciding</option>{trips.map((trip) => <option value={trip.slug} key={trip.slug}>{trip.title}</option>)}</select></label><label>Group size<select value={form.groupSize} onChange={(event) => setForm({ ...form, groupSize: event.target.value })}>{Array.from({ length: 12 }, (_, index) => index + 1).map((size) => <option key={size} value={size}>{size} {size === 1 ? "traveller" : "travellers"}</option>)}</select></label></div><label>When are you thinking of travelling?<input value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} placeholder="Month or preferred dates" maxLength={30} /></label><label>What would make this trip right for you?<textarea required minLength={10} maxLength={3000} rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us what you are excited about, your experience, or anything you would like us to know." /></label><label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>{error && <p className="inquiry-error" role="alert">{error}</p>}<button className="trip-book-button" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={16} /> : null}{submitting ? "Sending your note..." : "Send trip inquiry"}{!submitting && <ArrowRight size={16} />}</button><p className="privacy-note">Your details are only used to respond to this trip inquiry.</p></form>;
}