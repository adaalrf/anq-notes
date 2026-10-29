import config from '../site.config.js';
import { build } from './build.js';
try {
  const result = await build(
    process.cwd(),
    process.env.SITE_URL ? { ...config, url: process.env.SITE_URL } : config,
  );
  console.log(
    `Built ${result.pages} pages, ${result.posts} posts, ${result.tags} topics (${result.files} files) into public/.`,
  );
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
