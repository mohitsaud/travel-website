import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { withSafePostContent } from "@/lib/post-content";
import Post from "@/models/Post";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  try {
    await connectToDatabase();
    const post = await Post.findOne({ slug, status: "Published" }).lean();
    return post ? NextResponse.json(withSafePostContent(post)) : NextResponse.json({ error: "Post not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Unable to load post." }, { status: 500 });
  }
}