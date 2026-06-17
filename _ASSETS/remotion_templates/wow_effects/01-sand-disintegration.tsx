/**
 * WOW EFFECT #1 — SAND DISINTEGRATION (текст/картинка рассыпается в песок)
 * ⭐⭐⭐⭐⭐ Сложность: высокая | Вау-фактор: божественный
 *
 * Как работает: рисуем текст на offscreen-canvas, читаем пиксели (getImageData),
 * каждый непрозрачный пиксель = песчинка. По мере прогресса (frame) песчинки
 * разлетаются вправо-вверх по псевдо-noise полю + гравитация + затухание.
 * Детерминировано по frame (рендерится покадрово, без симуляции по времени).
 *
 * Параметры: text, color, direction. По умолчанию рассыпается слева-направо (как ветром).
 * Для картинки — заменить рисование текста на drawImage(img).
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { useMemo, useRef, useEffect } from "react";

// псевдослучайность детерминированная
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export default function SandDisintegration({
  text = "прошлого проекта",
  color = "#ffffff",
  startFrame = 0,
  durationFrames = 60,
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

  // прогресс рассыпания 0..1
  const p = Math.max(0, Math.min(1, (frame - startFrame) / durationFrames));

  // считаем точки текста один раз
  const points = useMemo(() => {
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const ctx = off.getContext("2d");
    if (!ctx) return [] as { x: number; y: number }[];
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.floor(height * 0.22)}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
    const img = ctx.getImageData(0, 0, width, height).data;
    const step = 4; // плотность песка (меньше = больше частиц = тяжелее)
    const pts: { x: number; y: number }[] = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (img[(y * width + x) * 4 + 3] > 128) pts.push({ x, y });
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
      const { x, y } = points[i];
      // у каждой песчинки своя задержка по X (рассыпание волной слева-направо)
      const delay = (x / width) * 0.5;
      const local = Math.max(0, Math.min(1, (p - delay) / (1 - 0.5)));
      const e = local * local; // ease-in
      const drift = rand(i) - 0.5;
      const dx = e * (120 + rand(i + 1) * 200); // унос вправо
      const dy = e * (drift * 80) + e * e * 60; // turbulence + гравитация
      const px = x + dx;
      const py = y + dy;
      const alpha = 1 - e;
      if (alpha <= 0.02) continue;
      ctx.globalAlpha = alpha;
      const s = 1 + e * 1.5;
      ctx.fillRect(px, py, s, s);
    }
    ctx.globalAlpha = 1;
  }, [points, p, color, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
}
