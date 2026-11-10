# Contact form verification

## Changes

- `src/Contact.tsx`, `src/contact.css`: monochrome two-column contact details/form, stacked on mobile; exact location/phone/email, safe direct links, Copy Email announcement, preserved LinkedIn/GitHub/resume links. Accessible labels/errors/status and static reduced-motion behavior. Sending state blocks repeated submissions; errors preserve input; confirmed acceptance clears fields.
- `src/contactValidation.ts`: shared required-field, email, control-character and length validation (100/254/5,000 characters).
- `api/contact.ts`: Vercel Web Request handler for Resend. Fixed recipient, server-configured sender, visitor Reply-To, escaped HTML/plain text, acceptance-ID check, idempotency, timeouts and generic errors. Rejects bad methods/origins/content types/payloads, honeypot submissions and bodies over 24 KB.
- Durable Upstash Redis rate limiting: atomic Lua counters for 5 attempts/IP/10 minutes and 100 total/hour. Missing configuration or service failure fails closed. No message database or process-local rate counters.
- `.env.example`, `.gitignore`, `README.md`: required server-only variables and provider/domain/Redis/local setup. `package.json`, lockfile, `tsconfig.json`: Node type definitions and API lint/type-check coverage.
- `src/main.tsx`: replaces Contact contents with the component, preserving #contact, section 06, order and footer.
- `tests/contact.spec.ts`: injected provider mocks and browser endpoint interception; no real messages.
- `tests/polish.spec.ts`: accepts Chromium's equivalent zero-translation serializations (`none` and `0px`) after a reduced-motion change. Existing behavior is unchanged; an immediate assertion otherwise failed on `0px`.
- Preservation manifests update only the authorized `src/main.tsx` entry; all other captured source hashes stay unchanged.
- `vercel.json`: disables automatic deployment only for `codex/contact-form`, allowing the requested Git push while respecting the instruction not to deploy. Production main is untouched.

## Results

Lint, TypeScript and production build passed. The complete focused contact/credentials/Experience/polish run passed **34 tests**. Contact checks were rerun after tightening content-type validation. Coverage includes required/invalid/oversized inputs, honeypot rejection, recipient injection, origin/method restrictions, shared-rate-limit wiring and rejection across handler instances, provider acceptance/errors, missing config, escaped email content, fixed recipient and Reply-To, idempotency, no browser-side secrets, clipboard, visible focus, no horizontal overflow at 1440/390/320 pixels, and automated WCAG checks. UI delivery states use mocked endpoint responses; API tests use fake Resend/Redis responses. Durable Redis behavior relies on its atomic EVAL implementation; no external service was contacted by the tests.

Visually inspected desktop, mobile details and mobile form screenshots in this directory. Contact 06, footer branding and direct links fit. Existing certificates/lightboxes, resume bytes/actions and Experience content passed their checks. Game and intro engine implementations are unchanged and remain covered by source preservation hashes; their full gameplay/intro suites were not rerun for this task.

## Remaining setup

No real credentials or verified sender were supplied. Real delivery therefore remains disabled until these server variables are populated:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` (mailbox on a domain verified in Resend, not an unverified Gmail/visitor address)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

See the repository README for setup steps and documentation links. After setup and explicit deployment authorization, deploy/merge the review branch. No deployment or real test email was performed.
