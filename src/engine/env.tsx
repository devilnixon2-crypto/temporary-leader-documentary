import React from 'react';
import {H, W, mix, GOLD} from '../theme';
import {Paper, Pt, WX0, WX1, rect, tornPath} from './paper';
import {rng} from './rng';
import {useShot} from './shot';
import {Glow} from './fx';

type PK = 'far' | 'mid' | 'clay' | 'near' | 'ink' | 'mist' | 'bone' | 'lacq' | 'river' | 'riverDeep' | 'gold';
export const useCol = () => {
  const {pal} = useShot();
  return (k: PK | string | undefined, fallback: PK = 'mid') => (k && (pal as unknown as Record<string, string>)[k]) || (k && k.startsWith('#') ? k : pal[fallback]);
};

export const Sun: React.FC<{x: number; y: number; r?: number; rays?: boolean}> = ({x, y, r = 90, rays = true}) => {
  const {frame, pal} = useShot();
  return (
    <g>
      <circle cx={x} cy={y} r={r * 3.2} fill="url(#g-glow)" opacity={0.75} />
      {rays && (
        <g transform={`rotate(${frame * 0.06} ${x} ${y})`} fill={pal.glow} opacity={0.4}>
          {Array.from({length: 18}, (_, i) => (
            <path key={i} transform={`rotate(${i * 20} ${x} ${y})`} d={`M${x - 7} ${y - r - 8}L${x} ${y - r * 2.1}L${x + 7} ${y - r - 8}Z`} />
          ))}
        </g>
      )}
      <circle cx={x} cy={y} r={r} fill={pal.bone} />
      <circle cx={x} cy={y} r={r * 0.82} fill={pal.glow} />
    </g>
  );
};

export const Moon: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 70}) => {
  const {pal} = useShot();
  return (
    <g>
      <circle cx={x} cy={y} r={r * 3} fill="url(#g-glow)" opacity={0.35} />
      <circle cx={x} cy={y} r={r} fill={pal.bone} />
      <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill={mix(pal.bone, pal.ink, 0.15)} />
      <circle cx={x + r * 0.25} cy={y + r * 0.3} r={r * 0.24} fill={mix(pal.bone, pal.ink, 0.12)} />
    </g>
  );
};

export const Stars: React.FC<{n?: number; seed?: number}> = ({n = 70, seed = 2}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  return (
    <g fill={pal.bone}>
      {Array.from({length: n}, (_, i) => (
        <circle key={i} cx={WX0 + r() * (WX1 - WX0)} cy={r() * 520} r={1 + r() * 2.2} opacity={0.35 + 0.6 * Math.abs(Math.sin(frame / (20 + r() * 40) + i))} />
      ))}
    </g>
  );
};

export const Clouds: React.FC<{y?: number; n?: number; seed?: number; col?: string; speed?: number; op?: number; s?: number}> = ({y = 200, n = 6, seed = 1, col, speed = 0.3, op = 0.75, s = 1}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  const span = WX1 - WX0 + 600;
  return (
    <g fill={col ?? pal.mist} opacity={op}>
      {Array.from({length: n}, (_, i) => {
        const x0 = r() * span;
        const yy = y + (r() - 0.5) * 120;
        const k = (0.7 + r() * 0.9) * s;
        const x = ((x0 + frame * speed * (0.6 + k * 0.4)) % span) + WX0 - 300;
        return (
          <g key={i} transform={`translate(${x} ${yy}) scale(${k})`}>
            <ellipse cx={0} cy={0} rx={120} ry={22} />
            <ellipse cx={-44} cy={-18} rx={64} ry={22} />
            <ellipse cx={34} cy={-26} rx={76} ry={26} />
          </g>
        );
      })}
    </g>
  );
};

export const Mountains: React.FC<{y?: number; seed?: number; col?: string; peak?: number; snow?: boolean}> = ({y = 700, seed = 1, col, peak = 380, snow = false}) => {
  const {pal} = useShot();
  const c = col ?? pal.far;
  const r = rng(seed);
  const xs: number[] = [];
  const hs: number[] = [];
  let x = WX0;
  let prev = 0.5;
  while (x < WX1) {
    const h = Math.max(0.12, Math.min(1, prev * 0.62 + r() * 0.52));
    prev = h;
    xs.push(x);
    hs.push(h);
    x += 90 + r() * 150;
  }
  const pts: Pt[] = [[WX0, 1300], ...xs.map((xx, i): Pt => [xx, y - hs[i] * peak]), [WX1, 1300]];
  return (
    <g>
      <Paper pts={pts} fill={c} seed={seed} amp={2} />
      {xs.map((ax, i) => {
        if (i === 0 || i >= xs.length - 1 || !(hs[i] > hs[i - 1] && hs[i] > hs[i + 1] && hs[i] > 0.42)) return null;
        const ay = y - hs[i] * peak;
        const nx = xs[i + 1];
        const ny = y - hs[i + 1] * peak;
        return (
          <g key={i}>
            <path d={`M${ax} ${ay}L${nx} ${ny}L${nx} ${y + 40}L${ax - 6} ${y + 40}Z`} fill={mix(c, pal.ink, 0.14)} opacity={0.5} />
            {snow && hs[i] > 0.6 && <path d={`M${ax} ${ay}L${ax - 30} ${ay + 46}L${ax - 10} ${ay + 36}L${ax + 6} ${ay + 58}L${ax + 22} ${ay + 38}L${ax + 36} ${ay + 54}L${ax + 52} ${ay + 40}Z`} fill={pal.bone} />}
          </g>
        );
      })}
    </g>
  );
};

