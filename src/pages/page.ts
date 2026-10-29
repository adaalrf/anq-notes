import type { Document } from '../content.js';
import { heading } from '../components/heading.js';
export function contentPage(page: Document, siteTitle: string) {
  return /* HTML */ `${heading(page.title, page.description, siteTitle)}
    <article class="prose">${page.html}</article>`;
}
