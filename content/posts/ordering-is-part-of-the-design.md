---
title: Ordering is part of the design
description: Predictable output makes it easier to review a generated site.
date: 2026-10-23
tags: [Notes, TypeScript]
---

Two posts can share a date. If their order depends on the filesystem, a rebuild
can produce an unrelated diff.

## Name the tie breaker

This generator orders posts by date, newest first, then by slug. Tags and routes
also have explicit ordering. The same content and configuration produce the same
file contents.

## Leave out the clock

Generated feeds do not need to insert the current build time. The date of the
latest published post is a stable and meaningful alternative.
