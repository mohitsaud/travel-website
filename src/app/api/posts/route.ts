import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { withSafePostContent } from '@/lib/post-content';

export const runtime = 'nodejs';

function errorResponse(error: unknown) {
  const unavailable =
    error instanceof Error && error.message.includes('MONGODB_URI');
  return NextResponse.json(
    {
      error: unavailable
        ? 'Database is not configured.'
        : 'Unable to load published posts.',
    },
    { status: unavailable ? 503 : 500 },
  );
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().slice(0, 100);
    const filter: Record<string, unknown> = {
      status: 'Published',
      slug: { $exists: true, $ne: '' },
    };
    const category = searchParams.get('category');
    if (category && category !== 'All categories') filter.category = category;
    if (query) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedQuery, $options: 'i' } },
        { excerpt: { $regex: escapedQuery, $options: 'i' } },
        { category: { $regex: escapedQuery, $options: 'i' } },
      ];
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json(
      posts.map((post) => withSafePostContent(post)),
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
