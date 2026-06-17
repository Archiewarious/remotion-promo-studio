/**
 * CTA Button — neon glassmorphism pill. ДВИЖОК (brand-agnostic): цвет/шрифт через пропсы.
 * Сцена передаёт accent={C.accent} font={FONT}. Дефолты нейтральные.
 */
import React from 'react';

interface CtaButtonProps {
  scale?: number;
  glow?: number;          // 0-1
  label?: string;
  accent?: string;        // бренд-акцент (hex). default нейтральный
  font?: string;          // бренд-шрифт (font-family). default системный
}

// accent hex → "r,g,b" для rgba()
const hexToRgb = (hex: string): string => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const CtaButton: React.FC<CtaButtonProps> = ({
  scale = 1,
  glow = 0.7,
  label = 'ЗАЛИШИТИ ЗАЯВКУ →',
  accent = '#6E8BFF',
  font = "'Inter','Segoe UI',system-ui,sans-serif",
}) => {
  const rgb = hexToRgb(accent);
  return (
    <div style={{transform: `scale(${scale})`, transformOrigin: 'center center', display: 'inline-block', position: 'relative'}}>
      <div style={{
        position: 'absolute', inset: -24, borderRadius: 80,
        background: `radial-gradient(ellipse, rgba(${rgb},${glow * 0.55}) 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: -1, filter: 'blur(4px)',
      }} />
      <div style={{
        position: 'absolute', inset: -8, borderRadius: 70,
        background: `radial-gradient(ellipse, rgba(${rgb},${glow * 0.25}) 0%, transparent 60%)`,
        pointerEvents: 'none', zIndex: -1,
      }} />
      <div style={{
        background: `linear-gradient(135deg, rgba(${rgb},0.22) 0%, rgba(${rgb},0.10) 50%, rgba(${rgb},0.18) 100%)`,
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 70, padding: '26px 80px',
        boxShadow: `0 0 ${48 + glow * 32}px rgba(${rgb},${glow * 0.75}), 0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 0 rgba(0,0,0,0.25)`,
        border: `4px solid ${accent}`, position: 'relative',
      }}>
        <div style={{
          fontFamily: font, fontSize: 56, fontWeight: 800, color: '#FFFFFF',
          letterSpacing: 4, textAlign: 'center',
          textShadow: `0 0 24px rgba(${rgb},${glow * 0.9}), 0 2px 8px rgba(0,0,0,0.65)`,
          whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
};
