---
title: A small visual vocabulary
description: Shared colours, spacing, and type make a family of projects easier to maintain.
date: 2026-10-21
tags: [Notes, Design]
---

A quiet palette can do useful work. Pine green, pale paper, and a readable serif
heading provide continuity without deciding every detail in advance.

## Tokens before exceptions

The token file names roles rather than individual pages:

```css
--color-canvas: #f6f8f6;
--color-brand: #2b5947;
--space-5: 1.5rem;
```

A component asks for a surface or a spacing step. Later, changing the vocabulary
changes the whole site in a predictable way.

> Consistency leaves more attention for the words.

## Keep it local

A shared language does not require a shared package. Ordinary CSS variables are
quite enough for a small collection of projects.
