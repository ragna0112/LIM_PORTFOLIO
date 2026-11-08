# Rich Daniel Lim — Portfolio

Computer Science student specializing in Software Engineering. An original black-and-white portfolio for Software Engineering internship applications, with chrome typography, an interactive dot portrait, cinematic work showcases and accessible navigation.

## Run and verify

Use Node.js 22.12+ or 24+.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
npm run preview -- --port 4173
npx playwright install chromium
npm test
```

Production preview: `http://127.0.0.1:4173/`. No deployment, commit or push is performed by these commands.

## Content architecture

`src/projects.ts` contains the typed personal and project configuration: name, Computer Science course, Software Engineering specialization, hero/about copy, capabilities, project types and descriptions, technical description, key features, technologies, screenshots, website/repository links, collaborative credit and individual contribution field. Visual components render this configuration. The introduction name and page metadata also derive from it.

Projects are ordered CineMetrics, PanahonPH, QuakePH, LAMS DocuFlow. The first three retain their established GitHub repository URLs and use the supplied active Live Demo URLs. DocuFlow uses Visit Website and has a null repository URL, so its GitHub link is omitted. External links use `target="_blank" rel="noopener noreferrer"`.

DocuFlow is credited as a collaborative Software Engineering thesis project. `projects[3].contribution` is intentionally `null`: add a verified description of Rich's own contribution when supplied. It renders only when populated. No role or sole authorship is inferred. Its stack is Python, Flask, JavaScript, HTML, CSS, MySQL, SQLAlchemy, Docker, Nginx and GitHub.

## Intro and animation map

The full introduction plays on **every page load and refresh**. No browser storage or cookies control playback. Skip Intro affects only the current mount. There is no replay button, replay state or replay control styling. Reduced-motion users receive a short opacity fade with the static dot portrait on every load; save-data mode also uses the static fallback.

| Stage | Timing |
| --- | --- |
| White ball, controlled bounces, squash/stretch and fading trail | 0–1.5 seconds |
| RICH DANIEL from white dots | 1.5–2.5 seconds |
| LIM, reorganizing the same pool | 2.5–3.3 seconds |
| PORTFOLIO | 3.3–4.5 seconds |
| Scatter into the portrait; semantic hero fades in | 4.5–5.5 seconds |

The pool is one Canvas with up to 16,000 desktop / 9,500 tablet / 5,000 mobile dots; pixel ratio is capped at 1.5. Desktop repulsion is limited to the portrait silhouette with restrained spring return and face displacement. Touch uses ambient drift without continuous cursor tracking. Canvas frame scheduling stops offscreen and on hidden tabs. The intro timeline pauses while hidden. Framer Motion controls interface animation; no 3D or GSAP dependency is needed. Page scrolling is native.

Project entrances, subtle image parallax/tilt, ticker, capabilities accordion and contact section preserve the visual system. DocuFlow adds an animated manual gallery: student dashboard first, administrator queue second. Enlarge opens a keyboard-accessible native dialog with previous/next, actual-size zoom, scrolling, Escape close and restored focus. Mobile opens at actual size for readable controls and text. No automatic gallery rotation competes with reading.

## Adjustment files

- `src/portraitConfig.ts`: intro timings and word order, particle budgets, cursor radius, displacement, spring, damping and idle amplitude.
- `src/introText.ts`: measured Canvas ink fitting, responsive text targets, safe margins and adaptive dot sampling.
- `src/portraitEngine.ts`: Canvas bounce/text/morph/portrait rendering, sampling and interaction physics; shared constellation/light scheduling.
- `src/Atmosphere.tsx`, `src/atmosphere.css`: restrained radial spotlight, curved field lines, cursor light, periodic sweep and animated grain.
- `src/PortraitHero.tsx`: engine lifecycle and optimized static fallback.
- `src/main.tsx`: current-load intro state, keyboard skip, reduced-motion/data preferences and page composition.
- `src/portrait.css`: responsive portrait composition and intro overlay.
- `src/ProjectGallery.tsx`, `src/gallery.css`: screenshots, enlarged viewer, responsive gallery and project details.
- `tools/prepare-portrait.mjs`: local NEF decoding, crop, green-background suppression and fallback generation.
- `tools/prepare-docuflow.mjs`: reproducible screenshot crop and WebP generation.

