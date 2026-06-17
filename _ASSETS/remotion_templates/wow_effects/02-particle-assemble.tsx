/**
 * WOW EFFECT #2 — PARTICLE ASSEMBLE (текст/лого СОБИРАЕТСЯ из летящих частиц)
 * ⭐⭐⭐⭐⭐ Сложность: высокая | Вау-фактор: божественный
 *
 * Обратный к рассыпанию: частицы прилетают с краёв экрана и складываются в текст.
 * Каждая частица стартует из случайной точки за кадром, по spring-easing летит в
 * свою целевую позицию (пиксель текста). Детерминировано по frame.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { useMemo, useRef, useEffect } from "react";

const rand = (i: number) => {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
// плавный ease-out-cubic
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function ParticleAssemble({
  text = "прошлого проекта",
  color = "#4ADE80",
  startFrame = 0,
  durationFrames = 45,
  fontFamily = "Caveat, sans-serif",
}: {
  text?: string;
  color?: string;
  startFrame?: number;
  durationFrames?: number;
  fontFamily?: string;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const p = Math.max(0, Math.min(1, (frame - startFrame) / durationFrames));

  const points = useMemo(() => {
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const ctx = off.getContext("2d");
    if (!ctx) return [] as { tx: number; ty: number; sx: number; sy: number }[];
    ctx.font = `bold ${Math.floor(height * 0.22)}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(text, width / 2, height / 2);
    const img = ctx.getImageData(0, 0, width, height).data;
    const step = 5;
    const pts = [];
    let i = 0;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (img[(y * width + x) * 4 + 3] > 128) {
          // стартовая точка — за краем кадра по случайному направлению
          const ang = rand(i) * Math.PI * 2;
          const dist = 600 + rand(i + 7) * 800;
          pts.push({
            tx: x,
            ty: y,
            sx: x + Math.cos(ang) * dist,
            sy: y + Math.sin(ang) * dist,
          });
          i++;
        }
      }
    }
    return pts;
  }, [text, width, height, fontFamily]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    for (let i = 0; i < points.length; i++) {
      const { tx, ty, sx, sy } = points[i];
      const delay = rand(i + 3) * 0.4; // частицы прилетают вразнобой
      const local = Math.max(0, Math.min(1, (p - delay) / (1 - 0.4)));
      const e = easeOut(local);
      const x = sx + (tx - sx) * e;
      const y = sy + (ty - sy) * e;
      ctx.globalAlpha = 0.3 + e * 0.7;
      const s = 3 - e * 1.5;
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
  }, [points, p, color, width, height]);

  return (
    <AbsoluteFill>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
}
