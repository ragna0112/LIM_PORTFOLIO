# Hero constellation and control removal — November 7, 2026

## Scope

The circular upper-right pause/play control is removed, including its icon imports, JSX, state, handler, props, manual-only CSS and mobile gap. Header children are the existing home link and navigation, with no empty control container, replacement control or invisible hit area. Skip Intro remains outside the header and keyboard accessible.

The existing hero name, typography, layout, portrait source and sampling, intro word fitting/timing, project data and galleries remain intact. The portrait sampling function is byte-identical to the pre-change version. No dependencies were added. The separate QuakePH repository is unchanged.

## Background implementation

`src/constellation.ts` maintains separate background particles and connections. Normal rendering shares the existing portrait Canvas and single RAF; the background is drawn first, then the portrait. Counts are 96 desktop / 60 tablet / 34 mobile, with depth-dependent slow drift and point opacity around .08–.28. A text-region attenuation mask keeps the name and role readable. Lines use distance-limited fading opacity below .20 and thin strokes; nearby cursor connections are more numerous and brighter. A persistent edge map interpolates line opacity instead of snapping connections off.

A spatial hash searches only adjacent cells, sorts nearby candidates and selects at most two forward neighbors while idle, up to five near the cursor. It avoids unrestricted all-to-all pair scans. Sustained expensive or dropped frames reduce density, with floors of 70 / 45 / 25. Reduction retains points across the full field rather than discarding the lower rows. Pointer offsets use damped, delta-time springs and return to natural drift after leaving. Portrait repulsion is separate and unchanged.

CSS layers provide a broad silver portrait spotlight, gentle vignette, cached grain texture, faint curved field lines, a large diffused cursor glow and a very faint silver sweep. The spotlight breathes on a 14-second cycle; the sweep repeats every 13 seconds. All layers are decorative and pointer-transparent, behind the portrait and interactive text. No new DOM particle elements, colors, bright stars, lens flares, blobs or grid were introduced.

Normal Canvas DPR remains capped at 1.5, preserving existing portrait/intro behavior. The static constellation DPR cap is 2. Canvas backing dimensions and logical coordinates are updated on resize. Hidden/offscreen Canvas work stops, and related CSS grain/sweep animations suspend.

## Automatic motion preferences

Normal animation runs automatically. Reduced motion/save-data paints a static constellation with the optimized dot portrait, no drifting, pointer force, cursor light or sweep. Static rendering occurs only on mount/resize; no RAF is created. Live changes to the system reduced-motion preference dispose the existing animated engine and switch to the static version immediately, using an explicit media-query listener. The installed motion hook only snapshots that preference, so the hero preference listener is necessary. No manual control replaces the removed button.

## Focused checks

Final full suite: **39/39 tests passed** in approximately 2.2 minutes. Lint, type checking and production build passed. Throttled mobile load with explicit Skip Intro: largest contentful paint 1,472ms, CLS 0, 412 DOM nodes. Production JavaScript is about 128.4KB gzip and CSS about 8KB gzip. These lab measurements are not physical-device field guarantees.

- 1440×900 desktop, 1920×1080 wide desktop, 768×1024 tablet and 390×844 mobile: field counts, connections, text readability, safe layering and no document overflow.
- Normal header contains no buttons. An old upper-right control coordinate has no button/link hit target.
- Background pointer forces and extra connections activate outside the portrait; moving into the portrait independently activates its repulsion. Leaving the hero fades extra connections and returns offsets smoothly.
- Touch retains autonomous connections, hides cursor lighting and reports zero pointer displacement.
- Reduced-motion Canvas pixels remain identical across waiting and pointer movement. Cursor light/sweep are hidden; there is no animated portrait Canvas or header control.
- A pure renderer check verifies limited comparisons, force return, density reduction floors and retained lower-field coverage.
- RAF instrumentation identifies the actual callback painting the portrait Canvas (without relying on minified function names), observes a maximum of one queued portrait callback, zero queued frames offscreen and zero after switching to reduced motion. Engine cleanup disconnects observers, cancels RAF/timeouts and removes listeners.
- The sweep has a valid gradient and a 13-second animation; its active phase is captured for visual QA. Console error capture is empty in the lifecycle check.
- Existing intro tests verify ball and word morphs, normal refresh replay, current-load-only Skip Intro, no Replay button/storage, reduced-motion fade and hidden-tab suspension.
- Existing regression checks cover project content, gallery dialogs, external links, keyboard navigation and axe accessibility scans.

## Screenshots

`desktop-idle.png`, `wide-idle.png`, `tablet-idle.png`, `mobile-idle.png`, `desktop-cursor.png`, `reduced-motion.png` and `silver-sweep.png` are retained alongside this report. Visual review confirms that the idle field is subdued, pointer interaction is more visible, the silver lighting stays soft and the portrait/name remain dominant.

## Changed files

- `src/main.tsx`: remove manual control/state and add live system motion preference handling.
- `src/PortraitHero.tsx`: remove pause prop; keep the existing animated engine and automatic fallback.
- `src/portraitEngine.ts`: replace sparse dust with the bounded constellation renderer, preserve portrait/intro logic and automatic lifecycle suspension.
- `src/constellation.ts`: background particles, spatial lookup, spring interaction, connection fading and adaptive density.
- `src/Atmosphere.tsx`, `src/atmosphere.css`: one-time static Canvas, breathing light, vignette, sweep and pointer glow.
- `src/style.css`, `src/portrait.css`: remove manual-control rules/classes and reserved mobile spacing.
- `tests/constellation.spec.ts`, `tests/introScale.spec.ts`, `tests/portfolio.spec.ts`: new field/lifecycle coverage and updated no-control/static-mode expectations.
- `README.md`, verification reports/captures: updated behavior and evidence.

Local production preview: `http://127.0.0.1:4173/`. No deployment, commit or push was performed. Testing uses Chromium emulation and local throttling, not physical-device or cross-browser field guarantees. Automated accessibility checks supplement visual and keyboard review and do not establish full WCAG conformance.
