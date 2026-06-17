/**
 * WOW EFFECT #12 — IMAGE DISPLACEMENT REVEAL (фото проявляется через жидкое искажение)
 * ⭐⭐⭐⭐⭐ Сложность: средне-высокая | Вау-фактор: премиум (awwwards-стиль)
 *
 * Изображение появляется не просто фейдом, а «протекает» через турбулентную
 * дисторсию: сильное искажение в начале → выравнивается к концу. Плюс лёгкий зум.
 * SVG feTurbulence+feDisplacementMap, scale анимируется от большого к 0.
 * Для оживления фото еды/заведений прошлого проекта при входе сцены.
 */
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, interpolate } from "remotion";

export default function ImageDisplacementReveal({
  src,
  revealFrames = 35,
}: {
  src: string;
  revealFrames?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // искажение: большое → 0
  const scale = interpolate(frame, [0, revealFrames], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, revealFrames * 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // лёгкий ken-burns зум
  const zoom = interpolate(frame, [0, revealFrames + 60], [1.15, 1.0], {
    extrapolateRight: "clamp",
  });
  const seed = Math.floor(frame / 2);
  const baseFreq = interpolate(frame, [0, revealFrames], [0.02, 0.006], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "transparent" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="displace-reveal">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFreq}
              numOctaves={2}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} />
          </filter>
        </defs>
      </svg>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity,
          filter: "url(#displace-reveal)",
          transform: `scale(${zoom})`,
        }}
      />
    </AbsoluteFill>
  );
}
