/**
 * BrandBG — единый фоновый слой для всех сцен (целостность + красивые cross-fade).
 * Brand-agnostic: дефолт — нейтральный графит, цвет задаётся палитрой/пропсами.
 *
 * Variants:
 *  - tone='dark'     : глубокий тёмный radial — default
 *  - tone='warm'     : тёплый тон (для CTA / тёплых сцен)
 *  - tone='hot'      : насыщенный удар-акцент (импакт)
 *  - tone='cream'    : светлый кремовый (bright moments)
 *
 * Все варианты разделяют: subtle grain + light leak sweeps + slow caustic drift.
 */
import React from 'react';
import {Img, staticFile} from 'remotion';

// Film-grain (SVG fractalNoise) as ONE module const — was an inline data-URI re-created on every
// render in two places (BrandBG + BrollBG). Hoisted: defined once, identical string, less churn.
const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

interface Props {
  frame: number;
  tone?: 'dark' | 'warm' | 'hot' | 'cream';
  showLeak?: boolean;
  leakDelay?: number;
}

// ⚠️ НЕЙТРАЛЬНЫЙ ДЕФОЛТ. Под бренд — поменять цвета в src/utils/colors.ts.
// dark = графит (дефолтный тон), warm = тёплый графит, hot = удар-акцент, cream = светлый.
const PALETTES = {
  dark:  {a: '#222a38', b: '#141a24', c: '#080b11'},
  warm:  {a: '#2b2620', b: '#1a1712', c: '#0a0805'},
  hot:   {a: '#d50007', b: '#8b0003', c: '#3a0001'},
  cream: {a: '#fffaef', b: '#f4e3b8', c: '#d6b06e'},
};

export const BrandBG: React.FC<Props> = ({
  frame, tone = 'dark', showLeak = true, leakDelay = 0,
}) => {
  const p = PALETTES[tone];
  const isLight = tone === 'cream';

  // BG slow zoom + caustic drift
  const bgScale = 1 + (frame * 0.0002);
  const causticX = 50 + Math.sin(frame * 0.025) * 14;
  const causticY = 50 + Math.cos(frame * 0.022) * 10;

  // Light leak (диагональный sweep, движется через кадр каждые ~3 сек)
  const leakCycle = ((frame - leakDelay) % 90) / 90;
  const leakX = -100 + leakCycle * 220;
  const leakOp = (leakCycle > 0.0 && leakCycle < 0.5) ? Math.sin(leakCycle * Math.PI) * 0.35 : 0;

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 45%, ${p.a} 0%, ${p.b} 55%, ${p.c} 100%)`,
        transform: `scale(${bgScale})`,
      }} />
      {/* Caustic drift — V13: чуть приглушено для тёмной палитры */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at ${causticX}% ${causticY}%, ${isLight ? 'rgba(255,230,180,0.3)' : 'rgba(170,190,230,0.12)'} 0%, transparent 45%)`,
        mixBlendMode: isLight ? 'multiply' : 'screen',
      }} />
      {/* Light leak sweep */}
      {showLeak && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(115deg, transparent 35%, rgba(255,210,140,0.45) 48%, rgba(255,255,255,0.55) 50%, rgba(255,210,140,0.45) 52%, transparent 65%)',
          transform: `translateX(${leakX}%)`,
          opacity: leakOp,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }} />
      )}
      {/* Grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: GRAIN_URL,
        opacity: isLight ? 0.22 : 0.16,
        mixBlendMode: isLight ? 'multiply' : 'overlay',
        pointerEvents: 'none',
      }} />
      {/* Vignette — V13: чуть плотнее для cinematic look */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${isLight ? 'rgba(120,80,30,0.18)' : 'rgba(0,0,0,0.70)'} 100%)`,
        pointerEvents: 'none',
      }} />
    </>
  );
};

// ============================================================
// BrollBG — V13 helper: фоновое видео + затемнение в зелёный
// ============================================================

interface BrollBGProps {
  src: string;
  videoFrame?: number;          // если 0 — статика
  zoom?: number;                 // base scale
  drift?: {x: number; y: number}; // smooth pan
  brightness?: number;           // 0..1
  saturation?: number;
  tintAlpha?: number;            // глубина зелёного overlay
  isImage?: boolean;             // если true — staticFile(src) как Img
}

export const BrollBG: React.FC<BrollBGProps> = ({
  src,
  zoom = 1.12,
  drift = {x: 0, y: 0},
  brightness = 0.45,
  saturation = 1.1,
  tintAlpha = 0.78,
  isImage = false,
}) => {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        background: '#04140a',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          transform: `scale(${zoom}) translate(${drift.x}px, ${drift.y}px)`,
          filter: `brightness(${brightness}) contrast(1.12) saturate(${saturation})`,
        }}>
          {isImage ? (
            <Img src={staticFile(src)}
              style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            // Используется внутри Sequence — OffthreadVideo
            <BrollVideo src={src} />
          )}
        </div>
      </div>
      {/* Зелёный multiply overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(8,46,26,${tintAlpha}) 0%, rgba(4,30,18,${tintAlpha * 0.85}) 50%, rgba(2,18,10,${tintAlpha}) 100%)`,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }} />
      {/* Дополнительный затемняющий vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,0,0.78) 100%)',
        pointerEvents: 'none',
      }} />
      {/* Subtle grain для cohesion с BrandBG */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: GRAIN_URL,
        opacity: 0.14,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }} />
    </>
  );
};

