import React from 'react';
import {mix, RED, GOLD} from '../theme';
import {rng} from './rng';
import {useShot} from './shot';

export type Kind = 'leader' | 'elder' | 'worker' | 'soldier' | 'scribe' | 'priest' | 'noble' | 'child' | 'farmer' | 'official' | 'raider' | 'woman';
export type Anim = 'idle' | 'walk' | 'run' | 'raise' | 'point' | 'bow' | 'sit' | 'write' | 'carry' | 'argue' | 'march' | 'dig' | 'cheer' | 'kneel';
export type Prop = 'none' | 'staff' | 'spear' | 'basket' | 'sack' | 'tablet' | 'torch' | 'shovel' | 'scroll' | 'banner' | 'jar' | 'rifle' | 'seal';

export type PuppetProps = {
  x: number; y: number; s?: number; kind?: Kind; anim?: Anim; prop?: Prop; fill?: string;
  flip?: boolean; speed?: number; off?: number; seed?: number; alpha?: number;
};

type Style = {body: 'tunic' | 'robe' | 'kilt'; hat: 'none' | 'cone' | 'turban' | 'helmet' | 'crown' | 'hood' | 'band' | 'scarf' | 'topknot'; beard: boolean; h: number};
const STYLE: Record<Kind, Style> = {
  leader: {body: 'kilt', hat: 'band', beard: true, h: 1.04},
  elder: {body: 'robe', hat: 'none', beard: true, h: 0.98},
  worker: {body: 'kilt', hat: 'band', beard: false, h: 1},
  soldier: {body: 'tunic', hat: 'helmet', beard: false, h: 1.04},
  scribe: {body: 'robe', hat: 'none', beard: false, h: 0.97},
  priest: {body: 'robe', hat: 'cone', beard: true, h: 1.03},
  noble: {body: 'robe', hat: 'crown', beard: false, h: 1.02},
  child: {body: 'tunic', hat: 'topknot', beard: false, h: 0.62},
  farmer: {body: 'kilt', hat: 'hood', beard: false, h: 0.98},
  official: {body: 'robe', hat: 'turban', beard: false, h: 1},
  raider: {body: 'tunic', hat: 'band', beard: true, h: 1.04},
  woman: {body: 'robe', hat: 'scarf', beard: false, h: 0.94},
};

type Joints = {tF: number; tB: number; sF: number; sB: number; aF: number; aB: number; eF: number; eB: number; lean: number; bob: number; head: number};

const poseOf = (anim: Anim, ph: number, sd: number): Joints => {
  const j: Joints = {tF: 0, tB: 0, sF: 0, sB: 0, aF: 8, aB: -6, eF: 8, eB: 8, lean: 0, bob: 0, head: 0};
  const s = Math.sin(ph);
  const c = Math.cos(ph);
  switch (anim) {
    case 'walk':
      Object.assign(j, {tF: s * 26, tB: -s * 26, sF: -Math.max(0, -c) * 32, sB: -Math.max(0, c) * 32, aF: -s * 24, aB: s * 24, eF: 16, eB: 16, bob: Math.abs(c) * 3});
      break;
    case 'run':
      Object.assign(j, {tF: s * 42, tB: -s * 42, sF: -Math.max(0, -c) * 55, sB: -Math.max(0, c) * 55, aF: -s * 45, aB: s * 45, eF: 70, eB: 70, lean: 9, bob: Math.abs(c) * 7});
      break;
    case 'march':
      Object.assign(j, {tF: s > 0 ? s * 40 : s * 12, tB: s > 0 ? -s * 12 : -s * 40, sF: s > 0 ? -s * 50 : 0, sB: s < 0 ? s * 50 : 0, aF: 20, aB: 6, eF: 80, eB: 20, bob: Math.abs(s) * 3});
      break;
    case 'raise':
      Object.assign(j, {aF: 165 + s * 5, eF: -8, aB: 12, bob: Math.abs(s) * 1.5});
      break;
    case 'point':
      Object.assign(j, {aF: 82, eF: 0, aB: 6, head: -3});
      break;
    case 'bow':
      Object.assign(j, {lean: 24, aF: 26, aB: 20, eF: 10, head: 8});
      break;
    case 'kneel':
      Object.assign(j, {tF: 88, sF: -88, tB: 2, sB: -92, lean: 14, aF: 30, aB: 24, eF: 20, head: 8, bob: -44});
      break;
    case 'sit':
      Object.assign(j, {tF: 86, tB: 86, sF: -86, sB: -86, aF: 38, aB: 30, eF: 60, eB: 60, bob: -43});
      break;
    case 'write':
      Object.assign(j, {tF: 86, tB: 86, sF: -86, sB: -86, aF: 38 + s * 9, aB: 30, eF: 70 + c * 10, eB: 60, bob: -43, lean: 8, head: 8});
      break;
    case 'carry':
      Object.assign(j, {tF: s * 18, tB: -s * 18, sF: -Math.max(0, -c) * 20, sB: -Math.max(0, c) * 20, aF: 158, aB: 158, eF: -45, eB: -45, bob: Math.abs(c) * 2});
      break;
    case 'argue':
      Object.assign(j, {aF: 66 + Math.sin(ph * 1.7 + sd) * 48, aB: 24 + Math.sin(ph * 1.3 + sd * 2) * 24, eF: 30, head: Math.sin(ph * 2.2 + sd) * 4, bob: Math.abs(Math.sin(ph * 1.7 + sd)) * 2});
      break;
    case 'dig':
      Object.assign(j, {lean: 26, aF: 40 + s * 40, aB: 36 + s * 40, eF: 30, eB: 30, tF: 10, tB: -8, bob: -Math.max(0, s) * 4});
      break;
    case 'cheer':
      Object.assign(j, {aF: 160 + Math.sin(ph * 2) * 16, aB: 160 - Math.sin(ph * 2) * 16, eF: 0, eB: 0, bob: Math.abs(Math.sin(ph * 2)) * 10});
      break;
    default:
      Object.assign(j, {aF: 8 + s * 2, aB: -6 - s * 2, bob: Math.sin(ph * 0.5) * 1.2});
  }
  return j;
};

