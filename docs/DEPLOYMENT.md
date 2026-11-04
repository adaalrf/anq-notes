# Deploying ANQ Notes

## Static hosting

Set the canonical HTTPS origin in `site.config.ts` or with
`SITE_URL=https://notes.example.com npm run build`. Enable `indexable` deliberately;
the fictional starter defaults to noindex. Publish the contents of `public/` at
the domain root. Configure missing routes to serve `404.html` with status 404.
The output needs no Node process, database, or browser JavaScript. URL-prefix
hosting isn't supported, so serve the site at a domain or subdomain root.

`SITE_URL` overrides the canonical origin for a release without editing the starter
configuration, and containers accept the same value as a build argument. The usual
HTTPS-origin validation applies. It doesn't change `indexable`.

Keep content, configuration, templates and local assets in version control.
Generated output can be rebuilt; never treat edits to `public/` as source changes.
A failed local build preserves the previous output, but production upload and
rollback still depend on the host's deployment mechanism.

## Container

```sh
podman build --build-arg SITE_URL=https://notes.example.com -t localhost/anq-notes:release .
npm run test:container
```

The pinned multi-stage image serves static files through Caddy as UID 1000 on
port 8080. `/healthz` returns 200. It supports a read-only filesystem with writable
`/tmp` and dropped capabilities. There are no migrations or persistent volumes.
Keep assets local to satisfy the supplied Content Security Policy. Use HTTPS at
the public reverse proxy. Don't deploy the source, credentials, `node_modules` or
the development preview server.

After release, check canonical/feed/sitemap URLs, the 404 status, asset loading
and indexing rules. Rollback replaces the static image or hosted output.
