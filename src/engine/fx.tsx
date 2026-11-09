import React from 'react';
import {rng} from './rng';
import {useShot} from './shot';
import {H, W, mix} from '../theme';

export const Dust: React.FC<{n?: number; seed?: number; col?: string; op?: number}> = ({n = 34, seed = 3, col, op = 0.55}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  return (
    <g fill={col ?? pal.bone}>
      {Array.from({length: n}, (_, i) => {
        const x = ((r() * (W + 600) + frame * (0.25 + r() * 0.7)) % (W + 600)) - 300;
        const y = r() * H + Math.sin(frame / 50 + i) * 16;
        return <circle key={i} cx={x} cy={y} r={1.4 + r() * 2.6} opacity={op * (0.55 + 0.45 * Math.sin(frame / 28 + i))} />;
      })}
    </g>
  );
};

export const Embers: React.FC<{n?: number; seed?: number; x0?: number; x1?: number; y?: number}> = ({n = 40, seed = 5, x0 = 0, x1 = W, y = H}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  return (
    <g fill={pal.gold}>
      {Array.from({length: n}, (_, i) => {
        const sp = 0.8 + r() * 1.6;
        const t = ((r() * 600 + frame * sp) % 600) / 600;
        const x = x0 + r() * (x1 - x0) + Math.sin(t * 9 + i) * 30;
        return <circle key={i} cx={x} cy={y - t * 760} r={2 + r() * 3} opacity={(1 - t) * 0.8} />;
      })}
    </g>
  );
};

export const Rain: React.FC<{n?: number; seed?: number; op?: number}> = ({n = 90, seed = 4, op = 0.4}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  return (
    <g fill={pal.bone} opacity={op}>
      {Array.from({length: n}, (_, i) => {
        const sp = 22 + r() * 12;
        const y = (((r() * (H + 200) + frame * sp) % (H + 200)) - 100);
        const x = r() * (W + 400) - 200 - y * 0.2;
        return <rect key={i} x={x} y={y} width={2.4} height={38} transform={`rotate(10 ${x} ${y})`} />;
      })}
    </g>
  );
};

export const Fireflies: React.FC<{n?: number; seed?: number; y0?: number; y1?: number}> = ({n = 22, seed = 8, y0 = 300, y1 = 900}) => {
  const {frame} = useShot();
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const bx = r() * W;
        const by = y0 + r() * (y1 - y0);
        const x = bx + Math.sin(frame / (40 + r() * 30) + i) * 60;
        const y = by + Math.cos(frame / (50 + r() * 30) + i * 2) * 40;
        const o = 0.35 + 0.65 * Math.abs(Math.sin(frame / (18 + r() * 20) + i));
        return <circle key={i} cx={x} cy={y} r={20} fill="url(#g-glow)" opacity={o} />;
      })}
    </g>
  );
};

export const Smoke: React.FC<{x: number; y: number; col?: string; h?: number; seed?: number; w?: number}> = ({x, y, col, h = 300, seed = 1, w = 1}) => {
  const {frame, pal} = useShot();
  return (
    <g fill={col ?? pal.mist}>
      {Array.from({length: 8}, (_, i) => {
        const t = (frame / 170 + i / 8 + seed * 0.13) % 1;
        const cx = x + (Math.sin(t * 6 + i + seed) * 26 + t * 50) * w;
        return <circle key={i} cx={cx} cy={y - t * h} r={(14 + t * 52) * w} opacity={(1 - t) * 0.5 * Math.min(1, t * 6)} />;
      })}
    </g>
  );
};

export const Birds: React.FC<{n?: number; y?: number; seed?: number; dir?: 1 | -1; col?: string; s?: number}> = ({n = 7, y = 260, seed = 2, dir = 1, col, s = 1}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  return (
    <g fill="none" stroke={col ?? pal.ink} strokeWidth={3 * s} strokeLinecap="round" opacity={0.75}>
      {Array.from({length: n}, (_, i) => {
        const lead = r() * 200;
        const x = (((lead + i * 70 * s + frame * (2.6 + r() * 0.8) * dir) % (W + 700)) + (W + 700)) % (W + 700) - 350;
        const yy = y + Math.sin(i * 1.9) * 60 * s + Math.sin(frame / 30 + i) * 12 + (i % 2) * 28 * s;
        const f = Math.sin(frame / 4 + i * 1.3) * 12 * s;
        return <path key={i} d={`M${x - 22 * s} ${yy - f}Q${x - 8 * s} ${yy - 8 * s} ${x} ${yy}Q${x + 8 * s} ${yy - 8 * s} ${x + 22 * s} ${yy - f}`} />;
      })}
    </g>
  );
};

export const Rays: React.FC<{x: number; y: number; n?: number; op?: number; col?: string; len?: number}> = ({x, y, n = 7, op = 0.14, col, len = 1500}) => {
  const {frame, pal} = useShot();
  return (
    <g fill={col ?? pal.glow} opacity={op}>
      {Array.from({length: n}, (_, i) => {
        const a = ((i / (n - 1)) * 70 - 35 + Math.sin(frame / 120 + i) * 4) * (Math.PI / 180);
        const w = 0.05 + (i % 3) * 0.02;
        return <path key={i} d={`M${x} ${y}L${x + Math.sin(a - w) * len} ${y + Math.cos(a - w) * len}L${x + Math.sin(a + w) * len} ${y + Math.cos(a + w) * len}Z`} opacity={0.5 + 0.5 * Math.sin(frame / 50 + i * 1.7) ** 2} />;
      })}
    </g>
  );
};

export const Glow: React.FC<{x: number; y: number; r?: number; op?: number; flicker?: number}> = ({x, y, r = 120, op = 0.8, flicker = 0.2}) => {
  const {frame} = useShot();
  const f = 1 - flicker * (0.5 + 0.5 * Math.sin(frame * 0.37 + x) * Math.sin(frame * 0.11 + y));
  return <circle cx={x} cy={y} r={r * (0.92 + 0.08 * f)} fill="url(#g-glow)" opacity={op * f} />;
};

