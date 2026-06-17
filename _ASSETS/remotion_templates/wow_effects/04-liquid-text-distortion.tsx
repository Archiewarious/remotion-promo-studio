/**
 * WOW EFFECT #4 — LIQUID TEXT DISTORTION (текст течёт/плавится как жидкость)
 * ⭐⭐⭐⭐⭐ Сложность: средне-высокая | Вау-фактор: премиум
 *
 * Текст рисуется построчно тонкими полосами, каждая полоса смещается по синус-волне
 * (displacement). Создаёт эффект жидкого/желейного дрожания и «втекания».
 * SVG-фильтр feTurbulence+feDisplacementMap даёт органическую дисторсию.
 * Анимация displacement seed по frame.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";

export default function LiquidTextDistortion({
  text = "прошлого проекта",
  color = "#ffffff",
  fontFamily = "Caveat, sans-serif",
  intensity = 18,
}: {
  text?: string;
  color?: string;
  fontFamily?: string;
  intensity?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // медленно плывущая турбулентность
  const baseFreq = 0.008 + Math.sin(frame * 0.03) * 0.004;
  const seed = Math.floor(frame / 3);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <svg width={width} height={height}>
        <defs>
          <filter id="liquid">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${baseFreq} ${baseFreq * 1.5}`}
              numOctaves={2}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={color}
          fontFamily={fontFamily}
          fontWeight={700}
          fontSize={height * 0.25}
          filter="url(#liquid)"
        >
          {text}
        </text>
      </svg>
    </AbsoluteFill>
  );
}
