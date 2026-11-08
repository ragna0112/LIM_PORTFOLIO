# Introduction scale and atmospheric background — November 7, 2026

## Diagnosis

The previous Canvas renderer used `Math.min(width * .14, 190, height * .24)` and `font * Math.min(1, targetWidth / measuredWidth)`. This capped the font at 190 CSS pixels and allowed shrinking only. CSS font-size changes could not enlarge these particle formations. At 1440×900, the old painted bounds were 822px (57.08%) for RICH DANIEL, 210px (14.58%) for LIM, and 726px (50.42%) for PORTFOLIO.

## Implementation

`src/introText.ts` fits the actual ink bounds returned by Canvas `measureText()` using font weight 800. It starts at a responsive font size and expands/binary-fits to the target width, subject to safe viewport height. A short word such as LIM intentionally requires a font larger than the starting estimate. Measurements use glyph left/right bearings and ascent/descent to center the visible ink, rather than advance width or an assumed baseline.

Desktop targets are 84% for the long phrases and 68% for LIM; tablet LIM uses 70%; mobile uses 86% / 72%, capped to preserve at least 24px of visible edge clearance. The intended local font and `document.fonts.ready` are awaited before fitting. Targets regenerate after viewport or backing-store changes. Duplicate resize notifications no longer regenerate the same masks.

All mask geometry is in CSS pixels. Only the main Canvas backing store uses the existing capped DPR (1.5). Sampling covers the complete ink region, adapts its grid to the unchanged responsive particle budget, and never truncates a target array at a letter boundary. Visible text is exclusively particles. The same pool morphs from the ball's final position to each word and into the existing portrait. Ball timing, phrase order, holds, current-load skip, refresh behavior and reduced-motion fallback remain intact. The hero's chrome font sizes, layout, source portrait, sampling and project content are unchanged.

## Actual painted-pixel measurements

These are the alpha bounds of fully settled pixels in the production Canvas, not CSS dimensions or only hidden-mask metrics. Pixels with alpha >80/255 define the bounds. The measurement script converts physical backing pixels to CSS pixels. Per-word screenshots and `measurements.json` are in this folder.

| Viewport | RICH DANIEL | LIM | PORTFOLIO |
| --- | --- | --- | --- |
| 1440×900 | 1,209px / 83.96% | 979px / 67.99% | 1,209px / 83.96% |
| 1920×1080 | 1,613px / 84.01% | 1,298px / 67.60% | 1,610px / 83.85% |
| 1366×768 | 1,146px / 83.89% | 927px / 67.86% | 1,149px / 84.11% |
| 768×1024 | 647px / 84.24% | 537px / 69.92% | 646px / 84.11% |
| 390×844 | 336px / 86.15% | 280px / 71.79% | 336px / 86.15% |

The 1440×900 heights are 194px, 588px, and 221px respectively. Visible formations are centered within 2px in these captures. The smallest measured edge clearance is 26px on mobile. No clipped glyphs were found in visual inspection of the settled words. A DPR=2 browser test verifies that the 1.5-capped backing store and live desktop-to-mobile resize retain the correct logical size.

## Atmospheric system

- CSS radial light near the portrait, moved very slowly; a small desktop pointer component is interpolated.
- Separate background dust in the existing Canvas loop: 24 desktop, 14 tablet and 8 mobile particles, low opacity and depth-dependent slow movement. No particle DOM nodes.
- Existing film grain keeps its original opacity and cached SVG tile; small CSS background-position steps occur every few seconds.
- One technical-depth treatment: three extremely faint curved field lines. No grid, scan lines, stars, colors or floating blobs.
- A soft cursor light behind the content, eased toward the pointer on fine-pointer devices. Its position stops when the pointer leaves the hero/page; opacity settles away. It does not replace portrait repulsion.

Dust, light easing and portrait rendering share the existing RAF, frame cap and visibility handling. Lighting transforms are written at most about 30 times per second. Hidden/offscreen sections and the ambient pause control suspend background work, including grain. Reduced motion/save-data uses static glow, static grain and field lines, without dust or pointer lighting. All atmospheric elements are decorative, pointer-transparent and excluded from layout flow.

Idle, portrait interaction, cursor field and reduced-motion screenshots are retained in this folder. Visual review confirmed subdued grayscale lighting and readable text without competing with the portrait or chrome name. Reduced-motion screenshots are captured after the short initial fade finishes.

## Scope and checks

Lint, TypeScript checking and the production build pass. The final complete browser run passed **30/30 tests** in approximately 2.1 minutes. The throttled mobile load with explicit Skip Intro measured 1,484ms largest contentful paint, 0 cumulative layout shift and 415 DOM nodes. Production JavaScript is about 126.9KB gzip; CSS is about 7.9KB gzip.

Changed implementation files: `src/introText.ts`, `src/portraitEngine.ts`, `src/Atmosphere.tsx`, `src/atmosphere.css`, `src/PortraitHero.tsx`, and the existing grain rule in `src/style.css`. Added regression coverage: `tests/introScale.spec.ts`. Hero stylesheet `src/portrait.css` is byte-identical to its pre-change copy, and the portrait sampling function is unchanged. No profile/project/navigation/content configuration changes or dependency additions.

Tests cover visible width and centering, safe margins, font readiness, live resize and DPR, non-intercepting atmospheric layers, eased pointer response, paused grain/lighting, and static reduced-motion mode. Existing tests cover full intro sequence, refresh, current-load skip, no Replay button or storage, portrait interaction, touch, page accessibility, content and gallery behavior.

Local preview: `http://127.0.0.1:4173/`. Verification uses Chromium emulation and local CPU/network throttling; it does not claim physical-device or cross-browser field coverage. No deployment, commit or push was performed.
