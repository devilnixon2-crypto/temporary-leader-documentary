import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {GOLD, mix} from '../theme';
import {tornPath} from '../engine/paper';

// Optional paper label (off by default; enable with the "labels" prop).
export const Strip: React.FC<{text: string; duration: number}> = ({text, duration}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [14, 28, duration - 24, duration - 10], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const w = 120 + text.length * 30;
  return (
    <div style={{position: 'absolute', left: 90, bottom: 96, opacity: a, transform: `translateX(${(1 - a) * -80}px) rotate(-1.2deg)`}}>
      <svg width={w + 20} height={110} style={{filter: 'drop-shadow(0 6px 8px rgba(30,20,12,0.35))'}}>
        <path d={tornPath([[6, 8], [w, 4], [w + 8, 92], [2, 100]], 5, 3, 30)} fill="#f0e4c9" />
        <rect x={6} y={90} width={w - 4} height={6} fill={GOLD} />
        <text x={30} y={62} fontFamily="Georgia, 'Times New Roman', serif" fontWeight={700} fontSize={44} letterSpacing={2} fill={mix('#251a13', '#251a13', 0)}>{text}</text>
      </svg>
    </div>
  );
};
