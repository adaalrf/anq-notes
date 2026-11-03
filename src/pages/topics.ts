import type { Document } from '../content.js';
import { escape } from '../render.js';
import { heading } from '../components/heading.js';
export function topicsPage(tags: [string, { label: string; posts: Document[] }][]) {
  return /* HTML */ `${heading('Topics', 'Browse notes by subject.')}
    <div class="topic-grid">
      ${
        tags.length
          ? tags
              .map(
                ([slug, tag]) =>
                  `<a class="panel topic" href="/tags/${slug}/"><strong>${escape(tag.label)}</strong><span>${tag.posts.length} ${tag.posts.length === 1 ? 'post' : 'posts'}</span></a>`,
              )
              .join('')
          : '<p>No topics yet.</p>'
      }
    </div>`;
}
