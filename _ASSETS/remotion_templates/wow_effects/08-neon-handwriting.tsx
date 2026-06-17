/**
 * WOW EFFECT #8 — NEON HANDWRITING REVEAL (текст «пишется» рукой с неон-свечением)
 * ⭐⭐⭐⭐⭐ Сложность: средняя | Вау-фактор: премиум, идеально под рукописный бренд
 *
 * SVG-текст обводится по контуру (stroke-dashoffset анимация = «рисование от руки»),
 * затем заливается + неоновое свечение (несколько слоёв drop-shadow).
 * ИДЕАЛЬНО для прошлого проекта (рукописный Caveat + зелёный неон как на вывеске).
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from "remotion";

export default function NeonHandwriting({
  text = "прошлого проекта",
  stroke = "#4ADE80",
  fill = "#4ADE80",
  fontFamily = "Caveat, cursive",
  drawFrames = 50,
}: {
  text?: string;
  stroke?: string;
  fill?: string;
  fontFamily?: string;
  drawFrames?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const PATH_LEN = 2000;
  const dash = interpolate(frame, [0, drawFrames], [PATH_LEN, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // заливка появляется после прорисовки контура
  const fillOpacity = interpolate(frame, [drawFrames, drawFrames + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // мерцание неона
  const glow = 18 + Math.sin(frame * 0.3) * 6 + fillOpacity * 14;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
      <svg
        width={width}
        height={height}
        style={{ filter: `drop-shadow(0 0 ${glow}px ${stroke}) drop-shadow(0 0 ${glow * 2}px ${stroke})` }}
      >
        {/* контур (рисуется) */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          fontFamily={fontFamily}
          fontWeight={700}
          fontSize={height * 0.3}
          style={{ strokeDasharray: PATH_LEN, strokeDashoffset: dash }}
        >
          {text}
        </text>
        {/* заливка (проявляется) */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={fill}
          fontFamily={fontFamily}
          fontWeight={700}
          fontSize={height * 0.3}
          opacity={fillOpacity}
        >
          {text}
        </text>
      </svg>
    </AbsoluteFill>
  );
}
