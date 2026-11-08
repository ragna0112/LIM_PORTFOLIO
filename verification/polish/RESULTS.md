# LinkedIn and final interaction polish — November 7, 2026

## Changes

The exact supplied LinkedIn URL is configured once as `profile.linkedinUrl` in `src/projects.ts`:
`https://www.linkedin.com/in/rich-daniel-lim-28a80134a/`.

LinkedIn appears first in the contact section's social links and in the footer beside GitHub and Back to Top. Both anchors use `target="_blank" rel="noopener noreferrer"`, monochrome text and arrow icons, and the accessible name “Visit Rich Daniel Lim on LinkedIn (opens in a new tab)”. Underline reveal and small arrow movement provide hover feedback. Keyboard focus remains visibly outlined. Existing GitHub/contact wording and project URLs are preserved.

The persistent Let’s connect pill remains an internal `#contact` link; it does not open a menu or panel. It navigates to the contact section with LinkedIn as the first professional profile. No contact information is replaced and no LinkedIn-blue logo/style is added.

## Restrained polish

- A 1.5px fixed silver reading-progress indicator follows raw document scroll progress, with no delayed easing, pointer interception, layout shift or screen-reader announcements. It is hidden behind the full-screen intro and remains functional with reduced motion.
- Primary CTA and project links receive at most ±3px magnetic translation on mouse/fine-pointer devices. CSS individual `translate` composes with existing transforms. Pointer events update styles directly; no React render or extra RAF loop is introduced. Leaving, scrolling, blur, keyboard focus and preference changes reset offsets.
- Touch/coarse pointers and reduced motion disable magnetic movement. Focus-visible links stay still. Native keyboard activation and safe external-link attributes are retained.
- Existing one-time section entrances use opacity, clipping and 16px vertical motion. Final clip bounds allow room for outlines; focus within a reveal immediately exposes its content without clipping. Reduced motion shows content directly.
- Existing screenshot-only parallax is restrained to a 20px total range. Important descriptions and project text do not move with the image. Existing small-screen/touch/reduced-motion transform suppression remains.
- Thumbnails are softly desaturated (80% grayscale) at rest and transition to full color only on hover-capable fine pointers without reduced motion. Enlarged gallery images retain original colors.
- Contact links share the existing right-hand area. Footer social links wrap onto their own row on narrow screens. Root bottom scroll padding keeps focused footer anchors above the persistent connection pill.

No additional decorative background layers were added. Intro timing/text fitting, constellation field, portrait source/sampling/interaction, navigation, portfolio text and project URLs are preserved. No new dependency is introduced.

## Verification

Final full suite: **47/47 tests passed** in approximately 2.3 minutes. Lint, type checking and production build passed. Throttled mobile load with explicit Skip Intro measured 1,464ms largest contentful paint, CLS 0 and 427 DOM nodes. Production JavaScript is about 129KB gzip and CSS about 8.45KB gzip.

Focused tests cover exact LinkedIn URL/attributes, two placements, existing contact destinations, visible/unobstructed keyboard focus, progress bounds, ±3px pointer movement, reset behavior, touch and reduced-motion suppression, image hover color and preserved project links. Visual captures cover 1440×900 desktop, 768×1024 tablet, 390×844 mobile and 320×740 small mobile.

Existing regression tests additionally cover the full intro and normal refresh, Skip Intro, no Replay/control/storage, constellation behavior and loop cleanup, portrait interaction, all project content/links, DocuFlow gallery dialogs, keyboard navigation, axe scans and local throttled performance. Chromium emulation is used; this does not claim physical-device or full cross-browser/manual assistive-technology certification.

## Files

- `src/projects.ts`: LinkedIn URL in the typed profile.
- `src/main.tsx`: contact/footer links, progress placement, refined Reveal and existing media parallax range.
- `src/InteractionPolish.tsx`: scroll progress and delegated magnetic behavior with listener cleanup.
- `src/polish.css`: restrained social/progress/magnetic interactions, responsive footer and focus safety.
- `src/style.css`, `src/gallery.css`: existing thumbnail filters/transitions updated in place.
- `tests/polish.spec.ts`: focused verification.
- Documentation and `verification/polish/*.png`: evidence and setup notes.

Local preview: `http://127.0.0.1:4173/`. No deployment, commit or push was performed.
