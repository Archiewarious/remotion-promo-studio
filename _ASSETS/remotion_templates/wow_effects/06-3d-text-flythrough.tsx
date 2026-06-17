/**
 * WOW EFFECT #6 — 3D TEXT FLY-THROUGH (камера пролетает сквозь слова в глубину)
 * ⭐⭐⭐⭐⭐ Сложность: средняя | Вау-фактор: кинематографичный
 *
 * Слова расставлены по оси Z, камера летит вперёд (perspective + translateZ).
 * Каждое слово влетает из глубины, проходит мимо камеры и улетает. CSS 3D-перспектива.
 * Без three.js — чистый CSS transform-style: preserve-3d. Детерминировано по frame.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from "remotion";

export default function Text3DFlythrough({
  words = ["УСПІШНИЙ", "БІЗНЕС", "МОЖЕ", "КОЖЕН"],
  color = "#ffffff",
  accent = "#4ADE80",
  fontFamily = "Caveat, sans-serif",
  framesPerWord = 22,
}: {
  words?: string[];
  color?: string;
  accent?: string;
  fontFamily?: string;
  framesPerWord?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camZ = frame * 26; // скорость пролёта камеры

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        perspective: 800,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ transformStyle: "preserve-3d", position: "relative" }}>
        {words.map((w, i) => {
          const wordZ = i * framesPerWord * 26;
          const z = wordZ - camZ; // позиция относительно камеры
          if (z < -400 || z > 2600) return null; // не рисуем далёкие/прошедшие
          const opacity = interpolate(z, [2600, 1800, 200, -200, -400], [0, 1, 1, 0.4, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%,-50%) translateZ(${-z}px)`,
                color: i % 2 === 0 ? color : accent,
                fontFamily,
                fontWeight: 700,
                fontSize: height * 0.2,
                opacity,
                whiteSpace: "nowrap",
                textShadow: "0 8px 40px rgba(0,0,0,0.5)",
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
