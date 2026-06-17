/**
 * WriteOnText — текст с эффектом «как-будто написанная рукой» подачи.
 * ─────────────────────────────────────────────────────────
 * Раскрывается слева направо через clip-path polygon с СЛЕГКА ДИАГОНАЛЬНЫМ
 * фронтом — имитирует движение пера. Опциональный tilt (правая сторона
 * приподнята/опущена) + лёгкий settle-scale в конце. Подходит для рукописных
 * шрифтов (Caveat и т.п.).
 *
 * ПРИМЕНЕНИЕ:
 *   <WriteOnText frame={frame} startFrame={74} duration={30}
 *                fontSize={156} tiltDeg={-5}>
 *     your <span style={{color: '#4ADE80'}}>highlight</span>
 *   </WriteOnText>
 *
 * props:
 *   frame       — useCurrentFrame()
 *   startFrame  — кадр начала write-on
 *   duration    — длительность раскрытия (по умолчанию 28)
 *   fontSize    — px (default 156)
 *   tiltDeg     — наклон в градусах (default -5; отрицательный = правая сторона ВВЕРХ)
 *   color       — основной цвет текста (default white)
 *   topPct      — вертикальная позиция в % высоты viewport (default 56)
 *   slantPct    — наклон фронта реveal-маски в % (default 4) — больше = острее перо
 *   zIndex      — стек (default 25)
 *   strongShadow — усиленная тень для читаемости поверх B-roll (default true)
 *   children    — содержимое (можно вкладывать span с другим цветом)
 *
 * ВНУТРЕННЕ: clip-path: polygon(0 0, R% 0, (R+slant)% 100%, 0 100%) — диагональный
 * правый край маски, движется от R=0 до R=100. После раскрытия — лёгкий spring settle.
 *
 * УРОК: для рукописного эффекта clip-path лучше чем letter-by-letter opacity —
 * сохраняется иллюзия НЕПРЕРЫВНОГО движения пера, не «вспышки».
 *
 * ПОИСК: "write on", "написанный", "рукописный", "перо", "clip-path reveal".
 */
import React from 'react';
import {interpolate, spring} from 'remotion';

interface Props {
  frame: number;
  startFrame: number;
  duration?: number;
  fontSize?: number;
  tiltDeg?: number;
  color?: string;
  topPct?: number;
  slantPct?: number;
  zIndex?: number;
  strongShadow?: boolean;
  fontFamily?: string;
  letterSpacing?: number;
  children: React.ReactNode;
}

export const WriteOnText: React.FC<Props> = ({
  frame, startFrame, duration = 28,
  fontSize = 156, tiltDeg = -5, color = '#FFFFFF',
  topPct = 56, slantPct = 4, zIndex = 25,
  strongShadow = true, fontFamily, letterSpacing = 2,
  children,
}) => {
  const endFrame = startFrame + duration;
  const reveal = interpolate(frame, [startFrame, endFrame], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const settle = spring({
    frame: frame - (endFrame - 4), fps: 30,
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