// Internal helper — OffthreadVideo wrapper
import {OffthreadVideo} from 'remotion';
const BrollVideo: React.FC<{src: string}> = ({src}) => (
  <OffthreadVideo
    src={staticFile(src)}
    muted
    style={{width: '100%', height: '100%', objectFit: 'cover'}}
  />
);

// ============================================================
// WOW FX HELPERS
// ============================================================

/** Particle dust — теперь 4 типа:
 *   'dust'      — мелкие золотые пылинки дрейфуют вверх (default)
 *   'sparks'    — быстрые красно-оранжевые искры зигзагом
 *   'fireflies' — крупные мерцающие зелёные точки медленно
 *   'snow'      — белые снежинки падают сверху вниз с волной
 */
type ParticleType = 'dust' | 'sparks' | 'fireflies' | 'snow';

export const ParticleField: React.FC<{
  frame: number; count?: number; color?: string; type?: ParticleType;
}> = ({frame, count = 16, color, type = 'dust'}) => {
  const defaultColor = {
    dust: 'rgba(255,230,160,0.55)',
    sparks: 'rgba(255,150,80,0.85)',
    fireflies: 'rgba(200,212,245,0.82)',
    snow: 'rgba(240,250,255,0.7)',
  }[type];
  const c = color || defaultColor;

  const particles = Array.from({length: count}).map((_, i) => {
    const seed = i * 91.7;
    const x = (seed % 1820) + 50;

    if (type === 'dust') {
      const speed = 0.3 + (i % 4) * 0.2;
      const y = 1100 - ((frame * speed * 4 + seed * 0.5) % 1300);
      const size = 3 + (i % 5) * 1.5;
      const op = Math.sin(((y + 100) / 1100) * Math.PI) * 0.7;
      const wob = Math.sin(frame * 0.04 + i) * 14;
      return {x: x + wob, y, size, op, glow: 2, fl: false};
    }
    if (type === 'sparks') {
      const speed = 0.8 + (i % 3) * 0.3;
      const y = 1100 - ((frame * speed * 8 + seed * 0.4) % 1400);
      const size = 2 + (i % 4) * 1;
      const op = Math.sin(((y + 100) / 1100) * Math.PI) * 0.85;
      const wob = Math.sin(frame * 0.12 + i * 2) * 26;
      return {x: x + wob, y, size, op, glow: 3, fl: false};
    }
    if (type === 'fireflies') {
      const speed = 0.15 + (i % 3) * 0.08;
      const y = 200 + Math.sin(frame * 0.018 + i * 0.7) * 380 + i * 4;
      const xPos = x + Math.cos(frame * 0.022 + i * 0.5) * 180;
      const size = 5 + (i % 4) * 2;
      const flicker = 0.4 + Math.sin(frame * 0.12 + i * 3) * 0.45;
      return {x: xPos, y, size, op: flicker, glow: 3.5, fl: true};
    }
    // snow
    const speed = 0.4 + (i % 4) * 0.18;
    const y = ((frame * speed * 6 + seed * 0.3) % 1400) - 100;
    const size = 4 + (i % 5) * 1.5;
    const op = Math.sin(((y + 100) / 1100) * Math.PI) * 0.75;
    const wob = Math.sin(frame * 0.06 + i * 1.5) * 35;
    return {x: x + wob, y, size, op, glow: 2.5, fl: false};
  });

  return (
    <>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: '50%',
          background: c, opacity: p.op,
          boxShadow: `0 0 ${p.size * p.glow}px ${c}`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  );
};

