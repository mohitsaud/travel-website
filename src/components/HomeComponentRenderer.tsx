import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { trips } from "@/lib/trips";

export type HomeComponentData = {
  _id: string;
  type: "hero" | "trip-showcase" | "editorial" | "callout";
  title: string;
  subtitle: string;
  body: string;
  image: string;
  linkLabel: string;
  linkHref: string;
  tripSlugs: string[];
  enabled: boolean;
  order: number;
};

export default function HomeComponentRenderer({ component }: { component: HomeComponentData }) {
  const featuredTrips = component.tripSlugs.map((slug) => trips.find((trip) => trip.slug === slug)).filter((trip) => trip !== undefined);
  const actionLink = component.linkHref.startsWith("https://")
    ? <a href={component.linkHref} target="_blank" rel="noopener noreferrer" className="button-light">{component.linkLabel || "Explore"} <ArrowUpRight size={15} /></a>
    : <Link href={component.linkHref || "/trips"} className="button-light">{component.linkLabel || "Explore"} <ArrowRight size={15} /></Link>;

  if (component.type === "trip-showcase") {
    return (
      <section className="journeys-section custom-trip-showcase">
        <div className="section-topline">
          <div>
            <p className="travel-kicker">{component.subtitle || "CURATED FOR YOU"}</p>
            <h2>{component.title}</h2>
          </div>
          {component.body && <div className="section-sidecopy">
            <p>{component.body}</p>
            {component.linkLabel && (component.linkHref.startsWith("https://")
              ? <a href={component.linkHref} target="_blank" rel="noopener noreferrer">{component.linkLabel} <ArrowRight size={15} /></a>
              : <Link href={component.linkHref || "/trips"}>{component.linkLabel} <ArrowRight size={15} /></Link>)}
          </div>}
        </div>
        <div className="journey-grid">
          {featuredTrips.slice(0, 4).map((trip, index) => (
            <article className={`journey-card journey-card-${index + 1}`} key={trip.slug}>
              <Link href={`/trips/${trip.slug}`} className="journey-link">
                <div className="journey-image" style={{ backgroundImage: `url("${trip.image}")` }}>
                  <span className="journey-number">0{index + 1}</span>
                  <span className="journey-duration">{trip.duration} {trip.duration === 1 ? "DAY" : "DAYS"}</span>
                </div>
                <div className="journey-info">
                  <p>{trip.region}</p>
                  <h3>{trip.title}</h3>
                  <div className="journey-bottom">
                    <span>From <strong>${trip.priceFrom.toLocaleString()}</strong></span>
                    <span className="journey-arrow"><ArrowUpRight size={17} /></span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (component.type === "hero") {
    return <section className="travel-hero custom-hero"><div className="hero-image" role="img" aria-label={component.title} style={component.image ? { backgroundImage: `url("${component.image.replaceAll('"', "%22")}")` } : undefined} /><div className="hero-scrim" /><div className="hero-content"><p className="hero-eyebrow"><span />{component.subtitle || "NEPAL · TIBET · BHUTAN"}</p><h1>{component.title}</h1>{component.body && <p className="hero-copy">{component.body}</p>}{component.linkLabel && <div className="hero-actions">{actionLink}</div>}</div></section>;
  }

  if (component.type === "callout") {
    return <section className="inquiry-banner custom-callout" style={component.image ? { backgroundImage: `linear-gradient(90deg, #193026ed, #193026ad), url("${component.image.replaceAll('"', "%22")}")` } : undefined}><div><p className="travel-kicker">{component.subtitle || "PLAN YOUR JOURNEY"}</p><h2>{component.title}</h2>{component.body && <p>{component.body}</p>}</div>{component.linkLabel && actionLink}</section>;
  }

  return <section className="custom-editorial"><div className="custom-editorial-copy"><p className="travel-kicker">{component.subtitle || "A NOTE FROM OUR TEAM"}</p><h2>{component.title}</h2>{component.body && <p>{component.body}</p>}{component.linkLabel && actionLink}</div>{component.image && <div className="custom-editorial-image" role="img" aria-label={component.title} style={{ backgroundImage: `url("${component.image.replaceAll('"', "%22")}")` }} />}</section>;
}