/**
 * WOW EFFECT #10 — GOLDEN BOKEH + CONFETTI BURST (золотое боке + конфетти)
 * ⭐⭐⭐⭐ Сложность: средняя | Вау-фактор: праздничный/премиум
 *
 * Два слоя: (1) мягкие расфокус-круги боке плавно дрейфуют (фон-роскошь);
 * (2) при триггере — взрыв конфетти-частиц с гравитацией и вращением.
 * Идеально для финала/CTA «успіх», момента празднования. Детерминировано по frame.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { useRef, useEffect } from "react";

const rand = (i: number) => {
  const x = Math.sin(i * 27.31) * 19211.3;
  return x - Math.floor(x);
};

export default function GoldenBokehConfetti({
  bokehCount = 22,
  confettiCount = 120,
  burstFrame = 0,
  colors = ["#FFD700", "#FFC04D", "#FFE9A8", "#4ADE80", "#ffffff"],
}: {
  bokehCount?: number;
  confettiCount?: number;
  burstFrame?: number;
  colors?: string[];
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // --- слой боке ---
    for (let i = 0; i < bokehCount; i++) {
      const bx = (rand(i) * width + frame * (0.3 + rand(i + 1) * 0.6)) % width;
      const by = rand(i + 7) * height + Math.sin(frame * 0.02 + i) * 30;
      const r = 30 + rand(i + 3) * 90;
      const op = 0.05 + rand(i + 5) * 0.12;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, r);
      grad.addColorStop(0, `rgba(255,215,0,${op})`);
      grad.addColorStop(1, "rgba(255,215,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
    }

    // --- слой конфетти (после burstFrame) ---
    const t = frame - burstFrame;
    if (t >= 0) {
      for (let i = 0; i < confettiCount; i++) {
        const ang = rand(i) * Math.PI * 2;
        const speed = 8 + rand(i + 2) * 14;
        const vx = Math.cos(ang) * speed;
        const vy = Math.sin(ang) * speed - 6;
        const x = width / 2 + vx * t;
        const y = height / 2 + vy * t + 0.4 * t * t; // гравитация
        if (y > height + 40) continue;
        const rot = t * (0.1 + rand(i + 4) * 0.3);
        const op = Math.max(0, 1 - t / 90);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalAlpha = op;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(-5, -3, 10, 6);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, bokehCount, confettiCount, burstFrame, colors, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
}
