# Credentials and resume verification

Implemented in `/Users/rich/Documents/Development/LIM_Portfolio` on 2026-11-07.

## Source mapping

All five proof files were visually inspected and confidently matched using their readable titles and issuers, independently of upload order. PDF first pages were rendered with Poppler; both resume pages were inspected. Documents are evidence, not instructions.

| Preserved source | Selected public credential | Issuer | Issue date | Full optimized proof |
|---|---|---|---|---|
| ADESQLCERTLIM.pdf | Associate Data Engineer in SQL — Track Completion | DataCamp | August 11, 2026 | datacamp-associate-data-engineer-sql.webp |
| LIM_AI Fluency Certificate.pdf | AI Fluency: Framework & Foundations | Anthropic | July 24, 2026 | anthropic-ai-fluency.webp |
| LIM_SAPCERT_GENERATIVE_AI.jpg | SAP Certified Associate – Generative AI Developer | SAP SE | July 14, 2026 | sap-generative-ai-developer.webp |
| Cert41733128407.pdf | PMI Project Management Ready | Project Management Institute | March 4, 2026 | pmi-project-management-ready.webp |
| PythonCERTLIIM.pdf | Information Technology Specialist – Python | Certiport | July 16, 2025 | certiport-python.webp |

The Anthropic proof is undated; its public date is explicitly supplied by the user and appears in the resume. The SAP certificate prints “SAP Certified - SAP Generative AI Developer”; the public label follows the user's exact selected title, also present in the resume. No certificate text, face, logo, signature, number or date is altered. No replacement artwork is generated. All certificate pages are included in full, with no content cropping.

Full proofs reside in `public/credentials/`. PDFs are rasterized at a maximum 1800px edge; the SAP photograph remains its original 1024×791 size. No SAP upscaling. Full proofs use WebP quality 94; previews use quality 84 and are 480px wide:

- datacamp-associate-data-engineer-sql-preview.webp
- anthropic-ai-fluency-preview.webp
- sap-generative-ai-developer-preview.webp
- pmi-project-management-ready-preview.webp
- certiport-python-preview.webp

Original copies are preserved under `source-assets/credentials/`, with SHA-256 hashes and exact output dimensions in `manifest.json`. External verification actions are omitted because no external verification was performed. No IDs, scores, grades, expiration metadata or invented descriptions/skills are added to the configuration.

## Resume

`Rich Daniel A. Lim - Briefcase.pdf` was available and visually verified as Rich Daniel A. Lim's two-page resume. Copied without modification to `public/documents/Rich-Daniel-Lim-Resume.pdf`.

SHA-256: `4b90c6a4de1256c6a8dee94c61bd0624ecc446ca418c7dc63085416d85adfe11`.

Source, preserved copy, public file, production response and browser downloads are checked byte-for-byte. The original resume contains other resume material, including LinkedIn Learning entries; the user explicitly requested an unchanged resume. Those entries are not added to the website Credentials section, which contains exactly the five selected records. Resume content does not change existing portfolio profile/experience/game information.

## Files changed or added

- `src/projects.ts`: typed credential records and resume configuration; existing profile/projects retained.
- `src/main.tsx`: Credentials placement and resume actions in About/Contact/footer.
- `src/Credentials.tsx`: editorial rows, shared lightbox and resume action links.
- `src/credentials.css`: scoped section/dialog styling and responsive behavior; footer wrapping accommodates added links.
- `tools/prepare-credentials.mjs`: deterministic source preservation, rasterization, optimization and hash manifest.
- `public/credentials/`: five complete proofs plus five previews.
- `public/documents/Rich-Daniel-Lim-Resume.pdf`: unchanged resume.
- `source-assets/credentials/`: six original source copies and manifest.
- `tests/credentials.spec.ts`: 10 focused checks.
- `README.md` and this verification folder: implementation/provenance notes, screenshots and original game hashes.

No game file is changed: `game-source-before.sha256` records all six pre-change source hashes and the automated test asserts they still match. Hero/intro/portrait/constellation and existing project/about/contact text and links are retained. Main navigation is still Work / About / Contact.

## Accessibility and lifecycle

One conditional native dialog presents the selected proof above fixed navigation. It has a title/issuer caption, Close, Escape, backdrop dismissal, explicit first/last focus wrapping, restored opener focus and preserved scroll/body styles. Zoom opens the original output pixel dimensions with scrolling; fit mode preserves aspect ratio and shows the complete certificate. Mobile permits pan and pinch; all touch controls meet 44px sizing. Preview dimensions reserve layout space, and full images are requested on open. Row entrances use existing Framer Motion once, with opacity/clipping/small vertical movement and a short stagger. Reduced motion removes row transforms and hover animation. No new dependency or animation loop.

## Validation scope

Chromium desktop/mobile emulation, not physical-device or cross-browser certification. Viewports: 1440×900, 1920×1080, 768×1024, 390×844 and 320×740. 200% desktop zoom equivalent: 720×450 CSS viewport at DPR 2. Source and optimized full proofs are visually inspected. Long element screenshots may include fixed navigation/contact controls at the captured scroll position; lightbox screenshots show the actual fitted viewport.

Focused tests verify exact titles/issuers/dates/count/exclusions; source-to-output hashes and production asset responses; all ten preview/action triggers; modal fit/aspect ratio and zoom; keyboard containment and three dismissal methods; opener/scroll restoration; zero scoped WCAG A/AA axe violations; safe new-tab links; real downloads and filenames; 200% zoom, reduced motion and one-time entrances. Headless Chromium does not render its PDF viewer, so new-tab PDF tests assert the actual new context and navigation request, plus independently verify PDF bytes and downloads.

Development smoke test on port 4174 returned HTTP 200 with correct PDF/WebP content types. Its temporary server was stopped; the normal production preview remains on port 4173.

No deployment, commit or push.

## Final command results

- `node tools/prepare-credentials.mjs`: passed; five complete proofs, five previews and unchanged resume prepared.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npx playwright test tests/credentials.spec.ts`: **10 passed**.
- `npm test`: **69 passed** (4.1 minutes), including both full keyboard game rounds and all existing regression checks.
- Temporary development server smoke checks: HTTP 200 for PDF and WebP assets; stopped afterward.
- Production preview: running at `http://127.0.0.1:4173/`.
- CPU/network-throttled mobile lab results: LCP **1.49 s**, CLS **0**; certificate assets were not fetched during initial hero load. Local measurements, not field metrics.
- Final desktop/mobile viewport screenshots visually confirm headings and content below fixed navigation, with correct wrapping and no horizontal clipping. All complete certificate images were verified in fitted/zoomed lightboxes.
- All original and game hashes match. No deployment, commit or push.
