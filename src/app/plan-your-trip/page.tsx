import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mountain } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Plan Your Nepal Trip",
  description: "Talk with a local trip planner about your Nepal trek or tour.",
};

export default async function PlanYourTripPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip = "" } = await searchParams;

  return (
    <main className="inquiry-page">
      <header className="catalog-header">
        <Link href="/" className="travel-brand">
          <span className="brand-emblem"><Mountain size={20} /></span>
          <span><strong>Himalaya</strong><small>TRAVEL COMPANY · NEPAL</small></span>
        </Link>
        <nav><Link href="/trips">Browse journeys</Link></nav>
      </header>
      <div className="inquiry-layout">
        <section className="inquiry-intro">
          <Link className="detail-back" href="/trips"><ArrowLeft size={14} /> BACK TO JOURNEYS</Link>
          <p className="travel-kicker">START A CONVERSATION</p>
          <h1>Let’s plan your<br /><em>time in Nepal.</em></h1>
          <p>Tell us a little about what you have in mind. A local trip planner will get back to you with practical advice and a first outline.</p>
          <div className="inquiry-promise"><CheckCircle2 size={17} /><span>No pressure, no obligation.<br />Just a useful first conversation.</span></div>
        </section>
        <InquiryForm initialTrip={trip} />
      </div>
      <footer className="catalog-footer"><Link href="/">Himalaya Travel Company</Link><span>Kathmandu, Nepal</span></footer>
    </main>
  );
}