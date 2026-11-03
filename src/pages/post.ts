import { tagSlug, type Document } from '../content.js';
import { dateLabel, escape } from '../render.js';
export function postPage(post: Document, newer?: Document, older?: Document) {
  const tags = post.tags
    .map((tag) => `<a class="tag" href="/tags/${tagSlug(tag)}/">${escape(tag)}</a>`)
    .join(' ');
  const adjacent = (item: Document | undefined, direction: string) =>
    item
      ? `<a href="${item.url}"><small>${direction}</small><span>${escape(item.title)}</span></a>`
      : '<span></span>';
  return /* HTML */ ` <a class="back" href="/blog/">← All writing</a>
    <header class="page-heading">
      <p class="eyebrow"><time datetime="${post.date}">${dateLabel(post.date!)}</time></p>
      <h1>${escape(post.title)}</h1>
      <p class="muted">${escape(post.description)}</p>
      ${tags ? `<nav class="tags" aria-label="Post tags">${tags}</nav>` : ''}
    </header>
    <article class="prose">${post.html}</article>
    ${
      newer || older
        ? `<nav class="adjacent-posts" aria-label="More writing">${adjacent(newer, 'Newer note')}${adjacent(older, 'Older note')}</nav>`
        : ''
    }`;
}
