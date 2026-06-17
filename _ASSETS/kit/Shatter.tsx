/**
 * Shatter — РАСПАД контента на осколки (выход сцены) ИЛИ сборка из осколков (вход).
 * ─────────────────────────────────────────────────────────
 * Оборачивает любой контент (логотип, текст, картинку) и в нужный момент
 * рассыпает его на сетку прямоугольных осколков (clip-path: inset()).
 * Каждый осколок летит наружу от центра + случайный разброс, вращается,
 * падает (гравитация), затухает. Детерминировано (rnd по индексу) — стабильный рендер.
 *
 * ИСПОЛЬЗОВАНИЕ:
 *   const p = interpolate(frame, [63, 79], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
 *   <Shatter progress={p} rows={6} cols={8} seed={1}>
 *     <МойЛоготип/>
 *   </Shatter>
 *
 *   // ВХОД (сборка из осколков): progress 1→0
 *   const pIn = interpolate(frame, [0, 16], [1,0], {...clamp});
 *
 * ПАРАМЕТРЫ:
 *   progress  0 = целое (швов нет), 1 = полностью разлетелось.
 *   rows/cols сетка осколков (лого ~6×8, строка текста ~3×10).
 *   seed      разный у разных слоёв (чтобы осколки летели по-разному).
 *   spread    дальность разлёта в px (по умолч. 120 + до 360).
 *   gravity   сила падения вниз (по умолч. 220).
 *   spin      макс. вращение в градусах (по умолч. 200).
 * ПОИСК: "распад", "осколки", "shatter", "рассыпается", "выход сцены".
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 7.13) * 43758.5453;
  return x - Math.floor(x);
};

interface ShatterProps {
  progress: number;
  rows?: number;
  cols?: number;
  seed?: number;
  spread?: number;
  gravity?: number;
  spin?: number;
  children: React.ReactNode;
}

export const Shatter: React.FC<ShatterProps> = ({
  progress, rows = 6, cols = 8, seed = 0, spread = 360, gravity = 220, spin = 200, children,
}) => {
  if (progress <= 0) {
    // целая картинка — без нарезки (нет швов между осколками)
    return <>{children}</>;
  }
  const cells: React.ReactNode[] = [];
  const e = progress * progress; // ease-in
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c + seed * 100;
      const cx = (c + 0.5) / cols;
      const cy = (r + 0.5) / rows;
      // вектор наружу от центра кадра + случайный разброс
      const dirX = (cx - 0.5) * 2 + (rnd(idx) - 0.5) * 0.8;
      const dirY = (cy - 0.5) * 2 + (rnd(idx + 1) - 0.5) * 0.8;
      const dist = 120 + rnd(idx + 2) * spread;
      const tx = dirX * dist * e;
      const ty = dirY * dist * e + e * e * gravity;
      const rot = (rnd(idx + 3) - 0.5) * spin * e;
      const sc = 1 - e * 0.5;
      const alpha = Math.max(0, 1 - e * 1.15);
      const top = (r / rows) * 100;
      const bottom = ((rows - r - 1) / rows) * 100;
      const left = (c / cols) * 100;
      const right = ((cols - c - 1) / cols) * 100;
      cells.push(
        <div
          key={idx}
          style={{
            position: 'absolute', inset: 0,
            clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)`,
            transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`,
            opacity: alpha,
            willChange: 'transform, opacity',
          }}
        >
          {children}
        </div>
      );
    }
  }
  return <AbsoluteFill>{cells}</AbsoluteFill>;
};
