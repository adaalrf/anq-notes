## Interface release — 2026-10-28

Live at https://notes.demo.adaalrf.dev through ANQ Publish, revision 2.
The reviewed page/component organization and navigation changes are deployed.
Readiness and public read-only browser/mobile checks passed. Automated accessibility
scans passed the public homepage. Existing fictional records and authentication
settings were preserved. GitHub publication remains separate.

Image: `localhost/anq-notes@sha256:101d17aabb1bb93d2a3b54fa9a4eacc3f3770f6e5ac8fc1738e36b3c716dcfd6`

Previous image retained for rollback: `localhost/anq-notes@sha256:f9144448ba5b325a1e78bf561f12c80a486c8a2d26250cb6c6ecda404e549dc8`

The release uses `SITE_URL=https://notes.demo.adaalrf.dev`; canonical links and
XML URLs use that origin. The demo remains noindex. The full JS-disabled browser,
pagination, feed/XML, 404 and accessibility suite passed over public HTTPS.

## Notes source and navigation review — local, 2026-10-28

Moved generated content/post/listing/topic/404 HTML out of build.ts into src/pages/.
Shared headings, cards and pagination live in src/components/. Document layout,
sanitation and escaping remain in render.ts, with the editable HTML shell in
templates/layout.html. No new dependencies or browser JavaScript.

Added active Writing/Topics/About section attributes, focusable main skip target,
distinct browser titles for later list pages, All topics links and newer/older
published-note navigation in existing deterministic date/slug order. Drafts stay
excluded; output-preservation and source-safety guarantees remain tested.

Passed npm run check (format, types, 15 build/preview tests, sample build), full
JavaScript-disabled browser navigation/pagination/XML/404 suite and accessibility/
responsive checks. Added skip-focus, active-section, paginated-title and adjacent
note assertions; corrected the browser test to follow Newer from the oldest sample.
Production-container check passed with unprivileged read-only runtime and dropped
capabilities. Mobile reading screenshot visually reviewed; fictional docs screenshots
refreshed. Preview http://localhost:5176 (session 59340), local image
localhost/anq-notes:interface-review. No public deployment, GitHub writes or content
resets. Blog's prior pass also remains local; portfolio is already deployed.
Earlier notes below are historical.

# Disposable deployment — 2026-10-27

> Earlier disposable deployment evidence uses the pre-ANQ namespace. The current
> local source has been renamed; this record does not claim a new deployment.

The fictional sample runs as the registered web-publish app `anq-blog-ssg` on the
existing Ubuntu 24.04 disposable VPS. A dedicated Unix account runs the pinned
Caddy image as an unprivileged user with a read-only filesystem, dropped
capabilities and temporary writes under `/tmp`. No database or persistent volume.

The workstation-built image was sent through an SSH tunnel to the loopback-only
registry. The web-publish node agent deployed its immutable digest, recorded the
operation, and passed normal container and HTTPS readiness checks. The internal
TLS hostname `https://ssg.web-publish.invalid` is for testing, not public DNS.

The complete browser suite passed against that deployment: JavaScript-disabled
navigation, post/topic pagination, Markdown/HTML pages, actual deployed RSS and
sitemap XML, real 404, mobile overflow and accessibility scans of six views.
Its readiness also returned after a VPS reboot before any administrative SSH login.

To repeat against the authorized disposable endpoint:

```sh
PREVIEW_URL=https://ssg.web-publish.invalid \
TEST_HOST_RESOLVER_RULES='MAP ssg.web-publish.invalid 95.217.135.13' \
TEST_IGNORE_HTTPS_ERRORS=1 npm run test:browser
```

These explicit browser-only settings handle internal test certificates and
reserved hostname resolution. Default tests still use a local preview and normal
certificate verification. No server policy is weakened. Without PREVIEW_URL the
suite builds the source before starting its temporary preview.

The publication remains noindex with fictional content and the starter canonical
URL. Public hostname/canonical configuration, GitHub publication and actual-domain
launch are separate work. No path-prefix support was added just for this host.

## Recorded release

Node registration `anq-blog-ssg`, revision `1`, image:

```text
localhost:5000/anq-blog-ssg@sha256:7b8099bd564ccff3bc3237e8b6dca4f2e78e319679a07836ff1b1fc4c8b7d9db
```
