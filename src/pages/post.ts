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
  return /* HTML */ ` <header class="page-heading reading-heading">
      <h1>${escape(post.title)}</h1>
      <p class="muted">${escape(post.description)}</p>
      <div class="post-meta">
        <p class="eyebrow"><time datetime="${post.date}">${dateLabel(post.date!)}</time></p>
        ${tags ? `<nav class="tags" aria-label="Post tags">${tags}</nav>` : ''}
      </div>
    </header>
    <article class="prose reading-body">${post.html}</article>
    ${
      newer || older
        ? `<nav class="adjacent-posts" aria-label="More writing">${adjacent(newer, 'Newer note')}${adjacent(older, 'Older note')}</nav>`
        : ''
    }`;
}
