import Link from "next/link";
import { Clock3, Mountain } from "lucide-react";
import { trips } from "@/lib/trips";

type SearchParams = Promise<{ style?: string; region?: string; duration?: string }>;

export default async function TripsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const results = trips.filter((trip) => {
    const styleMatches = !filters.style || filters.style.toLowerCase() === trip.style.toLowerCase();
    const regionMatches = !filters.region || trip.region.toLowerCase().includes(filters.region.toLowerCase()) || trip.title.toLowerCase().includes(filters.region.toLowerCase());
    const durationMatches = !filters.duration || (filters.duration === "short" ? trip.duration <= 7 : filters.duration === "medium" ? trip.duration >= 8 && trip.duration <= 14 : trip.duration >= 15);
    return styleMatches && regionMatches && durationMatches;
  });

  return <main className="catalog-page"><header className="catalog-header"><Link href="/" className="travel-brand"><span className="brand-emblem"><Mountain size={20} /></span><span><strong>Himalaya</strong><small>TRAVEL COMPANY · NEPAL</small></span></Link><nav><Link href="/">Home</Link><Link href="/plan-your-trip">Plan a trip</Link></nav></header><section className="catalog-intro"><p className="travel-kicker">THE JOURNEY COLLECTION</p><h1>Find your kind<br />of <em>Nepal.</em></h1><p>Small groups, thoughtful routes, local guides. Find the journey that fits you.</p></section><div className="catalog-layout"><aside className="catalog-filters"><p>TRAVEL STYLE</p>{["All", "Trekking", "Culture", "Adventure"].map((style) => <Link className={(filters.style || "All") === style ? "selected" : ""} href={style === "All" ? "/trips" : `/trips?style=${style}`} key={style}>{style}<span>{style === "All" ? trips.length : trips.filter((trip) => trip.style === style).length}</span></Link>)}<div className="filter-note"><Clock3 size={15} /><span>Need a different pace?<Link href="/plan-your-trip">Build a private itinerary</Link></span></div></aside><section className="catalog-results"><div className="results-heading"><span>{results.length} journeys</span><span>Updated for the 2026 season</span></div><div className="catalog-grid">{results.map((trip) => <article className="catalog-card" key={trip.slug}><Link href={`/trips/${trip.slug}`}><div className="catalog-image" style={{ backgroundImage: `url("${trip.image}")` }}><span>{trip.duration} {trip.duration === 1 ? "DAY" : "DAYS"}</span></div><p>{trip.region}</p><h2>{trip.title}</h2><div className="catalog-card-meta"><span>{trip.difficulty}</span><span>From <strong>${trip.priceFrom.toLocaleString()}</strong></span></div></Link></article>)}</div>{results.length === 0 && <p className="no-trips">No journeys match those filters. <Link href="/trips">Clear filters</Link></p>}</section></div><footer className="catalog-footer"><Link href="/">← Back to Himalaya Travel</Link><span>Questions? <Link href="/plan-your-trip">Talk to a local trip planner</Link></span></footer></main>;
}