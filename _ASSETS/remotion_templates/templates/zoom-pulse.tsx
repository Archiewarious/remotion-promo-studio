import React from "react";
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from "remotion";

// Gentle zoom pulse on an image — frame-based Remotion (was CSS @keyframes/next-image, rewritten).
// Smooth sine breathing; for render, point imageUrl to staticFile('public/...').
interface ZoomPulseProps {
  imageUrl?: string;
  periodInSeconds?: number;
  minScale?: number;
  maxScale?: number;
}

export const ZoomPulse: React.FC<ZoomPulseProps> = ({
  imageUrl = "https://images.pexels.com/photos/1726310/pexels-photo-1726310.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  periodInSeconds = 4,
  minScale = 1,
  maxScale = 1.1,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (Math.sin((frame / (periodInSeconds * fps)) * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0->1->0
  const scale = minScale + (maxScale - minScale) * t;
  return (
    <AbsoluteFill style={{backgroundColor: "black", overflow: "hidden"}}>
      <Img
        src={imageUrl}
        style={{width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`}}
      />
    </AbsoluteFill>
  );
};

export default ZoomPulse;