export const River: React.FC<{y?: number; seed?: number; speed?: number; glint?: number}> = ({y = 700, seed = 1, speed = 1, glint}) => {
  const {frame, pal} = useShot();
  const lines = 11;
  return (
    <g>
      <rect x={WX0} y={y} width={WX1 - WX0} height={H + 300 - y} fill={pal.river} />
      <rect x={WX0} y={y + (H - y) * 0.45} width={WX1 - WX0} height={H + 300} fill={pal.riverDeep} opacity={0.5} />
      {Array.from({length: lines}, (_, k) => {
        const yy = y + ((k + 1) * (H + 40 - y)) / (lines + 1);
        let d = `M${WX0} ${yy}`;
        for (let x = WX0; x <= WX1; x += 70) d += `L${x} ${yy + Math.sin(x / 120 + frame * 0.045 * speed * (0.5 + k * 0.12) + k + seed) * (3 + k * 0.9)}`;
        return <path key={k} d={d} stroke={pal.bone} strokeWidth={2 + k * 0.35} fill="none" opacity={0.16 + k * 0.02} />;
      })}
      {glint !== undefined && Array.from({length: 14}, (_, i) => <ellipse key={i} cx={glint + Math.sin(frame / 20 + i) * (30 + i * 9)} cy={y + 14 + i * 22} rx={26 - i} ry={3} fill={pal.glow} opacity={0.5 - i * 0.03} />)}
    </g>
  );
};

export const Canal: React.FC<{vx?: number; vy?: number; w?: number}> = ({vx = 960, vy = 560, w = 560}) => {
  const {frame, pal} = useShot();
  return (
    <g>
      <Paper pts={[[vx - 14, vy], [vx + 14, vy], [vx + w, H + 160], [vx - w, H + 160]]} fill={pal.river} amp={1.5} />
      <Paper pts={[[vx - 14, vy], [vx - w, H + 160], [WX0, H + 160], [WX0, vy + 40]]} fill={pal.mid} tex="brick" texOp={0.1} />
      <Paper pts={[[vx + 14, vy], [vx + w, H + 160], [WX1, H + 160], [WX1, vy + 40]]} fill={pal.mid} tex="brick" texOp={0.1} />
      {Array.from({length: 9}, (_, k) => {
        const t = ((k / 9 + frame / 260) % 1) ** 1.8;
        const hw = (14 + (w - 14) * t) * 0.8;
        const yy = vy + (H + 160 - vy) * t;
        return <path key={k} d={`M${vx - hw} ${yy}Q${vx} ${yy - 6 * t} ${vx + hw} ${yy}`} stroke={pal.bone} strokeWidth={2 + 3 * t} fill="none" opacity={0.35 * t} />;
      })}
    </g>
  );
};

export const Fields: React.FC<{y?: number; seed?: number; col?: string}> = ({y = 640, seed = 1, col}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  const base = col ?? pal.mid;
  return (
    <g>
      {Array.from({length: 9}, (_, i) => {
        const t0 = (i / 9) ** 1.6;
        const t1 = ((i + 1) / 9) ** 1.6;
        const y0 = y + (H + 200 - y) * t0;
        const y1 = y + (H + 200 - y) * t1;
        const c = i % 2 ? mix(base, pal.gold, 0.22) : mix(base, pal.clay, 0.2);
        const tufts = 26 + i * 4;
        return (
          <g key={i}>
            <rect x={WX0} y={y0} width={WX1 - WX0} height={y1 - y0 + 1} fill={c} />
            {Array.from({length: tufts}, (_, k) => {
              const x = WX0 + (k / tufts) * (WX1 - WX0) + r() * 40;
              const hh = 8 + t1 * 36;
              const sw = Math.sin(frame / 30 + k * 0.7 + i) * (2 + t1 * 8);
              return <path key={k} d={`M${x} ${y1 - 2}Q${x + sw * 0.4} ${y1 - hh * 0.5} ${x + sw} ${y1 - hh}`} stroke={mix(c, pal.gold, 0.45)} strokeWidth={2 + t1 * 3} fill="none" />;
            })}
          </g>
        );
      })}
    </g>
  );
};

