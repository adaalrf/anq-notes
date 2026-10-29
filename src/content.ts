import { readdir, readFile, lstat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { parseDocument } from 'yaml';
import { z } from 'zod';
import { markdown, cleanHtml } from './render.js';
export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters/digits separated by single hyphens for slugs.',
  );
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Use a real calendar date in YYYY-MM-DD format.');
const metadata = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(300),
    slug: slugSchema.optional(),
    date: dateSchema.optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
    draft: z.boolean().default(false),
  })
  .strict();
export type Document = {
  title: string;
  description: string;
  slug: string;
  date?: string;
  tags: string[];
  draft: boolean;
  html: string;
  source: string;
  url: string;
};
export function tagSlug(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug)
    throw new Error(`Tag "${value}" needs at least one Latin letter or digit for its URL.`);
  return slug;
}
export function parseContent(source: string, file: string, kind: 'page' | 'post'): Document {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(
    source.replace(/^\uFEFF/, ''),
  );
  if (!match) throw new Error(`${file}: start with YAML front matter between --- lines.`);
  if (Buffer.byteLength(match[1]) > 16_384)
    throw new Error(`${file}: front matter exceeds 16 KiB.`);
  const yaml = parseDocument(match[1], { uniqueKeys: true, resolveKnownTags: false });
  if (yaml.errors.length || yaml.warnings.length)
    throw new Error(
      `${file}: invalid YAML: ${[...yaml.errors, ...yaml.warnings].map((e) => e.message).join('; ')}`,
    );
  let input: z.infer<typeof metadata>;
  try {
    input = metadata.parse(yaml.toJS({ maxAliasCount: 0 }));
  } catch (error) {
    throw new Error(`${file}: ${(error as Error).message}`);
  }
  const slug = slugSchema.parse(input.slug ?? basename(file, extname(file)));
  if (kind === 'post' && !input.date) throw new Error(`${file}: posts require a date.`);
  if (kind === 'page' && (input.date || input.tags.length))
    throw new Error(`${file}: dates and tags belong to posts.`);
  const tags = [...new Set(input.tags)];
  for (const tag of tags) tagSlug(tag);
  return {
    ...input,
    tags,
    slug,
    html: extname(file) === '.html' ? cleanHtml(match[2]) : markdown(match[2]),
    source: file,
    url: kind === 'post' ? `/blog/${slug}/` : slug === 'index' ? '/' : `/${slug}/`,
  };
}
export async function readContent(directory: string, kind: 'page' | 'post'): Promise<Document[]> {
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink())
    throw new Error(`${directory}: expected a real content directory.`);
  const documents: Document[] = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isSymbolicLink() || !entry.isFile())
      throw new Error(
        `${join(directory, entry.name)}: use flat files, not links or subdirectories.`,
      );
    if (!['.md', '.html'].includes(extname(entry.name)))
      throw new Error(`${entry.name}: expected .md or .html content.`);
    if (kind === 'post' && extname(entry.name) !== '.md')
      throw new Error(`${entry.name}: posts must use Markdown.`);
    const file = join(directory, entry.name);
    if ((await lstat(file)).size > 1_048_576) throw new Error(`${file}: content exceeds 1 MiB.`);
    const doc = parseContent(await readFile(file, 'utf8'), file, kind);
    if (!doc.draft) documents.push(doc);
  }
  return documents.sort(
    (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.slug.localeCompare(b.slug),
  );
}
