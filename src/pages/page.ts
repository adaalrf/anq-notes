import type { Document } from '../content.js';
import { heading } from '../components/heading.js';
export function contentPage(page: Document) {
  return /* HTML */ `${heading(page.title, page.description)}
    <article class="prose">${page.html}</article>`;
}
