import React from "react";
import {AbsoluteFill, useVideoConfig} from "remotion";
import {TransitionSeries, linearTiming, springTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";

// Real scene-to-scene transitions via @remotion/transitions (fade / slide / wipe).
// Replace <Panel> with your actual scenes; tune each Sequence durationInFrames + transition timing.
// Composition duration = sum of sequences MINUS the transition overlaps.
const Panel: React.FC<{bg: string; label: string}> = ({bg, label}) => (
  <AbsoluteFill style={{background: bg, justifyContent: "center", alignItems: "center", color: "#fff", fontSize: 96, fontWeight: 800, fontFamily: "sans-serif", letterSpacing: 1}}>
    {label}
  </AbsoluteFill>
);

export const SceneTransitions: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={2 * fps}>
        <Panel bg="#0f172a" label="Scene 1" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={springTiming({config: {damping: 200}})} />
      <TransitionSeries.Sequence durationInFrames={2 * fps}>
        <Panel bg="#1e293b" label="Scene 2" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: "from-right"})} timing={linearTiming({durationInFrames: Math.round(0.7 * fps)})} />
      <TransitionSeries.Sequence durationInFrames={2 * fps}>
        <Panel bg="#334155" label="Scene 3" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: "from-bottom-right"})} timing={linearTiming({durationInFrames: Math.round(0.6 * fps)})} />
      <TransitionSeries.Sequence durationInFrames={2 * fps}>
        <Panel bg="#475569" label="Scene 4" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

export default SceneTransitions;
