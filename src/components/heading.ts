import { escape } from '../render.js';
export function heading(title: string, description: string, modifier = '') {
  return /* HTML */ `<header class="page-heading ${modifier}">
    <h1>${escape(title)}</h1>
    <p class="muted">${escape(description)}</p>
  </header>`;
}
