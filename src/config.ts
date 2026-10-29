import { z } from 'zod';
const schema = z
  .object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(300),
    url: z
      .string()
      .url()
      .refine((value) => {
        const url = new URL(value);
        return (
          url.protocol === 'https:' &&
          url.pathname === '/' &&
          !url.search &&
          !url.hash &&
          !url.username &&
          !url.password
        );
      }, 'Use an HTTPS domain root, without credentials, a path, query or fragment.'),
    author: z.string().trim().min(1).max(100),
    language: z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/),
    postsPerPage: z.number().int().min(1).max(50),
    indexable: z.boolean(),
  })
  .strict();
export type SiteConfig = z.infer<typeof schema>;
export function validateConfig(raw: unknown): SiteConfig {
  const config = schema.parse(raw);
  return { ...config, url: new URL(config.url).origin };
}
