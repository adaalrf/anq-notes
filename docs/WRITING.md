# Writing with ANQ Notes

## Make it yours

1. Edit `site.config.ts`: name, description, author and canonical HTTPS domain.
2. Edit `content/pages/index.md`, the HTML about page, and the sample attribution
   in `templates/layout.html`.
3. Replace the fictional starter posts in `content/posts/`.
4. Adjust `styles/tokens.css`, then `styles/site.css` for component and layout rules.
5. Run `npm run check` and inspect the output.

The default canonical URL is `https://example.com`, and `indexable: false` keeps the
starter out of search indexes. Change both deliberately when preparing a launch.
This project doesn't change DNS or publish anything itself.

## Pages and posts

Pages accept `.md` or `.html`; posts accept `.md`. Both start with YAML front
matter. Each lives directly in its folder; nested content folders aren't supported.

```md
---
title: A useful observation
description: A short plain-text description used on cards and in feeds.
date: 2026-10-27
tags: [Notes, Design]
draft: false
---

A paragraph with **emphasis** and a [link](/about/).

## A clear heading

More detail belongs here.
```

`title` and `description` are required. Posts also require a real `YYYY-MM-DD`
date. Pages omit dates and tags. The optional `slug` overrides the filename; use
lowercase letters and digits separated by single hyphens. `index` is the homepage.
Posts render at `/blog/slug/`; other pages render at `/slug/`.

## Drafts, dates and topics

Use `draft: true` to exclude a document from every generated page and feed. Draft
metadata is still validated. Dates control ordering; they don't schedule future
publication. Posts are ordered by descending date, then ascending slug for ties.

Topics are ordered by their normalized URL slug. Conflicting labels produce an
error rather than silently sharing a URL, so keep topic names consistent (for
example `Design`).

## Headings, links and images

The layout already provides the page title as `h1`, so start body sections at `h2`.
Markdown headings receive unique IDs for fragment links. Internal links must point
to generated URLs, including trailing slashes for page directories.

Images need alt text, or `alt=""` for decoration. Put local images, fonts and files
in `assets/` and link them as `/assets/filename`.

## What's allowed in content

Content HTML is sanitized: scripts, handlers, inline styles and unsafe link
protocols are removed. That still leaves prose, code, tables, images and semantic
HTML pages. There is no executable front matter.
