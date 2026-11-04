# ANQ Notes

[![Checks](https://github.com/adaalrf/anq-notes/actions/workflows/check.yml/badge.svg)](https://github.com/adaalrf/anq-notes/actions/workflows/check.yml)

A small static site generator, first made for a tiny web server that couldn't run
Node.

[Read the sample publication](https://notes.demo.adaalrf.dev) · [Read the case study](https://adaalrf.dev/work/anq-notes/)

![The sample writing page, with fictional posts](docs/screenshots/writing-desktop.png)

The sample publication is fictional, and it's built from the files in this
repository.

## Why it exists

It started with a very small web server that couldn't run Node, so a site for it
had to be plain files. That turned into an interest in small sites that load
quickly, and in what a generator actually has to do to produce them.

Turning a folder of text into a website sounds like a small job, but the interesting
questions turn up once you try it. What should happen when a build fails halfway
through? When a link points at a page that doesn't exist? How do you let a post
contain HTML without letting it run scripts?

Building the generator was a way to find out. It isn't meant to replace an existing
one, but if it's useful to someone, that's a good thing.

## What it does

- Turns Markdown and HTML files into a complete site, with no JavaScript needed to
  read it.
- Adds a writing index, topics, pagination, an RSS feed and a sitemap.
- Checks links, images and metadata before anything is published.
- Keeps the last good site in place when a build fails.
- Removes scripts and other unsafe content from what's written.
- Keeps drafts out of every page and feed.

## How it works

A build happens in two steps. First it reads and checks everything, and writes the
result to a temporary folder. Only when the whole site is valid does that folder
replace the published one. A mistake in a post therefore stops the build, and the
previous site stays exactly as it was.

The output is plain HTML and CSS, so any static host can serve it, with no server
code or database behind it. The only script is an optional theme switch.

## Try it yourself

You'll need Node.js 26 or newer and npm. Then, from this directory:

```sh
npm ci
npm run dev
```

Open <http://localhost:5176>. The preview builds once, so after an edit, run
`npm run build` in another terminal and refresh. Press Ctrl-C to stop.

To make it your own, edit `site.config.ts`, then replace the fictional posts in
`content/posts/`. The [writing guide](docs/WRITING.md) has the details.

## Under the hood

Written in TypeScript. There's no framework, client bundle or plugin system; the
generator is a handful of small modules.

| Worth reading                          | Why                                       |
| -------------------------------------- | ----------------------------------------- |
| [`build.ts`](src/build.ts)             | Checks the whole site before replacing it |
| [`render.ts`](src/render.ts)           | Markdown, sanitizing and heading links    |
| [`links.ts`](src/links.ts)             | Finds broken links, fragments and images  |
| [`build.test.ts`](tests/build.test.ts) | What happens when content is wrong        |

## What it leaves out

This is a small project. There's no plugin system, scheduled publishing or nested
content folders, and it doesn't support hosting under a URL prefix. It trusts its
author: sanitizing protects the site from mistakes, and it isn't meant for content
uploaded by strangers.

## Going further

- [Writing](docs/WRITING.md): setting it up, and how posts and pages work
- [Architecture](docs/ARCHITECTURE.md): the source layout, build steps and recovery
- [Deployment](docs/DEPLOYMENT.md): static hosts and containers
- [Contributing](CONTRIBUTING.md): where things live and how to run the tests
- [Design](DESIGN.md): the visual rules

The [first public commit](https://github.com/adaalrf/anq-notes/commit/6a9584a) is a
squashed snapshot of earlier work; changes since then are recorded one by one.
