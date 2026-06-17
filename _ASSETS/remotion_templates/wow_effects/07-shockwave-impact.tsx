/**
 * WOW EFFECT #7 — SHOCKWAVE IMPACT (ударная волна при появлении цифры/слова)
 * ⭐⭐⭐⭐ Сложность: средняя | Вау-фактор: мощный акцент
 *
 * Цифра «бьёт» по экрану: расходящиеся кольца-волны + вспышка + radial-искажение +
 * shake. Идеально на момент звучания ключевой цифры ($5000, 33%). spring-вход.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill, spring, interpolate } from "remotion";

export default function ShockwaveImpact({
  text = "$5 000",
  color = "#ffffff",
  ringColor = "#4ADE80",
  fontFamily = "Caveat, sans-serif",
}: {
  text?: string;
  color?: string;
  ringColor?: string;
  fontFamily?: string;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 9, stiffness: 180, mass: 0.6 } });
  const scale = interpolate(pop, [0, 1], [0.3, 1]);
  // shake затухает
  const shakeAmt = Math.max(0, 1 - frame / 12);
  const shakeX = Math.sin(frame * 4) * 14 * shakeAmt;
  const shakeY = Math.cos(frame * 5) * 10 * shakeAmt;
  const flash = Math.max(0, 1 - frame / 6);

  const rings = [0, 6, 12].map((delay) => {
    const t = Math.max(0, frame - delay);
    const r = t * 28;
    const op = Math.max(0, 1 - t / 30);
    return { r, op };
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {rings.map((ring, i) => (
          <circle
            key={i}
            cx={width / 2}
            cy={height / 2}
            r={ring.r}
            fill="none"
            stroke={ringColor}
            strokeWidth={6}
            opacity={ring.op}
          />
        ))}
      </svg>
      <div
        style={{
          color,
          fontFamily,
          fontWeight: 700,
          fontSize: height * 0.3,
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
          textShadow: `0 0 ${40 * flash + 10}px ${ringColor}`,
        }}
      >
        {text}
      </div>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash * 0.7, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
}
