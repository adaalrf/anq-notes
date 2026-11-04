import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lstat, readFile, writeFile, mkdir, symlink, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from '../src/build.js';
import { parseContent } from '../src/content.js';
import { markdown } from '../src/render.js';
import { checkLinks } from '../src/links.js';
import { validateConfig } from '../src/config.js';
import { fixture, post, document, snapshot, cleanup, config } from './fixtures.js';

test('builds pages, posts, topic pagination, RSS and sitemap with explicit tie ordering', async () => {
  const root = await fixture();
  try {
    for (const slug of ['c', 'a', 'b']) await post(root, slug);
    const result = await build(root, config);
    assert.equal(result.posts, 3);
    assert.equal(result.tags, 1);
    const index = await readFile(join(root, 'public/blog/index.html'), 'utf8');
    assert.ok(index.indexOf('/blog/a/') < index.indexOf('/blog/b/'));
    assert.ok(!index.includes('/blog/c/'));
    assert.match(
      await readFile(join(root, 'public/blog/page/2/index.html'), 'utf8'),
      /\/blog\/c\//,
    );
    assert.match(
      await readFile(join(root, 'public/tags/notes/page/2/index.html'), 'utf8'),
      /Page 2 of 2/,
    );
    const middle = await readFile(join(root, 'public/blog/b/index.html'), 'utf8');
    assert.match(middle, /aria-label="More writing"/);
    assert.match(middle, /href="\/blog\/a\/"/);
    assert.match(middle, /href="\/blog\/c\/"/);
    const newest = await readFile(join(root, 'public/blog/a/index.html'), 'utf8');
    assert.doesNotMatch(newest, /Newer note/);
    const oldest = await readFile(join(root, 'public/blog/c/index.html'), 'utf8');
    assert.doesNotMatch(oldest, /Older note/);
    const secondPage = await readFile(join(root, 'public/blog/page/2/index.html'), 'utf8');
    assert.match(secondPage, /<title>Writing — Page 2 · Fixture &amp; Notes<\/title>/);
    assert.match(index, /href="\/blog\/" aria-current="page"/);
    const rss = await readFile(join(root, 'public/rss.xml'), 'utf8');
    assert.match(rss, /Fixture &amp; Notes/);
    assert.match(rss, /<pubDate>/);
    const sitemap = await readFile(join(root, 'public/sitemap.xml'), 'utf8');
    assert.match(sitemap, /https:\/\/example.com\/blog\/a\//);
    assert.ok(!sitemap.includes('404.html'));
    assert.match(await readFile(join(root, 'public/robots.txt'), 'utf8'), /Allow: \//);
  } finally {
    await cleanup(root);
  }
});
test('drafts are absent everywhere and stale generated pages disappear on a successful rebuild', async () => {
  const root = await fixture();
  try {
    await post(root, 'published');
    await post(root, 'secret-draft', { draft: true, tags: ['Hidden'] });
    await build(root, config);
    assert.ok(!(await snapshot(join(root, 'public')))['blog/secret-draft/index.html']);
    assert.ok(!(await readFile(join(root, 'public/rss.xml'), 'utf8')).includes('secret-draft'));
    await post(root, 'published', { draft: true });
    await build(root, config);
    const output = await snapshot(join(root, 'public'));
    assert.ok(!output['blog/published/index.html']);
    assert.ok(!output['tags/notes/index.html']);
    assert.match(
      await readFile(join(root, 'public/blog/index.html'), 'utf8'),
      /No published posts yet/,
    );
  } finally {
    await cleanup(root);
  }
});
test('identical source/config creates identical file bytes', async () => {
  const root = await fixture();
  try {
    await post(root, 'one');
    await build(root, config);
    const before = await snapshot(join(root, 'public'));
    await build(root, config);
    assert.deepEqual(await snapshot(join(root, 'public')), before);
  } finally {
    await cleanup(root);
  }
});
test('broken links and missing fragments fail before replacing the last good build', async () => {
  const root = await fixture();
  try {
    await post(root, 'one', {}, '## A heading\n\n[Jump](#a-heading)');
    await build(root, config);
    const before = await snapshot(join(root, 'public'));
    for (const body of [
      '[Broken](/missing/)',
      '[Fragment](/blog/one/#missing)',
      '![No alt](/assets/missing.png)',
    ]) {
      await post(root, 'one', {}, body);
      await assert.rejects(() => build(root, config), /broken internal|missing fragment/);
      assert.deepEqual(await snapshot(join(root, 'public')), before);
    }
    assert.ok(
      !(await readdir(root)).some((name) => name.startsWith('.anq-')),
      'No staging/lock residue',
    );
  } finally {
    await cleanup(root);
  }
});
test('duplicate slugs, reserved pages, and colliding tag URLs are rejected', async () => {
  for (const mode of ['post', 'page', 'tag']) {
    const root = await fixture();
    try {
      if (mode === 'post') {
        await post(root, 'one', { slug: 'same' });
        await post(root, 'two', { slug: 'same' });
      }
      if (mode === 'page')
        await writeFile(
          join(root, 'content/pages/blog.md'),
          document({ title: 'Bad', description: 'Reserved route.' }),
        );
      if (mode === 'tag') {
        await post(root, 'one', { tags: ['C++'] });
        await post(root, 'two', { tags: ['C#'] });
      }
      await assert.rejects(() => build(root, config), /collision|reserved|same URL/);
    } finally {
      await cleanup(root);
    }
  }
});
test('front matter validates dates, slugs, unknown keys, aliases and executable tag syntax', () => {
  for (const date of ['31.12.2026', '2026-02-30', 'not a date'])
    assert.throws(() =>
      parseContent(document({ title: 'Bad', description: 'Bad date.', date }), 'one.md', 'post'),
    );
  for (const meta of [
    { title: 'Missing description' },
    { title: 'Bad', description: 'Bad slug.', slug: '../escape' },
    { title: 'Bad', description: 'Unknown.', unknown: true },
  ])
    assert.throws(() => parseContent(document(meta), 'one.md', 'page'));
  assert.throws(
    () => parseContent('---js\nreturn {}\n---\nHello', 'one.md', 'post'),
    /front matter/,
  );
  assert.throws(
    () => parseContent('---\ntitle: &a Hello\ndescription: *a\n---\nHi', 'one.md', 'page'),
    /alias/i,
  );
  assert.throws(
    () =>
      parseContent(
        '---\ntitle: !!js/function function() {}\ndescription: Test\n---\nHi',
        'one.md',
        'page',
      ),
    /invalid YAML/,
  );
});
test('Markdown/HTML sanitization strips scripts, events and unsafe link protocols', () => {
  const html = markdown(
    '<script>alert(1)</script>\n\n<img src="x" onerror="bad()" alt="Example">\n\n[Bad](javascript:alert(1))\n\n## Same\n\n## Same',
  );
  assert.ok(!html.includes('<script'));
  assert.ok(!html.includes('onerror'));
  assert.ok(!html.includes('javascript:'));
  assert.match(html, /id="same"/);
  assert.match(html, /id="same-2"/);
  const page = parseContent(
    document(
      { title: 'Page', description: 'Page.' },
      '<p onclick="bad()">Safe text</p><iframe src="https://evil.invalid"></iframe>',
    ),
    'page.html',
    'page',
  );
  assert.equal(page.html.trim(), '<p>Safe text</p>');
});
test('unmanaged public directories and symlinked assets are preserved/rejected', async () => {
  const root = await fixture();
  try {
    await mkdir(join(root, 'public'));
    await writeFile(join(root, 'public/precious.txt'), 'Keep this.');
    await assert.rejects(() => build(root, config), /not a recognized/);
    assert.equal(await readFile(join(root, 'public/precious.txt'), 'utf8'), 'Keep this.');
  } finally {
    await cleanup(root);
  }
  const other = await fixture();
  try {
    await symlink(join(other, 'site-secret'), join(other, 'assets/link'));
    await assert.rejects(() => build(other, config), /symlink/);
  } finally {
    await cleanup(other);
  }
});
test('an active/stale build lock is respected rather than deleted', async () => {
  const root = await fixture();
  try {
    await writeFile(join(root, '.anq-build.lock'), 'held');
    await assert.rejects(() => build(root, config), /Another build/);
    assert.equal(await readFile(join(root, '.anq-build.lock'), 'utf8'), 'held');
  } finally {
    await cleanup(root);
  }
});
test('preview config disables indexing, 404 is noindex, and asset files are copied unchanged', async () => {
  const root = await fixture();
  try {
    await writeFile(join(root, 'assets/example.txt'), 'Static bytes.');
    await build(root, { ...config, indexable: false });
    assert.match(await readFile(join(root, 'public/robots.txt'), 'utf8'), /Disallow: \//);
    assert.match(await readFile(join(root, 'public/index.html'), 'utf8'), /noindex,nofollow/);
    assert.match(await readFile(join(root, 'public/404.html'), 'utf8'), /noindex,nofollow/);
    assert.equal(await readFile(join(root, 'public/assets/example.txt'), 'utf8'), 'Static bytes.');
  } finally {
    await cleanup(root);
  }
});
test('the site names its own files after their content and leaves author assets alone', async () => {
  const root = await fixture();
  try {
    await writeFile(join(root, 'assets/photo.png'), 'Author bytes.');
    await writeFile(
      join(root, 'styles/tokens.css'),
      "@font-face { src: url('/assets/fonts/anq-serif.woff2'); }",
    );
    await build(root, config);
    const page = await readFile(join(root, 'public/index.html'), 'utf8');
    const tokens = page.match(/styles\/tokens\.[0-9a-f]{10}\.css/)![0];
    const css = await readFile(join(root, 'public', tokens), 'utf8');
    const font = css.match(/assets\/fonts\/anq-serif\.[0-9a-f]{10}\.woff2/)![0];
    await lstat(join(root, 'public', font));
    await lstat(join(root, 'public/assets/photo.png'));
    await assert.rejects(lstat(join(root, 'public/styles/tokens.css')));
  } finally {
    await cleanup(root);
  }
});
test('configuration rejects unsafe/incompatible URLs, unknown keys and invalid page sizes', () => {
  for (const url of [
    'http://example.com',
    'https://example.com/blog',
    'https://user:password@example.com',
    'https://example.com?query=1',
  ])
    assert.throws(() => validateConfig({ ...config, url }));
  assert.throws(() => validateConfig({ ...config, postsPerPage: 0 }));
  assert.throws(() => validateConfig({ ...config, unknown: true }));
  assert.equal(
    validateConfig({ ...config, url: 'https://example.com/' }).url,
    'https://example.com',
  );
});
test('link audit handles encoded paths/fragments and rejects missing alt/duplicate IDs', () => {
  checkLinks(
    new Map([
      ['index.html', '<a href="/about/#a%20b">About</a>'],
      ['about/index.html', '<h1 id="a b">About</h1>'],
    ]),
    config.url,
  );
  assert.throws(
    () =>
      checkLinks(
        new Map([
          ['index.html', '<img src="/assets/x.png">'],
          ['assets/x.png', 'bytes'],
        ]),
        config.url,
      ),
    /alt text/,
  );
  assert.throws(
    () =>
      checkLinks(new Map([['index.html', '<h1 id="same">A</h1><h2 id="same">B</h2>']]), config.url),
    /duplicate id/,
  );
});

test('external images fail validation before replacing the previous site', async () => {
  const root = await fixture();
  try {
    await post(root, 'local');
    await build(root, config);
    const before = await snapshot(join(root, 'public'));
    await post(root, 'external', {}, '![Example](https://elsewhere.example/picture.png)');
    await assert.rejects(build(root, config), /external images/);
    assert.deepEqual(await snapshot(join(root, 'public')), before);
  } finally {
    await cleanup(root);
  }
});
