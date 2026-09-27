import { NextResponse } from 'next/server';
import { requireAdmin, requireSameOrigin } from '@/lib/require-admin';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { postWriteSchema, slugify } from '@/lib/post-validation';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const filter: Record<string, unknown> = {};
    if (status && status !== 'All posts') {
      if (status !== 'Draft' && status !== 'Published')
        return NextResponse.json(
          { error: 'Invalid status filter.' },
          { status: 400 },
        );
      filter.status = status;
    }
    if (category && category !== 'All categories') filter.category = category;
    if (query)
      filter.$or = [
        { title: { $regex: query.slice(0, 100), $options: 'i' } },
        { excerpt: { $regex: query.slice(0, 100), $options: 'i' } },
        { category: { $regex: query.slice(0, 100), $options: 'i' } },
      ];
    return NextResponse.json(
      await Post.find(filter).sort({ updatedAt: -1 }).limit(200).lean(),
    );
  } catch {
    return NextResponse.json(
      { error: 'Unable to load posts.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const authError = await requireAdmin(request);
  if (authError) return authError;
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
    const baseSlug = slugify(parsed.data.title);
    let slug = baseSlug;
    for (let suffix = 2; await Post.exists({ slug }); suffix += 1)
      slug = `${baseSlug}-${suffix}`;
    const post = await Post.create({ ...parsed.data, slug });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to create post.' },
      { status: 500 },
    );
  }
}
