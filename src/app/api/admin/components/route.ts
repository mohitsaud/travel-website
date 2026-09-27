import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin, requireSameOrigin } from "@/lib/require-admin";
import HomeComponent from "@/models/HomeComponent";
import { homeComponentSchema } from "@/lib/home-component-validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    await connectToDatabase();
    return NextResponse.json(await HomeComponent.find().sort({ order: 1, createdAt: 1 }).lean());
  } catch {
    return NextResponse.json({ error: "Unable to load homepage components." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    await connectToDatabase();
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    const parsed = homeComponentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid component." }, { status: 400 });
    return NextResponse.json(await HomeComponent.create(parsed.data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create homepage component." }, { status: 500 });
  }
}