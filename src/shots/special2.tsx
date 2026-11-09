import React from 'react';
import {Easing, interpolate} from 'remotion';
import {GOLD, H, RED, mix} from '../theme';
import {Plane, Shot, camPreset, useShot} from '../engine/shot';
import {Paper, Pt, WX0, WX1, rect} from '../engine/paper';
import {Puppet} from '../engine/puppet';
import {Dust, Embers, Glow, Rays, Smoke} from '../engine/fx';
import * as E from '../engine/env';
import {Compose, Item, skyFor} from '../engine/compose';
import {rng} from '../engine/rng';
import {ShotProps} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SERIF = "Georgia, 'Times New Roman', serif";

const wrap = (p: ShotProps, children: React.ReactNode) => (
  <Shot duration={p.duration} tod={p.tod} seed={p.seed} cam={camPreset(p.cam, p.focus?.[0], p.focus?.[1])} slotText={p.slotText}>
    {children}
  </Shot>
);

const Backdrop: React.FC<{tone?: number}> = ({tone = 0.1}) => {
  const {pal} = useShot();
  return (
    <Plane depth={0.02} shadow={false}>
      <rect x={WX0} y={-400} width={WX1 - WX0} height={H + 800} fill={mix(pal.bone, pal.mid, tone)} />
    </Plane>
  );
};

