import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { getTrip } from "@/lib/trips";

export const runtime = "nodejs";

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  tripSlug: z.string().trim().max(120).default(""),
  startDate: z.string().trim().max(30).default(""),
  groupSize: z.coerce.number().int().min(1).max(20),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
}).strict();

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 }); }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ success: true }, { status: 201 });
  if (parsed.data.tripSlug && !getTrip(parsed.data.tripSlug)) return NextResponse.json({ error: "That trip is not available." }, { status: 400 });

  try {
    await connectToDatabase();
    await Inquiry.create(parsed.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not send your request just now. Please try again." }, { status: 503 });
  }
}