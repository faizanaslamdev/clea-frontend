import { describe, expect, it } from 'vitest';
import { escapeHtml } from './html-escape';
import { buildWelcomeEmail } from '@/lib/email/templates/welcome';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;',
    );
  });
});

describe('buildWelcomeEmail HTML safety', () => {
  it('escapes user-provided names in HTML but keeps plain text readable', () => {
    const template = buildWelcomeEmail({
      name: `<script>alert("x")</script>`,
    });

    expect(template.text).toContain('<script>alert("x")</script>');
    expect(template.html).not.toContain('<script>');
    expect(template.html).toContain('&lt;script&gt;');
  });
});