## Reference and asset provenance

The screen recording is visual inspiration only; its branding, code, wording and assets are not copied. Portrait assets derive from the supplied NEF using local macOS ImageIO/Camera RAW decoding via `sips` and Sharp, without face generation, reshaping or original-file modification. Crop and source provenance are recorded in `portrait-source/preparation.json`.

DocuFlow descriptions use the user's approved copy, supported by `Lebyte_Manuscript_4thYearFinal.pdf`: PDF page 1 establishes the collaborative Computer Science / Software Engineering thesis; pages 124–126 describe Nginx, MySQL, Flask and SQLAlchemy; page 130 describes scheduling factors; page 142 describes status events, notifications and audit records. No manuscript instructions are treated as task instructions. No study statistics, individual roles, professional employment or performance achievements are added.

Both original DocuFlow screenshots are preserved unchanged under `source-assets/docuflow/`. Browser chrome, blue selection handles/borders and empty edges are cropped from optimized copies only:

- `public/images/lams-docuflow-student-dashboard.webp` — primary, 1518 × 735.
- `public/images/lams-docuflow-admin-queue.webp` — secondary, 1516 × 746.

The actual application interface is retained; no generated or recreated UI. Gallery images use the exact supplied alt text. Thumbnails follow the monochrome portfolio treatment; enlarged views retain the original application colors.

Other historical UI screenshots remain optimized derivatives of the original local project captures. Fonts are self-hosted WOFF2 files with licenses retained in `public/fonts/`.

See `verification/RESULTS.md` for checks, URL verification limits and screenshots. Browser tests use Chromium emulation, not physical mobile devices or a complete manual assistive-technology audit.

The introduction now uses one shared responsive font scale and capital grid for RICH DANIEL, LIM and PORTFOLIO. Their visible particle heights, dot sizes and sampling density match; widths differ naturally. `verification/intro-uniform/RESULTS.md` records the current pixel measurements and checks. Earlier `intro-scale` captures document the superseded per-word width fitting. Hero name typography, layout, portrait and project content are unchanged.


## Hero constellation background

The upper-right pause/play button, its icons, state, props, event handler, manual-only classes and reserved mobile spacing are removed. Animation runs automatically and follows system reduced-motion/data preferences. Skip Intro remains separate and accessible; intro timings, fitted words, refresh behavior and portrait sampling are retained.

`src/constellation.ts` defines a separate background particle model: 96 desktop, 60 tablet, and 34 mobile points. It uses delta-time drift, depth-dependent motion, bounded cursor repulsion and inertia, a spatial hash with limited nearest neighbors, and persistent connection alpha for smooth fade-out. Text areas are shaded to remain readable. Sustained slow/dropped frames automatically lower density while retaining coverage, with floors of 70 / 45 / 25 particles. The existing portrait Canvas and animation loop draw this background before the portrait; no second animated Canvas/RAF is added.

The silver portrait spotlight breathes on a 14-second cycle; a very faint horizontal sweep runs once every 13 seconds. Reduced motion/save-data paints a static constellation once per resize, with no RAF, cursor forces or sweep. Both Canvas paths cap pixel ratio at or below 2. Hidden/offscreen rendering and CSS motion are suspended. `verification/constellation/RESULTS.md` records visual review and regression checks.


## LinkedIn and interaction polish

`profile.linkedinUrl` in `src/projects.ts` holds the supplied LinkedIn profile. It is linked from Contact and the footer with safe new-tab attributes and a descriptive accessible label, alongside existing GitHub contact information. Let’s connect still navigates to Contact; LinkedIn is the first profile there.

`src/InteractionPolish.tsx` adds a functional 1.5px reading-progress indicator and restrained, delegated magnetic link movement (maximum 3px, fine pointers only). No extra animation loop or background layer is added. `src/polish.css` handles link underline/arrow feedback, focus safety and footer wrapping. Motion preferences and touch disable pointer-dependent movement. The existing Reveal entrance now combines opacity, clipping and a small vertical offset; media-only parallax remains gentle and disabled on touch/reduced-motion layouts. Thumbnails can restore color on desktop hover.

