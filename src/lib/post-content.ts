import sanitizeHtml from 'sanitize-html';

const richTextOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2', 'h3']),
  allowedAttributes: { a: ['href', 'name', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
  },
};

export function sanitizePostContent(content: string) {
  return sanitizeHtml(content, richTextOptions);
}

export function postContentAsPlainText(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function withSafePostContent<T extends { content: string }>(post: T) {
  return { ...post, content: sanitizePostContent(post.content) };
}