/** SmokeBurst — expanding smoke ring при impact-моментах.
 *  НЕ shockwave-ring (запрещён) — это soft displaced cloud с blur.
 *  Один short-lived puff. */
export const SmokeBurst: React.FC<{
  frame: number; startFrame: number; x: number; y: number;
  size?: number; color?: string;
}> = ({frame, startFrame, x, y, size = 400, color = 'rgba(255,235,180,0.45)'}) => {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / 26));
  if (t <= 0 || t >= 1) return null;
  const sc = 0.3 + t * 1.7;
  const op = Math.sin(t * Math.PI) * 0.85;
  const blur = 18 + t * 30;
  return (
    <div style={{
      position: 'absolute', left: x - size/2, top: y - size/2,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
      transform: `scale(${sc})`,
      opacity: op,
      filter: `blur(${blur}px)`,
      pointerEvents: 'none',
      mixBlendMode: 'screen',
    }} />
  );
};

/** LeafFall — листочки падают (для eco/zsj сцен). */
export const LeafFall: React.FC<{frame: number; count?: number}> = ({frame, count = 14}) => {
  const leaves = Array.from({length: count}).map((_, i) => {
    const seed = i * 81.3;
    const x = (seed % 1820) + 50;
    const speed = 0.5 + (i % 4) * 0.18;
    const y = ((frame * speed * 5 + seed * 0.4) % 1400) - 100;
    const rot = (frame * (1 + (i % 3) * 0.4) + i * 30) % 360;
    const sway = Math.sin(frame * 0.05 + i) * 40;
    const op = Math.sin(((y + 100) / 1100) * Math.PI) * 0.7;
    const size = 16 + (i % 4) * 4;
    return {x: x + sway, y, rot, op, size};
  });
  return (
    <>
      {leaves.map((l, i) => (
        <svg key={i} width={l.size} height={l.size * 1.4}
          viewBox="0 0 24 32"
          style={{
            position: 'absolute', left: l.x, top: l.y,
            opacity: l.op, transform: `rotate(${l.rot}deg)`,
            filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.7))',
            pointerEvents: 'none',
          }}>
          <path d="M12 2 C4 8 4 18 12 30 C20 18 20 8 12 2 Z M12 4 L12 28"
            fill={i % 2 ? '#9fd87a' : '#5bb83a'}
            stroke="#3a8a1f" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
    </>
  );
};

/** ConfettiBurst — золотые/зелёные конфетти разлетаются вверх (для CTA). */
export const ConfettiBurst: React.FC<{frame: number; startFrame: number; count?: number; x?: number; y?: number}> = ({
  frame, startFrame, count = 28, x = 960, y = 540,
}) => {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / 40));
  if (t <= 0) return null;
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i * 0.7);
        const dist = t * (250 + (i % 5) * 60);
        const gravity = t * t * 200;
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist - 80 + gravity;
        const rot = t * 480 + i * 30;
        const colors = ['#ffd070', '#ffaa30', '#4ADE80', '#fff5d0', '#669047'];
        const c = colors[i % colors.length];
        const op = (1 - t) * 0.95;
        const size = 10 + (i % 4) * 4;
        return (
          <div key={i} style={{
            position: 'absolute', left: px - size/2, top: py - size/2,
            width: size, height: size * 0.55,
            background: c, transform: `rotate(${rot}deg)`,
            opacity: op,
            boxShadow: `0 0 8px ${c}`,
            pointerEvents: 'none',
          }} />
        );
      })}
    </>
  );
};