const limb = (w1: number, w2: number, L: number) => `M${-w1} 0L${w1} 0L${w2} ${L}L${-w2} ${L}Z`;

const PropArt: React.FC<{prop: Prop; fill: string; flame: number}> = ({prop, fill, flame}) => {
  switch (prop) {
    case 'staff': return <g><rect x={-3} y={-150} width={6} height={190} fill={mix(fill, '#000', 0.25)} /><circle cx={0} cy={-154} r={8} fill={GOLD} /></g>;
    case 'spear': return <g><rect x={-2.5} y={-170} width={5} height={215} fill={mix(fill, '#000', 0.2)} /><path d="M-8 -168L0 -205L8 -168Z" fill={mix(fill, '#fff', 0.35)} /></g>;
    case 'rifle': return <g transform="rotate(-80)"><rect x={-3} y={-20} width={6} height={95} fill={mix(fill, '#000', 0.2)} /><rect x={-5} y={50} width={10} height={26} fill={mix(fill, '#000', 0.4)} /></g>;
    case 'torch': return (
      <g>
        <rect x={-3} y={-60} width={6} height={90} fill={mix(fill, '#000', 0.3)} />
        <circle cx={0} cy={-76} r={70} fill="url(#g-glow)" />
        <path d="M0 -62C-12 -70 -10 -88 0 -108C10 -88 12 -70 0 -62Z" fill={GOLD} transform={`scale(1 ${flame})`} />
      </g>
    );
    case 'banner': return <g><rect x={-3} y={-190} width={6} height={230} fill={mix(fill, '#000', 0.25)} /><path d={`M3 -188L${70 + flame * 8} ${-176}L${64 + flame * 6} ${-140}L3 ${-132}Z`} fill={GOLD} /></g>;
    case 'basket': return <g transform="translate(0 -20)"><path d="M-22 0L22 0L16 24L-16 24Z" fill={mix(fill, '#fff', 0.15)} /><ellipse cx={0} cy={0} rx={22} ry={5} fill={mix(fill, '#000', 0.2)} /></g>;
    case 'sack': return <g transform="translate(6 -8)"><ellipse cx={0} cy={0} rx={20} ry={24} fill={mix(fill, '#fff', 0.2)} /><path d="M-8 -22L0 -30L8 -22Z" fill={mix(fill, '#000', 0.2)} /></g>;
    case 'jar': return <g transform="translate(0 -4)"><path d="M-12 -18C-24 0 -20 24 0 26C20 24 24 0 12 -18Z" fill={mix(fill, '#fff', 0.2)} /><rect x={-9} y={-26} width={18} height={9} fill={mix(fill, '#000', 0.15)} /></g>;
    case 'tablet': return <rect x={-16} y={-8} width={34} height={22} rx={3} fill={GOLD} opacity={0.9} />;
    case 'scroll': return <g><rect x={-6} y={-14} width={12} height={46} rx={5} fill="#f0e4c9" /><rect x={-8} y={-16} width={16} height={4} fill={GOLD} /></g>;
    case 'seal': return <g><rect x={-7} y={-6} width={14} height={14} fill={GOLD} /><rect x={-4} y={-14} width={8} height={9} fill={GOLD} /></g>;
    case 'shovel': return <g><rect x={-2.5} y={-20} width={5} height={78} fill={mix(fill, '#000', 0.2)} /><path d="M-11 56L11 56L7 82L-7 82Z" fill={mix(fill, '#fff', 0.3)} /></g>;
    default: return null;
  }
};

