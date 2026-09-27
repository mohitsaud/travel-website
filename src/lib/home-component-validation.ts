import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { trips } from "@/lib/trips";

const imageUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  if (value.startsWith("/uploads/")) return !value.includes("..") && !value.includes("\\");
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}, "Image must be an HTTP(S) URL or uploaded image path.");

export const homeComponentSchema = z.object({
  type: z.enum(["hero", "trip-showcase", "editorial", "callout"]),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(240).default(""),
  body: z.string().trim().max(1200).default(""),
  image: imageUrl.default(""),
  linkLabel: z.string().trim().max(40).default(""),
  linkHref: z.string().trim().max(200).refine((value) => !value || value.startsWith("/") || value.startsWith("https://"), "Link must be a local path or HTTPS URL.").default(""),
  tripSlugs: z.array(z.string()).max(12).refine((slugs) => slugs.every((slug) => trips.some((trip) => trip.slug === slug)), "Choose valid trips."),
  enabled: z.boolean(),
  order: z.number().int().min(0).max(10000),
}).strict().transform((component) => ({
  ...component,
  title: sanitizeHtml(component.title, { allowedTags: [], allowedAttributes: {} }),
  subtitle: sanitizeHtml(component.subtitle, { allowedTags: [], allowedAttributes: {} }),
  body: sanitizeHtml(component.body, { allowedTags: [], allowedAttributes: {} }),
  linkLabel: sanitizeHtml(component.linkLabel, { allowedTags: [], allowedAttributes: {} }),
}));