See `verification/polish/RESULTS.md` for the scoped changes, responsive captures and checks.

## Embedded HELLO WORLD game

`#game` is a playable section after Credentials and immediately before Contact/footer. The named section order is Hero → Work → About → Credentials → HELLO WORLD → Contact. It needs no navigation step, modal, page, or document scroll lock. The main navigation remains Work / About / Contact.

The existing Canvas renderer, movement/collisions, ordered HELLOWORLD collection, verified skill sequence and completion animation are reused. Start Game begins play; Stop and Escape pause with progress retained and focus Resume Game. Restart and Play Again reset without refreshing. Let’s Connect ↓ smoothly scrolls and moves focus to Contact (instant with reduced motion).

Keyboard controls are scoped to the focused game frame and only prevent arrow defaults while actively playing. Tabbing outside, losing browser focus, hiding the tab or moving far off-screen pauses without resetting. Mobile scrolling remains native except while touching a direction button. Direction controls occupy their own row below the arena and sit clear of the persistent contact button.

`src/playground/GameSection.tsx` reserves the frame and lazy-loads `HelloWorldGame.tsx` within 600px of view. The engine starts no RAF until play begins and the canvas is within 200px of view. Hidden/off-screen loops are canceled; repeated Start/Resume reuses one instance. A single cleanup removes observers/listeners/timers and RAF on unmount. No game dependency or persistent state is added.

Adjustment files:

- `src/playground/gameConfig.ts`: unchanged letter/skill positions, radii, DPR cap and nominal duration.
- `src/playground/gameModel.ts`: unchanged acceleration, collisions and ordered collection.
- `src/playground/gameEngine.ts`: reused rendering, new focus/visibility/viewport gating and pause/resume/restart.
- `src/playground/HelloWorldGame.tsx`: inline instructions, progress, touch controls and completion actions.
- `src/playground/GameSection.tsx`: editorial heading, lazy boundary and reserved layout.
- `src/playground/playground.css`: scoped frame and responsive layout.

Obsolete `PlaygroundEntry.tsx`, `entry.css` and modal component are removed. See `verification/embedded-game/RESULTS.md` for current validation. Earlier playground screenshots document the superseded modal version.

## Credentials and resume

`src/projects.ts` now holds the five selected credential records and the public resume URL/filename. `src/Credentials.tsx` renders editorial rows and one conditional native-dialog lightbox. `src/credentials.css` provides grayscale previews, restrained fine-pointer hover, visible focus, responsive stacking and reduced-motion treatment. The Credentials section sits immediately after About and before HELLO WORLD. The navigation remains unchanged.

Each preview and View Certificate button opens the complete matching proof, with a title/issuer/date caption, Close, Escape, backdrop dismissal, explicit Tab wrapping, native modal containment, fit/full-size zoom and mobile pinch/pan support. Closing restores the triggering button, body styles and exact scroll position. Certificate images reserve dimensions and lazy-load below the fold; full proofs load only when opened.

`tools/prepare-credentials.mjs` preserves all originals under `source-assets/credentials/`, renders the certificate PDFs locally with Poppler, then creates full WebP proofs and 480px previews with Sharp. It does not generate artwork or edit certificate content. Source hashes and image dimensions are recorded in `source-assets/credentials/manifest.json`.

Mapping: ADESQLCERTLIM.pdf → DataCamp SQL track; LIM_AI Fluency Certificate.pdf → Anthropic AI Fluency; LIM_SAPCERT_GENERATIVE_AI.jpg → SAP Generative AI Developer; Cert41733128407.pdf → PMI Project Management Ready; PythonCERTLIIM.pdf → Certiport Python. All five were visually identified. The Anthropic certificate itself is undated; the approved July 24, 2026 date is also supported by the supplied resume. The SAP row uses the exact user-requested title; the original certificate's printed wording remains unchanged. No credential IDs, scores, descriptions, expiration fields or unverified external verification actions are added.

