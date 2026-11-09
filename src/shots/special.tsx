import React from 'react';
import {Easing, interpolate} from 'remotion';
import {GOLD, H, RED, W, mix} from '../theme';
import {Plane, Shot, camPreset, useShot} from '../engine/shot';
import {Paper, Pt, WX0, WX1, rect, tornPath} from '../engine/paper';
import {Puppet} from '../engine/puppet';
import {Dust, Embers, Glow, Rays, Smoke} from '../engine/fx';
import * as E from '../engine/env';
import {Compose, Item, skyFor} from '../engine/compose';
import {rng} from '../engine/rng';
import {ShotProps} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SERIF = "Georgia, 'Times New Roman', serif";
const ease = Easing.inOut(Easing.cubic);

const wrap = (p: ShotProps, children: React.ReactNode, sky?: [string, string]) => (
  <Shot duration={p.duration} tod={p.tod} seed={p.seed} cam={camPreset(p.cam, p.focus?.[0], p.focus?.[1])} slotText={p.slotText} sky={sky}>
    {children}
  </Shot>
);

/** Parchment backdrop used by maps and diagrams. */
const Parchment: React.FC<{tone?: number}> = ({tone = 0}) => {
  const {pal} = useShot();
  return (
    <Plane depth={0.02} shadow={false}>
      <rect x={WX0} y={-400} width={WX1 - WX0} height={H + 800} fill={mix(pal.bone, pal.mid, 0.12 + tone)} />
      <rect x={WX0} y={-400} width={WX1 - WX0} height={H + 800} fill="url(#p-dots)" opacity={0.035} />
    </Plane>
  );
};

