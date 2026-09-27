import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Mountain } from "lucide-react";
import { getTrip, trips } from "@/lib/trips";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return trips.map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTrip(slug);
  return trip ? { title: `${trip.title} | Himalaya Travel`, description: trip.summary, openGraph: { images: [trip.image] } } : { title: "Journey not found" };
}

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = getTrip(slug);
  if (!trip) notFound();

  return <main className="trip-detail-page"><header className="catalog-header"><Link href="/" className="travel-brand"><span className="brand-emblem"><Mountain size={20} /></span><span><strong>Himalaya</strong><small>TRAVEL COMPANY · NEPAL</small></span></Link><nav><Link href="/trips">All journeys</Link><Link href="/plan-your-trip">Plan a trip</Link></nav></header><div className="trip-detail-hero" style={{ backgroundImage: `linear-gradient(90deg, #101d18cc, #101d1833), url("${trip.image}")` }}><div><Link href="/trips" className="detail-back"><ArrowLeft size={14} /> ALL JOURNEYS</Link><p className="travel-kicker">{trip.region.toUpperCase()}</p><h1>{trip.title}</h1><p>{trip.summary}</p></div></div><div className="trip-detail-layout"><article className="trip-itinerary"><div className="trip-facts"><span><Clock3 size={16} />{trip.duration} days</span><span><Mountain size={16} />Max altitude {trip.altitude}</span><span><MapPin size={16} />{trip.difficulty}</span></div><h2>The route, at a glance</h2><p className="itinerary-intro">A locally led journey with time to settle into the landscape. Your guide will adjust the pace to the group and conditions.</p><ol className="itinerary-list">{trip.itinerary.map((day, index) => <li key={day}><span>DAY {String(index + 1).padStart(2, "0")}</span><p>{day}</p></li>)}</ol><div className="trip-includes"><h2>Included in your journey</h2><p><Check size={15} />Local English-speaking trek leader</p><p><Check size={15} />Pre-trip planning and arrival support</p><p><Check size={15} />Accommodation and listed ground transport</p><p><Check size={15} />Small group with a maximum of 10 travellers</p></div></article><aside className="trip-booking"><p className="travel-kicker">A PLACE ON THE TRAIL</p><p className="price-label">From</p><strong className="trip-price">US$ {trip.priceFrom.toLocaleString()}</strong><span className="price-note">per person · based on two travellers</span><div className="booking-next"><CalendarDays size={16} /><span><small>NEXT GROUP DEPARTURE</small><strong>{trip.departure}</strong></span></div><Link className="trip-book-button" href={`/plan-your-trip?trip=${trip.slug}`}>Ask about this trip <ArrowRight size={16} /></Link><p className="booking-footnote">Private departures and custom dates are available.</p></aside></div><footer className="catalog-footer"><Link href="/trips">← Browse more journeys</Link><Link href="/">Himalaya Travel Company</Link></footer></main>;
}