# Developing ANQ Notes

With Node.js 24+ and npm, run `npm ci`, then `npm run dev`. Open
http://localhost:5176. The preview builds once; run `npm run build` after editing
and refresh. It is a cloneable publication project, not an installed npm CLI.

| Change                                      | Source                             |
| ------------------------------------------- | ---------------------------------- |
| Site title, author and canonical origin     | `site.config.ts`                   |
| Writing and static pages                    | `content/posts/`, `content/pages/` |
| Generated page templates                    | `src/pages/`                       |
| Repeated cards, headings and pagination     | `src/components/`                  |
| Document shell                              | `templates/layout.html`            |
| Content parsing and metadata                | `src/content.ts`                   |
| Markdown rendering, sanitation and escaping | `src/render.ts`                    |
| Build orchestration and output validation   | `src/build.ts`                     |
| CLI/build entry and local server            | `src/cli.ts`, `src/serve.ts`       |
| Tokens and page styles                      | `styles/`                          |
| Images and static files                     | `assets/`                          |

`public/` is generated; change source instead. Keep plain HTML output usable
without browser JavaScript. Author content remains data, while the configuration
and templates are trusted code. Reject source symlinks and unsafe output targets;
a failed build must preserve a previous successful generated site.

Run `npm run check` (format, types, isolated build/preview tests and sample build).
For browser/navigation changes run `npm run test:browser`; install Chromium with
`npx playwright install chromium`, or set `CHROMIUM_EXECUTABLE` on NixOS. The
browser checks use temporary fictional publications. Container changes also need
`npm run test:container` with rootless Podman. Read the README scope before
adding features. Keep screenshots fictional and preserve Git signing settings.

For visual changes, use the local CSS tokens and preserve contrast, visible
keyboard focus, readable errors and text labels for status. Colour alone must
not convey state. Keep screenshots fictional.
