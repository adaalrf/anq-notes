import type { Document } from '../content.js';
import { heading } from '../components/heading.js';
export function contentPage(page: Document) {
  return /* HTML */ `${heading(page.title, page.description, 'reading-heading')}
    <article class="prose reading-body">${page.html}</article>`;
}
