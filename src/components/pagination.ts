export function pagination(page: number, count: number, url: (n: number) => string) {
  if (count <= 1) return '';
  return /* HTML */ `<nav class="pagination" aria-label="Post pages">
    ${page > 1 ? `<a rel="prev" href="${url(page - 1)}">Newer posts</a>` : '<span></span>'}
    <span>Page ${page} of ${count}</span>
    ${page < count ? `<a rel="next" href="${url(page + 1)}">Older posts</a>` : '<span></span>'}
  </nav>`;
}
