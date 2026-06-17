import React from "react";
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

// Parallax pan over an image — frame-based Remotion (was CSS @keyframes/next-image, rewritten).
// Length driven by the Sequence/composition. For render, point imageUrl to staticFile('public/...').
interface ParallaxPanProps {
  imageUrl?: string;
  direction?: "left-right" | "right-left" | "top-bottom" | "bottom-top";
  scale?: number;
  amount?: number; // pan distance in %
}

export const ParallaxPan: React.FC<ParallaxPanProps> = ({
  imageUrl = "https://images.pexels.com/photos/1644724/pexels-photo-1644724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  direction = "left-right",
  scale = 1.2,
  amount = 20,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], {extrapolateRight: "clamp"});
  let tx = 0;
  let ty = 0;
  if (direction === "left-right") tx = -amount * p;
  else if (direction === "right-left") tx = -amount * (1 - p);
  else if (direction === "top-bottom") ty = -amount * p;
  else ty = -amount * (1 - p);
  return (
    <AbsoluteFill style={{backgroundColor: "black", overflow: "hidden"}}>
      <Img
        src={imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

export default ParallaxPan;
