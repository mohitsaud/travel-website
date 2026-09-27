# Blog CMS

A Next.js App Router blog with a public published-post site, an authenticated editorial admin, MongoDB persistence, rich-text content, and image uploads.

## Requirements

- Node.js 20.9 or newer
- A MongoDB database, local or Atlas

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and configure all values.
3. Set a unique `ADMIN_PASSWORD` and a random `SESSION_SECRET` of at least 32 characters (for example, generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`).
4. Start the app with `npm run dev`.
5. Visit [http://localhost:3000/blog](http://localhost:3000/blog), then use `/login` to open the admin.

Keep `.env.local` private. The MongoDB `posts` collection and its slug index are created by Mongoose. The root URL redirects to `/blog`.

## Features

- Public article index at `/blog` and published article pages at `/blog/:slug`.
- Password-protected admin at `/admin`, using signed, expiring HttpOnly sessions.
- Create, edit, preview, publish, and delete posts with a rich-text editor.
- Strict server-side validation, sanitized HTML, and same-origin write checks.
- Uploads decoded and re-encoded to WebP, with a 5 MB input limit.
- Dynamic article metadata and canonical URLs.

## API

- `GET /api/posts?q=` lists published posts only.
- `GET /api/posts/:slug` retrieves a published post by slug.
- `POST /api/admin/login` starts an admin session; `DELETE` signs out.
- `GET /api/admin/posts` lists and filters all posts (authenticated).
- `POST /api/admin/posts` creates a post (authenticated).
- `PUT|DELETE /api/admin/posts/:id` updates or deletes a post (authenticated).
- `POST /api/uploads` uploads an image (authenticated).

Story fields: `title`, `excerpt`, `content`, `category`, `status` (`Draft` or `Published`), optional `cover` URL, and `readTime` in minutes. Titles generate unique readable slugs.

## Deployment notes

- Set `SITE_URL` to the canonical HTTPS origin for sitemap/canonical metadata.
- Set `ADMIN_PASSWORD` and `SESSION_SECRET` through your hosting secret manager; never commit them.
- The included upload handler writes to `public/uploads`. This is for a persistent single-host deployment only. Serverless/ephemeral hosting needs a persistent object-storage adapter (such as S3-compatible storage) before production use.
- Configure MongoDB network access, backups, and least-privilege credentials for the deployed environment.
- The single shared admin password is suitable only for a single-editor deployment. Multi-user access needs individual accounts and authorization.

## Checks

```bash
npm run lint
npm run build
```
