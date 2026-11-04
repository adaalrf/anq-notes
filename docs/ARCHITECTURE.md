# Architecture

## Source layout

```text
site.config.ts    Small typed site configuration
content/pages/    Markdown and HTML pages
content/posts/    Markdown posts with YAML metadata
styles/           Shared visual tokens and page/component CSS
templates/        One HTML layout
assets/           Static files copied into output; the site's own get hashed names
src/
  pages/          Content page, post, listing, topics and 404 HTML
  components/     Shared headings, post cards and pagination
  build.ts        Filesystem orchestration, routes, feeds and output replacement
  render.ts       Sanitized Markdown, metadata escaping and document layout
  content.ts      Front matter parsing and published content ordering
  links.ts        Generated link, fragment and image checks
  config.ts       Typed site configuration validation
  cli.ts          Build entry point
  serve.ts        Local preview server
tests/            Integration, preview, browser and container checks
public/           Generated output; ignored by Git
```

## Trust

The template, configuration and build source are trusted project code. Author
content is treated as data: it's parsed, validated and sanitized. This isn't an
untrusted-upload service.

## The theme and layout

The theme uses the same token names, typography and spacing conventions as the rest
of the ANQ family. Keep colour, font and spacing roles in `tokens.css`, page
structure in `site.css`, and author prose in `content/`.

Layout placeholders are `{{title}}`, `{{siteTitle}}`, `{{description}}`,
`{{canonical}}`, `{{language}}`, `{{author}}`, `{{robots}}` and `{{body}}`. Metadata
is escaped, and body HTML has already been sanitized. The optional
`{{writingCurrent}}`, `{{topicsCurrent}}` and `{{aboutCurrent}}` placeholders emit
trusted current-section attributes for the standard navigation. Update the layout
navigation when adding or removing pages.

## Building

A build validates metadata, URLs, output collisions, links and fragments, duplicate
IDs, image alt attributes and same-origin image sources before publishing output.
Generated paths, file ordering and RSS dates are deterministic. RSS includes the
latest 20 posts; the sitemap includes published pages, listings and topics, and
excludes the 404 page. External links aren't fetched or checked. External images are
rejected, because the supplied container permits only local images.

An invalid build leaves the previous generated site in place. A successful build
replaces it and removes stale generated routes. `public/` must be absent or contain
this generator's ownership marker; an unknown existing directory is preserved.

## Recovery

Builds use a lock, a staging directory and a rename with a previous-output fallback.
This is local build protection, not a production deployment transaction. If a
process crashes, confirm no build is running before removing the stale
`.anq-build.lock`. Inspect leftover `.anq-build-*` and `.anq-previous-*` directories
before recovery; the generator never silently adopts unmanaged output. Source and
asset symlinks are rejected.