export const Palm: React.FC<{x: number; y: number; h?: number; s?: number; seed?: number; col?: string}> = ({x, y, h = 330, s = 1, seed = 1, col}) => {
  const {frame, pal} = useShot();
  const c = col ?? pal.near;
  const sway = Math.sin(frame / 55 + seed) * 10 * s;
  const topx = x + sway * 1.5;
  const topy = y - h * s;
  return (
    <g>
      <path d={`M${x - 11 * s} ${y}Q${x + sway * 0.4 - 8 * s} ${y - h * s * 0.5} ${topx - 5 * s} ${topy}L${topx + 5 * s} ${topy}Q${x + sway * 0.4 + 10 * s} ${y - h * s * 0.5} ${x + 11 * s} ${y}Z`} fill={mix(c, pal.clay, 0.3)} />
      {Array.from({length: 9}, (_, i) => {
        const a = (-170 + i * 22.5) * (Math.PI / 180);
        const len = (150 + (i % 3) * 18) * s;
        const bend = Math.sin(frame / 38 + i + seed) * 8 * s;
        const ex = topx + Math.cos(a) * len;
        const ey = topy + Math.sin(a) * len * 0.55 + 46 * s;
        return <path key={i} d={`M${topx} ${topy}Q${topx + Math.cos(a) * len * 0.5} ${topy + Math.sin(a) * len * 0.55 - 36 * s + bend} ${ex} ${ey}Q${topx + Math.cos(a) * len * 0.5} ${topy + Math.sin(a) * len * 0.55 - 6 * s} ${topx} ${topy + 4 * s}Z`} fill={c} />;
      })}
    </g>
  );
};

export const Reeds: React.FC<{x0: number; x1: number; y: number; n?: number; seed?: number; col?: string; h?: number}> = ({x0, x1, y, n = 14, seed = 1, col, h = 200}) => {
  const {frame, pal} = useShot();
  const r = rng(seed);
  return (
    <g fill={col ?? pal.ink}>
      {Array.from({length: n}, (_, i) => {
        const x = x0 + (x1 - x0) * (i / n) + r() * 24;
        const hh = h * (0.6 + r() * 0.7);
        const sw = Math.sin(frame / 36 + i * 0.9 + r() * 3) * (10 + hh * 0.06);
        const w = 5 + r() * 3;
        return <path key={i} d={`M${x - w} ${y}Q${x + sw * 0.3} ${y - hh * 0.5} ${x + sw} ${y - hh}Q${x + sw * 0.4 + w} ${y - hh * 0.5} ${x + w} ${y}Z`} />;
      })}
    </g>
  );
};

export const House: React.FC<{x: number; y: number; w: number; h: number; col: string; seed: number}> = ({x, y, w, h, col, seed}) => {
  const {pal, frame} = useShot();
  const r = rng(seed);
  const lit = pal.lamp > 0.5;
  const dx = x + w * (0.25 + r() * 0.3);
  const roof = Math.floor(r() * 4);
  return (
    <g>
      <Paper pts={rect(x, y - h, w, h + 160)} fill={col} seed={seed} tex="brick" texOp={0.09} />
      <Paper pts={rect(x - 7, y - h - 12, w + 14, 14)} fill={mix(col, pal.ink, 0.18)} seed={seed + 1} />
      <path d={`M${dx} ${y}V${y - h * 0.5}A${w * 0.11} ${w * 0.11} 0 0 1 ${dx + w * 0.22} ${y - h * 0.5}V${y}Z`} fill={pal.ink} opacity={0.82} />
      {lit && <Glow x={dx + w * 0.11} y={y - h * 0.3} r={w * 0.4} op={0.6} />}
      {r() > 0.4 && <rect x={x + w * 0.68} y={y - h * 0.72} width={w * 0.1} height={h * 0.16} fill={pal.ink} opacity={0.7} />}
      {roof === 0 && <g><rect x={x + w * 0.2} y={y - h - 42} width={w * 0.22} height={30} rx={8} fill={mix(col, pal.bone, 0.2)} /></g>}
      {roof === 1 && <g fill={mix(col, pal.ink, 0.3)}><rect x={x + w * 0.1} y={y - h - 58} width={5} height={46} /><rect x={x + w * 0.5} y={y - h - 58} width={5} height={46} /><path d={`M${x + w * 0.05} ${y - h - 58}L${x + w * 0.6} ${y - h - 58}L${x + w * 0.5} ${y - h - 72}L${x + w * 0.15} ${y - h - 72}Z`} fill={pal.bone} opacity={0.8} /></g>}
      {roof === 2 && <g stroke={mix(col, pal.ink, 0.4)} strokeWidth={4}><line x1={x + w * 0.75} y1={y - h - 10} x2={x + w * 0.9} y2={y - h - 86} /><line x1={x + w * 0.86} y1={y - h - 10} x2={x + w * 1.0} y2={y - h - 86} /></g>}
      {roof === 3 && <path d={`M${x + w * 0.1} ${y - h - 12}Q${x + w * 0.3} ${y - h - 66 + Math.sin(frame / 30 + seed) * 4} ${x + w * 0.55} ${y - h - 12}`} fill="none" stroke={pal.gold} strokeWidth={6} />}
    </g>
  );
};

