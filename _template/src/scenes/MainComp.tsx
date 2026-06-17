/**
 * MainComp — точка входа. СТАРТЕР на KIT (движок выстрадан в прошлого проекта, вид НЕЙТРАЛЬНЫЙ).
 * Под проект: правь colors.ts (C.accent), fonts.ts (бренд-шрифт), текст ниже.
 * Сцены выноси в src/scenes/CN.tsx и собирай тут через <Sequence>
 * (паттерн SCENES[from,dur] + overlapFor — см. UNIVERSAL_VIDEO_PROMPT.md).
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandBG, ParticleField, LensFlare} from '../kit/BrandBG';   // ← общий движок (junction src/kit)
import {smoothIn, fadeInLong, fadeOutLong} from '../kit/smooth';    // ← общий движок
import {FONT} from '../utils/fonts';                                // ← бренд (per-project)
import {C} from '../utils/colors';                                  // ← бренд (per-project)

export const MainComp: React.FC<{duration?: number}> = ({duration = 300}) => {
  const frame = useCurrentFrame();
  const fi = fadeInLong(frame, 14);
  const fo = fadeOutLong(frame, duration, 16);
  const titleSp = smoothIn(frame, 4, 28);
  const subSp = smoothIn(frame, 24, 28);

  return (
    <AbsoluteFill style={{opacity: fi * fo, overflow: 'hidden'}}>
      <BrandBG frame={frame} tone="dark" showLeak={false} />
      <ParticleField frame={frame} count={16} type="fireflies" />

      <AbsoluteFill style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 14}}>
        <div style={{
          fontFamily: FONT, fontSize: 140, fontWeight: 800, color: C.accent,
          transform: `scale(${0.8 + titleSp * 0.2})`, opacity: titleSp, letterSpacing: 1,
          textShadow: `0 0 70px ${C.accentDim}, 0 14px 30px rgba(0,0,0,0.6)`,
        }}>
          НАЗВА ПРОЕКТУ
        </div>
        <div style={{
          fontFamily: FONT, fontSize: 56, fontWeight: 500, color: C.cream,
          opacity: subSp, transform: `translateY(${(1 - subSp) * 20}px)`, letterSpacing: 3,
          textShadow: '0 4px 14px rgba(0,0,0,0.6)',
        }}>
          підзаголовок
        </div>
      </AbsoluteFill>

      <LensFlare x={1400} y={400} size={420} opacity={0.35 * titleSp} color="#cfd8ee" />
    </AbsoluteFill>
  );
};