/** StarBurst — 8-конечная звезда лучей из центра, expanding+fading. */
export const StarBurst: React.FC<{frame: number; startFrame: number; x: number; y: number; rays?: number; color?: string}> = ({
  frame, startFrame, x, y, rays = 8, color = 'rgba(255,250,200,0.85)',
}) => {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / 30));
  if (t <= 0) return null;
  const len = t * 600;
  const op = Math.sin(t * Math.PI) * 0.9;
  return (
    <svg
      style={{position: 'absolute', left: x - 700, top: y - 700, width: 1400, height: 1400, pointerEvents: 'none', mixBlendMode: 'screen'}}
      viewBox="-700 -700 1400 1400"
    >
      {Array.from({length: rays}).map((_, i) => {
        const angle = (i / rays) * 360 + t * 30;
        return (
          <polygon
            key={i}
            points={`-10,0 10,0 0,-${len}`}
            transform={`rotate(${angle})`}
            fill={color}
            opacity={op}
          />
        );
      })}
    </svg>
  );
};

/** FoodCard — маленькая фото-карточка с frame.
 *  Используется для C10/C11 чтобы добавить визуальную глубину. */
export const FoodCard: React.FC<{
  src: string; x: number; y: number; w: number; rot: number; opacity?: number;
}> = ({src, x, y, w, rot, opacity = 0.85}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: w * 0.72,
    transform: `rotate(${rot}deg)`,
    border: '5px solid rgba(255,255,255,0.85)',
    boxShadow: '0 18px 36px rgba(0,0,0,0.5), 0 0 30px rgba(74,222,128,0.3)',
    overflow: 'hidden',
    opacity,
    pointerEvents: 'none',
  }}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.2)'}} />
  </div>
);

/** EnergyBeam — горизонтальный/диагональный энергетический луч-вспышка.
 *  Используется для C2 ring-scan, C16 progress impact. */
export const EnergyBeam: React.FC<{
  frame: number; startFrame: number; x: number; y: number;
  width?: number; angle?: number; color?: string;
}> = ({frame, startFrame, x, y, width = 600, angle = 0, color = 'rgba(255,255,255,0.85)'}) => {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / 18));
  if (t <= 0 || t >= 1) return null;
  const w = width * t;
  const op = Math.sin(t * Math.PI) * 0.9;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: 6,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      transform: `translateX(-50%) rotate(${angle}deg)`,
      transformOrigin: 'center',
      opacity: op,
      boxShadow: `0 0 22px ${color}, 0 0 60px ${color}`,
      pointerEvents: 'none',
    }} />
  );
};

/** Lens flare — static radial burst (НЕ ring, hex shape) */
export const LensFlare: React.FC<{x: number; y: number; size?: number; opacity?: number; color?: string}> = ({
  x, y, size = 240, opacity = 0.7, color = '#fff5d0',
}) => (
  <div style={{
    position: 'absolute', left: x - size/2, top: y - size/2,
    width: size, height: size,
    background: `radial-gradient(circle, ${color} 0%, transparent 40%)`,
    opacity, pointerEvents: 'none', mixBlendMode: 'screen',
  }}>
    {/* Cross spikes */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      width: size * 1.6, height: 3,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      transform: 'translate(-50%, -50%)',
      opacity: 0.85,
    }} />
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      width: 3, height: size * 1.6,
      background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
      transform: 'translate(-50%, -50%)',
      opacity: 0.85,
    }} />
  </div>
);

/** Camera shake — subtle wiggle. V9: amp клампим до 3px чтобы убрать "дёрганость". */
export const cameraShake = (frame: number, fromFrame: number, dur = 8, amp = 8): {x: number; y: number} => {
  const t = Math.max(0, Math.min(1, (frame - fromFrame) / dur));
  if (t >= 1) return {x: 0, y: 0};
  const decay = 1 - t;
  const clampedAmp = Math.min(3, amp); // V9: hard clamp
  return {
    x: Math.sin(frame * 1.0) * clampedAmp * decay, // V9: slower freq 1.4→1.0
    y: Math.cos(frame * 1.2) * clampedAmp * decay,
  };
};

/** God-rays vertical from top — атмосфера */
export const GodRays: React.FC<{frame: number; opacity?: number; angle?: number}> = ({
  frame, opacity = 0.18, angle = -8,
}) => {
  const sway = Math.sin(frame * 0.015) * 5;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none', mixBlendMode: 'screen',
    }}>
      {Array.from({length: 3}).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '-15%',
          left: `${20 + i * 30}%`,
          width: 300, height: '130%',
          background: `linear-gradient(180deg, rgba(255,235,170,${opacity}) 0%, transparent 70%)`,
          transform: `rotate(${angle + sway + i * 2}deg)`,
        }} />
      ))}
    </div>
  );
};