export const Village: React.FC<{x0?: number; x1?: number; y?: number; seed?: number; col?: string; sc?: number; hmin?: number; hmax?: number}> = ({x0 = WX0, x1 = WX1, y = 760, seed = 1, col, sc = 1, hmin = 110, hmax = 230}) => {
  const {pal} = useShot();
  const r = rng(seed);
  const items: React.ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const w = (110 + r() * 130) * sc;
    const h = (hmin + r() * (hmax - hmin)) * sc;
    items.push(<House key={i} x={x} y={y} w={w} h={h} col={mix(col ?? pal.mid, pal.bone, r() * 0.18)} seed={seed * 31 + i} />);
    x += w + (14 + r() * 50) * sc;
    i++;
  }
  return <g>{items}</g>;
};

export const Ziggurat: React.FC<{x: number; y: number; w?: number; tiers?: number; h?: number; col?: string; seed?: number}> = ({x, y, w = 760, tiers = 4, h = 78, col, seed = 1}) => {
  const {pal, frame} = useShot();
  const c = col ?? pal.clay;
  return (
    <g>
      {Array.from({length: tiers}, (_, i) => {
        const tw = w * (1 - i / (tiers + 0.7));
        return <Paper key={i} pts={rect(x - tw / 2, y - h * (i + 1), tw, h + 1)} fill={mix(c, pal.bone, i * 0.07)} seed={seed + i} tex="brick" texOp={0.1} />;
      })}
      <Paper pts={[[x - 46, y], [x + 46, y], [x + 30, y - h * tiers], [x - 30, y - h * tiers]]} fill={mix(c, pal.ink, 0.28)} seed={seed + 8} tex="stripe" texOp={0.1} />
      <Paper pts={rect(x - 62, y - h * tiers - 74, 124, 74)} fill={mix(c, pal.bone, 0.3)} seed={seed + 9} />
      <path d={`M${x - 16} ${y - h * tiers}V${y - h * tiers - 44}A16 16 0 0 1 ${x + 16} ${y - h * tiers - 44}V${y - h * tiers}Z`} fill={pal.ink} />
      <Glow x={x} y={y - h * tiers - 30} r={90} op={0.5 + pal.lamp * 0.5} />
      <rect x={x + 56} y={y - h * tiers - 150} width={5} height={78} fill={pal.ink} />
      <path d={`M${x + 61} ${y - h * tiers - 148}L${x + 110 + Math.sin(frame / 12) * 5} ${y - h * tiers - 134}L${x + 61} ${y - h * tiers - 116}Z`} fill={GOLD} />
    </g>
  );
};

export const Skyline: React.FC<{y?: number; seed?: number; col?: string; hmax?: number}> = ({y = 700, seed = 1, col, hmax = 240}) => {
  const {pal} = useShot();
  const r = rng(seed);
  const c = col ?? pal.far;
  const lit = pal.lamp > 0.4;
  const els: React.ReactNode[] = [];
  let x = WX0;
  let i = 0;
  while (x < WX1) {
    const w = 60 + r() * 110;
    const h = 60 + r() * hmax;
    els.push(
      <g key={i}>
        <Paper pts={rect(x, y - h, w, h + 400)} fill={c} seed={seed + i} amp={1.5} />
        {lit && r() > 0.45 && <rect x={x + w * 0.3} y={y - h * 0.6} width={9} height={14} fill={pal.gold} opacity={0.85} />}
        {r() > 0.7 && <rect x={x + w * 0.1} y={y - h - 22} width={w * 0.8} height={22} fill={mix(c, pal.ink, 0.1)} />}
      </g>,
    );
    x += w + 6 + r() * 20;
    i++;
  }
  return <g>{els}</g>;
};

export const Wall: React.FC<{y?: number; seed?: number; col?: string; gateX?: number; h?: number}> = ({y = 760, seed = 1, col, gateX = 960, h = 190}) => {
  const {pal} = useShot();
  const c = col ?? pal.clay;
  return (
    <g>
      <Paper pts={rect(WX0, y - h, WX1 - WX0, h + 400)} fill={c} seed={seed} tex="brick" texOp={0.1} />
      {Array.from({length: Math.round((WX1 - WX0) / 70)}, (_, i) => <rect key={i} x={WX0 + i * 70} y={y - h - 26} width={40} height={28} fill={c} />)}
      <Paper pts={rect(gateX - 160, y - h - 110, 320, h + 110)} fill={mix(c, pal.ink, 0.12)} seed={seed + 3} tex="brick" texOp={0.1} />
      <path d={`M${gateX - 70} ${y}V${y - 110}A70 70 0 0 1 ${gateX + 70} ${y - 110}V${y}Z`} fill={pal.ink} />
      <Glow x={gateX} y={y - 70} r={170} op={0.2 + pal.lamp * 0.6} />
    </g>
  );
};