export const Puppet: React.FC<PuppetProps> = ({x, y, s = 1, kind = 'worker', anim = 'idle', prop = 'none', fill, flip = false, speed = 1, off = 0, seed = 1, alpha = 1}) => {
  const {frame, pal} = useShot();
  const st = STYLE[kind];
  const col = kind === 'leader' ? RED : fill ?? pal.ink;
  const dark = mix(col, '#000', 0.22);
  const ph = (frame / 24) * Math.PI * 2 * speed + off + seed * 1.7;
  const j = poseOf(anim, ph, seed);
  const sc = s * st.h;
  const flame = 1 + Math.sin(frame * 0.4 + seed) * 0.12;
  const hem = Math.sin(ph) * 3;
  const holdA = j.aF + j.eF;
  const seated = anim === 'sit' || anim === 'write' || anim === 'kneel';
  const legs = st.body !== 'robe' || seated;
  const hemY = seated ? -50 : -4;
  const onHead = anim === 'carry' && (prop === 'basket' || prop === 'sack' || prop === 'jar');
  const bodyY = -j.bob;

  const Leg: React.FC<{t: number; sh: number; c: string}> = ({t, sh, c}) => (
    <g transform={`translate(0 -88) rotate(${-t})`}>
      <path d={limb(7, 5.5, 44)} fill={c} />
      <g transform={`translate(0 44) rotate(${-sh})`}>
        <path d={limb(5.5, 4.5, 44)} fill={c} />
        <path d="M-5 42L10 42L12 48L-6 48Z" fill={c} />
      </g>
    </g>
  );
  const Arm: React.FC<{a: number; e: number; c: string; holding?: boolean}> = ({a, e, c, holding}) => (
    <g transform={`translate(0 -140) rotate(${-a})`}>
      <path d={limb(5.5, 4.5, 32)} fill={c} />
      <g transform={`translate(0 32) rotate(${-e})`}>
        <path d={limb(4.5, 3.5, 30)} fill={c} />
        <circle cx={0} cy={31} r={4.2} fill={c} />
        {holding && prop !== 'none' && !onHead && (
          <g transform={`translate(0 31) rotate(${a + e})`}>
            <PropArt prop={prop} fill={col} flame={flame} />
          </g>
        )}
      </g>
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -sc : sc} ${sc})`} opacity={alpha}>
      <ellipse cx={0} cy={2} rx={26} ry={5} fill={pal.ink} opacity={0.16} />
      <g transform={`translate(0 ${bodyY})`}>
        {legs && <Leg t={j.tB} sh={j.sB} c={dark} />}
        {st.body === 'robe' && <path d={`M-13 -92L13 -92L${(seated ? 22 : 27) + hem} ${hemY}L${(seated ? -22 : -27) + hem} ${hemY}Z`} fill={col} />}
        <Arm a={j.aB} e={j.eB} c={dark} />
        <g transform={`rotate(${j.lean} 0 -88)`}>
          {st.body === 'robe' && <path d="M-14 -142L14 -142L13 -88L-13 -88Z" fill={col} />}
          {st.body === 'tunic' && <path d="M-14 -142L14 -142L12 -88L-12 -88Z M-12 -92L12 -92L17 -52L-17 -52Z" fill={col} />}
          {st.body === 'kilt' && <path d="M-14 -142L14 -142L12 -92L-12 -92Z" fill={col} />}
          {st.body === 'kilt' && (
            <path d={`M-13 -94L13 -94L19 -48L15 -52L11 -46L7 -52L3 -46L-1 -52L-5 -46L-9 -52L-13 -46L-19 -48Z`} fill={kind === 'leader' ? mix(col, '#000', 0.12) : mix(col, '#fff', 0.1)} />
          )}
          {kind === 'leader' && <path d="M-14 -142L-6 -142L16 -96L10 -92Z" fill={mix(col, '#000', 0.4)} />}
          {kind === 'leader' && <rect x={-13} y={-97} width={26} height={5} fill={GOLD} />}
          {kind === 'official' && <path d="M-4 -142L4 -142L4 -60L-4 -60Z" fill={GOLD} opacity={0.7} />}
          {kind === 'noble' && <path d="M-14 -142L14 -142L14 -128L-14 -128Z" fill={GOLD} opacity={0.75} />}
          <rect x={-4} y={-152} width={8} height={12} fill={col} />
          <g transform={`rotate(${j.head} 0 -150)`}>
            <ellipse cx={0} cy={-164} rx={12.5} ry={14} fill={col} />
            <path d="M10 -166L19 -160L10 -156Z" fill={col} />
            {st.beard && <path d="M-4 -156L9 -154L5 -140L-3 -146Z" fill={dark} />}
            {st.hat === 'cone' && <path d="M-13 -170L0 -208L13 -170Z" fill={dark} />}
            {st.hat === 'turban' && <ellipse cx={0} cy={-174} rx={15} ry={9} fill={mix(col, '#fff', 0.18)} />}
            {st.hat === 'helmet' && <path d="M-14 -166A14 14 0 0 1 14 -166L16 -162L-14 -162Z M-2 -182L2 -182L1 -194L-1 -194Z" fill={mix(col, '#fff', 0.25)} />}
            {st.hat === 'crown' && <path d="M-11 -174L-11 -190L-5 -182L0 -192L5 -182L11 -190L11 -174Z" fill={GOLD} />}
            {st.hat === 'hood' && <path d="M-15 -160A15 17 0 0 1 12 -176L8 -164Z" fill={dark} />}
            {st.hat === 'band' && <rect x={-13} y={-173} width={26} height={4} fill={kind === 'leader' ? GOLD : dark} />}
            {st.hat === 'scarf' && <path d="M-14 -162A14 16 0 0 1 14 -166L16 -150L-6 -146Z" fill={dark} />}
            {st.hat === 'topknot' && <circle cx={-2} cy={-181} r={6} fill={col} />}
            {kind === 'leader' && <circle cx={-9} cy={-172} r={6} fill={col} />}
          </g>
        </g>
        {legs && <Leg t={j.tF} sh={j.sF} c={col} />}
        <Arm a={j.aF} e={j.eF} c={col} holding />
        {onHead && <g transform="translate(0 -184)"><PropArt prop={prop} fill={col} flame={flame} /></g>}
      </g>
    </g>
  );
};

// ---------- crowds ----------

export type CrowdProps = {
  kind?: Kind; n?: number; anim?: Anim; dir?: 1 | -1; y?: number; s?: number; x0?: number; x1?: number;
  speed?: number; prop?: Prop; seed?: number; fill?: string; rows?: number; sizeVar?: number; mixKinds?: Kind[]; alpha?: number; flip?: boolean;
};

export const Crowd: React.FC<CrowdProps> = ({
  kind = 'worker', n = 8, anim = 'walk', dir = 1, y = 880, s = 1, x0 = -150, x1 = 2070, speed = 3.4, prop = 'none',
  seed = 1, fill, rows = 1, sizeVar = 0.12, mixKinds, alpha = 1, flip,
}) => {
  const {frame} = useShot();
  const r = rng(seed * 97 + 5);
  const span = x1 - x0;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const row = i % rows;
        const k = mixKinds ? mixKinds[Math.floor(r() * mixKinds.length)] : kind;
        const sz = s * (1 + (r() - 0.5) * sizeVar * 2) * (1 - row * 0.07);
        const base = x0 + (span * (i + 0.5)) / n + (r() - 0.5) * (span / n) * 0.6;
        let x = base;
        let a: Anim = anim;
        if (anim === 'walk' || anim === 'run' || anim === 'march' || anim === 'carry') {
          const px = speed * (anim === 'run' ? 1.7 : 1) * sz;
          x = x0 + ((((base - x0) + dir * px * frame) % span) + span) % span;
        }
        const yy = y + row * 34 * s + (r() - 0.5) * 8;
        return (
          <Puppet key={i} x={x} y={yy} s={sz} kind={k} anim={a} prop={prop} fill={fill} flip={flip ?? dir === -1} seed={seed + i}
            speed={(anim === 'walk' || anim === 'carry' ? 0.8 + r() * 0.15 : 0.9 + r() * 0.3)} off={r() * 6} alpha={alpha} />
        );
      })}
    </g>
  );
};
