# Introduction exit-position fix

Updated 2026-11-08 in `/Users/rich/Documents/Development/LIM_Portfolio`.

## Root cause

The header retained the initial section hash, waited for `introActive` to become false and fonts/layout to settle, then called `scrollToSection()` for that retained ID. Consequently, refreshing `#work` played the intro at Home and then automatically jumped back to Work. This was an initial-route effect, not a hardcoded active section or an IntersectionObserver scroll. Browser restoration also needed an explicit page-load guard. The site uses native scrolling (Framer Motion observes it); no Lenis, Locomotive, ScrollSmoother or other owning controller exists.

## Correction

- `src/introScroll.ts` runs before React creates section anchors. It sets `history.scrollRestoration='manual'`, clears any stale fragment through `history.replaceState(history.state, '', pathname + search)` and resets native scroll to zero.
- While the intro initializes, root overflow/overscroll are temporarily guarded and scroll/pageshow events keep the document at zero. Scrollbar gutter is reserved without modifying permanent layout.
- Completion and Skip reset zero before revealing Hero, repeat on the next animation frame, restore root inline styles and `scrollRestoration='auto'`, then remove guard listeners. No long timeout, persistent storage, extra history entry or ongoing animation loop is used. Reloading while the intro is active also restores automatic mode after dismissal.
- `src/Navigation.tsx` removes delayed initial-hash routing entirely. Hash changes during initialization clear back to Home. Ordinary link selections, hash navigation and Back/Forward still work after initialization; selection waits for layout, then updates the hash. The logo returns Home and clears the fragment, preserving pathname/query.
- `src/main.tsx` initializes the guard before render and resets position before its existing finish callback reveals Hero. Skip focuses `#home` using preventScroll; natural completion does not move focus. No automatic focus or navigation targets Work.

The equal-height masks, phrase order, font, particle sampling, bounce, morph/scatter/portrait paths and 5.5-second timing are untouched by this exit-position fix. `preserved-hashes.json` records the typography/animation and all unrelated source bytes from immediately before this fix; the automated preservation test verifies them.

## Files changed for this fix

- `src/introScroll.ts`: new temporary initialization/exit guard.
- `src/main.tsx`: initialize and finish the guard; focus Home after Skip.
- `src/Navigation.tsx`: remove startup section routing and clear the logo hash.
- `tests/introExit.spec.ts`: stale-hash refresh, natural completion, Skip, mobile/reduced motion, history/query preservation, scroll lock cleanup and source-preservation cases.
- `tests/navigation.spec.ts`: update initial-route expectations to the newly requested Home-on-refresh behavior; retain normal navigation/history checks.
- `tests/intro.spec.ts`: Skip now focuses Home rather than the hero heading.
- `verification/intro-uniform/preserved-hashes.json`: refresh the two intentionally authorized lifecycle files in the earlier typography baseline. Typography files themselves are separately frozen in this fix's baseline.
- `README.md` and this verification folder.

## Verification scope

Chromium desktop/mobile emulation, not physical-device or cross-browser certification. Tests refresh all five section hashes and wait for natural intro completion, check Skip and reduced motion at desktop/mobile sizes, preserve query parameters/history length, sample native scroll throughout the intro, verify manual-to-auto restoration and released scrolling, refresh during an active intro, and exercise all header links, logo and Back/Forward after completion. Existing uniform typography tests, full game rounds, credentials/lightboxes, resume downloads, project links, particles, layout/accessibility and performance run as regressions.

The immediately preceding typography run passed all 11 focused intro checks; its full run passed 84 checks but encountered the existing game-driver stall after Play Again. That unchanged game-completion test passed both real-keyboard rounds on isolated rerun (33.8 s / 34.1 s). This was before the exit-position fix and is recorded separately from final results below.

No deploy, commit or push. Local preview remains `http://127.0.0.1:4173/`.

## Final results

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Intro/navigation focused run: 21 passed. The new exit cases passed in the final combined run, including all 12 new tests.
- `npm test -- --retries=1`: **97 passed** (5.5 minutes). No retry was needed in this final run; both unchanged game-completion rounds passed on the first attempt (34.2 s / 33.6 s).
- Every fresh/stale-hash load, Skip, reduced motion, mid-intro refresh, query/history preservation, native scroll guard, released scrolling, logo and normal Back/Forward check passed.
- Uniform intro pixel heights remain exact at all eight viewports (142px each at 1440×900; 148px each at 1920×1080), with typography/timing source hashes unchanged by the exit fix.
- Native-scroll visual smoke checks capture desktop natural completion and mobile Skip at Home with no hash, scrollY 0, automatic restoration and no root overflow lock.
- Throttled mobile local lab result: LCP 1.58 s, CLS 0. These are local measurements, not field metrics.
- Existing credentials/lightboxes, downloads, projects, navigation, game, hero/portrait/constellation and accessibility regressions passed.
- Local preview: `http://127.0.0.1:4173/`. No deployment, commit or push.