export const ChinaRoof: React.FC<{x: number; y: number; w: number; h?: number; col?: string}> = ({x, y, w, h = 120, col}) => {
  const {pal} = useShot();
  const c = col ?? mix(pal.gold, pal.clay, 0.45);
  const hw = w / 2;
  return (
    <g>
      <path d={`M${x - hw - 70} ${y - 34}Q${x - hw - 6} ${y + 4} ${x - hw + 26} ${y + 14}L${x + hw - 26} ${y + 14}Q${x + hw + 6} ${y + 4} ${x + hw + 70} ${y - 34}Q${x + hw * 0.7} ${y - h * 0.3} ${x + hw * 0.34} ${y - h}L${x - hw * 0.34} ${y - h}Q${x - hw * 0.7} ${y - h * 0.3} ${x - hw - 70} ${y - 34}Z`} fill={c} stroke={mix(c, '#fff4d8', 0.3)} strokeWidth={2} />
      {Array.from({length: Math.round(w / 34)}, (_, i) => <line key={i} x1={x - hw + 20 + i * 34} y1={y + 10} x2={x - hw * 0.34 + (i / Math.round(w / 34)) * hw * 0.68} y2={y - h + 6} stroke={mix(c, pal.ink, 0.35)} strokeWidth={2} opacity={0.5} />)}
      <rect x={x - hw * 0.34 - 4} y={y - h - 14} width={hw * 0.68 + 8} height={16} fill={mix(c, pal.ink, 0.25)} />
      <path d={`M${x - hw * 0.34 - 4} ${y - h - 14}l-14 -22l24 8zM${x + hw * 0.34 + 4} ${y - h - 14}l14 -22l-24 8z`} fill={pal.gold} />
    </g>
  );
};

export const ChinaHall: React.FC<{x: number; y: number; w?: number; tiers?: number; col?: string}> = ({x, y, w = 640, tiers = 2, col}) => {
  const {pal} = useShot();
  const lac = col ?? pal.lacq;
  const bodyH = 190;
  return (
    <g>
      {[0, 1, 2].map((i) => <Paper key={i} pts={rect(x - w / 2 - 70 + i * 22, y - 28 + i * 0 - (2 - i) * 0 - i * 24, w + 140 - i * 44, 28)} fill={mix(pal.bone, pal.clay, 0.2 + i * 0.05)} seed={i + 4} />)}
      <Paper pts={rect(x - w / 2, y - 76 - bodyH, w, bodyH + 50)} fill={lac} seed={3} />
      {Array.from({length: 7}, (_, i) => <rect key={i} x={x - w / 2 + 14 + i * ((w - 28) / 6) - 9} y={y - 76 - bodyH} width={18} height={bodyH + 50} fill={mix(lac, pal.ink, 0.25)} />)}
      {[1, 3, 5].map((i) => <rect key={i} x={x - w / 2 + 14 + i * ((w - 28) / 6) - 52} y={y - 76 - bodyH * 0.65} width={88} height={bodyH * 0.55} fill={mix(lac, pal.ink, 0.5)} opacity={0.8} />)}
      <ChinaRoof x={x} y={y - 76 - bodyH} w={w + 40} h={140} />
      {tiers > 1 && <ChinaRoof x={x} y={y - 76 - bodyH - 150} w={w * 0.7} h={110} />}
    </g>
  );
};

