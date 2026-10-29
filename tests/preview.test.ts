import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, symlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createPreview } from '../src/serve.js';
import { build } from '../src/build.js';
import { fixture, cleanup, config } from './fixtures.js';
let root: string, origin: string, server: ReturnType<typeof createPreview>;
before(async () => {
  root = await fixture();
  await build(root, config);
  await writeFile(join(root, 'private.txt'), 'Do not serve this.');
  await mkdir(join(root, 'public/assets'), { recursive: true });
  await symlink(join(root, 'private.txt'), join(root, 'public/assets/leak.txt'));
  server = createPreview(join(root, 'public'));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
after(async () => {
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  await cleanup(root);
});
test('preview serves HTML/CSS/XML and redirects directory paths', async () => {
  assert.equal((await fetch(origin + '/')).status, 200);
  assert.match(
    (await fetch(origin + '/styles/site.css')).headers.get('content-type')!,
    /text\/css/,
  );
  assert.match((await fetch(origin + '/rss.xml')).headers.get('content-type')!, /application\/xml/);
  const redirect = await fetch(origin + '/blog?test=1', { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/blog/?test=1');
});
test('preview returns a real 404, supports HEAD and rejects mutations', async () => {
  const missing = await fetch(origin + '/missing/');
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Page not found/);
  assert.equal(await (await fetch(origin + '/', { method: 'HEAD' })).text(), '');
  assert.equal((await fetch(origin + '/', { method: 'POST' })).status, 405);
});
test('preview denies dotfiles, traversal, malformed encoding and symlink escapes', async () => {
  for (const path of ['/.anq-ssg-output', '/%2e%2e%2fprivate.txt', '/assets/leak.txt']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 404);
    assert.ok(!(await response.text()).includes('Do not serve this.'));
  }
  assert.equal((await fetch(origin + '/%E0%A4%A')).status, 400);
});
