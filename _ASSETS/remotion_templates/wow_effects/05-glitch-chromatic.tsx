/**
 * WOW EFFECT #5 — GLITCH + CHROMATIC ABERRATION (цифровой глитч с RGB-сдвигом)
 * ⭐⭐⭐⭐⭐ Сложность: средняя | Вау-фактор: агрессивный/кибер
 *
 * Текст троится в R/G/B-каналы со смещением (хроматическая аберрация), плюс
 * случайные горизонтальные «срезы» (slice glitch) и дёрганье по X.
 * Идеально для резких акцентов/ударов цифр. Детерминировано по frame.
 */
import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";

const rand = (i: number) => {
  const x = Math.sin(i * 33.71) * 9999.7;
  return x - Math.floor(x);
};

export default function GlitchChromatic({
  text = "33%",
  fontFamily = "Caveat, sans-serif",
  fontSize = 320,
}: {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
}) {
  const frame = useCurrentFrame();

  // вспышки глитча каждые ~12 кадров
  const glitchPhase = frame % 12;
  const glitchActive = glitchPhase < 3;
  const shift = glitchActive ? (rand(frame) - 0.5) * 24 : 4 + Math.sin(frame * 0.4) * 2;
  const jitterX = glitchActive ? (rand(frame + 1) - 0.5) * 30 : 0;

  // случайные горизонтальные срезы
  const slices = glitchActive
    ? Array.from({ length: 5 }).map((_, i) => ({
        top: rand(frame + i * 7) * 100,
        h: 4 + rand(frame + i * 3) * 12,
        dx: (rand(frame + i * 5) - 0.5) * 60,
      }))
    : [];

  const layer = (col: string, dx: number, dy: number, blend: string) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: col,
        fontFamily,
        fontWeight: 700,
        fontSize,
        transform: `translate(${dx}px, ${dy}px)`,
        mixBlendMode: blend as any,
      }}
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", transform: `translateX(${jitterX}px)` }}>
      {layer("#ff0040", -shift, 0, "screen")}
      {layer("#00ffe0", shift, 0, "screen")}
      {layer("#ffffff", 0, 0, "normal")}
      {slices.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${s.top}%`,
            height: `${s.h}%`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontFamily,
            fontWeight: 700,
            fontSize,
            transform: `translateX(${s.dx}px)`,
            overflow: "hidden",
            clipPath: `inset(0)`,
          }}
        >
          {text}
        </div>
      ))}
    </AbsoluteFill>
  );
}