export const Throne: React.FC<{x: number; y: number; s?: number; kind?: 'dragon' | 'seat' | 'lion'; glow?: boolean}> = ({x, y, s = 1, kind = 'dragon', glow = true}) => {
  const {pal, frame} = useShot();
  const g = pal.gold;
  const dk = mix(pal.lacq, pal.ink, 0.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow && <Glow x={0} y={-150} r={260} op={0.35 + pal.lamp * 0.3} flicker={0.1} />}
      {kind === 'dragon' && (
        <g>
          {[0, 1, 2].map((i) => <Paper key={i} pts={rect(-190 + i * 26, -i * 26 - 26, 380 - i * 52, 28)} fill={mix(pal.bone, pal.clay, 0.25 + i * 0.1)} seed={20 + i} />)}
          <Paper pts={rect(-80, -156, 160, 80)} fill={dk} seed={31} />
          <Paper pts={[[-86, -76], [86, -76], [74, -176], [-74, -176]]} fill={g} seed={32} />
          <Paper pts={[[-100, -176], [100, -176], [70, -320], [-70, -320]]} fill={mix(g, pal.clay, 0.2)} seed={33} />
          <g opacity={0.8 + 0.1 * Math.sin(frame / 20)} fill="none" stroke={mix(g, pal.ink, 0.45)} strokeWidth={12} strokeLinecap="round"><path d="M-60 -210C-30 -300 20 -190 50 -280" /><path d="M-50 -250C-10 -222 30 -300 60 -226" /><circle cx={-62} cy={-206} r={10} fill={mix(g, pal.ink, 0.45)} stroke="none" /></g>
          <Paper pts={rect(-118, -228, 20, 168)} fill={dk} seed={34} />
          <Paper pts={rect(98, -228, 20, 168)} fill={dk} seed={35} />
        </g>
      )}
      {kind === 'seat' && (
        <g>
          <Paper pts={rect(-70, -96, 140, 20)} fill={mix(pal.clay, pal.bone, 0.2)} seed={41} />
          <Paper pts={[[-60, -76], [-40, -76], [-46, 0], [-66, 0]]} fill={pal.near} seed={42} />
          <Paper pts={[[40, -76], [60, -76], [66, 0], [46, 0]]} fill={pal.near} seed={43} />
          <Paper pts={rect(-66, -180, 14, 90)} fill={pal.near} seed={44} />
          <rect x={-52} y={-110} width={104} height={14} fill={g} opacity={0.8} />
        </g>
      )}
      {kind === 'lion' && (
        <g>
          <Paper pts={rect(-96, -86, 192, 86)} fill={mix(pal.clay, pal.bone, 0.15)} seed={52} />
          <Paper pts={rect(-96, -250, 36, 170)} fill={mix(pal.clay, pal.bone, 0.15)} seed={53} />
          <Paper pts={rect(-110, -112, 220, 26)} fill={g} seed={51} />
          {Array.from({length: 10}, (_, i) => <path key={i} transform={`rotate(${i * 36} 112 -40)`} d="M104 -66L112 -96L120 -66Z" fill={mix(g, pal.ink, 0.3)} />)}
          <circle cx={112} cy={-40} r={30} fill={g} /><circle cx={118} cy={-46} r={4} fill={pal.ink} /><path d="M126 -34L140 -26L124 -22Z" fill={pal.ink} />
        </g>
      )}
    </g>
  );
};

export const Pylon: React.FC<{x: number; y: number; w?: number; h?: number; col?: string; seed?: number}> = ({x, y, w = 600, h = 420, col, seed = 1}) => {
  const {pal} = useShot();
  const c = col ?? pal.far;
  const r = rng(seed);
  const mark = (x0: number) => Array.from({length: 22}, (_, i) => <rect key={i} x={x0 + 18 + (i % 4) * 30} y={y - h + 70 + Math.floor(i / 4) * 52} width={8 + r() * 14} height={26} fill={pal.ink} opacity={0.16} />);
  return (
    <g>
      <Paper pts={[[x - w / 2 - 20, y], [x - w / 2 + 30, y - h], [x - 40, y - h], [x - 28, y]]} fill={c} seed={seed} tex="stripe" texOp={0.06} />
      <Paper pts={[[x + w / 2 + 20, y], [x + w / 2 - 30, y - h], [x + 40, y - h], [x + 28, y]]} fill={c} seed={seed + 1} tex="stripe" texOp={0.06} />
      {mark(x - w / 2 + 6)}{mark(x + 70)}
      <Paper pts={rect(x - w / 2 + 10, y - h - 24, w - 20, 24)} fill={mix(c, pal.bone, 0.15)} seed={seed + 2} />
      <Paper pts={[[x - 36, y], [x + 36, y], [x + 36, y - h * 0.62], [x - 36, y - h * 0.62]]} fill={pal.ink} seed={seed + 3} />
      <Glow x={x} y={y - h * 0.3} r={150} op={0.2 + pal.lamp * 0.5} />
    </g>
  );
};

export const Pyramid: React.FC<{x: number; y: number; w?: number; h?: number; col?: string}> = ({x, y, w = 700, h = 420, col}) => {
  const {pal} = useShot();
  const c = col ?? pal.far;
  return (
    <g>
      <Paper pts={[[x - w / 2, y], [x, y - h], [x + w / 2, y]]} fill={c} seed={3} amp={2} />
      <path d={`M${x} ${y - h}L${x + w / 2} ${y}L${x + 10} ${y}Z`} fill={mix(c, pal.ink, 0.2)} opacity={0.65} />
    </g>
  );
};

