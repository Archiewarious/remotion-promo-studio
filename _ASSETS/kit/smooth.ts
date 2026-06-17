/**
 * Smooth motion utilities for V4 best-of.
 * Замена резким spring overshoot — мягкий cubic ease-out + settle.
 *
 * Принципы:
 *  - Все движения с длинным "tail" (cubic-bezier 0.16, 1, 0.3, 1).
 *  - Никаких snap-стопов: после landing — micro-settle decay.
 *  - Motion-blur на основе численной производной (текущий vs кадр-1).
 *  - Длительности входа 14-22 кадра (а не 8-10).
 */
import {interpolate} from 'remotion';

const SMOOTH = (t: number) => 1 - Math.pow(1 - t, 4); // ease-out quart, мягкий

/** Главная гладкая анимация 0→1 за `dur` кадров. БЕЗ overshoot. */
export const smoothIn = (frame: number, delay = 0, dur = 18): number => {
  const t = Math.max(0, Math.min(1, (frame - delay) / dur));
  return SMOOTH(t);
};

/** smoothIn + микро-settle decay после landing.
 *  V9: amp клампим до 0.01 чтобы убрать визуальное "дрожание". */
export const smoothSettle = (
  frame: number,
  delay = 0,
  dur = 18,
  settleAmp = 0.014,
  settleDecay = 0.075,
): number => {
  const base = smoothIn(frame, delay, dur);
  if (base < 1) return base;
  const settleFrame = frame - delay - dur;
  const decay = Math.exp(-settleFrame * settleDecay);
  const clampedAmp = Math.min(0.01, settleAmp); // V9: hard clamp
  return 1 + Math.sin(settleFrame * 0.35) * clampedAmp * decay; // V9: slower freq
};

/** Мягкий ease-out interpolate 0→target за dur кадров. Удобно для translation/blur. */
export const smoothLerp = (
  frame: number,
  delay: number,
  dur: number,
  from: number,
  to: number,
): number => {
  const t = smoothIn(frame, delay, dur);
  return from + (to - from) * t;
};

/** Motion-blur для быстро движущихся элементов.
 *  V9: maxBlur клампим до 12 чтобы избежать "рваных" mid-animation кадров. */
export const motionBlur = (
  frame: number,
  posFn: (f: number) => number,
  scale = 0.55,
  maxBlur = 18,
): number => {
  const cur = posFn(frame);
  const prev = posFn(Math.max(0, frame - 1));
  const v = Math.abs(cur - prev);
  const clampedMax = Math.min(12, maxBlur); // V9: hard clamp
  return Math.min(clampedMax, v * scale);
};

/** Хвост-fade-in (для scene-входа). 10-14 кадров. */
export const fadeInLong = (frame: number, len = 12): number =>
  interpolate(frame, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Хвост-fade-out с длинным окончанием (для cross-fade overlap). */
export const fadeOutLong = (frame: number, duration: number, len = 14): number =>
  interpolate(frame, [duration - len, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Counter с easing-out (вместо линейного). */
export const smoothCounter = (
  frame: number,
  delay: number,
  dur: number,
  from: number,
  to: number,
): number => {
  return Math.floor(smoothLerp(frame, delay, dur, from, to));
};

/** Mini-drift для атмосферы (sin-колебание). */
export const drift = (frame: number, freq = 0.03, amp = 6, phase = 0): number =>
  Math.sin(frame * freq + phase) * amp;
