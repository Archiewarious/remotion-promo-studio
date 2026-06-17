/**
 * WOW EFFECT #11 — GOD RAYS / VOLUMETRIC LIGHT (объёмные лучи света)
 * ⭐⭐⭐⭐ Сложность: средняя | Вау-фактор: кинематографичный/премиум
 *
 * Лучи света расходятся из точки (солнце за объектом), медленно вращаются и пульсируют.
 * Conic-gradient лучи + radial-блик. Кладётся как overlay (mix-blend: screen) поверх
 * B-roll/лого. Создаёт «божественный»/премиальный свет. Детерминировано по frame.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from "remotion";

export default function GodRaysLight({
  originX = 50,
  originY = 30,
  rayColor = "rgba(255, 240, 200, 0.5)",
  rays = 16,
}: {
  originX?: number;
  originY?: number;
  rayColor?: string;
  rays?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotate = frame * 0.15;
  const pulse = 0.7 + Math.sin(frame * 0.06) * 0.3;

  // строим conic-gradient из чередующихся лучей
  const stops: string[] = [];
  const seg = 360 / rays;
  for (let i = 0; i < rays; i++) {
    const a0 = i * seg;
    const a1 = a0 + seg * 0.5;
    const a2 = a0 + seg;
    stops.push(`transparent ${a0}deg`, `${rayColor} ${a1}deg`, `transparent ${a2}deg`);
  }
  const conic = `conic-gradient(from ${rotate}deg at ${originX}% ${originY}%, ${stops.join(",")})`;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", overflow: "hidden", mixBlendMode: "screen" }}>
      {/* лучи */}
      <div style={{ position: "absolute", inset: "-30%", background: conic, opacity: 0.5 * pulse, filter: "blur(8px)" }} />
      {/* центральный блик */}
      <div
        style={{
          position: "absolute",
          left: `${originX}%`,
          top: `${originY}%`,
          width: 600,
          height: 600,
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, rgba(255,245,210,${0.6 * pulse}) 0%, transparent 60%)`,
        }}
      />
    </AbsoluteFill>
  );
}
