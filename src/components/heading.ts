import { escape } from '../render.js';
export function heading(title: string, description: string, eyebrow: string) {
  return /* HTML */ `<header class="page-heading">
    <p class="eyebrow">${escape(eyebrow)}</p>
    <h1>${escape(title)}</h1>
    <p class="muted">${escape(description)}</p>
  </header>`;
}
