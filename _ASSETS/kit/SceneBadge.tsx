/**
 * SceneBadge — белый чип с номером сцены в правом верхнем углу.
 * Помогает клиенту давать таргетированные правки: «сцена #N».
 * Полупрозрачный, не отвлекает.
 */
import React from 'react';

interface Props {
  num: number;
}

export const SceneBadge: React.FC<Props> = ({num}) => (
  <div style={{
    position: 'absolute',
    top: 28, right: 36,
    width: 76, height: 76,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.92)',
    border: '3px solid rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Courier New", Consolas, monospace',
    fontSize: 42,
    fontWeight: 900,
    color: '#0a1c12',
    letterSpacing: -2,
    boxShadow: '0 6px 18px rgba(0,0,0,0.5), inset 0 -2px 0 rgba(0,0,0,0.15)',
    zIndex: 9999,
    pointerEvents: 'none',
    textShadow: 'none',
  }}>
    #{num}
  </div>
);
