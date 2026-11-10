# Silver RLwork artwork and automatic intro

The exact uploaded PNG is archived at `source-assets/branding/rlwork-silver-original.png`. `preparation.json` records its SHA-256 and crop rectangles. `tools/prepare-branding.mjs` creates the public assets directly from these pixels; no replacement typeface or redrawn symbol is used.

## Assets

- `public/branding/rlwork-header-silver.webp`: 566 × 144 horizontal silver symbol and original wordmark, 9.3 KB.
- `public/branding/rlwork-footer-silver.webp`: 640 × 656 complete stacked artwork, 31.1 KB; also replaces About's old initials monogram.
- `public/favicon.ico`: embedded 16, 32 and 48 pixel PNG images.
- `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png` (180 pixels).
- `source-assets/branding/favicon-48x48.png`: archived ICO source.

Icons use the full original symbol geometry, a solid black matte and balanced padding. Tiny icons receive modest brightness and sharpening. No manifest exists, so no 192/512 icons are needed. Existing HTML icon declarations already point to the correct public filenames; title and description remain unchanged. Obsolete flat public SVG branding assets are removed.

## Source changes

- `src/Navigation.tsx`: silver header asset and explicit intrinsic dimensions, existing accessible Home link retained.
- `src/main.tsx`: stacked About/footer artwork, removed Skip Intro markup and its focus handler, independent nine-second completion fallback.
- `src/PortraitHero.tsx`: renderer initialization exceptions finish the intro and show the portrait fallback.
- `src/portrait.css`: removed dedicated Skip Intro styles.
- `src/branding.css`: silver artwork sizes and black-matte blending.
- `tools/prepare-branding.mjs`, source artwork/preparation metadata, generated assets.
- Tests now wait for automatic completion rather than clicking the removed control. Preservation baselines refresh only the explicitly changed source files.

The particle engine, text sizes, intro timing/configuration, page order, section numbering, resume, credentials and game implementation remain unchanged. The ordinary Skip to content accessibility link remains available. No intro skip or replay control exists.

## Visual verification

Header checks cover 1920, 1440, 1024, 768, 390 and 320 pixels. Header Home actions, image decoding, no horizontal overflow and contact links pass. Desktop/mobile header and footer screenshots are saved here. `favicon-pixel-review.png` shows native 16/32/48 icons and nearest-neighbor enlargements; visually inspected at actual sizes. All PNG backgrounds are opaque black and ICO entries decode at their declared sizes.

## Automated verification

Lint, TypeScript and production build passed. Branding, Experience, normal intro, refresh/scroll reset, reduced motion, keyboard order, navigation history and icon serving checks passed. The normal timing check passed on rerun after one 67 ms wall-clock overrun during screenshot capture. A first draft of the failure test suppressed all browser animation frames (including scroll-unlock), and was corrected to suspend only the renderer timeline; the corrected watchdog test passed. Failed image loading and a thrown renderer exception also passed.

Final focused results: 70 distinct checks passed across the branding/Experience/intro/intro-exit/navigation and credentials/portfolio runs, including corrected-test reruns. The entire game/constellation suite was not rerun for this change; game mechanics and intro-engine timing remain protected by unchanged-file hashes. Lint, typecheck, build and `git diff --check` passed.

Performance coverage now separates the automatic intro from reduced motion because there is no Skip Intro button. Under 4× CPU throttling and simulated mobile network conditions, automatic-intro LCP was 7.82 s (including the 5.5 s sequence), CLS 0.0853. Reduced-motion LCP was 2.516 s, CLS 0.000009. The reduced-motion budget remains 4 s; the automatic path allows the same budget plus the fixed 5.5 s intro. These are local synthetic measurements.

Verified the production output contains exactly the two new silver WebP branding files and configured icon files; obsolete flat SVG marks are absent. A source search confirms there is no Skip Intro markup, class or dedicated handler in `src`. No deployment, commit or push was performed.
