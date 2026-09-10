import React from 'react';

const BLADE_COUNT = 16;
const GOLD: [number, number, number] = [0xf2, 0xa9, 0x3b];
const GREY: [number, number, number] = [0xb0, 0xb6, 0xbf];

function bladeColor(angleDeg: number): string {
  const rad = (angleDeg * Math.PI) / 180;
  const t = (Math.sin(rad) + 1) / 2; // 0 = left (gold), 1 = right (grey)
  const [r1, g1, b1] = GOLD;
  const [r2, g2, b2] = GREY;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

export const GemLogo: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <svg viewBox="0 0 24 24" className={className}>
    {Array.from({ length: BLADE_COUNT }).map((_, i) => {
      const angle = i * (360 / BLADE_COUNT);
      return (
        <ellipse
          key={i}
          cx="12"
          cy="6.4"
          rx="1.55"
          ry="5.1"
          fill={bladeColor(angle)}
          transform={`rotate(${angle} 12 12)`}
        />
      );
    })}
    <circle cx="12" cy="12" r="1.9" fill="#FFFFFF" />
  </svg>
);