export const Granary: React.FC<{x0?: number; x1?: number; y?: number; n?: number; col?: string; seed?: number; sc?: number}> = ({x0 = 200, x1 = 1700, y = 760, n = 5, col, seed = 1, sc = 1}) => {
  const {pal} = useShot();
  const c = col ?? pal.mid;
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
        const w = (120 + r() * 50) * sc;
        const h = (120 + r() * 60) * sc;
        return (
          <g key={i}>
            <Paper pts={[[x - w / 2, y], [x - w / 2 + 6, y - h], [x + w / 2 - 6, y - h], [x + w / 2, y]]} fill={mix(c, pal.bone, r() * 0.15)} seed={seed + i} tex="brick" texOp={0.1} />
            <Paper pts={[[x - w / 2 - 14, y - h + 6], [x, y - h - 70 * sc], [x + w / 2 + 14, y - h + 6]]} fill={mix(c, pal.ink, 0.3)} seed={seed + i + 9} />
            <rect x={x - 16 * sc} y={y - 56 * sc} width={32 * sc} height={56 * sc} fill={pal.ink} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};

export const Tents: React.FC<{x0?: number; x1?: number; y?: number; n?: number; seed?: number; col?: string; sc?: number}> = ({x0 = 100, x1 = 1800, y = 800, n = 5, seed = 1, col, sc = 1}) => {
  const {pal, frame} = useShot();
  const c = col ?? pal.far;
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
        const w = (190 + r() * 90) * sc;
        const h = (150 + r() * 60) * sc;
        return (
          <g key={i}>
            <Paper pts={[[x - w / 2, y], [x, y - h], [x + w / 2, y]]} fill={mix(c, pal.bone, r() * 0.2)} seed={seed + i} amp={2} />
            <path d={`M${x} ${y - h}L${x + 6} ${y}L${x + w * 0.16} ${y}Z`} fill={pal.ink} opacity={0.45} />
            <rect x={x - 2} y={y - h - 56 * sc} width={4} height={56 * sc} fill={pal.ink} />
            <path d={`M${x + 2} ${y - h - 54 * sc}L${x + 40 * sc + Math.sin(frame / 8 + i) * 6} ${y - h - 42 * sc}L${x + 2} ${y - h - 30 * sc}Z`} fill={pal.gold} />
          </g>
        );
      })}
    </g>
  );
};

export const Banner: React.FC<{x: number; y: number; h?: number; w?: number; col?: string; seed?: number}> = ({x, y, h = 360, w = 150, col, seed = 1}) => {
  const {frame, pal} = useShot();
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= 8; i++) {
    const k = i / 8;
    const off = Math.sin(frame / 7 + k * 5 + seed) * 11 * k;
    top.push(`${x + 5 + k * w},${y - h + 6 + off}`);
    bot.push(`${x + 5 + k * w},${y - h + 76 + off}`);
  }
  return (
    <g>
      <rect x={x - 3} y={y - h - 8} width={6} height={h + 8} fill={pal.ink} opacity={0.85} />
      <polygon points={top.join(' ') + ' ' + bot.reverse().join(' ')} fill={col ?? pal.gold} />
    </g>
  );
};

export const Lantern: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const {frame, pal} = useShot();
  const sw = Math.sin(frame / 30 + x) * 5;
  return (
    <g transform={`translate(${x + sw} ${y}) scale(${s})`}>
      <line x1={-sw} y1={-300} x2={0} y2={0} stroke={pal.ink} strokeWidth={3} />
      <Glow x={0} y={30} r={120} op={0.55 + pal.lamp * 0.3} />
      <path d="M-22 6Q-30 40 -18 72L18 72Q30 40 22 6Z" fill={mix(pal.lacq, pal.gold, 0.25)} />
      <rect x={-18} y={0} width={36} height={8} fill={pal.gold} /><rect x={-14} y={72} width={28} height={8} fill={pal.gold} />
    </g>
  );
};

export const Fire: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const {frame, pal} = useShot();
  const f = (o: number) => 1 + Math.sin(frame * 0.4 + o) * 0.14 + Math.sin(frame * 0.17 + o * 2) * 0.08;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow x={0} y={-40} r={200} op={0.7} />
      <path d="M-34 0C-60 -30 -30 -80 -6 -118C-8 -76 20 -64 18 -90C44 -60 50 -22 34 0Z" fill={pal.gold} transform={`scale(1 ${f(0)})`} />
      <path d="M-18 0C-34 -20 -14 -48 0 -70C6 -48 22 -34 18 0Z" fill={pal.bone} opacity={0.85} transform={`scale(1 ${f(2)})`} />
      <path d="M-46 4L46 -6M-40 -8L44 8" stroke={pal.ink} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

export const Ground: React.FC<{y?: number; seed?: number; col?: string; tex?: 'stones' | 'cracks' | 'plain'}> = ({y = 900, seed = 1, col, tex = 'stones'}) => {
  const {pal} = useShot();
  const c = col ?? pal.near;
  const r = rng(seed);
  const pts: Pt[] = [[WX0, y + 20 * r()]];
  for (let x = WX0; x <= WX1; x += 120) pts.push([x, y - 8 + r() * 16]);
  pts.push([WX1, 1400], [WX0, 1400]);
  return (
    <g>
      <Paper pts={pts} fill={c} seed={seed} amp={2} />
      {tex === 'stones' && Array.from({length: 60}, (_, i) => <ellipse key={i} cx={WX0 + r() * (WX1 - WX0)} cy={y + 20 + r() * 200} rx={4 + r() * 12} ry={3 + r() * 6} fill={mix(c, pal.ink, 0.35)} opacity={0.7} />)}
      {tex === 'cracks' && Array.from({length: 26}, (_, i) => { const x = WX0 + r() * (WX1 - WX0); const yy = y + 30 + r() * 180; return <path key={i} d={`M${x} ${yy}l${20 + r() * 40} ${r() * 20 - 8}l${r() * 30} ${r() * 30}`} stroke={pal.ink} strokeWidth={3} fill="none" opacity={0.5} />; })}
    </g>
  );
};

