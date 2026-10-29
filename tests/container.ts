import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
const name = `anq-ssg-check-${randomUUID()}`;
const origin = 'http://127.0.0.1:18087';
const image = process.env.CONTAINER_IMAGE || 'localhost/anq-notes:v1';
const podman = (args: string[]) =>
  execFileSync('podman', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
let started = false;
try {
  await new Promise<void>((resolve, reject) => {
    const probe = createServer();
    probe.once('error', () =>
      reject(new Error('Port 18087 is occupied; its owner was left running.')),
    );
    probe.listen(18087, '127.0.0.1', () => probe.close(() => resolve()));
  });
  podman([
    'run',
    '-d',
    '--name',
    name,
    '--read-only',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--tmpfs',
    '/tmp:rw,noexec,nosuid,size=64m',
    '-p',
    '127.0.0.1:18087:8080',
    image,
  ]);
  started = true;
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(origin + '/healthz')).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'Static container did not become healthy');
  const info = JSON.parse(podman(['inspect', name]))[0];
  assert.equal(info.Config.User, '1000:1000');
  assert.equal(info.HostConfig.ReadonlyRootfs, true);
  const home = await fetch(origin + '/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /A notebook for things worth keeping/);
  assert.match(home.headers.get('content-security-policy')!, /default-src 'none'/);
  assert.equal((await fetch(origin + '/styles/site.css')).status, 200);
  assert.equal((await fetch(origin + '/rss.xml')).status, 200);
  const missing = await fetch(origin + '/missing/');
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Page not found/);
  assert.equal((await fetch(origin + '/.anq-ssg-output')).status, 404);
  podman(['exec', name, 'test', '!', '-e', '/app']);
  console.log(
    'Static production container passed: unprivileged/read-only runtime, dropped capabilities, health, HTML/CSS/RSS, real 404, output-marker hiding and no source/toolchain directory.',
  );
} finally {
  if (started) spawnSync('podman', ['rm', '-f', name], { stdio: 'pipe' });
}
