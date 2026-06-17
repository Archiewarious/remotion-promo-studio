/**
 * write-on-clip-path — текст с эффектом «как-будто написанная рукой» подачи.
 * ─────────────────────────────────────────────────────────
 * Раскрытие текста слева→направо через clip-path polygon с СЛЕГКА ДИАГОНАЛЬНЫМ
 * правым фронтом маски — имитация движения пера. Опциональный tilt
 * (правая сторона приподнята/опущена) + лёгкий settle-spring в финале.
 *
 * ПОЧЕМУ clip-path, а не letter-by-letter opacity:
 *   letter-by-letter создаёт «вспышки» отдельных букв (не похоже на рисование пером).
 *   clip-path с диагональным фронтом сохраняет иллюзию НЕПРЕРЫВНОГО движения.
 *
 * РАБОТАЕТ С: любой рукописный шрифт (Caveat, Permanent Marker, Kalam),
 *   также с обычными шрифтами (но рукописные → правдоподобнее).
 *
 * Создан в проекте прошлого проекта (концовка прошлого проекта, сцена C2 «ROI 33%»),
 * 2026-05-23. Реальная история: клиент попросил подпись «как написанная»,
 * выбран clip-path подход (не SVG-text-path) для скорости и работы с любым шрифтом.
 */
import React from 'react';
import {interpolate, spring} from 'remotion';

interface Props {
  /** useCurrentFrame() */
  frame: number;
  /** Кадр старта раскрытия */
  startFrame: number;
  /** Длительность раскрытия (default 28) */
  duration?: number;
  fontSize?: number;
  /** Наклон в градусах. Отрицательный = правая сторона ВВЕРХ (default -5) */
  tiltDeg?: number;
  color?: string;
  /** Вертикальная позиция (% высоты viewport, default 56) */
  topPct?: number;
  /** Острота фронта пера в % (default 4 — больше = резче, 0 = вертикальный фронт) */
  slantPct?: number;
  zIndex?: number;
  /** Усиленная тень для читаемости поверх B-roll (default true) */
  strongShadow?: boolean;
  fontFamily?: string;
  letterSpacing?: number;
  /** Текст или JSX (можно с <span style={{color:'…'}}> для акцентов) */
  children: React.ReactNode;
  /** FPS (default 30) */
  fps?: number;
}

export const WriteOnClipPath: React.FC<Props> = ({
  frame, startFrame, duration = 28,
  fontSize = 156, tiltDeg = -5, color = '#FFFFFF',
  topPct = 56, slantPct = 4, zIndex = 25,
  strongShadow = true, fontFamily, letterSpacing = 2,
  fps = 30,
  children,
}) => {
  const endFrame = startFrame + duration;
  const reveal = interpolate(frame, [startFrame, endFrame], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const settle = spring({
    frame: frame - (endFrame - 4), fps,
    config: {damping: 18, stiffness: 110},
  });

  const shadow = strongShadow
    ? '0 6px 30px rgba(0,0,0,0.98), 0 0 18px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.95)'
    : '0 4px 18px rgba(0,0,0,0.7)';

  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top: `${topPct}%`,
        textAlign: 'center',
        fontFamily, fontWeight: 700, fontSize, color, letterSpacing, lineHeight: 1,
        transform: `translateY(-50%) rotate(${tiltDeg}deg) scale(${0.985 + settle * 0.015})`,
        textShadow: shadow,
        clipPath: `polygon(0% 0%, ${reveal}% 0%, ${Math.min(reveal + slantPct, 100 + slantPct)}% 100%, 0% 100%)`,
        zIndex, pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
};

/* ───── ПРИМЕР ─────
import {useCurrentFrame} from 'remotion';
import {WriteOnClipPath} from './write-on-clip-path';

export const Demo = () => {
  const frame = useCurrentFrame();
  return (
    <WriteOnClipPath
      frame={frame} startFrame={20} duration={30}
      fontSize={156} tiltDeg={-5} topPct={56}
      fontFamily="Caveat"
    >
      write-on <span style={{color: '#4ADE80'}}>highlight</span>
    </WriteOnClipPath>
  );
};
*/
