import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import { requireAdmin, requireSameOrigin } from '@/lib/require-admin';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { postWriteSchema, slugify } from '@/lib/post-validation';

export const runtime = 'nodejs';
type RouteContext = { params: Promise<{ id: string }> };
const missingPost = () =>
  NextResponse.json({ error: 'Post not found.' }, { status: 404 });

export async function PUT(request: Request, { params }: RouteContext) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const { id } = await params;
  if (!isValidObjectId(id)) return missingPost();
  try {
    await connectToDatabase();
    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 },
      );
    }
    const parsed = postWriteSchema.safeParse(input);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid post.' },
        { status: 400 },
      );
    if (!(await Post.exists({ _id: id }))) return missingPost();
    const baseSlug = slugify(parsed.data.title);
    let slug = baseSlug;
    for (
      let suffix = 2;
      await Post.exists({ slug, _id: { $ne: id } });
      suffix += 1
    )
      slug = `${baseSlug}-${suffix}`;
    const post = await Post.findByIdAndUpdate(
      id,
      { ...parsed.data, slug },
      { new: true, runValidators: true },
    ).lean();
    return post ? NextResponse.json(post) : missingPost();
  } catch {
    return NextResponse.json(
      { error: 'Unable to update post.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const { id } = await params;
  if (!isValidObjectId(id)) return missingPost();
  try {
    await connectToDatabase();
    const post = await Post.findByIdAndDelete(id);
    return post ? NextResponse.json({ success: true }) : missingPost();
  } catch {
    return NextResponse.json(
      { error: 'Unable to delete post.' },
      { status: 500 },
    );
  }
}
