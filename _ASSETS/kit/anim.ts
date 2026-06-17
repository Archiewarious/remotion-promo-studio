import {interpolate, spring} from 'remotion';

// fps-aware spring/timing helpers. Pass fps from useVideoConfig() — NEVER hardcode (breaks 60fps/Reels).
export interface SpringOpts {
  delay?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

/** Organic spring-in (0→1). Use for text/element entrances. */
export const springIn = (
  frame: number,
  fps: number,
  {delay = 0, damping = 18, stiffness = 120, mass = 1}: SpringOpts = {},
): number => spring({frame: frame - delay, fps, config: {damping, stiffness, mass}});

/** Hard-punch scale: element slams in from big scale → 1 */
export const punchIn = (frame: number, fps: number, delay = 0): number =>
  spring({frame: frame - delay, fps, config: {damping: 13, stiffness: 200, mass: 0.8}});

/** Fade-out at end of scene (frame-based, fps-agnostic). */
export const fadeOut = (frame: number, duration: number, fadeLen = 8): number =>
  interpolate(frame, [duration - fadeLen, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Fade-in at start (fps-agnostic). */
export const fadeIn = (frame: number, len = 10): number =>
  interpolate(frame, [0, len], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Slow Ken Burns zoom over the whole scene (duration in frames, fps-agnostic). */
export const kenBurnsScale = (frame: number, duration: number, from = 1.06, to = 1.0): number =>
  interpolate(frame, [0, duration], [from, to], {extrapolateRight: 'clamp'});

/** Continuous "breathing" pulse — hz = cycles per SECOND (fps-aware, was per-frame). */
export const pulse = (frame: number, fps: number, hz = 0.5, amp = 0.04): number =>
  1 + Math.sin((frame / fps) * Math.PI * 2 * hz) * amp;

/** Stagger spring: delay = index * staggerFrames. */
export const stagger = (frame: number, fps: number, index: number, staggerFrames = 8, damping = 18): number =>
  springIn(frame, fps, {delay: index * staggerFrames, damping});
