import { Marked } from 'marked';
import sanitize from 'sanitize-html';
import { Parser } from 'htmlparser2';
import type { SiteConfig } from './config.js';
export const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
export function cleanHtml(html: string) {
  return sanitize(html, {
    allowedTags: [
      ...sanitize.defaults.allowedTags,
      'img',
      'section',
      'article',
      'header',
      'footer',
      'nav',
      'figure',
      'figcaption',
      'time',
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      time: ['datetime'],
      th: ['scope', 'colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
  });
}
export function markdown(body: string) {
  const headings = new Set<string>();
  const parser = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        let text = '';
        const reader = new Parser({
          ontext(value) {
            text += value;
          },
        });
        reader.write(html);
        reader.end();
        const base =
          text
            .normalize('NFKD')
            .replace(/\p{M}/gu, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || 'section';
        let id = base;
        let count = 1;
        while (headings.has(id)) id = `${base}-${++count}`;
        headings.add(id);
        return `<h${depth} id="${id}">${html}</h${depth}>`;
      },
    },
  });
  return cleanHtml(parser.parse(body, { async: false }));
}
export function layout(
  template: string,
  config: SiteConfig,
  title: string,
  description: string,
  url: string,
  body: string,
  noindex = false,
) {
  const values: Record<string, string> = {
    title: escape(title === config.title ? title : `${title} · ${config.title}`),
    siteTitle: escape(config.title),
    description: escape(description),
    language: escape(config.language),
    canonical: escape(config.url + url),
    author: escape(config.author),
    robots: config.indexable && !noindex ? 'index,follow' : 'noindex,nofollow',
    writingCurrent:
      url === '/blog/'
        ? 'aria-current="page"'
        : url.startsWith('/blog/')
          ? 'aria-current="true"'
          : '',
    topicsCurrent:
      url === '/tags/'
        ? 'aria-current="page"'
        : url.startsWith('/tags/')
          ? 'aria-current="true"'
          : '',
    aboutCurrent: url === '/about/' ? 'aria-current="page"' : '',
    body,
  };
  const rendered = template.replace(/\{\{([A-Za-z]+)\}\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Unknown layout placeholder: ${key}`);
    return values[key];
  });
  if (!template.includes('{{body}}')) throw new Error('The layout must include {{body}}.');
  return rendered;
}
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z'),
  );
}
