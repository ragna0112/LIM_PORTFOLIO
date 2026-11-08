# Embedded HELLO WORLD game

Scope: refactor of the existing game in `/Users/rich/Documents/Development/LIM_Portfolio`, 2026-11-07. The user deferred Credentials/resume work to a later request; no credentials or links were invented.

## Integration

- `GameSection.tsx` is placed immediately before the existing About section. Projects, capabilities, profile, Contact, LinkedIn and the hero/intro/portrait remain intact.
- Main navigation is Work / About / Contact; no replacement game navigation entry, separate page, modal or document scroll lock.
- Editorial label/title/supporting line precede the bordered inline frame. Placeholder and loaded frame reserve the same responsive height to avoid loading shifts.
- Reuses `gameModel.ts` and `gameConfig.ts` without changes: objective, skills, normalized layout, movement, collisions and duration. Existing Canvas rendering and completion choreography remain in `gameEngine.ts`.
- Removed `PlaygroundEntry.tsx` and `entry.css`. Replaced the modal component with `HelloWorldGame.tsx`, keeping its progress, skill status and controls. Removed all dialog/close/scroll-restoration logic and obsolete overlay styles.

## Input and lifecycle

- Start Game begins play and focuses the arena. Restart resets immediately; Stop and Escape pause with progress intact and focus Resume Game. Play Again resets without refresh.
- Keyboard movement is handled on the game frame only while playing and focused. Outside/inactive arrow keys retain browser scrolling. Tab can leave normally and pauses the game.
- Direction buttons capture and release native pointer contacts; touch-action is disabled only on these buttons. The arena permits native vertical scrolling. Controls sit below the canvas, left of the persistent contact button.
- Continue to About moves focus and smoothly scrolls to About; reduced motion uses instant scrolling.
- One engine is retained across pause/resume/restart. Game code loads within 600px of view, and RAF is gated by Start plus canvas proximity (200px).
- Off-screen, hidden-tab, browser-blur and lost game focus suspend gameplay and clear velocities/held inputs. Reentry offers Resume rather than resetting or capturing input automatically.
- Engine cleanup disconnects resize/intersection observers, cancels RAF and removes input/visibility listeners; component cleanup clears the skill timer and motion preference listener.
- DPR remains capped at 2. Decorative density is 18 desktop / 12 tablet / 9 mobile nodes. Reduced motion removes ambient drift, glow, pulses and completion travel while retaining controls.

## Verification scope

Chromium desktop/mobile emulation, not physical-device or cross-browser certification. Tests cover 1440×900, 1920×1080, 768×1024, 390×844 and 320×740. A 720×450 CSS viewport at DPR 2 exercises the 1440×900 desktop layout at 200% zoom equivalent.

Screenshots in this folder show ready, playing, completion and zoom states. Automated accessibility checks apply WCAG A/AA rules to the game region. Existing portfolio accessibility, project/link, introduction, portrait, constellation and performance suites remain in the regression run.

Tests use real WASD/arrows for two complete rounds, confirm each existing skill, pause/resume after three collected letters, restart, completion and Continue to About. Other checks cover native emulated touch, inactive versus active arrow scrolling, focus return, repeated pause/resume, one pending RAF maximum, retained listener counts, no hidden/offscreen frames, no duplicate canvas, Canvas fallback and reduced motion.

## Files

- `src/main.tsx`: section placement and removal of navigation trigger.
- `src/playground/GameSection.tsx`: heading, lazy loading and fallback.
- `src/playground/HelloWorldGame.tsx`: inline states, controls, focus and About continuation.
- `src/playground/gameEngine.ts`: reused renderer with scoped input and lifecycle gates.
- `src/playground/playground.css`: embedded frame layout.
- `tests/playground.spec.ts`: embedded interaction coverage.
- `tests/portfolio.spec.ts`, `tests/constellation.spec.ts`: remove obsolete trigger allowances in header assertions.
- `README.md`: current integration and adjustment notes.

No deployment, commit or push.

## Final results

- Lint, TypeScript checking and production build: passed.
- Full regression suite: **59 passed** (4.0 minutes).
- After the final skill-status alignment polish: all **6 responsive/touch checks passed** on the rebuilt production output.
- Two complete keyboard rounds: 34.0 s and 34.1 s, including a retained-progress scroll-away/resume check and Play Again.
- Explicit browser console/runtime check: zero errors, exactly one game canvas, no body positioning/scroll lock.
- Throttled mobile lab check: LCP 1.50 s, CLS 0. No game JavaScript fetched during initial hero load. These are local lab results, not field measurements.
- Final lazy game chunk: 14.22 KB raw / 5.40 KB gzip, with no new dependencies.
- Local preview remains available at `http://127.0.0.1:4173/`.
