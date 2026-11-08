import { INTRO_TEXT } from './introText';

/** Seconds from the first rendered frame. Morphs reuse the same particle pool. */
export const INTRO = {
  words: INTRO_TEXT.phrases,
  ballEnd: 1.5,
  wordStarts: [1.5, 2.5, 3.3],
  scatterStart: 4.5,
  revealStart: 4.7,
  end: 5.5,
  textMorph: .32,
} as const;
export const PORTRAIT = {
  mask: '/images/rich-mask.webp',
  fallback: '/images/rich-dots.webp',
  desktopParticles: 16000,
  tabletParticles: 9500,
  mobileParticles: 5000,
  dprLimit: 1.5,
  desktopFPS: 60,
  mobileFPS: 30,
  pointerRadius: 78,
  maxDisplacement: 17,
  faceDisplacement: 7,
  spring: .065,
  damping: .79,
  idleAmplitude: .55,
} as const;
export function phaseAt(seconds: number) {
  if (seconds < INTRO.ballEnd) return 'ball';
  if (seconds < INTRO.wordStarts[1]) return 'rich-daniel';
  if (seconds < INTRO.wordStarts[2]) return 'lim';
  if (seconds < INTRO.scatterStart) return 'portfolio';
  if (seconds < INTRO.end) return 'portrait-transition';
  return 'portrait';
}
