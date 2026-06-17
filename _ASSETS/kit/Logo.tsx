/**
 * Logo watermark — always rendered in bottom-left corner.
 * Fades in over first 20 frames of its first appearance.
 */
import React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {springIn} from './anim';

interface LogoProps {
  frame: number;
  /** Opacity override 0-1 (default 1) */
  opacity?: number;
  /** имя файла лого в public/ (per-project) */
  src?: string;
}

export const Logo: React.FC<LogoProps> = ({frame, opacity = 1, src = 'logo_watermark.png'}) => {
  const {fps} = useVideoConfig();
  const entry = Math.min(springIn(frame, fps, {damping: 20, stiffness: 80}), 1);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 32,
        left: 36,
        width: 88,
        height: 88,
        opacity: entry * opacity,
        transform: `scale(${0.6 + entry * 0.4})`,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'contain'}}
      />
    </div>
  );
};
