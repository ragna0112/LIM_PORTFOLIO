# Header navigation and consistent numbering

Updated 2026-11-07 in `/Users/rich/Documents/Development/LIM_Portfolio`.

## Central configuration

`src/sections.ts` contains each ID, navigation label, display number, href and eyebrow label.

| ID | Navigation | Number | Eyebrow | Href |
|---|---|---|---|---|
| work | Work | 01 | SELECTED WORK / 01 | #work |
| about | About | 02 | ABOUT / 02 | #about |
| credentials | Credentials | 03 | CREDENTIALS / 03 | #credentials |
| game | Play | 04 | INTERACTIVE / 04 | #game |
| contact | Contact | 05 | CONTACT / 05 | #contact |

Home has no page number. The previous Work project-count badge is removed. The unnumbered capabilities section retains its content and item numbers, with the stale “02 /” page prefix removed. Project-card numbers /01 through /04 are unchanged.

## Header and behavior

- Existing R·L logo stays at the left page margin; desktop navigation aligns at the right with consistent gaps, quiet small numbers and Contact arrow.
- Existing header heights remain 86px desktop/tablet and 72px narrow mobile. Thin border, typography, colors and sticky layering are preserved.
- IntersectionObserver observes Home and the five numbered sections through a band below the header; current links use `aria-current="location"` and a restrained underline/brightness state. Unnumbered content may leave numbered links inactive.
- Observer updates do not alter the URL. Header clicks update hashes, wait for fonts/two layout frames, scroll with the sticky-header offset and focus the destination. Home scrolls to zero.
- Initial known hashes wait until the full intro finishes (or Skip/reduced motion completes it), then align after font/layout readiness. The intro remains at Home while it runs, preventing a hidden/off-screen intro on direct hash loads. Browser hash changes and back/forward navigation also align correctly.
- Reduced motion uses instant scrolling. Existing project IDs and links remain unchanged.
- The decorative cursor remains available elsewhere but is hidden while the header is hovered or focused, preventing circles over labels or an apparent extra navigation item.

## Mobile menu

At widths ≤900px the logo and compact Menu button remain visible. Five numbered links appear in a native modal navigation sheet, not a game overlay. Close/Escape/backdrop dismiss it. Selection closes first, restores body styles, then focuses and scrolls the destination. Explicit Tab wrapping plus native modality keeps focus inside; dismissal restores the trigger and exact prior scroll position. Resizing to desktop closes the sheet, unlocks scrolling and exposes desktop navigation. Short/zoomed viewports permit vertical menu scrolling, with no horizontal overflow. All controls are at least 44px high.

## Numbering and header files changed

- `src/sections.ts`: new typed central configuration and eyebrow formatter.
- `src/Navigation.tsx`: new header, mobile menu, observer, hash routing and focus handling.
- `src/navigation.css`: desktop/mobile styling, sticky offsets, active state and cursor exclusion.
- `src/main.tsx`: replace inline header, render Work/About/Contact eyebrows from the config, remove stale capability page prefix.
- `src/Credentials.tsx`: render the Credentials eyebrow from the config; proof/lightbox/resume behavior is untouched.
- `src/playground/GameSection.tsx`: render the game eyebrow from the config; game placement and behavior are untouched.
- `src/style.css`: scope original navigation rules to desktop and remove conflicting hidden-counter rules.
- `src/portrait.css`: scope the old narrow-header nav spacing rule to desktop links; no portrait effect or layout change.
- `tests/navigation.spec.ts`: 12 navigation/numbering tests.
- `tests/constellation.spec.ts`, `tests/credentials.spec.ts`, `tests/portfolio.spec.ts`, `tests/playground.spec.ts`: update old three-link/no-menu assumptions for the authorized five-link header while retaining no-pause/no-Playground checks.
- `verification/game-position/preserved-hashes.json`: remove the intentionally changed Credentials component from the prior byte-frozen list; data, images, resume, game mechanics/CSS and particle source remain protected.
- `README.md` and this folder: current configuration/behavior and verification notes.

## Checks

Chromium desktop/mobile emulation, not physical-device or cross-browser certification. Navigation tests cover 1440×900, 768×1024, 390×844, 320×740 and 720×450 CSS viewport (200% desktop zoom equivalent); the existing regression suite additionally covers 1920×1080 and media/intro variants. Desktop geometry, exact order/numbers, project numbering, no duplicate IDs, all link targets and focus, active-section changes without hash churn, direct hashes/refresh, full intro before direct hash, history, menu containment, restored focus/scroll, resize cleanup, reduced motion, cursor exclusion and scoped WCAG A/AA axe checks are exercised. Contact alignment allows native bottom-of-document clamping while keeping its heading clear of the header.

Screenshots include `desktop-header.png`, `tablet-menu.png`, `mobile-menu.png`, `small-mobile-menu.png` and `zoom-200-menu.png`.

Existing hero, intro, portrait, constellation, project information, all five credential proofs/lightboxes, resume actions, embedded gameplay and Contact/LinkedIn remain preserved. No dependency added; no game modal, pause/play control or Playground entry restored. No deploy, commit or push.

## Final results

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npx playwright test tests/navigation.spec.ts`: **12 passed**.
- `npm test`: **81 passed** (4.4 minutes), including all existing gameplay, credential, resume, project, intro and visual-effect regressions.
- Local CPU/network-throttled mobile measurement: LCP **1.48 s**, CLS **0**. These are local lab results, not field metrics.
- Desktop header and mobile/200%-equivalent menu screenshots visually reviewed: labels readable, correct numbering/order, no horizontal clipping or cursor circle over the header.
- Production preview remains available at `http://127.0.0.1:4173/`.
- No deployment, commit or push.
