---
title: Leave the last good build alone
description: A broken link should fail a build, not replace the site with partial output.
date: 2026-10-25
tags: [Notes, Operations]
---

A build can fail halfway through reading content. Replacing the output before
validation turns an ordinary authoring error into a broken preview.

## Validate, then publish

The generator prepares its output, checks internal links, and writes to a staging
directory. Only a completed build replaces the generated public directory.

## Recoverable mistakes

Duplicate slugs, malformed dates, missing fragments, and unknown configuration
keys produce errors. Fix the source and build again. The previous output remains
available while you do so.