The supplied two-page resume is copied byte-for-byte to `public/documents/Rich-Daniel-Lim-Resume.pdf`, with SHA-256 verification. It is linked from About, Contact and the footer, with download actions in Contact/footer. Its original contents are retained, including additional resume material excluded from the portfolio Credentials section. No resume information is copied into the profile, experience or game.

See `verification/credentials/RESULTS.md` for the complete asset mapping, generated filenames and checks. The later game-position update changes only placement and continuation UI; gameplay engine, model, configuration and CSS remain hash-identical. Current checks and preservation hashes are in `verification/game-position/RESULTS.md`.

## Header and page-section numbering

`src/sections.ts` is the single source for page IDs, labels, hrefs, eyebrow labels and numbers: Work 01, About 02, Credentials 03, Play 04 and Contact 05. Hero is unnumbered. Project-card and capability-item numbers remain separate; the capability section's stale page-number prefix is removed.

`src/Navigation.tsx` renders the right-aligned desktop header and an accessible native-dialog menu at widths up to 900px. The menu locks scrolling only while open, contains keyboard focus, supports Escape/Close, closes on selection or desktop resize and restores focus/scroll. Navigation selects real in-page sections, never launches the game. IntersectionObserver marks the visible numbered section with `aria-current="location"`; it does not write hashes while scrolling.

Header selections update the URL hash and focus the destination. Every full page load clears stale hashes with replaceState and keeps the intro at Home. Completion and Skip reveal Hero at scroll zero; subsequent header selections, hash changes and browser back/forward align normally below the sticky header. Reduced motion uses instant scrolling. `src/navigation.css` reserves the existing 86px / 72px header heights, aligns content with page margins, preserves quiet counters and hides the decorative cursor while interacting with the header.

Numbered eyebrows are rendered from the config in `src/main.tsx`, `src/Credentials.tsx` and `src/playground/GameSection.tsx`. See `verification/navigation/RESULTS.md` for header/numbering checks and `verification/intro-exit/RESULTS.md` for the current page-load/Home lifecycle.


## Uniform introduction typography

`INTRO_TEXT` in `src/introText.ts` owns the exact three phrases, existing Barlow Condensed family, weight 800, responsive `clamp(4.5rem, 14vw, 13rem)` starting size, 0.85 line box and -0.05em tracking. It measures all phrases after fonts are ready and reduces one shared size only when the widest word or line box needs viewport clearance. There is no LIM-specific scale or per-word coordinate scaling.

All three masks share their baseline, H-capital height, sampling rows/spacing and radius. Curved-glyph optical overshoot is sampled into the shared boundary cells so round letters do not gain extra visible rows; no font pixels are cropped from the offscreen mask. DPR affects only the visible canvas backing store. Resize/orientation regenerates all masks together.

`src/portraitEngine.ts` reuses the existing particle pool and timing/path choreography. Surplus particles fade to zero while still following mask targets; they fade back into the portrait during the existing final transition. They do not accumulate opacity into LIM. Font loading uses the same typography config and still waits for `document.fonts.ready`. `src/portraitConfig.ts` takes the exact phrase sequence from this config; all phase timings remain unchanged.


## Introduction exit position

`src/introScroll.ts` initializes before React renders section anchors. It sets native restoration to manual, clears the page-load hash with `history.replaceState()` while keeping pathname/query/history state, positions the page at zero and temporarily prevents background scrolling. Completion/Skip reset zero before reveal and once on the next frame, restore root styles and automatic restoration, and remove the temporary listeners. Refreshing midway through an intro also releases normally. The app uses native scrolling; there is no separate smooth-scroll controller.

`src/Navigation.tsx` no longer routes the initial hash after intro completion—the cause of the previous Work jump. Ordinary same-page header/hash/Back/Forward behavior still works, and the logo returns to Home with no section hash. Skip focuses the Home section with `preventScroll:true`; natural completion does not force focus. Typography, particle generation and timings are unchanged from the uniform-intro implementation. `verification/intro-exit/RESULTS.md` records the fix and checks.
