# Working on ANQ Notes

Read README.md and CONTRIBUTING.md. This is a
cloneable source project, not an npm CLI service. Keep the v1 source easy to read:
content parsing, sanitized rendering, build orchestration and a local preview.
Do not add a plugin framework, client bundle or external service speculatively.

Keep the portfolio-family token names in styles/tokens.css; page rules belong in
styles/site.css. Never insert unescaped metadata into generated HTML/XML. Content
must pass sanitization. Do not execute front matter or follow source symlinks.
Preserve a previous successful public/ on validation failure and refuse unmanaged
output. Tests use temporary directories; never reset archived or user content.

Run npm run check and relevant browser checks for product changes. Container
changes need the isolated container check. Keep screenshots fictional. Preserve
Git signing settings; do not disable signing if its key is locked. GitHub/domain
publication remains outside the current local work.
