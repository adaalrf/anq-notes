import type { Document } from '../content.js';
import { escape, dateLabel } from '../render.js';
export function cards(posts: Document[]) {
  return posts
    .map(
      (post) =>
        /* HTML */ `<article class="post-card">
          <p class="eyebrow"><time datetime="${post.date}">${dateLabel(post.date!)}</time></p>
          <h2><a href="${post.url}">${escape(post.title)}</a></h2>
          <p>${escape(post.description)}</p>
          <a class="read-more" href="${post.url}">Read ${escape(post.title)}</a>
        </article>`,
    )
    .join('\n');
}
