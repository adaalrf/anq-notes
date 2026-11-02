import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { stringify } from 'yaml';
import type { SiteConfig } from '../src/config.js';
export const config: SiteConfig = {
  title: 'Fixture & Notes',
  description: 'A small test publication.',
  url: 'https://example.com',
  author: 'Fictional Writer',
  language: 'en',
  postsPerPage: 2,
  indexable: true,
};
export function document(meta: Record<string, unknown>, body = 'A short **note**.') {
  return `---\n${stringify(meta)}---\n${body}\n`;
}
export async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'anq-ssg-'));
  for (const dir of ['content/pages', 'content/posts', 'styles', 'templates', 'assets/fonts'])
    await mkdir(join(root, dir), { recursive: true });
  for (const file of [
    'styles/tokens.css',
    'styles/site.css',
    'templates/layout.html',
    'assets/mark.svg',
    'assets/theme.js',
    'assets/fonts/source-serif-4.woff2',
  ])
    await writeFile(join(root, file), await readFile(resolve(file)));
  await writeFile(
    join(root, 'content/pages/index.md'),
    document({ title: 'Home', description: 'Welcome to the fixture.' }),
  );
  await writeFile(
    join(root, 'content/pages/about.html'),
    document({ title: 'About', description: 'A fictional fixture.' }, '<p>Some context.</p>'),
  );
  return root;
}
export async function post(
  root: string,
  slug: string,
  meta: Record<string, unknown> = {},
  body = 'A short note.',
) {
  await writeFile(
    join(root, `content/posts/${slug}.md`),
    document(
      { title: slug, description: `About ${slug}.`, date: '2026-10-01', tags: ['Notes'], ...meta },
      body,
    ),
  );
}
export async function snapshot(root: string, relative = ''): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const entry of (await readdir(join(root, relative), { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const path = join(relative, entry.name);
    if (entry.isDirectory()) Object.assign(result, await snapshot(root, path));
    else result[path] = (await readFile(join(root, path))).toString('base64');
  }
  return result;
}
export const cleanup = (root: string) => rm(root, { recursive: true, force: true });
