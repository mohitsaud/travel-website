import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import { withSafePostContent } from '@/lib/post-content';
import Post from '@/models/Post';

type PageProps = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  await connectToDatabase();
  const post = await Post.findOne({ slug, status: 'Published' }).lean();
  return post ? withSafePostContent(post) : null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: 'Post not found' };
    return {
      title: post.title,
      description: post.excerpt,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        type: 'article',
        title: post.title,
        description: post.excerpt,
        publishedTime: post.createdAt.toISOString(),
        images: post.cover ? [post.cover] : [],
      },
    };
  } catch {
    return { title: 'Blog post' };
  }
}

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getPost(slug);
  } catch {
    return (
      <main className="public-blog">
        <p className="public-empty">The blog is temporarily unavailable.</p>
      </main>
    );
  }
  if (!post) notFound();

  return (
    <main className="public-blog">
      <header className="public-header">
        <Link href="/blog" className="public-brand">
          Blog
        </Link>
        <nav>
          <Link href="/blog">All articles</Link>
        </nav>
      </header>
      <article className="public-article">
        {post.cover && (
          <div
            className="public-hero-image"
            role="img"
            aria-label="Article cover"
            style={{
              backgroundImage: `url("${post.cover.replaceAll('"', '%22')}")`,
            }}
          />
        )}
        <header>
          <p className="blog-post-card-category">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="public-article-excerpt">{post.excerpt}</p>
          <div className="public-article-meta">
            <time dateTime={post.createdAt.toISOString()}>
              {new Intl.DateTimeFormat('en', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }).format(post.createdAt)}
            </time>
            <span>{post.readTime} min read</span>
          </div>
        </header>
        <div
          className="public-article-body"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      <footer className="public-footer">
        <Link href="/blog">← All articles</Link>
      </footer>
    </main>
  );
}
