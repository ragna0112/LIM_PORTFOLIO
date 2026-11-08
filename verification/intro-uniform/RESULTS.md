# Uniform particle introduction typography

Updated 2026-11-07 in `/Users/rich/Documents/Development/LIM_Portfolio`.

## Scope and result

Only the full-screen introduction's text masks and surplus-dot staging change. The exact sequence is RICH DANIEL → LIM → PORTFOLIO. One shared responsive configuration replaces independent width fitting; there is no LIM-specific font, width target, enlargement or coordinate scale.

- Existing family: Barlow Condensed, weight 800.
- Starting size: `clamp(4.5rem, 14vw, 13rem)` using the document's actual root rem size.
- Shared line box: 0.85; tracking: -0.05em.
- One shared size reduces globally if any phrase/line box needs viewport clearance. All phrases remain single-line at the tested sizes.
- Font loading and `document.fonts.ready` precede mask measurement/sampling.
- `measureText()` and actual ink bounds calculate horizontal centering, common baseline and H-capital height. A manual tracking path supports contexts without Canvas letterSpacing.
- Shared capital rows include the full font's curved-letter optical overshoot in boundary cells instead of allocating taller rows for round letters. Offscreen ink is retained; no per-word rescaling or final-coordinate stretch is used.
- Sampling spacing, dot radius and vertical rows are identical across the three masks. Budget pressure coarsens all masks together using the largest count.
- CSS-pixel dimensions are independent of the capped visible-canvas DPR. Resize/orientation regenerates all masks together.

The same portrait particle pool is reused. Surplus dots retain positions and morph paths but fade to zero while a shorter word settles, then fade into the existing portrait transition. They do not stack opacity into LIM or create a surrounding cloud. No particles are converted into DOM text.

Bouncing ball, phase starts (1.5 / 2.5 / 3.3 seconds), 0.32-second morphs, scatter at 4.5 seconds, reveal at 4.7 seconds and total 5.5 seconds remain unchanged. Skip, per-refresh playback, reduced-motion/save-data fallbacks and RAF lifecycle are preserved. The final quadratic scatter/portrait paths remain unchanged.

## Measured visible particle heights

Measurements scan the rendered Canvas pixels after each phrase settles, rather than trusting CSS or only font metadata.

| CSS viewport | RICH DANIEL | LIM | PORTFOLIO |
|---|---:|---:|---:|
| 1440×900 | 142px | 142px | 142px |
| 1920×1080 | 148px | 148px | 148px |
| 1366×768 | 136px | 136px | 136px |
| 768×1024 | 76px | 76px | 76px |
| 1024×768 | 102px | 102px | 102px |
| 390×844 | 52px | 52px | 52px |
| 320×740 | 48px | 48px | 48px |
| 430×932 | 52px | 52px | 52px |

All masks share font size, weight, font string, line height, tracking, baseline, capital height, step and radius. Font size is 201.6 CSS px at 1440px width and 208px at 1920px. Natural widths differ: LIM is shorter, not independently enlarged. Raster centers stay within 1.5 CSS px of the shared center horizontally and at the exact vertical center; all tested painted ink remains at least 24px from every edge. Screenshots for every viewport/phrase reside in this folder.

## Files

- `src/introText.ts`: shared config, all-mask fitting, capital grid, consistent density/radius and exact words.
- `src/portraitConfig.ts`: source the phrase tuple from the shared config; timing values unchanged.
- `src/portraitEngine.ts`: generate masks together, load the shared font, preserve/fade surplus particle opacity during morphs and portrait convergence.
- `tests/introScale.spec.ts`: replace superseded per-word width checks with pixel-height, centering, safety, common-style, resize/orientation/DPR and source-preservation assertions.
- `README.md`: current intro behavior and adjustment source.
- This folder: source hashes, measurements and visual verification.

`preserved-hashes.json` records every other source file. A test asserts all those bytes remain unchanged, including hero component/layout CSS, navigation, section data/copy, game, credentials, gallery and constellation code. No public asset is modified, no dependency is added, and no persistent state is introduced.

## Validation scope

Chromium emulation, not physical-device or cross-browser certification. Eight viewport sizes include requested desktops, portrait/landscape tablets and common narrow/wide phones. DPR 2 checks preserve CSS font sizing while the backing store remains capped at 1.5. Live resize and orientation changes rebuild shared masks during playback. Existing tests also verify full refresh playback, ball/text/scatter/portrait order, Skip, reduced motion, save-data, Canvas fallback, hidden/off-screen suspension, one RAF and all portfolio regressions.

No deploy, commit or push. Local preview: `http://127.0.0.1:4173/`.


## Subsequent exit-position request

The user next requested that full refreshes always finish at Home, superseding initial deep-link positioning. `src/main.tsx` and `src/Navigation.tsx` were then intentionally updated for that lifecycle fix, and their preservation-baseline hashes refreshed. The actual shared typography, portrait configuration and particle engine remain byte-identical to the version measured above; the separate `verification/intro-exit/preserved-hashes.json` freezes those files for the exit fix. See `verification/intro-exit/RESULTS.md` for final combined validation.

Final combined validation after the Home exit-position fix: lint, type checking and production build passed; all 97 tests passed on first attempt with one retry configured but unused. Exact equal painted heights remain confirmed across all eight sizes. Natural intro and Skip reveal Hero at scroll zero with stale hashes cleared. See the exit report for the lifecycle root cause, changed files and detailed results.