// ---------------------------------------------------------------- calendar
export const Calendar: React.FC<ShotProps> = (p) => {
  const years = [1908, 1909, 1910, 1911, 1912];
  return wrap(p, <CalendarInner n={years.length} years={years} />);
};
const CalendarInner: React.FC<{n: number; years: number[]}> = ({n, years}) => {
  const {frame, dur, pal} = useShot();
  const per = dur / (n + 0.4);
  const rand = rng(5);
  return (
    <>
      <Plane depth={0.05}>
        <rect x={WX0} y={-300} width={WX1 - WX0} height={H + 600} fill={pal.near} />
        {Array.from({length: 14}, (_, i) => <rect key={i} x={WX0 + i * 280} y={-300} width={6} height={H + 600} fill={pal.ink} opacity={0.35} />)}
      </Plane>
      <Plane depth={0.4}>
        <Paper pts={rect(560, 120, 800, 860)} fill={pal.clay} seed={3} />
        <Paper pts={rect(590, 210, 740, 740)} fill={pal.bone} seed={4} />
        {[0, 1, 2].map((i) => <circle key={i} cx={700 + i * 260} cy={150} r={13} fill={pal.ink} />)}
        {years.map((y, i) => {
          const idx = years.length - 1 - i;
          const start = (n - 1 - idx + 0) * per;
          const flip = interpolate(frame, [start + per - 10, start + per], [1, 0], clamp);
          const page = idx === 0 ? 1 : flip;
          if (i < 0) return null;
          const flyT = interpolate(frame, [start + per - 10, start + per + 14], [0, 1], clamp);
          const gone = flyT >= 1 && idx !== 0;
          if (gone) return null;
          return (
            <g key={y} transform={`translate(960 210) rotate(${(1 - page) * -14 * (idx % 2 ? 1 : -1)}) translate(-960 -210) translate(0 ${(1 - page) * -240})`} opacity={idx === 0 ? 1 : page}>
              <Paper pts={rect(590, 210, 740, 740)} fill={mix(pal.bone, pal.gold, (i % 3) * 0.05)} seed={20 + i} />
              <rect x={590} y={210} width={740} height={120} fill={pal.gold} opacity={0.8} />
              <text x={960} y={360} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={190} fill={pal.ink}>{y}</text>
              {Array.from({length: 42}, (_, k) => <circle key={k} cx={650 + (k % 7) * 100} cy={500 + Math.floor(k / 7) * 76} r={8 + rand() * 0} fill={pal.ink} opacity={0.35} />)}
            </g>
          );
        })}
      </Plane>
      <Plane depth={1}><Dust seed={4} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- maps
const BLOB: Record<string, Pt[]> = {
  americas: [[240, 150], [520, 180], [600, 340], [520, 520], [600, 640], [520, 860], [440, 980], [390, 760], [430, 560], [300, 430], [250, 300]],
  eurafrica: [[800, 190], [1120, 170], [1300, 260], [1340, 420], [1210, 520], [1180, 700], [1070, 880], [940, 820], [900, 600], [820, 470], [760, 320]],
  asia: [[1260, 210], [1620, 190], [1840, 300], [1790, 470], [1620, 560], [1450, 520], [1360, 400]],
};
const SPOTS: {n: string; x: number; y: number}[] = [
  {n: 'meso', x: 1130, y: 420}, {n: 'egypt', x: 1000, y: 470}, {n: 'indus', x: 1290, y: 460},
  {n: 'china', x: 1560, y: 380}, {n: 'mesoamerica', x: 430, y: 420}, {n: 'andes', x: 500, y: 700},
];
export const MapScene: React.FC<ShotProps> = (p) => {
  const kind: string = p.opt?.kind ?? 'world';
  return wrap(p, kind === 'world' ? <WorldMap /> : kind === 'meso' ? <MesoMap /> : <Provinces />);
};
const WorldMap: React.FC = () => {
  const {frame, dur, pal} = useShot();
  const lit = (i: number) => interpolate(frame, [30 + i * (dur / 9), 60 + i * (dur / 9)], [0, 1], clamp);
  return (
    <>
      <Parchment />
      <Plane depth={0.2}>
        {Object.entries(BLOB).map(([k, pts], i) => <Paper key={k} pts={pts} fill={mix(pal.mid, pal.bone, 0.15)} seed={i + 2} amp={6} />)}
        <path d="M240 150L520 180M800 190L1340 260" stroke={pal.ink} strokeWidth={2} opacity={0.1} fill="none" />
      </Plane>
      <Plane depth={0.45}>
        {SPOTS.map((s, i) => {
          const a = lit(i);
          return (
            <g key={s.n}>
              <circle cx={s.x} cy={s.y} r={(70 + Math.sin(frame / 14 + i) * 8) * a} fill="url(#g-glow)" opacity={a} />
              <circle cx={s.x} cy={s.y} r={14 * a} fill={GOLD} stroke={pal.ink} strokeWidth={3} />
              {SPOTS.slice(0, i).slice(-1).map((q) => {
                const t = interpolate(frame, [60 + i * (dur / 9), 100 + i * (dur / 9)], [0, 1], clamp);
                const mx = (s.x + q.x) / 2;
                const my = Math.min(s.y, q.y) - 120 - (i % 3) * 40;
                return <path key={q.n} d={`M${q.x} ${q.y}Q${mx} ${my} ${s.x} ${s.y}`} fill="none" stroke={pal.ink} strokeWidth={4} strokeDasharray="14 12" strokeDashoffset={-frame * 0.8} opacity={0.45 * t} pathLength={1} />;
              })}
            </g>
          );
        })}
      </Plane>
      <Plane depth={1}><Dust seed={9} /></Plane>
    </>
  );
};
const MesoMap: React.FC = () => {
  const {frame, pal} = useShot();
  const riverPath = (x0: number) => `M${x0} -60C${x0 + 120} 220 ${x0 - 160} 360 ${x0 + 60} 560S${x0 + 300} 780 ${1010} 940`;
  return (
    <>
      <Parchment tone={0.04} />
      <Plane depth={0.15}>
        <Paper pts={[[300, 120], [1700, 90], [1740, 760], [1100, 1080], [260, 1100]]} fill={mix(pal.mid, pal.bone, 0.3)} seed={3} amp={9} />
        <Paper pts={[[860, 940], [1180, 900], [1300, 1100], [760, 1120]]} fill={pal.river} seed={9} amp={5} />
      </Plane>
      <Plane depth={0.35}>
        <path d={riverPath(760)} stroke={pal.river} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={riverPath(1160)} stroke={pal.riverDeep} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={riverPath(760)} stroke={pal.bone} strokeWidth={4} fill="none" strokeDasharray="16 22" strokeDashoffset={-frame * 1.2} opacity={0.6} />
        <path d={riverPath(1160)} stroke={pal.bone} strokeWidth={4} fill="none" strokeDasharray="16 22" strokeDashoffset={-frame * 1.2} opacity={0.6} />
        {[[900, 880], [1060, 840], [980, 920]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={70} ry={26} fill={pal.riverDeep} opacity={0.5} />)}
      </Plane>
      <Plane depth={0.6}>
        {[[800, 500], [1110, 470], [900, 700], [1230, 700], [1030, 300], [700, 250]].map(([x, y], i) => {
          const a = interpolate(frame, [20 + i * 18, 50 + i * 18], [0, 1], clamp);
          return (
            <g key={i} opacity={a}>
              <circle cx={x} cy={y} r={60 + Math.sin(frame / 12 + i) * 6} fill="url(#g-glow)" />
              <Paper pts={rect(x - 22, y - 22, 44, 36)} fill={pal.clay} seed={i + 5} />
              <Paper pts={rect(x - 14, y - 42, 28, 24)} fill={pal.near} seed={i + 9} />
            </g>
          );
        })}
      </Plane>
      <Plane depth={1}><Dust seed={3} /></Plane>
    </>
  );
};
const Provinces: React.FC = () => {
  const {frame, dur, pal} = useShot();
  const r = rng(11);
  const cells: {pts: Pt[]; cx: number; cy: number}[] = [];
  for (let gx = 0; gx < 7; gx++) for (let gy = 0; gy < 4; gy++) {
    const x = 330 + gx * 190 + (gy % 2) * 40;
    const y = 190 + gy * 190;
    const j = () => (r() - 0.5) * 70;
    cells.push({pts: [[x + j(), y + j()], [x + 190 + j(), y + j()], [x + 190 + j(), y + 190 + j()], [x + j(), y + 190 + j()]], cx: x + 95, cy: y + 95});
  }
  return (
    <>
      <Parchment tone={0.02} />
      <Plane depth={0.3}>
        {cells.map((c, i) => {
          const dist = Math.hypot(c.cx - 960, c.cy - 480);
          const t = interpolate(frame, [20 + dist * (dur / 2600), 50 + dist * (dur / 2600)], [0, 1], clamp);
          return <Paper key={i} pts={c.pts} fill={mix(mix(pal.mid, pal.bone, 0.25), GOLD, t * 0.9)} seed={i + 2} amp={4} />;
        })}
        <circle cx={960} cy={480} r={34} fill={pal.ink} /><circle cx={960} cy={480} r={16} fill={pal.lacq} />
      </Plane>
      <Plane depth={1}><Dust seed={5} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- doors and locks
const LockArt: React.FC<{x: number; y: number; o: number; s?: number; n?: number}> = ({x, y, o, s = 1, n}) => {
  const {pal} = useShot();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${-o * 18}) rotate(${-o * 38} 22 0)`}><path d="M-22 0V-30A22 22 0 0 1 22 -30V0" fill="none" stroke={pal.gold} strokeWidth={10} strokeLinecap="round" /></g>
      <rect x={-34} y={0} width={68} height={56} rx={7} fill={o > 0.5 ? mix(pal.gold, pal.bone, 0.25) : pal.gold} stroke={pal.ink} strokeWidth={3} />
      <circle cx={0} cy={22} r={7} fill={pal.ink} /><rect x={-3} y={26} width={6} height={18} fill={pal.ink} />
      {n !== undefined && <text x={0} y={-62} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={30} fill={pal.ink} opacity={0.7}>{n}</text>}
    </g>
  );
};
export const DoorLocks: React.FC<ShotProps> = (p) => {
  const from = p.opt?.from ?? 0;
  const to = p.opt?.to ?? 0;
  return wrap(p, <DoorInner from={from} to={to} />);
};
const DoorInner: React.FC<{from: number; to: number}> = ({from, to}) => {
  const {t, frame, pal} = useShot();
  const open = from + (to - from) * Easing.inOut(Easing.cubic)(interpolate(t, [0.2, 0.75], [0, 1], clamp));
  const all = Math.max(0, Math.min(1, open - 3));
  const gap = 150 * all;
  return (
    <>
      <Plane depth={0.05}><rect x={WX0} y={-300} width={WX1 - WX0} height={H + 600} fill={mix(pal.ink, pal.lacq, 0.3)} /></Plane>
      <Plane depth={0.2}>
        <Paper pts={rect(300, 40, 1320, 1100)} fill={pal.clay} seed={2} tex="brick" texOp={0.14} />
        <path d={`M560 1100V380A400 400 0 0 1 1360 380V1100Z`} fill={pal.ink} />
        <rect x={960 - gap / 2 - 6} y={300} width={gap + 12} height={800} fill={pal.gold} opacity={all} />
        {all > 0 && <Rays x={960} y={600} n={9} op={0.3 * all} len={1400} />}
      </Plane>
      <Plane depth={0.4}>
        <Paper pts={[[600 - gap / 2 * 0, 1100], [600, 390], [960 - gap / 2, 390], [960 - gap / 2, 1100]]} fill={pal.near} seed={5} tex="stripe" texOp={0.07} />
        <Paper pts={[[960 + gap / 2, 1100], [960 + gap / 2, 390], [1320, 390], [1320, 1100]]} fill={pal.near} seed={6} tex="stripe" texOp={0.07} />
        {[470, 600, 740, 880].map((y, i) => <g key={i}><circle cx={640} cy={y} r={9} fill={pal.gold} opacity={0.8} /><circle cx={1280} cy={y} r={9} fill={pal.gold} opacity={0.8} /></g>)}
        {[0, 1, 2, 3].map((i) => <LockArt key={i} x={960 - gap / 2 - 110} y={420 + i * 150} o={Math.max(0, Math.min(1, open - i))} n={i + 1} />)}
        <Glow x={460} y={520} r={180} op={0.6} /><Glow x={1460} y={520} r={180} op={0.6} />
        <E.Fire x={460} y={640} s={0.5} /><E.Fire x={1460} y={640} s={0.5} />
      </Plane>
      <Plane depth={0.75}>
        <E.Ground y={1000} col={pal.near} seed={3} />
        <Puppet x={960} y={1050} s={1.5} kind="leader" anim="idle" prop="staff" fill={RED} />
      </Plane>
      <Plane depth={1}><Dust seed={7 + Math.floor(frame / 99)} /><Embers n={14} y={1100} /></Plane>
    </>
  );
};

export const LocksOrders: React.FC<ShotProps> = (p) => wrap(p, <LocksOrdersInner />);
const LocksOrdersInner: React.FC = () => {
  const {t, pal} = useShot();
  const orders = [[0, 1, 2, 3], [2, 0, 3, 1], [1, 3, 0, 2]];
  const simul = [false, false, true];
  return (
    <>
      <Parchment tone={0.03} />
      <Plane depth={0.4}>
        {orders.map((ord, row) => (
          <g key={row}>
            <Paper pts={rect(260, 190 + row * 270, 1400, 200)} fill={mix(pal.bone, pal.mid, 0.3)} seed={row + 3} />
            {[0, 1, 2, 3].map((lock) => {
              const rank = ord.indexOf(lock);
              const start = simul[row] && rank > 1 ? 0.28 + (rank - 2) * 0.02 : 0.15 + rank * 0.17;
              const o = interpolate(t, [start, start + 0.1], [0, 1], clamp);
              return <LockArt key={lock} x={500 + lock * 310} y={260 + row * 270} o={o} n={lock + 1} s={1.2} />;
            })}
          </g>
        ))}
      </Plane>
      <Plane depth={1}><Dust seed={2} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- ratchet
export const RatchetScene: React.FC<ShotProps> = (p) => wrap(p, <RatchetInner n={p.opt?.n ?? 5} />);
const RatchetInner: React.FC<{n: number}> = ({n}) => {
  const {t, frame, pal} = useShot();
  const TEETH = 14;
  const stepT = (i: number) => 0.14 + (i * 0.72) / n;
  const prog = (i: number) => Easing.out(Easing.cubic)(interpolate(t, [stepT(i), stepT(i) + 0.05], [0, 1], clamp));
  const total = Array.from({length: n}, (_, i) => prog(i)).reduce((a, b) => a + b, 0);
  const ang = total * (360 / TEETH);
  const click = Math.max(0, ...Array.from({length: n}, (_, i) => Math.sin(interpolate(t, [stepT(i), stepT(i) + 0.05], [0, Math.PI], clamp))));
  const R = 270;
  const gear = (() => {
    const pts: Pt[] = [];
    const s = (Math.PI * 2) / TEETH;
    for (let i = 0; i < TEETH; i++) {
      const a = i * s;
      ([[0.84, 0], [1, 0.12], [0.84, 0.92]] as [number, number][]).forEach(([k, tt]) => pts.push([Math.cos(a + tt * s) * R * k, Math.sin(a + tt * s) * R * k]));
    }
    return tornPath(pts, 14, 2, 26) + `M${R * 0.28} 0A${R * 0.28} ${R * 0.28} 0 1 0 ${-R * 0.28} 0A${R * 0.28} ${R * 0.28} 0 1 0 ${R * 0.28} 0Z`;
  })();
  const icons = ['M-40 10Q-20 -20 0 10T40 10V30H-40Z', 'M0 -40L18 24H-18Z', 'M-40 -10H40A40 40 0 0 1 -40 -10Z'];
  return (
    <>
      {skyFor(p0(), 3).length > 0 && null}
      <Compose items={[...skyFor('day', 3), ['mountains', {y: 760, seed: 3, peak: 240}], ['river', {y: 800}]]} />
      <Plane depth={0.35}>
        {Array.from({length: n}, (_, i) => {
          const on = interpolate(t, [stepT(i), stepT(i) + 0.04], [0, 1], clamp);
          return (
            <g key={i} transform={`translate(${340 + i * Math.min(250, 1180 / n)} 120) scale(${0.9 + on * 0.25})`}>
              <circle r={50} fill={mix(pal.bone, pal.mid, 0.25)} stroke={pal.ink} strokeWidth={2} />
              <g transform="scale(0.8)" fill={on > 0.5 ? GOLD : pal.far} stroke={pal.ink} strokeWidth={on > 0.5 ? 2 : 0}><path d={icons[i % 3]} /></g>
            </g>
          );
        })}
      </Plane>
      <Plane depth={0.6}>
        <g transform={`translate(1160 600) rotate(${ang})`}><path d={gear} fill={pal.near} fillRule="evenodd" /><circle r={R * 0.14} fill={GOLD} /></g>
        <g transform={`translate(1160 ${600 - R * 0.9}) rotate(${-click * 14})`}><path d="M-16 -80L16 -80L8 22L-8 22Z" fill={pal.ink} /></g>
        <rect x={1120} y={880} width={80} height={220} fill={pal.ink} />
        <Paper pts={rect(260, 280, 56, 620)} fill={mix(pal.bone, pal.mid, 0.3)} seed={3} />
        <Paper pts={rect(260, 900 - total * (620 / n), 56, total * (620 / n))} fill={GOLD} seed={4} />
        {Array.from({length: n + 1}, (_, i) => <rect key={i} x={250} y={900 - i * (620 / n)} width={76} height={5} fill={pal.ink} opacity={0.6} />)}
      </Plane>
      <Plane depth={0.85}>
        <E.Ground y={960} col={pal.clay} seed={4} />
        <Puppet x={620} y={985} s={1.7} kind="leader" anim={click > 0.3 ? 'raise' : 'idle'} prop="staff" fill={RED} />
      </Plane>
      <Plane depth={1.1}><E.Reeds x0={-80} x1={400} y={H + 20} n={12} seed={4} h={320} /><Dust seed={13 + Math.floor(frame / 50)} /></Plane>
    </>
  );
};
const p0 = () => 'day' as const;

// ---------------------------------------------------------------- family tree, threads, balance
export const FamilyTree: React.FC<ShotProps> = (p) => wrap(p, <FamilyTreeInner gens={p.opt?.gens ?? 5} />);
const FamilyTreeInner: React.FC<{gens: number}> = ({gens}) => {
  const {t, pal, frame} = useShot();
  type N = {x: number; y: number; g: number; main: boolean; px?: number; py?: number};
  const nodes: N[] = [{x: 960, y: 920, g: 0, main: true}];
  const r = rng(7);
  let layer: N[] = [nodes[0]];
  for (let g = 1; g < gens; g++) {
    const next: N[] = [];
    layer.forEach((n, i) => {
      const kids = n.main ? 3 : r() > 0.5 ? 2 : 1;
      for (let k = 0; k < kids; k++) {
        const x = n.x + (k - (kids - 1) / 2) * (1000 / (g + 0.6)) + (r() - 0.5) * 50;
        const c: N = {x, y: 920 - g * (760 / gens), g, main: n.main && k === Math.floor(kids / 2), px: n.x, py: n.y};
        next.push(c);
        nodes.push(c);
      }
    });
    layer = next;
  }
  return (
    <>
      <Parchment tone={0.02} />
      <Plane depth={0.12}>
        <Paper pts={[[WX0, 960], [600, 940], [1300, 950], [WX1, 930], [WX1, 1300], [WX0, 1300]]} fill={mix(pal.mid, pal.clay, 0.3)} seed={8} amp={5} />
        <circle cx={960} cy={560} r={520} fill="url(#g-glow)" opacity={0.35} />
      </Plane>
      <Plane depth={0.3}>
        {nodes.map((n, i) => {
          const a = interpolate(t, [0.05 + (n.g / gens) * 0.8, 0.05 + (n.g / gens) * 0.8 + 0.12], [0, 1], clamp);
          const fade = n.main ? 1 : 1 - interpolate(t, [0.75, 1], [0, 0.55], clamp);
          return (
            <g key={i} opacity={a * fade}>
              {n.px !== undefined && <path d={`M${n.px} ${n.py}C${n.px} ${(n.py! + n.y) / 2} ${n.x} ${(n.py! + n.y) / 2} ${n.x} ${n.y}`} stroke={n.main ? GOLD : pal.near} strokeWidth={n.main ? 12 : 6} fill="none" strokeDasharray={1} pathLength={1} strokeDashoffset={1 - a} />}
              <circle cx={n.x} cy={n.y} r={n.main ? 42 : 30} fill={n.main ? GOLD : pal.near} stroke={pal.ink} strokeWidth={3} />
              {n.main && <path d={`M${n.x - 18} ${n.y - 30}L${n.x - 18} ${n.y - 54}L${n.x - 8} ${n.y - 42}L${n.x} ${n.y - 58}L${n.x + 8} ${n.y - 42}L${n.x + 18} ${n.y - 54}L${n.x + 18} ${n.y - 30}Z`} fill={GOLD} stroke={pal.ink} strokeWidth={2} />}
            </g>
          );
        })}
        <Glow x={960} y={920} r={200} op={0.6} />
      </Plane>
      <Plane depth={1}><Dust seed={2 + Math.floor(frame / 120)} /></Plane>
    </>
  );
};

export const Threads: React.FC<ShotProps> = (p) => wrap(p, <ThreadsInner />);
const ThreadsInner: React.FC = () => {
  const {t, frame, pal} = useShot();
  const groups: {x: number; y: number; kind: 'priest' | 'official' | 'soldier' | 'noble'; prop: 'staff' | 'scroll' | 'spear' | 'jar'}[] = [
    {x: 330, y: 760, kind: 'priest', prop: 'staff'}, {x: 760, y: 840, kind: 'official', prop: 'scroll'},
    {x: 1180, y: 840, kind: 'soldier', prop: 'spear'}, {x: 1590, y: 760, kind: 'noble', prop: 'jar'},
    {x: 560, y: 960, kind: 'official', prop: 'scroll'}, {x: 1400, y: 960, kind: 'soldier', prop: 'spear'},
  ];
  const tight = interpolate(t, [0.1, 0.8], [0, 1], clamp);
  return (
    <>
      <Compose items={[...skyFor('dusk', 2), ['skyline', {y: 700, seed: 4}], ['ground', {y: 900, seed: 3}]]} />
      <Plane depth={0.4}>
        <E.Throne x={960} y={420} s={0.62} kind="dragon" />
        {groups.map((g, i) => {
          const a = interpolate(t, [0.05 + i * 0.07, 0.15 + i * 0.07], [0, 1], clamp);
          const sag = (1 - tight) * 90;
          const pulse = 0.5 + 0.5 * Math.sin(frame / 16 + i);
          return (
            <path key={i} d={`M960 330C${960 + (g.x - 960) * 0.2} ${330 + sag} ${g.x} ${g.y - 360 + sag} ${g.x} ${g.y - 190}`} fill="none" stroke={GOLD} strokeWidth={4 + pulse * 3} opacity={a} strokeLinecap="round" strokeDasharray={1} pathLength={1} strokeDashoffset={1 - a} />
          );
        })}
      </Plane>
      <Plane depth={0.7}>
        {groups.map((g, i) => <Puppet key={i} x={g.x} y={g.y} s={0.95} kind={g.kind} anim={tight > 0.6 ? 'raise' : 'idle'} prop={g.prop} fill={pal.ink} seed={i + 2} />)}
      </Plane>
      <Plane depth={1}><Dust seed={5} /></Plane>
    </>
  );
};

export const Balance: React.FC<ShotProps> = (p) => wrap(p, <BalanceInner />);
const BalanceInner: React.FC = () => {
  const {t, pal} = useShot();
  const tilt = interpolate(t, [0.1, 0.5, 0.9], [0, -10, 4], {...clamp, easing: ease});
  const L = {x: 560, y: 0};
  return (
    <>
      <Compose items={[...skyFor('day', 4), ['ridge', {y: 780, amp: 30, seed: 3}], ['ground', {y: 930, seed: 2, tex: 'plain'}]]} />
      <Plane depth={0.5}>
        <Paper pts={[[930, 960], [990, 960], [975, 300], [945, 300]]} fill={pal.near} seed={3} />
        <g transform={`translate(960 300) rotate(${tilt})`}>
          <Paper pts={rect(-480, -12, 960, 24)} fill={pal.clay} seed={4} />
          {[-1, 1].map((sd) => {
            const x = sd * 480;
            const drop = sd * Math.sin((tilt * Math.PI) / 180) * 480;
            return (
              <g key={sd} transform={`translate(${x} 0) rotate(${-tilt})`}>
                <path d="M0 0L-120 220M0 0L120 220" stroke={pal.ink} strokeWidth={4} fill="none" />
                <Paper pts={[[-140, 220], [140, 220], [90, 260], [-90, 260]]} fill={sd < 0 ? pal.mid : GOLD} seed={sd + 9} />
                {sd < 0 ? <Puppet x={0} y={220} s={1.05} kind="worker" anim="raise" prop="staff" fill={pal.ink} /> : <g><Puppet x={-44} y={220} s={0.95} kind="noble" anim="idle" fill={pal.ink} /><Puppet x={44} y={220} s={0.62} kind="child" anim="idle" fill={pal.ink} /></g>}
                {drop > 9999 && null}
              </g>
            );
          })}
        </g>
        <circle cx={960} cy={300} r={20} fill={GOLD} stroke={pal.ink} strokeWidth={3} />
      </Plane>
      <Plane depth={1}><Dust seed={8} /></Plane>
      <L0 {...L} />
    </>
  );
};
const L0: React.FC<{x: number; y: number}> = () => null;

// ---------------------------------------------------------------- compound growth
export const CompoundGrowth: React.FC<ShotProps> = (p) => wrap(p, <CompoundInner />);
const CompoundInner: React.FC = () => {
  const {t, frame, pal} = useShot();
  const r = rng(21);
  const bl = Array.from({length: 9}, (_, i) => ({x: 300 + i * 190, w: 120 + r() * 70, h: 120 + r() * 160, big: i === 4}));
  const gen = Math.min(4, Math.floor(t * 5));
  return (
    <>
      <Compose items={[...skyFor('day', 5), ['mountains', {y: 700, seed: 6, peak: 200}], ['fields', {y: 700, seed: 2}]]} />
      <Plane depth={0.5}>
        <E.Wall y={900} h={110} col={pal.clay} gateX={960} seed={4} />
        {bl.map((b, i) => {
          const a = Easing.out(Easing.back(1.6))(interpolate(t, [0.05 + i * 0.09, 0.05 + i * 0.09 + 0.1], [0, 1], clamp));
          return (
            <g key={i} transform={`translate(${b.x} 880) scale(1 ${a}) translate(${-b.x} -880)`}>
              <E.House x={b.x} y={880} w={b.w} h={b.h * (b.big ? 1.9 : 1)} col={mix(pal.mid, pal.bone, 0.1 + (i % 3) * 0.06)} seed={i + 5} />
              {b.big && <E.Banner x={b.x + b.w / 2} y={880 - b.h * 1.9 - 12} h={130} w={70} seed={i} />}
            </g>
          );
        })}
        {Array.from({length: gen + 1}, (_, i) => <E.Banner key={i} x={170 + i * 70} y={760} h={160} w={50} seed={i} />)}
      </Plane>
      <Plane depth={0.8}>
        <E.Ground y={960} col={pal.near} seed={5} />
        {Array.from({length: gen + 2}, (_, i) => <Puppet key={i} x={500 + i * 150} y={1020} s={i === 0 ? 1 : 0.72 + (i % 2) * 0.2} kind={i === 0 ? 'leader' : i % 3 === 0 ? 'child' : 'noble'} anim="idle" fill={i === 0 ? RED : pal.ink} seed={i} />)}
      </Plane>
      <Plane depth={1}><Dust seed={3} /><Smoke x={600} y={760} h={300} /></Plane>
      {frame < 0 && null}
    </>
  );
};

// ---------------------------------------------------------------- image slot
export const ImageSlot: React.FC<ShotProps> = (p) => wrap(p, <SlotInner label={p.label ?? ''} />);
const SlotInner: React.FC<{label: string}> = ({label}) => {
  const {slotText, pal, frame} = useShot();
  return (
    <>
      <Parchment tone={0.05} />
      <Plane depth={0.3}>
        <Paper pts={rect(260, 130, 1400, 800)} fill={pal.near} seed={5} amp={5} />
        <Paper pts={rect(310, 180, 1300, 700)} fill={mix(pal.bone, pal.mid, 0.25)} seed={6} amp={4} />
        <path d={`M310 180L1610 880M1610 180L310 880`} stroke={pal.ink} strokeWidth={3} opacity={0.08} />
        {slotText && <text x={960} y={560} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={44} fill={pal.ink} opacity={0.65}>{'ADD IMAGE: ' + label}</text>}
      </Plane>
      <Plane depth={1}><Dust seed={4 + Math.floor(frame / 150)} /></Plane>
    </>
  );
};
