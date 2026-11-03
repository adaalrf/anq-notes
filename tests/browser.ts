import { checkNavigationTheme } from './navigation-theme.js';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createPreview } from '../src/serve.js';
import { build } from '../src/build.js';
import config from '../site.config.js';
const server = process.env.PREVIEW_URL ? undefined : createPreview(resolve('public'));
if (server) {
  await build(process.cwd(), config);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
}
const origin =
  process.env.PREVIEW_URL || `http://127.0.0.1:${(server!.address() as { port: number }).port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  args: process.env.TEST_HOST_RESOLVER_RULES
    ? [`--host-resolver-rules=${process.env.TEST_HOST_RESOLVER_RULES}`, '--no-proxy-server']
    : [],
});
try {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    ignoreHTTPSErrors: process.env.TEST_IGNORE_HTTPS_ERRORS === '1',
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin);
  await expect(page.getByRole('switch', { name: 'Dark mode' })).toBeHidden();
  await expect(
    page.getByRole('heading', { name: 'A notebook for things worth keeping.', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Writing', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Writing', exact: true })).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Writing', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.post-card')).toHaveCount(4);
  await page.getByRole('link', { name: 'Older posts', exact: true }).click();
  await expect(page.getByText('Page 2 of 2', { exact: true })).toBeVisible();
  await expect(page).toHaveTitle('Writing — Page 2 · ANQ Notes');
  await expect(page.locator('.post-card')).toHaveCount(2);
  await page.getByRole('link', { name: 'Read Starting with a good default', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Starting with a good default', exact: true }),
  ).toBeVisible();
  await expect(page.locator('pre')).toContainText('npm run build');
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Writing', exact: true }),
  ).toHaveAttribute('aria-current', 'true');
  await page
    .getByRole('navigation', { name: 'More writing' })
    .getByRole('link', { name: /Newer note/ })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(
    'Starting with a good default',
  );
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Starting with a good default');
  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Notes', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Older posts', exact: true }).click();
  await page.reload();
  await expect(page.getByText('Page 2 of 2', { exact: true })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Topics', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Topics', exact: true })).toBeVisible();
  await expect(page.locator('.topic')).toHaveCount(4);
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'About this notebook.', exact: true }),
  ).toBeVisible();
  const response = await page.goto(origin + '/missing/');
  assert.equal(response!.status(), 404);
  await expect(page.getByRole('heading', { name: 'Page not found.', exact: true })).toBeVisible();
  // XML parser checks need script evaluation, in a separate enabled context.
  const scanContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      ignoreHTTPSErrors: process.env.TEST_IGNORE_HTTPS_ERRORS === '1',
    }),
    scan = await scanContext.newPage();
  // Navigate normally: the static site's CSP intentionally forbids fetch().
  const xml: string[] = [];
  for (const path of ['/rss.xml', '/sitemap.xml']) {
    const response = await scan.goto(origin + path);
    assert.equal(response?.status(), 200);
    xml.push(await response!.text());
  }
  const [rss, sitemap] = xml;
  await scan.goto(origin);
  for (const xml of [rss, sitemap])
    assert.equal(
      await scan.evaluate(
        (value) =>
          new DOMParser().parseFromString(value, 'application/xml').querySelector('parsererror') !==
          null,
        xml,
      ),
      false,
    );
  assert.equal(
    await scan.evaluate(
      (value) =>
        new DOMParser().parseFromString(value, 'application/xml').querySelectorAll('item').length,
      rss,
    ),
    6,
  );
  await mkdir('test-results', { recursive: true });
  for (const route of [
    '/',
    '/blog/',
    '/tags/',
    '/blog/a-small-visual-vocabulary/',
    '/about/',
    '/404.html',
  ]) {
    await scan.goto(origin + route);
    await expect(scan.locator('script')).toHaveCount(1);
    await expect(scan.locator('script')).toHaveAttribute('src', '/assets/theme.js');
    const result = await new AxeBuilder({ page: scan })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    assert.deepEqual(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      [],
      route,
    );
    for (const width of [390, 768]) {
      await scan.setViewportSize({ width, height: 844 });
      assert.equal(
        await scan.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${route} overflow at ${width}`,
      );
    }
    await scan.setViewportSize({ width: 1440, height: 1000 });
  }
  await scan.goto(origin + '/blog/');
  await scan.screenshot({ path: 'test-results/writing-desktop.png', fullPage: true });
  await scan.setViewportSize({ width: 390, height: 844 });
  await scan.goto(`${origin}/blog/`);
  // Standalone controls meet the family's 44px target; links inside a sentence are exempt.
  assert.deepEqual(
    await scan.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('main a, header a, footer a')]
        .filter((control) => {
          const sentence = control.closest('p, li');
          return !sentence || sentence.textContent!.trim() === control.textContent!.trim();
        })
        .filter((control) => control.getClientRects().length)
        .filter(
          (control) =>
            Math.max(
              control.getBoundingClientRect().height,
              parseFloat(getComputedStyle(control, '::after').height) || 0,
            ) < 44,
        )
        .map((control) => control.className + ':' + control.textContent!.trim().slice(0, 24)),
    ),
    [],
  );
  // Pagination sits evenly between the last post's rule and the footer.
  for (const path of ['/blog/', '/blog/page/2/']) {
    await scan.goto(origin + path);
    const gaps = await scan.evaluate(() => {
      const nav = document.querySelector('.pagination')!.getBoundingClientRect();
      const posts = [...document.querySelectorAll('.post-card')];
      const above = posts.at(-1)!.getBoundingClientRect().bottom;
      const below = document.querySelector('.site-footer')!.getBoundingClientRect().top;
      const label = document.querySelector('.pagination > :nth-child(2)')!;
      const middle = label.getBoundingClientRect();
      return {
        above: nav.top - above,
        below: below - nav.bottom,
        offCentre: middle.left + middle.width / 2 - (nav.left + nav.width / 2),
        offRule: nav.left - posts.at(-1)!.getBoundingClientRect().left,
      };
    });
    assert.ok(Math.abs(gaps.above - gaps.below) < 2, `${path} ${JSON.stringify(gaps)}`);
    assert.ok(Math.abs(gaps.offCentre) < 1, `${path} ${JSON.stringify(gaps)}`);
    assert.ok(Math.abs(gaps.offRule) < 1, `${path} ${JSON.stringify(gaps)}`);
  }
  // Short pages keep the footer at the bottom of the screen.
  await scan.setViewportSize({ width: 1556, height: 1400 });
  for (const path of ['/tags/', '/about/', '/missing/', '/blog/page/2/']) {
    await scan.goto(origin + path);
    const under = await scan.evaluate(
      () => innerHeight - document.querySelector('.site-footer')!.getBoundingClientRect().bottom,
    );
    assert.ok(Math.abs(under) < 2, `${path} leaves ${under}px under the footer`);
  }
  // Every rule on the page starts and ends with the content.
  for (const width of [1556, 390]) {
    await scan.setViewportSize({ width, height: 844 });
    await scan.goto(`${origin}/blog/`);
    const edges = await scan.evaluate(() =>
      ['.site-header', '.post-card', '.pagination', '.site-footer'].map((selector) => {
        const { left, right } = document.querySelector(selector)!.getBoundingClientRect();
        return [Math.round(left), Math.round(right)];
      }),
    );
    assert.deepEqual(new Set(edges.map(String)).size, 1, JSON.stringify(edges));
    await scan.goto(`${origin}/blog/one-build-many-static-hosts/`);
    const postEdges = await scan.evaluate(() =>
      ['.site-header', '.adjacent-posts', '.site-footer'].map((selector) => {
        const { left, right } = document.querySelector(selector)!.getBoundingClientRect();
        return [Math.round(left), Math.round(right)];
      }),
    );
    assert.deepEqual(new Set(postEdges.map(String)).size, 1, JSON.stringify(postEdges));
  }
  // The Top button stays out of the way until the reader has scrolled.
  const top = scan.getByRole('link', { name: 'Back to top', exact: true });
  await expect(top).toBeHidden();
  await scan.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  await expect(top).toBeVisible();
  await scan.screenshot({ path: 'test-results/writing-mobile.png', fullPage: true });
  await scan.goto(origin + '/blog/a-small-visual-vocabulary/');
  await scan.screenshot({ path: 'test-results/post-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  await checkNavigationTheme(scan, origin, false);
  console.log(
    'Browser passed: JS-disabled navigation, post/topic pagination, Markdown/HTML pages, XML parsing, 404, mobile overflow and accessibility scans of six views.',
  );
} finally {
  await browser.close();
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
}
