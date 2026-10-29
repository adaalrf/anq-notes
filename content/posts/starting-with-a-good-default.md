---
title: Starting with a good default
description: A small site should give its author a clear place to begin.
date: 2026-10-20
tags: [Notes, TypeScript]
---

A good default is not the final design. It is a place where the next decision is
small enough to make with confidence.

## The short path

1. Set the title, description, and canonical URL in `site.config.ts`.
2. Edit the pages in `content/pages/`.
3. Add a Markdown file to `content/posts/`.
4. Run `npm run build` and preview the result.

```sh
npm ci
npm run build
npm run dev
```

The generated `public/` directory is disposable build output. The source content
is the part you keep.

## A useful boundary

Keep authoring and deployment separate. The generator creates a set of files;
a static host serves them. Neither needs to know the other's internals.
