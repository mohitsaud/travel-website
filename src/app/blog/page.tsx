import type { Metadata } from 'next';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogPostCard from '@/components/BlogPostCard';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest articles and notes.',
  alternates: { canonical: '/blog' },
};

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  let posts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    cover: string;
    createdAt: Date;
  }> = [];
  let unavailable = false;
  try {
    await connectToDatabase();
    posts = await Post.find({
      status: 'Published',
      slug: { $exists: true, $ne: '' },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title slug excerpt category cover createdAt')
      .lean();
  } catch {
    unavailable = true;
  }

  return (
    <main className="public-blog">
      <header className="public-header">
        <Link href="/blog" className="public-brand">
          Blog
        </Link>
        <nav>
          <Link href="/blog">Articles</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>
      <section className="public-intro">
        <p className="page-kicker">ARTICLES</p>
        <h1>Latest posts</h1>
        <p>Ideas, notes, and stories.</p>
      </section>
      {unavailable ? (
        <p className="public-empty">The blog is temporarily unavailable.</p>
      ) : posts.length ? (
        <section className="public-post-grid">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} variant="archive" headingLevel="h2" />
          ))}
        </section>
      ) : (
        <p className="public-empty">No published posts yet.</p>
      )}
      <footer className="public-footer">
        © {new Date().getFullYear()} Blog
      </footer>
    </main>
  );
}
