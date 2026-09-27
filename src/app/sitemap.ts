import type { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const routes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/blog`, changeFrequency: 'daily', priority: 1 },
  ];

  try {
    await connectToDatabase();
    const posts = await Post.find({
      status: 'Published',
      slug: { $exists: true, $ne: '' },
    })
      .select('slug updatedAt')
      .lean();
    routes.push(
      ...posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    );
  } catch {
    return routes;
  }

  return routes;
}
