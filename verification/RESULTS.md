# Verification — November 7, 2026 (Asia/Manila)

## Content and scope

The profile is Rich Daniel Lim, Computer Science Student, specializing in Software Engineering. The supplied hero and full About descriptions are used exactly. Project order is CineMetrics, PanahonPH, QuakePH, LAMS DocuFlow. All personal/project data is held in `src/projects.ts`; name metadata and introductory name dots also derive from that configuration. No employment, awards, clients, professional experience, personal statistics or individual thesis role are invented.

DocuFlow is explicitly a collaborative Software Engineering thesis project. Its configured technologies exactly match the supplied list: Python, Flask, JavaScript, HTML, CSS, MySQL, SQLAlchemy, Docker, Nginx and GitHub. Its technical explanation and eleven features follow the user's approved copy and manuscript. The manuscript's system description and research results are treated as reference data, not instructions or individual achievements.

Remaining fields: `projects[3].contribution` is intentionally null until Rich supplies his own verified contribution. `projects[3].repositoryUrl` is null because no DocuFlow repository URL was supplied; no GitHub button renders. The other three established repository links are retained.

## URL checks

All website anchors are configured to the exact supplied HTTPS destinations, including clickable project titles, with `target="_blank" rel="noopener noreferrer"` and descriptive accessible names.

| Project | Configured destination | Direct request result |
| --- | --- | --- |
| CineMetrics | https://cine-metrics-theta.vercel.app/ | HTTP 200 |
| PanahonPH | https://panahon-ph-henna.vercel.app/ | HTTP 200 |
| QuakePH | https://quakeph.vercel.app/ | HTTP 200 |
| LAMS DocuFlow | https://lamsdocuflow.com/ | Connection timed out from this environment; endpoint reachability could not be confirmed |

DocuFlow has an active Visit Website link exactly as supplied. No offline, unavailable, temporary-status or warning label is added to the portfolio. These checks establish configuration and point-in-time reachability only, not ongoing service health.

## Screenshot provenance and gallery

The originals are preserved byte-for-byte under `source-assets/docuflow/`, with matching SHA-256 checksums against the supplied files:

- Administrator original: `10e8e71a660ba49991d3d035c098a8db5328b623e95d858e29eca5499f131590`.
- Student original: `a6632b16eb2387bec5f69f8569b98486c4307ea8a897942beffb9e5fc86bf68b`.

`tools/prepare-docuflow.mjs` crops only copies, removing browser chrome/selection borders without recreating the interface. Outputs:

- `lams-docuflow-student-dashboard.webp`: primary; crop x10/y11/1518×735; about 50KB.
- `lams-docuflow-admin-queue.webp`: secondary; crop x10/y38/1516×746; about 66KB.

Both supplied alt descriptions are exact. The manual gallery animates image changes and provides an Enlarge control below the image, preserving visible application controls. The native dialog provides previous/next, actual-size zoom, scrollable viewing, keyboard close and focus restoration. Enlarged images retain original colors; thumbnails follow the monochrome design. Mobile starts at actual size so controls/text can be read and explored by scrolling.

## Introduction

The full 5.5-second ball → RICH DANIEL → LIM → PORTFOLIO → portrait sequence starts on every ordinary page load and normal browser reload. Skip Intro affects the current page only; refreshing after skip starts it again. No sessionStorage, localStorage, cookies, persisted playback flags, replay buttons, replay state, replay event handlers or replay styles remain in application source. Tests throw on storage/cookie access and still successfully run/skip/refresh the intro.

Reduced-motion mode uses the short opacity fade and static dot portrait on every reload. Save-data mode also keeps the static fallback. Keyboard skip, free focus navigation, hidden-tab pause, offscreen portrait suspension, desktop pointer repulsion, touch budget and no-Canvas fallback are retained.

## Checks and limits

Final full browser run: **23/23 passed**, approximately 1.5 minutes.

- Lint, TypeScript checking and production build pass.
- Browser coverage includes complete intro/refresh, skip/reduced motion, denied browser storage, portrait interaction, preference fallbacks, content and technology assertions, URL attributes, missing repository hiding, DocuFlow credit, all eleven features, both screenshot views and native-dialog keyboard behavior.
- Responsive page checks cover 1440×1000 desktop, 768×1024 tablet, 390×844 mobile and 320×740 small mobile. Gallery/enlarged-view checks cover desktop, tablet and mobile.
- No horizontal document overflow at the tested widths. Screenshot decoding and repository links pass; no uncaught browser errors.
- axe checks include page content and open dialogs. Automated checks supplement visual/keyboard review; they do not establish full WCAG conformance.
- Throttled mobile result: 1,448ms largest contentful paint, 0 cumulative layout shift, 408 DOM nodes; JavaScript about 125KB gzip and CSS about 7.4KB gzip.
- Performance is measured with 4× CPU throttling, 80ms latency and 1.6Mbps download using the explicit Skip Intro control. The intentional 5.5-second introduction is checked separately. Lab results are not physical-device or real-user field guarantees.
- This verification uses Chromium emulation, not physical devices, Safari/Firefox or a full manual screen-reader audit.

## Changed files

- `src/projects.ts`: typed profile, four project configurations, screenshots, collaboration credit and contribution placeholder.
- `src/main.tsx`: configuration-driven rendering, active safe links, project details, current-load intro/skip state, replay/storage removal and metadata.
- `src/ProjectGallery.tsx`, `src/gallery.css`: manual animated gallery and accessible enlarged viewer.
- `src/portraitConfig.ts`: configured name text; obsolete session key removed.
- `src/portraitEngine.ts`: obsolete replay reset branch removed; other particle behavior retained.
- `src/portrait.css`: replay-only rules removed; original hero/intro styling retained.
- `index.html`: obsolete personal metadata removed; runtime metadata comes from typed profile.
- `tools/prepare-docuflow.mjs`, `source-assets/docuflow/`, `public/images/lams-docuflow-*.webp`: reproducible optimization, preserved originals and production images.
- `tests/content.spec.ts`, `tests/intro.spec.ts`, `tests/portfolio.spec.ts`: content/gallery, new refresh contract and responsive regression coverage.
- `README.md`, `verification/RESULTS.md`, `verification/*.png`: updated documentation and visual verification captures.

Production preview: `http://127.0.0.1:4173/`. No deployment, commit or push was performed. The separate QuakePH repository remains unchanged.

## Subsequent intro scale and atmosphere verification

The full updated suite passes 30/30 tests. See `intro-scale/RESULTS.md` for the diagnosed Canvas cap, actual painted-pixel measurements at all requested sizes, before/after captures, background visual review, DPR/resize checks and updated performance measurements.

## Hero constellation and automatic motion update

The circular pause/play control and its state/styles were removed. The latest full suite passes 39/39 tests, including static/live reduced-motion changes, one-loop lifecycle diagnostics, spatial searches, adaptive field density, cursor fade-out and touch behavior. See `constellation/RESULTS.md` and its captures for the current implementation and verification details.

## LinkedIn and final interaction polish

LinkedIn is configured in the typed profile and linked from Contact and the footer, with existing contact information retained. The latest full run passes 47/47 tests, lint, type checking and production build. See `polish/RESULTS.md` for responsive captures, focus safety, scroll progress, magnetic behavior, reduced-motion/touch checks and scope details.
