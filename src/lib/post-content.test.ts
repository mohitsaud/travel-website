import { describe, expect, it } from 'vitest';
import { postContentAsPlainText, sanitizePostContent } from './post-content';

describe('post content sanitization', () => {
  it('preserves editor formatting and hardens links', () => {
    const content =
      '<h2>Section</h2><p><strong>Bold</strong> and <em>italic</em> <a href="https://example.com">link</a></p>';

    expect(sanitizePostContent(content)).toBe(
      '<h2>Section</h2><p><strong>Bold</strong> and <em>italic</em> <a href="https://example.com" rel="noopener noreferrer" target="_blank">link</a></p>',
    );
  });

  it('removes executable markup and attributes', () => {
    const content =
      '<p onclick="alert(1)">Safe <img src=x onerror="alert(1)"></p><script>alert(1)</script>';

    expect(sanitizePostContent(content)).toBe('<p>Safe </p>');
  });

  it('detects content that contains no readable text', () => {
    expect(postContentAsPlainText('<p><br></p>')).toBe('');
    expect(postContentAsPlainText('<p>Written words</p>')).toBe(
      'Written words',
    );
  });
});
