import type { Document } from '../content.js';
import { heading } from '../components/heading.js';
import { cards } from '../components/cards.js';
import { pagination } from '../components/pagination.js';
export function listingPage(
  title: string,
  description: string,
  items: Document[],
  page: number,
  count: number,
  url: (n: number) => string,
) {
  return /* HTML */ ` ${heading(title, description)}
  ${items.length ? cards(items) : '<p class="panel">No published posts yet.</p>'}
  ${pagination(page, count, url)}`;
}