export const Rocks: React.FC<{x0: number; x1: number; y: number; n?: number; seed?: number; col?: string; s?: number}> = ({x0, x1, y, n = 5, seed = 1, col, s = 1}) => {
  const {pal} = useShot();
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
        const w = (90 + r() * 160) * s;
        const h = (60 + r() * 130) * s;
        return <Paper key={i} pts={[[x - w / 2, y], [x - w * 0.35, y - h * 0.7], [x - w * 0.05, y - h], [x + w * 0.3, y - h * 0.75], [x + w / 2, y]]} fill={col ?? pal.ink} seed={seed + i} amp={3} />;
      })}
    </g>
  );
};

export const Pillar: React.FC<{x: number; w: number; top?: number; bottom?: number; col?: string}> = ({x, w, top = -80, bottom = H + 200, col}) => {
  const {pal} = useShot();
  const c = col ?? pal.lacq;
  return (
    <g>
      <Paper pts={rect(x - w / 2, top, w, bottom - top)} fill={c} seed={Math.round(x)} amp={1.5} />
      <rect x={x - w / 2} y={top + 90} width={w} height={w * 0.16} fill={pal.gold} opacity={0.85} />
      <rect x={x - w / 2 - w * 0.12} y={bottom - 130} width={w * 1.24} height={w * 0.4} fill={mix(pal.bone, pal.clay, 0.3)} />
      <rect x={x - w / 2 + w * 0.12} y={top} width={w * 0.1} height={bottom - top} fill={mix(c, pal.bone, 0.2)} opacity={0.5} />
    </g>
  );
};

export const FloorLines: React.FC<{vy: number; col?: string}> = ({vy, col}) => {
  const {pal} = useShot();
  const c = col ?? mix(pal.mid, pal.clay, 0.2);
  return (
    <g>
      <rect x={WX0} y={vy} width={WX1 - WX0} height={H + 400 - vy} fill={c} />
      {Array.from({length: 17}, (_, i) => {
        const x = 960 + (i - 8) * 280;
        return <line key={i} x1={960 + (i - 8) * 22} y1={vy} x2={x * 1.0 + (i - 8) * 120} y2={H + 300} stroke={pal.ink} strokeWidth={3} opacity={0.2} />;
      })}
      {Array.from({length: 9}, (_, k) => {
        const yy = vy + (H + 300 - vy) * ((k + 1) / 9) ** 1.7;
        return <line key={k} x1={WX0} y1={yy} x2={WX1} y2={yy} stroke={pal.ink} strokeWidth={2 + k * 0.5} opacity={0.18} />;
      })}
    </g>
  );
};

export const torn = tornPath;

export const Columns: React.FC<{x0?: number; x1?: number; y?: number; n?: number; h?: number; col?: string}> = ({x0 = 300, x1 = 1620, y = 800, n = 6, h = 300, col}) => {
  const {pal} = useShot();
  const c = col ?? mix(pal.bone, pal.mid, 0.25);
  return (
    <g>
      <Paper pts={rect(x0 - 40, y - 24, x1 - x0 + 80, 40)} fill={mix(c, pal.clay, 0.2)} seed={2} />
      {Array.from({length: n}, (_, i) => {
        const x = x0 + ((x1 - x0) * i) / (n - 1);
        return (
          <g key={i}>
            <Paper pts={rect(x - 24, y - h - 24, 48, h)} fill={c} seed={i + 3} amp={1.5} />
            {[-14, 0, 14].map((o) => <line key={o} x1={x + o} y1={y - h - 20} x2={x + o} y2={y - 28} stroke={pal.ink} strokeWidth={2} opacity={0.12} />)}
            <Paper pts={rect(x - 34, y - h - 44, 68, 22)} fill={mix(c, pal.bone, 0.2)} seed={i + 9} />
          </g>
        );
      })}
      <Paper pts={rect(x0 - 50, y - h - 80, x1 - x0 + 100, 36)} fill={mix(c, pal.clay, 0.25)} seed={5} />
      <Paper pts={[[x0 - 50, y - h - 80], [(x0 + x1) / 2, y - h - 190], [x1 + 50, y - h - 80]]} fill={mix(c, pal.clay, 0.12)} seed={6} />
    </g>
  );
};
