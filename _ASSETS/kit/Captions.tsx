// Captions.tsx — subtitle track from an @remotion/captions JSON (made by scripts/voicetiming.py --captions).
// Brand-agnostic: pass accent + font. Self-loads public/<src>. TikTok-style line with active-word highlight.
// 80% of social viewers watch muted -> subtitles are not optional for Reels/Shorts.
import React, {useEffect, useMemo, useState} from 'react';
import {useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender} from 'remotion';

export type Caption = {text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null};
type Line = {start: number; end: number; words: Caption[]};

const groupLines = (caps: Caption[], windowMs: number, gapMs: number): Line[] => {
  const lines: Line[] = [];
  let cur: Line | null = null;
  for (const c of caps) {
    if (!cur) {
      cur = {start: c.startMs, end: c.endMs, words: [c]};
      continue;
    }
    const tooLong = c.endMs - cur.start > windowMs;
    const gap = c.startMs - cur.end > gapMs;
    if (tooLong || gap) {
      lines.push(cur);
      cur = {start: c.startMs, end: c.endMs, words: [c]};
    } else {
      cur.words.push(c);
      cur.end = c.endMs;
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

export const Captions: React.FC<{
  src?: string;
  accent?: string;
  font?: string;
  fontSize?: number;
  bottom?: number;
  windowMs?: number;
  gapMs?: number;
}> = ({src = 'captions.json', accent = '#ffffff', font = 'inherit', fontSize = 54, bottom = 140, windowMs = 1400, gapMs = 350}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [caps, setCaps] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender('load-captions'));

  useEffect(() => {
    let alive = true;
    fetch(staticFile(src))
      .then((r) => r.json())
      .then((d: Caption[]) => {
        if (alive) setCaps(Array.isArray(d) ? d : []);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
    return () => {
      alive = false;
    };
  }, [handle, src]);

  // Group captions into lines ONCE (memoized), not on every frame — caps/windowMs/gapMs are frame-independent.
  const lines = useMemo(() => groupLines(caps, windowMs, gapMs), [caps, windowMs, gapMs]);

  if (!caps.length) return null;
  const nowMs = (frame / fps) * 1000;
  const line = lines.find((l) => nowMs >= l.start && nowMs <= l.end + 200);
  if (!line) return null;

  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', padding: '0 8%'}}>
      <div
        style={{
          fontFamily: font,
          fontSize,
          fontWeight: 800,
          lineHeight: 1.15,
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 2px 8px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
          maxWidth: '100%',
        }}
      >
        {line.words.map((w, i) => {
          const active = nowMs >= w.startMs && nowMs < w.endMs;
          return (
            <span
              key={i}
              style={{
                color: active ? accent : '#fff',
                opacity: active ? 1 : 0.92,
                display: 'inline-block',
                transform: active ? 'scale(1.06)' : 'none', // frame-driven, no CSS transitions (forbidden in Remotion)
                marginRight: '0.28em',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
