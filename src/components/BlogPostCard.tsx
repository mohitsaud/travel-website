import Link from "next/link";

type BlogPostCardProps = {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    cover: string;
    createdAt: Date;
  };
  variant?: "featured" | "archive";
  headingLevel?: "h2" | "h3";
};

export default function BlogPostCard({ post, variant = "archive", headingLevel = "h2" }: BlogPostCardProps) {
  const Heading = headingLevel;
  const date = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(post.createdAt);

  return (
    <article className={`blog-post-card blog-post-card-${variant}`}>
      <Link href={`/blog/${post.slug}`} className="blog-post-card-link">
        {post.cover && (
          <div
            className="blog-post-card-image"
            role="img"
            aria-label={`Cover image for ${post.title}`}
            style={{ backgroundImage: `url("${post.cover.replaceAll('"', "%22")}")` }}
          />
        )}
        <div className="blog-post-card-copy">
          <p className="blog-post-card-category">{post.category}</p>
          <Heading>{post.title}</Heading>
          <p className="blog-post-card-excerpt">{post.excerpt}</p>
          <time dateTime={post.createdAt.toISOString()}>{date}</time>
        </div>
      </Link>
    </article>
  );
}
