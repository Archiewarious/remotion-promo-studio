import React from "react";
import {AbsoluteFill, Img, interpolate, Easing, useCurrentFrame, useVideoConfig} from "remotion";

// Ken Burns (slow zoom + pan) — frame-based Remotion. Length is driven by the Sequence/composition,
// not a CSS duration. Drop into src/scenes/, point imageUrl to staticFile('public/...') for render.
interface KenBurnsProps {
  imageUrl?: string;
  scale?: number; // end scale
  translateX?: number; // px at end
  translateY?: number;
}

export const KenBurns: React.FC<KenBurnsProps> = ({
  imageUrl = "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
  scale = 1.5,
  translateX = -50,
  translateY = -30,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const s = 1 + (scale - 1) * p;
  return (
    <AbsoluteFill style={{backgroundColor: "black", overflow: "hidden"}}>
      <Img
        src={imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s}) translate(${translateX * p}px, ${translateY * p}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export default KenBurns;
