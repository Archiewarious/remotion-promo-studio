/**
 * WOW EFFECT #3 — FLOW FIELD WIND PARTICLES (частицы летят по полю-ветру)
 * ⭐⭐⭐⭐⭐ Сложность: высокая | Вау-фактор: гипнотический
 *
 * Тысячи частиц движутся по векторному полю (flow field на основе value-noise).
 * Создаёт ощущение ветра/дыма/потока. Детерминировано: позиция частицы =
 * интеграл по полю, вычисляется аналитически от frame (без накопления состояния).
 * Цвет — фирменный зелёный с вариацией яркости.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { useRef, useEffect } from "react";

const rand = (i: number) => {
  const x = Math.sin(i * 91.7) * 47453.13;
  return x - Math.floor(x);
};
// дешёвый value-noise: угол поля в точке (x,y)
const fieldAngle = (x: number, y: number, t: number) => {
  return (
    Math.sin(x * 0.004 + t * 0.01) * 1.5 +
    Math.cos(y * 0.005 - t * 0.012) * 1.5 +
    Math.sin((x + y) * 0.002) * 0.8
  );
};

export default function FlowFieldWind({
  count = 1200,
  color = "#4ADE80",
  speed = 2.2,
}: {
  count?: number;
  color?: string;
  speed?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < count; i++) {
      // стартовая позиция частицы
      let x = rand(i) * width;
      let y = rand(i + 1000) * height;
      const life = 40 + rand(i + 5) * 60;
      const born = rand(i + 9) * 80;
      const age = ((frame - born) % life + life) % life;
      // интегрируем шаги по полю (детерминированно от age)
      const steps = Math.floor(age);
      for (let s = 0; s < steps; s++) {
        const a = fieldAngle(x, y, frame - age + s);
        x += Math.cos(a) * speed;
        y += Math.sin(a) * speed;
      }
      if (x < 0 || x > width || y < 0 || y > height) continue;
      const fade = Math.sin((age / life) * Math.PI); // появляется и гаснет
      ctx.globalAlpha = fade * 0.6;
      const bright = 0.6 + rand(i + 2) * 0.4;
      ctx.fillStyle = color;
      const sz = 1.5 + rand(i + 3) * 2;
      ctx.fillRect(x, y, sz, sz);
    }
    ctx.globalAlpha = 1;
  }, [frame, count, color, speed, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
}
