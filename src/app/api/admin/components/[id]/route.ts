import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin, requireSameOrigin } from "@/lib/require-admin";
import HomeComponent from "@/models/HomeComponent";
import { homeComponentSchema } from "@/lib/home-component-validation";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ error: "Homepage component not found." }, { status: 404 });

export async function PUT(request: Request, { params }: RouteContext) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const { id } = await params;
  if (!isValidObjectId(id)) return notFound();
  try {
    await connectToDatabase();
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    const parsed = homeComponentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid component." }, { status: 400 });
    const component = await HomeComponent.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();
    return component ? NextResponse.json(component) : notFound();
  } catch {
    return NextResponse.json({ error: "Unable to update homepage component." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const { id } = await params;
  if (!isValidObjectId(id)) return notFound();
  try {
    await connectToDatabase();
    const result = await HomeComponent.findByIdAndDelete(id);
    return result ? NextResponse.json({ success: true }) : notFound();
  } catch {
    return NextResponse.json({ error: "Unable to delete homepage component." }, { status: 500 });
  }
}