// ---------------------------------------------------------------- composite
const Profile: React.FC<{kind: number; x: number; y: number; s: number; fill: string}> = ({kind, x, y, s, fill}) => {
  const {pal} = useShot();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <ellipse cx={0} cy={0} rx={100} ry={120} />
      <path d="M80 -10L128 20L80 40Z" />
      <rect x={-40} y={100} width={80} height={110} />
      {kind === 0 && <><path d="M-30 80Q0 190 60 120L50 70Z" fill={mix(fill, '#000', 0.25)} /><rect x={-104} y={-84} width={208} height={18} fill={pal.gold} /></>}
      {kind === 1 && <><path d="M-110 -100L110 -100L130 120L70 120L40 -40L-60 -40L-90 120L-130 120Z" fill={pal.gold} opacity={0.9} /><path d="M-110 -100L110 -100L100 -76L-100 -76Z" fill={mix(fill, '#000', 0.3)} /></>}
      {kind === 2 && <><circle cx={-24} cy={-20} r={30} fill={pal.bone} /><circle cx={-24} cy={-20} r={12} fill={pal.ink} /><path d="M-90 -120l-24 -70l50 40zM90 -120l24 -70l-50 40z" fill={mix(fill, '#000', 0.25)} /><rect x={-60} y={50} width={120} height={14} fill={pal.ink} opacity={0.5} /></>}
      {kind === 3 && <>{Array.from({length: 9}, (_, i) => <path key={i} transform={`rotate(${-80 + i * 20} 0 -90)`} d="M-8 -90L0 -250L8 -90Z" fill={i % 2 ? pal.gold : mix(fill, '#000', 0.3)} />)}<path d="M-100 -60h200v28h-200z" fill={pal.gold} /></>}
    </g>
  );
};
export const Composite: React.FC<ShotProps> = (p) => wrap(p, <CompositeInner />);
const CompositeInner: React.FC = () => {
  const {t, pal} = useShot();
  const xs = [380, 760, 1160, 1540];
  const merge = Easing.inOut(Easing.cubic)(interpolate(t, [0.5, 0.82], [0, 1], clamp));
  return (
    <>
      <Backdrop tone={0.14} />
      <Plane depth={0.4}>
        {xs.map((x, i) => {
          const a = interpolate(t, [0.05 + i * 0.1, 0.18 + i * 0.1], [0, 1], clamp);
          const px = x + (960 - x) * merge;
          return <g key={i} opacity={a * (1 - merge * 0.85)}><Profile kind={i} x={px} y={440} s={1.15 - merge * 0.4} fill={mix(pal.clay, pal.near, i * 0.2)} /></g>;
        })}
        <g opacity={interpolate(t, [0.7, 0.95], [0, 1], clamp)}>
          <Glow x={960} y={560} r={360} op={0.7} />
          <Puppet x={960} y={900} s={2.4} kind="leader" anim="idle" prop="staff" fill={RED} />
        </g>
      </Plane>
      <Plane depth={1}><Dust seed={7} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- handover
export const Handover: React.FC<ShotProps> = (p) => wrap(p, <HandoverInner />);
const HandoverInner: React.FC = () => {
  const {t, pal} = useShot();
  const gave = t > 0.45;
  return (
    <>
      <Compose items={[...skyFor('dusk', 5), ['skyline', {y: 760, seed: 3}], ['ground', {y: 960, seed: 2}]]} />
      <Plane depth={0.6}>
        <Glow x={960} y={560} r={420} op={0.4} />
        <Puppet x={560} y={1030} s={3.5} kind="elder" anim="point" prop={gave ? 'none' : 'staff'} fill={pal.near} />
        <Puppet x={1400} y={1030} s={3.6} kind="leader" flip anim={gave ? 'raise' : 'point'} prop={gave ? 'staff' : 'none'} fill={RED} />
      </Plane>
      <Plane depth={1}><Dust seed={4} /><Embers n={18} seed={3} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- triptych
export const Triptych: React.FC<ShotProps> = (p) => wrap(p, <TriptychInner />);
const TriptychInner: React.FC = () => {
  const {t, pal, frame} = useShot();
  const PW = 540;
  const panels = [
    {x: 120, a: 0.04, label: 'LENT'},
    {x: 700, a: 0.34, label: 'KEPT'},
    {x: 1280, a: 0.64, label: 'INHERITED'},
  ];
  return (
    <>
      <Backdrop tone={0.16} />
      <Plane depth={0.4}>
        <defs>{panels.map((q, i) => <clipPath key={i} id={`tp${i}`}><rect x={q.x} y={190} width={PW} height={700} /></clipPath>)}</defs>
        {panels.map((q, i) => {
          const s = Easing.out(Easing.back(1.7))(interpolate(t, [q.a, q.a + 0.1], [0, 1], clamp));
          return (
            <g key={i} opacity={Math.min(1, s)} transform={`translate(${q.x + PW / 2} 540) scale(${0.85 + 0.15 * s}) translate(${-(q.x + PW / 2)} -540)`}>
              <Paper pts={rect(q.x - 22, 168, PW + 44, 744)} fill={pal.near} seed={i + 3} />
              <g clipPath={`url(#tp${i})`}>
                <rect x={q.x} y={190} width={PW} height={700} fill={mix(pal.skyBottom, pal.mid, 0.25 + i * 0.05)} />
                <circle cx={q.x + 400} cy={320} r={120} fill="url(#g-glow)" />
                <Paper pts={rect(q.x, 780, PW, 120)} fill={pal.clay} seed={i + 9} />
                {i === 0 && <><Puppet x={q.x + 150} y={820} s={1.5} kind="elder" anim="point" prop="staff" fill={pal.near} /><Puppet x={q.x + 410} y={820} s={1.5} kind="leader" flip anim="point" fill={RED} /></>}
                {i === 1 && <><Puppet x={q.x + 270} y={820} s={1.8} kind="leader" anim="raise" prop="staff" fill={RED} /><E.Granary x0={q.x + 20} x1={q.x + 220} y={790} n={2} sc={0.5} col={pal.mid} /></>}
                {i === 2 && <><Puppet x={q.x + 170} y={820} s={1.55} kind="leader" anim="point" fill={RED} /><Puppet x={q.x + 400} y={820} s={1.0} kind="child" flip anim="raise" prop="staff" fill={pal.near} /></>}
              </g>
              <path d={`M${q.x + 30} ${150}h${PW - 60}`} stroke={GOLD} strokeWidth={8} opacity={0} />
            </g>
          );
        })}
        {[1, 2].map((k) => {
          const a = interpolate(t, [panels[k].a - 0.08, panels[k].a], [0, 1], clamp);
          const x = panels[k].x - 40;
          return <path key={k} d={`M${x - 36} 540h50M${x - 6} 510l30 30l-30 30`} stroke={GOLD} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={a} />;
        })}
      </Plane>
      <Plane depth={1}><Dust seed={frame > 9999 ? 1 : 6} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- paths diverge
export const PathsDiverge: React.FC<ShotProps> = (p) => wrap(p, <PathsInner />);
const PathsInner: React.FC = () => {
  const {t, pal, frame} = useShot();
  const ends = [{x: 1480, y: 230, k: 0}, {x: 1560, y: 540, k: 1}, {x: 1480, y: 850, k: 2}];
  return (
    <>
      <Backdrop tone={0.12} />
      <Plane depth={0.3}>
        <circle cx={340} cy={540} r={150} fill="url(#g-glow)" />
        <circle cx={340} cy={540} r={22} fill={GOLD} stroke={pal.ink} strokeWidth={4} />
        {ends.map((e, i) => {
          const g = interpolate(t, [0.1 + i * 0.12, 0.6 + i * 0.1], [0, 1], clamp);
          const d = `M340 540C${700 + i * 40} ${540 + (i - 1) * 40} ${1000} ${e.y + (i === 1 ? 0 : (i - 1) * -90)} ${e.x - 150} ${e.y}`;
          return (
            <g key={i}>
              <path d={d} stroke={GOLD} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
              <path d={d} stroke={pal.ink} strokeWidth={3} fill="none" strokeDasharray="10 14" strokeDashoffset={-frame} opacity={0.4 * g} />
              <g opacity={interpolate(t, [0.55 + i * 0.1, 0.72 + i * 0.1], [0, 1], clamp)} transform={`translate(${e.x} ${e.y})`}>
                <circle r={110} fill="url(#g-glow)" />
                {e.k === 0 && <g transform="translate(-60 40)"><Paper pts={rect(0, -40, 120, 40)} fill={pal.clay} seed={2} /><Paper pts={rect(20, -80, 80, 40)} fill={pal.mid} seed={3} /><Paper pts={rect(40, -120, 40, 40)} fill={pal.clay} seed={4} /></g>}
                {e.k === 1 && <Paper pts={[[-80, 40], [0, -80], [80, 40]]} fill={pal.far} seed={5} />}
                {e.k === 2 && <g transform="translate(0 30)"><E.ChinaRoof x={0} y={0} w={120} h={70} /></g>}
              </g>
            </g>
          );
        })}
      </Plane>
      <Plane depth={1}><Dust seed={8} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- oracle bones
export const OracleBones: React.FC<ShotProps> = (p) => wrap(p, <OracleInner />);
const OracleInner: React.FC = () => {
  const {t, pal, frame} = useShot();
  const crack = interpolate(t, [0.3, 0.75], [0, 1], clamp);
  const cr = ['M960 560L900 470L860 380', 'M960 560L1040 480L1090 400', 'M960 560L950 650L900 740', 'M960 560L1020 640L1080 720'];
  return (
    <>
      <Compose items={[...skyFor('night', 3), ['mountains', {y: 760, seed: 4, peak: 260}], ['ground', {y: 900, seed: 6}]]} />
      <Plane depth={0.3}>
        {[0, 1, 2, 3, 4].map((i) => {
          const rise = ((frame / 220 + i * 0.2) % 1);
          return <g key={i} opacity={0.22 * Math.sin(rise * Math.PI)} transform={`translate(${300 + i * 320} ${760 - rise * 140})`}><Puppet x={0} y={0} s={3.2} kind={i % 2 ? 'noble' : 'elder'} anim="idle" fill={pal.bone} /></g>;
        })}
      </Plane>
      <Plane depth={0.55}>
        <ellipse cx={960} cy={600} rx={200} ry={150} fill={mix(pal.bone, pal.mid, 0.3)} stroke={pal.ink} strokeWidth={5} />
        <path d="M960 460V740M800 600H1120M850 510L1070 690M1070 510L850 690" stroke={pal.ink} strokeWidth={3} opacity={0.3} />
        {cr.map((d, i) => <path key={i} d={d} stroke={pal.ink} strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, crack * 1.4 - i * 0.12))} />)}
        <g transform={`translate(${1200 - interpolate(t, [0.1, 0.3], [0, 160], clamp)} ${700 - interpolate(t, [0.1, 0.3], [0, 100], clamp)}) rotate(-35)`}><rect x={0} y={-6} width={260} height={12} fill={pal.ink} /><circle cx={0} cy={0} r={11} fill={GOLD} /></g>
        <E.Fire x={1300} y={850} s={0.9} />
      </Plane>
      <Plane depth={0.8}><Puppet x={620} y={940} s={1.6} kind="priest" anim="kneel" fill={pal.ink} /></Plane>
      <Plane depth={1}><Embers n={34} seed={6} /><Dust seed={5} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- king list tablet
const Wedges: React.FC<{x: number; y: number; cols: number; rows: number; seed: number; op?: number}> = ({x, y, cols, rows, seed, op = 1}) => {
  const {pal} = useShot();
  const r = rng(seed);
  return (
    <g fill={pal.ink} opacity={0.55 * op}>
      {Array.from({length: cols * rows}, (_, i) => {
        const cx = x + (i % cols) * 30 + (r() - 0.5) * 6;
        const cy = y + Math.floor(i / cols) * 34;
        const k = Math.floor(r() * 3);
        return k === 0 ? <path key={i} d={`M${cx} ${cy}l22 7l-22 7z`} /> : k === 1 ? <path key={i} d={`M${cx} ${cy}l8 -2l14 2l-14 12z`} /> : <path key={i} d={`M${cx} ${cy + 7}l22 -7l0 14z`} />;
      })}
    </g>
  );
};
export const KingList: React.FC<ShotProps> = (p) => wrap(p, <KingListInner />);
const KingListInner: React.FC = () => {
  const {t, pal} = useShot();
  const drop = Easing.out(Easing.cubic)(interpolate(t, [0.1, 0.62], [0, 1], clamp));
  const lit = interpolate(t, [0.6, 0.85], [0, 1], clamp);
  return (
    <>
      <Compose items={[...skyFor('dawn', 6), ['clouds', {y: 160, n: 8, seed: 3, s: 1.6, op2: 0.9}], ['mountains', {y: 840, seed: 8, peak: 200}]]} />
      <Plane depth={0.15}><Rays x={960} y={-40} n={9} op={0.25 * (0.4 + lit)} len={1500} /></Plane>
      <Plane depth={0.5}>
        <Paper pts={[[420, 880], [1500, 880], [1480, 300], [440, 300]]} fill={mix(pal.clay, pal.bone, 0.2)} seed={3} amp={4} />
        {[0, 1, 2, 3, 4, 5].map((c) => <Wedges key={c} x={500 + c * 160} y={350} cols={3} rows={14} seed={c + 3} />)}
        {[0, 1, 2, 3, 4].map((c) => <rect key={c} x={578 + c * 160 + 74} y={340} width={4} height={510} fill={pal.ink} opacity={0.3} />)}
        <Glow x={960} y={560} r={520} op={0.5 * lit} />
        <g transform={`translate(960 ${-120 + drop * 130})`}>
          <path d="M-70 40L-70 -30L-35 0L0 -50L35 0L70 -30L70 40Z" fill={GOLD} stroke={pal.ink} strokeWidth={4} />
          <Glow x={0} y={0} r={190} op={0.9} />
        </g>
      </Plane>
      <Plane depth={1}><Dust seed={9} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- horus
const Falcon: React.FC<{x: number; y: number; s: number; flap: number; fill: string}> = ({x, y, s, flap, fill}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <path d={`M-30 0C-100 ${-90 - flap * 70} -230 ${-70 - flap * 90} -300 ${-20 - flap * 120}C-210 ${-10 - flap * 40} -120 20 -40 40Z`} />
    <path d={`M30 0C100 ${-90 - flap * 70} 230 ${-70 - flap * 90} 300 ${-20 - flap * 120}C210 ${-10 - flap * 40} 120 20 40 40Z`} />
    <ellipse cx={0} cy={40} rx={44} ry={78} />
    <circle cx={0} cy={-50} r={28} />
    <path d="M-6 -56L-34 -40L-8 -34Z" fill={mix(fill, '#fff', 0.35)} />
    <path d="M-26 110L26 110L14 200L-14 200Z" />
  </g>
);
export const Horus: React.FC<ShotProps> = (p) => wrap(p, <HorusInner />);
const HorusInner: React.FC = () => {
  const {t, frame, pal} = useShot();
  const fx = interpolate(t, [0, 1], [-200, 2100]);
  const fy = 300 + Math.sin(t * 6) * 40;
  return (
    <>
      <Compose items={[...skyFor('gold', 2), ['pyramid', {x: 300, y: 760}], ['pyramid', {x: 640, y: 760, w: 420, h: 250}], ['river', {y: 830, glint: 1400}], ['pylon', {x: 1200, y: 840, w: 560, h: 420}], ['ground', {y: 940, seed: 4, tex: 'plain'}]]} />
      <Plane depth={0.3}>
        <circle cx={1200} cy={250} r={70} fill={GOLD} /><circle cx={1200} cy={250} r={150} fill="url(#g-glow)" />
        <Falcon x={fx} y={fy} s={0.9} flap={Math.sin(frame / 4) * 0.5 + 0.5} fill={pal.ink} />
      </Plane>
      <Plane depth={0.6}>
        <Puppet x={1200} y={960} s={1.25} kind="noble" anim="raise" prop="none" fill={pal.ink} />
        <Crowd2 />
      </Plane>
      <Plane depth={1}><Dust seed={4} /></Plane>
    </>
  );
};
const Crowd2: React.FC = () => {
  const {pal} = useShot();
  return <>{[900, 1000, 1400, 1500].map((x, i) => <Puppet key={i} x={x} y={985} s={0.95} kind={i % 2 ? 'priest' : 'official'} anim="bow" fill={pal.near} seed={i} />)}</>;
};

// ---------------------------------------------------------------- succession panels (Yao, Shun, Yu, Qi)
export const Succession: React.FC<ShotProps> = (p) => wrap(p, <SuccessionInner />);
const SuccessionInner: React.FC = () => {
  const {t, pal, frame} = useShot();
  const names: {k: 'elder' | 'worker' | 'noble' | 'child'; hat?: boolean}[] = [{k: 'elder'}, {k: 'worker'}, {k: 'noble'}, {k: 'child'}];
  const px = (i: number) => 330 + i * 420;
  const staffX = interpolate(t, [0.1, 0.9], [px(0), px(3)], clamp);
  return (
    <>
      <Compose items={[...skyFor('dawn', 4), ['mountains', {y: 790, seed: 11, peak: 280, snow: false}], ['ground', {y: 900, seed: 7, tex: 'plain'}]]} />
      <Plane depth={0.5}>
        {names.map((n, i) => {
          const a = Easing.out(Easing.back(1.5))(interpolate(t, [i * 0.18, i * 0.18 + 0.12], [0, 1], clamp));
          return (
            <g key={i} transform={`translate(${px(i)} 900) scale(${a}) translate(${-px(i)} -900)`}>
              <Paper pts={rect(px(i) - 150, 640, 300, 270)} fill={mix(pal.mid, pal.bone, 0.2)} seed={i + 2} />
              <Puppet x={px(i)} y={900} s={1.5} kind={n.k} anim={i === 3 ? 'idle' : 'point'} prop={i === 3 ? 'none' : 'none'} fill={pal.near} seed={i} />
              {i < 2 && <path d={`M${px(i) - 20} 560l12 -34l12 34l-34 -21h44z`} fill={GOLD} transform={`translate(20 -40)`} />}
              {i === 2 && <g transform={`translate(${px(i) + 90} 700)`}><circle r={26} fill={GOLD} /><path d="M0 26V80M0 52L-30 90M0 52L30 90" stroke={GOLD} strokeWidth={8} fill="none" /></g>}
            </g>
          );
        })}
        <g transform={`translate(${staffX} ${680 + Math.sin(frame / 8) * 4})`}><rect x={-4} y={-150} width={8} height={300} fill={pal.ink} /><circle cx={0} cy={-156} r={11} fill={GOLD} /><Glow x={0} y={-150} r={110} op={0.7} /></g>
      </Plane>
      <Plane depth={1}><Dust seed={3} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- scroll (edict)
export const ScrollScene: React.FC<ShotProps> = (p) => wrap(p, <ScrollInner />);
const ScrollInner: React.FC = () => {
  const {t, pal, frame} = useShot();
  const open = Easing.inOut(Easing.cubic)(interpolate(t, [0.08, 0.55], [0, 1], clamp));
  const w = 160 + open * 1100;
  const stamp = interpolate(t, [0.62, 0.7, 0.78], [0, 1, 0.9], clamp);
  const r = rng(9);
  return (
    <>
      <Compose items={[['ground', {y: 0, seed: 3, col: 'near', tex: 'plain'}]]} />
      <Plane depth={0.4}>
        <Glow x={960} y={540} r={620} op={0.3} />
        <Paper pts={rect(960 - w / 2, 250, w, 580)} fill={mix(pal.bone, pal.gold, 0.12)} seed={4} amp={3} />
        <clipPath id="sc"><rect x={960 - w / 2 + 20} y={250} width={w - 40} height={580} /></clipPath>
        <g clipPath="url(#sc)">
          {Array.from({length: 17}, (_, i) => <rect key={i} x={410 + i * 64} y={300 + (i % 3) * 8} width={20} height={400 - (i % 4) * 40} fill={pal.ink} opacity={0.22 + r() * 0.1} />)}
        </g>
        <rect x={960 - w / 2 - 20} y={226} width={40} height={628} rx={18} fill={pal.near} /><rect x={960 + w / 2 - 20} y={226} width={40} height={628} rx={18} fill={pal.near} />
        <g transform={`translate(1380 ${760 - 90 * stamp}) scale(${1 + 0.1 * (1 - stamp)})`} opacity={stamp}><rect x={-60} y={-60} width={120} height={120} fill={pal.lacq} /><rect x={-40} y={-40} width={80} height={80} fill="none" stroke={pal.bone} strokeWidth={6} /></g>
      </Plane>
      <Plane depth={1}><Dust seed={5 + Math.floor(frame / 200)} /></Plane>
    </>
  );
};

// ---------------------------------------------------------------- generic composed shot
export const ComposeShot: React.FC<ShotProps & {items: Item[]}> = (p) => wrap(p, <Compose items={p.items} />);
export const _unused = {Pt: null as unknown as Pt, Rays, Smoke, Dust, Embers, WX1};
