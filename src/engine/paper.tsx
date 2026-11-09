import React from 'react';
import {rng} from './rng';
import {mix} from '../theme';

export type Pt = [number, number];
export const WX0 = -900;
export const WX1 = 2820;

/** Polygon with slightly irregular "torn paper" edges. */
export const tornPath = (pts: Pt[], seed: number, amp = 3, seg = 36) => {
  const r = rng(seed);
  let d = '';
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const n = Math.max(1, Math.round(len / seg));
    const nx = -(q[1] - p[1]) / len;
    const ny = (q[0] - p[0]) / len;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const o = k === 0 ? 0 : (r() - 0.5) * 2 * amp;
      d += (d ? 'L' : 'M') + (p[0] + (q[0] - p[0]) * t + nx * o).toFixed(1) + ' ' + (p[1] + (q[1] - p[1]) * t + ny * o).toFixed(1);
    }
  });
  return d + 'Z';
};

export const rect = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** A cut-paper shape: fill + faint light edge on top. */
export const Paper: React.FC<{pts: Pt[]; fill: string; seed?: number; amp?: number; opacity?: number; edge?: boolean; tex?: 'brick' | 'stripe' | 'dots'; texOp?: number}> = ({
  pts, fill, seed = 1, amp = 3, opacity = 1, edge = true, tex, texOp = 0.12,
}) => {
  const d = tornPath(pts, seed, amp);
  return (
    <g opacity={opacity}>
      <path d={d} fill={fill} stroke={edge ? mix(fill, '#fff4d8', 0.35) : undefined} strokeWidth={edge ? 2 : 0} />
      {tex && <path d={d} fill={`url(#p-${tex})`} opacity={texOp} />}
    </g>
  );
};

export const Ridge: React.FC<{y: number; amp: number; seed: number; fill: string; opacity?: number; bottom?: number}> = ({y, amp, seed, fill, opacity = 1, bottom = 1300}) => {
  const r = rng(seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  const pts: Pt[] = [[WX0, bottom]];
  for (let x = WX0; x <= WX1; x += 60) {
    pts.push([x, y - (Math.sin(x / 260 + ph[0]) * 0.5 + Math.sin(x / 110 + ph[1]) * 0.3 + Math.sin(x / 47 + ph[2]) * 0.2) * amp]);
  }
  pts.push([WX1, bottom]);
  return <path d={tornPath(pts, seed, 2, 30)} fill={fill} opacity={opacity} stroke={mix(fill, '#fff4d8', 0.3)} strokeWidth={2} />;
};
