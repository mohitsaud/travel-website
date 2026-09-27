import { z } from 'zod';
import {
  postContentAsPlainText,
  sanitizePostContent,
} from '@/lib/post-content';

const safeContent = z
  .string()
  .trim()
  .max(100_000)
  .refine(
    (value) => Boolean(postContentAsPlainText(value)),
    'Post content is required.',
  )
  .transform(sanitizePostContent);
const coverUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    if (value.startsWith('/uploads/'))
      return !value.includes('..') && !value.includes('\\');
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Cover must be an HTTP(S) URL or an uploaded image path.');

export const postWriteSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    excerpt: z.string().trim().min(1).max(240),
    content: safeContent,
    category: z.string().trim().min(1).max(40),
    status: z.enum(['Draft', 'Published']),
    cover: coverUrl.default(''),
    readTime: z.coerce.number().int().min(1).max(60),
  })
  .strict();

export function slugify(title: string) {
  return (
    title
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 140) || 'post'
  );
}
