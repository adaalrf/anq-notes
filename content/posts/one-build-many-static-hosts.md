---
title: One build, many static hosts
description: Plain files make a useful deployment contract.
date: 2026-10-24
tags: [Notes, Operations]
---

The public directory contains HTML, CSS, assets, an RSS feed, and a sitemap.
It needs a static HTTP server, not a running Node application.

## Keep the boundary small

| Build time                | Visitor time         |
| ------------------------- | -------------------- |
| Node and TypeScript       | An ordinary browser  |
| Markdown and front matter | HTML and CSS         |
| Validation                | Static file requests |

## Preview honestly

The included preview server binds to loopback. It helps an author inspect the
output; production hosting belongs to the publishing system.
