/**
 * WOW EFFECT #9 — PARTICLE MORPH (частицы перетекают из одной формы в другую)
 * ⭐⭐⭐⭐⭐ Сложность: высокая | Вау-фактор: гипнотический
 *
 * Один набор частиц морфит между двумя текстами/формами (напр. «$8» → «$5000»,
 * или цифра → лого). Частицы интерполируются между точками формы A и формы B
 * по ease, во время перехода разлетаются турбулентно. Детерминировано по frame.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { useMemo, useRef, useEffect } from "react";

const rand = (i: number) => {
  const x = Math.sin(i * 51.13) * 38211.7;
  return x - Math.floor(x);
};
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function sample(text: string, w: number, h: number, fontFamily: string) {
  const off = document.createElement("canvas");
  off.width = w; off.height = h;
  const ctx = off.getContext("2d")!;
  ctx.font = `bold ${Math.floor(h * 0.28)}px ${fontFamily}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, w / 2, h / 2);
  const img = ctx.getImageData(0, 0, w, h).data;
  const step = 6; const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step)
      if (img[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
  return pts;
}

export default function ParticleMorph({
  from = "$8",
  to = "$5 000",
  color = "#4ADE80",
  fontFamily = "Caveat, sans-serif",
  morphStart = 20,
  morphFrames = 30,
}: {
  from?: string; to?: string; color?: string; fontFamily?: string;
  morphStart?: number; morphFrames?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const A = useMemo(() => sample(from, width, height, fontFamily), [from, width, height, fontFamily]);
  const B = useMemo(() => sample(to, width, height, fontFamily), [to, width, height, fontFamily]);

  const p = Math.max(0, Math.min(1, (frame - morphStart) / morphFrames));
  const e = easeInOut(p);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    const n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i++) {
      const a = A[i % A.length];
      const b = B[i % B.length];
      // турбулентность в середине морфа
      const turb = Math.sin(e * Math.PI) * (rand(i) - 0.5) * 120;
      const x = a.x + (b.x - a.x) * e + turb;
      const y = a.y + (b.y - a.y) * e + turb * 0.6;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.globalAlpha = 1;
  }, [A, B, e, color, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
}
