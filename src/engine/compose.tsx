import React from 'react';
import {H, W, mix, Tod} from '../theme';
import {Plane, useShot} from './shot';
import {Paper, Pt, Ridge, WX0, WX1, rect} from './paper';
import {Crowd, CrowdProps, Puppet, PuppetProps} from './puppet';
import {Birds, Dust, Embers, Fireflies, Glow, Rain, Rays, Smoke} from './fx';
import * as E from './env';

export type ItemType =
  | 'sun' | 'moon' | 'stars' | 'clouds' | 'birds' | 'rays' | 'mountains' | 'skyline' | 'ridge' | 'river' | 'canal' | 'fields'
  | 'palms' | 'reeds' | 'village' | 'ziggurat' | 'wall' | 'chinaHall' | 'pylon' | 'pyramid' | 'granary' | 'tents' | 'throne'
  | 'banners' | 'lanterns' | 'fire' | 'ground' | 'rocks' | 'hall' | 'crowd' | 'puppet' | 'dust' | 'embers' | 'rain' | 'fireflies'
  | 'smoke' | 'glow' | 'fg' | 'fog' | 'shape' | 'columns';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item = [ItemType, Record<string, any>?];

const tone = (d: number, pal: ReturnType<typeof useShot>['pal']) =>
  d < 0.3 ? mix(pal.far, pal.clay, 0.5) : d < 0.5 ? pal.clay : d < 0.72 ? pal.near : pal.ink;

const Hall: React.FC<{vy?: number; throne?: 'dragon' | 'seat' | 'lion'; lanterns?: boolean}> = ({vy = 560, throne = 'dragon', lanterns = true}) => {
  const {pal} = useShot();
  const dark = mix(pal.lacq, pal.ink, 0.38);
  const pil = [{d: 0.2, off: 330, w: 46, b: 650}, {d: 0.34, off: 480, w: 66, b: 730}, {d: 0.52, off: 680, w: 92, b: 850}, {d: 0.76, off: 930, w: 128, b: 1040}, {d: 1.05, off: 1290, w: 176, b: 1320}];
  return (
    <>
      <Plane depth={0.06}>
        <Paper pts={[[WX0, -400], [WX1, -400], [1530, vy - 240], [390, vy - 240]]} fill={mix(pal.ink, pal.lacq, 0.25)} seed={2} />
        {Array.from({length: 9}, (_, i) => <line key={i} x1={WX0 + i * 380} y1={-400} x2={390 + i * 140} y2={vy - 240} stroke={pal.gold} strokeWidth={5} opacity={0.35} />)}
        <Paper pts={[[WX0, -400], [390, vy - 240], [390, vy + 90], [WX0, H + 400]]} fill={dark} seed={3} />
        <Paper pts={[[WX1, -400], [1530, vy - 240], [1530, vy + 90], [WX1, H + 400]]} fill={dark} seed={4} />
        <Paper pts={rect(390, vy - 240, 1140, 330)} fill={pal.lacq} seed={5} />
        <rect x={390} y={vy - 240} width={1140} height={22} fill={pal.gold} opacity={0.8} />
        {Array.from({length: 6}, (_, i) => <g key={i}><rect x={470 + i * 190} y={vy - 170} width={100} height={170} fill={mix(pal.lacq, pal.ink, 0.45)} /><path d={`M${470 + i * 190} ${vy - 170}h100M${470 + i * 190} ${vy - 130}h100M${470 + i * 190} ${vy - 90}h100M${470 + i * 190} ${vy - 50}h100M${520 + i * 190} ${vy - 170}v170`} stroke={pal.gold} strokeWidth={2.5} opacity={0.5} /></g>)}
      </Plane>
      <Plane depth={0.2}>
        {[0, 1, 2].map((i) => <Paper key={i} pts={rect(720 + i * 36, vy + 40 - i * 26, 480 - i * 72, 26)} fill={mix(pal.bone, pal.clay, 0.2 + i * 0.1)} seed={10 + i} />)}
        <E.Throne x={960} y={vy + 40 - 78} s={0.92} kind={throne} />
        {[0, 1].map((i) => <rect key={i} x={560 + i * 800} y={vy - 120} width={22} height={170} fill={pal.gold} opacity={0.7} />)}
        <Smoke x={620} y={vy + 40} h={220} seed={1} w={0.8} /><Smoke x={1300} y={vy + 40} h={220} seed={2} w={0.8} />
      </Plane>
      <Plane depth={0.3}><E.FloorLines vy={vy + 40} col={mix(pal.mid, pal.clay, 0.3)} /></Plane>
      {pil.map((p, i) => (
        <React.Fragment key={i}>
          <Plane depth={p.d}><E.Pillar x={960 - p.off} w={p.w} top={vy - (p.b - vy) * 1.55} bottom={p.b} /></Plane>
          <Plane depth={p.d}><E.Pillar x={960 + p.off} w={p.w} top={vy - (p.b - vy) * 1.55} bottom={p.b} /></Plane>
        </React.Fragment>
      ))}
      {lanterns && <Plane depth={0.62}>{[620, 1300, 240, 1680].map((x, i) => <E.Lantern key={i} x={x} y={190 + (i % 2) * 70} s={0.8 + (i > 1 ? 0.25 : 0)} />)}</Plane>}
    </>
  );
};

const FG: React.FC<{kind: string; seed?: number}> = ({kind, seed = 1}) => {
  const {pal} = useShot();
  if (kind === 'reeds') return <g><E.Reeds x0={-200} x1={420} y={H + 20} n={16} seed={seed} h={340} col={pal.ink} /><E.Reeds x0={1560} x1={2120} y={H + 20} n={14} seed={seed + 3} h={300} col={pal.ink} /></g>;
  if (kind === 'rocks') return <g><E.Rocks x0={-250} x1={560} y={H + 10} n={3} seed={seed} s={1.5} col={pal.ink} /><E.Rocks x0={1400} x1={2200} y={H + 10} n={3} seed={seed + 4} s={1.4} col={pal.ink} /></g>;
  if (kind === 'frame') return <g><Paper pts={rect(-260, -200, 400, H + 500)} fill={pal.ink} seed={seed} /><Paper pts={rect(1790, -200, 400, H + 500)} fill={pal.ink} seed={seed + 1} /></g>;
  if (kind === 'arch') return <g><Paper pts={rect(-260, -200, 340, H + 500)} fill={pal.ink} seed={seed} /><Paper pts={rect(1840, -200, 340, H + 500)} fill={pal.ink} seed={seed + 1} /><Paper pts={[[-260, -200], [2180, -200], [2180, 120], [1500, 40], [420, 40], [-260, 120]]} fill={pal.ink} seed={seed + 2} /></g>;
  if (kind === 'leaves') return <g><E.Palm x={-60} y={380} h={60} s={1.5} seed={seed} col={pal.ink} /><E.Palm x={1990} y={340} h={40} s={1.6} seed={seed + 2} col={pal.ink} /></g>;
  return null;
};

export const Compose: React.FC<{items: Item[]}> = ({items}) => {
  const {pal, tod} = useShot();
  const col = (k?: string, fb: Parameters<ReturnType<typeof E.useCol>>[1] = 'mid') => {
    if (!k) return pal[fb];
    if (k.startsWith('#')) return k;
    return ((pal as unknown) as Record<string, string>)[k] ?? pal[fb];
  };
  return (
    <>
      {items.map(([t, p = {}], i) => {
        const d: number | undefined = p.d;
        const P = (def: number, node: React.ReactNode) => <Plane key={i} depth={d ?? def} blur={p.blur} opacity={p.op}>{node}</Plane>;
        switch (t) {
          case 'sun': return P(0, <E.Sun x={p.x ?? 1300} y={p.y ?? 260} r={p.r ?? 90} rays={p.rays ?? true} />);
          case 'moon': return P(0, <E.Moon x={p.x ?? 1300} y={p.y ?? 240} r={p.r ?? 70} />);
          case 'stars': return P(0, <E.Stars n={p.n} seed={p.seed} />);
          case 'clouds': return P(p.d ?? 0.03, <E.Clouds y={p.y ?? 200} n={p.n ?? 6} seed={p.seed ?? i} col={col(p.col, 'mist')} speed={p.speed ?? 0.3} op={p.op2 ?? 0.75} s={p.s ?? 1} />);
          case 'birds': return P(0.1, <Birds n={p.n} y={p.y} seed={p.seed ?? i} dir={p.dir} s={p.s} col={p.col && col(p.col)} />);
          case 'rays': return P(0.1, <Rays x={p.x ?? 1300} y={p.y ?? 200} n={p.n} op={p.o ?? 0.14} len={p.len} />);
          case 'mountains': return P(0.06, <E.Mountains y={p.y} seed={p.seed ?? i} col={col(p.col, 'far')} peak={p.peak} snow={p.snow} />);
          case 'skyline': return P(0.12, <E.Skyline y={p.y} seed={p.seed ?? i} col={col(p.col, 'far')} hmax={p.hmax} />);
          case 'ridge': return P(0.18, <Ridge y={p.y ?? 700} amp={p.amp ?? 40} seed={p.seed ?? i} fill={col(p.col, 'far')} />);
          case 'river': return P(0.25, <E.River y={p.y} seed={p.seed} speed={p.speed} glint={p.glint} />);
          case 'canal': return P(0.3, <E.Canal vx={p.vx} vy={p.vy} w={p.w} />);
          case 'fields': return P(0.3, <E.Fields y={p.y} seed={p.seed ?? i} col={col(p.col, 'mid')} />);
          case 'palms': return P(0.5, <g>{(p.xs as number[]).map((x, k) => <E.Palm key={k} x={x} y={p.y ?? 800} h={p.h ?? 330} s={(p.s ?? 1) * (1 + ((k * 37) % 5) * 0.08)} seed={k + (p.seed ?? 1)} col={col(p.col, 'near')} />)}</g>);
          case 'reeds': return P(0.9, <E.Reeds x0={p.x0 ?? -100} x1={p.x1 ?? 500} y={p.y ?? H + 10} n={p.n} seed={p.seed ?? i} h={p.h} col={col(p.col, 'ink')} />);
          case 'village': return P(0.4, <E.Village x0={p.x0} x1={p.x1} y={p.y} seed={p.seed ?? i} col={col(p.col, 'mid')} sc={p.sc} hmin={p.hmin} hmax={p.hmax} />);
          case 'ziggurat': return P(0.22, <E.Ziggurat x={p.x ?? 960} y={p.y ?? 700} w={p.w} tiers={p.tiers} h={p.h} col={col(p.col, 'clay')} seed={p.seed ?? i} />);
          case 'wall': return P(0.34, <E.Wall y={p.y} seed={p.seed ?? i} col={col(p.col, 'clay')} gateX={p.gateX} h={p.h} />);
          case 'chinaHall': return P(0.3, <E.ChinaHall x={p.x ?? 960} y={p.y ?? 760} w={p.w} tiers={p.tiers} />);
          case 'pylon': return P(0.3, <E.Pylon x={p.x ?? 960} y={p.y ?? 780} w={p.w} h={p.h} col={col(p.col, 'far')} seed={p.seed ?? i} />);
          case 'pyramid': return P(0.1, <E.Pyramid x={p.x ?? 1400} y={p.y ?? 720} w={p.w} h={p.h} col={col(p.col, 'far')} />);
          case 'granary': return P(0.45, <E.Granary x0={p.x0} x1={p.x1} y={p.y} n={p.n} col={col(p.col, 'mid')} seed={p.seed ?? i} sc={p.sc} />);
          case 'tents': return P(0.4, <E.Tents x0={p.x0} x1={p.x1} y={p.y} n={p.n} seed={p.seed ?? i} col={col(p.col, 'far')} sc={p.sc} />);
          case 'throne': return P(0.4, <E.Throne x={p.x ?? 960} y={p.y ?? 780} s={p.s} kind={p.kind} />);
          case 'banners': return P(0.55, <g>{(p.xs as number[]).map((x, k) => <E.Banner key={k} x={x} y={p.y ?? 800} h={p.h} w={p.w} seed={k} col={p.col && col(p.col)} />)}</g>);
          case 'lanterns': return P(0.8, <g>{(p.xs as number[]).map((x, k) => <E.Lantern key={k} x={x} y={p.y ?? 200} s={p.s} />)}</g>);
          case 'fire': return P(0.6, <g>{(p.xs as number[]).map((x, k) => <E.Fire key={k} x={x} y={p.y ?? 860} s={p.s ?? 1} />)}</g>);
          case 'ground': return P(0.55, <E.Ground y={p.y} seed={p.seed ?? i} col={col(p.col, 'near')} tex={p.tex} />);
          case 'rocks': return P(0.9, <E.Rocks x0={p.x0 ?? 0} x1={p.x1 ?? 1920} y={p.y ?? 900} n={p.n} seed={p.seed ?? i} col={col(p.col, 'ink')} s={p.s} />);
          case 'hall': return <Hall key={i} vy={p.vy} throne={p.throne} lanterns={p.lanterns} />;
          case 'crowd': { const dd = d ?? 0.6; return P(0.6, <Crowd {...(p as CrowdProps)} fill={p.fill ? col(p.fill) : tone(dd, pal)} />); }
          case 'puppet': { const dd = d ?? 0.6; return P(0.6, <Puppet {...(p as PuppetProps)} fill={p.fill ? col(p.fill) : tone(dd, pal)} />); }
          case 'dust': return P(1, <Dust n={p.n} seed={p.seed} op={p.o} />);
          case 'embers': return P(0.9, <Embers n={p.n} seed={p.seed} x0={p.x0} x1={p.x1} y={p.y} />);
          case 'rain': return P(1.1, <Rain n={p.n} seed={p.seed} op={p.o} />);
          case 'fireflies': return P(0.8, <Fireflies n={p.n} seed={p.seed} y0={p.y0} y1={p.y1} />);
          case 'smoke': return P(0.4, <g>{(p.xs as number[]).map((x, k) => <Smoke key={k} x={x} y={p.y ?? 700} h={p.h} seed={k + 1} w={p.w} />)}</g>);
          case 'glow': return P(0.5, <Glow x={p.x ?? 960} y={p.y ?? 540} r={p.r} op={p.o} />);
          case 'fg': return P(1.12, <FG kind={p.kind ?? 'reeds'} seed={p.seed ?? i} />);
          case 'fog': return P(0.45, <rect x={WX0} y={p.y ?? 560} width={WX1 - WX0} height={p.h ?? 300} fill="url(#g-fog)" opacity={p.o ?? 0.6} />);
          case 'columns': return P(0.35, <E.Columns x0={p.x0} x1={p.x1} y={p.y} n={p.n} h={p.h} col={p.col && col(p.col)} />);
          case 'shape': return P(0.5, <Paper pts={p.pts as Pt[]} fill={col(p.col, 'mid')} seed={p.seed ?? i} />);
          default: return null;
        }
      })}
      {tod === 'storm' && null}
    </>
  );
};

export const skyFor = (tod: Tod, seed = 1): Item[] => {
  switch (tod) {
    case 'night': return [['stars', {seed}], ['moon', {x: 1380 - (seed % 4) * 120}], ['clouds', {y: 220, n: 3, op2: 0.25, seed}]];
    case 'dawn': return [['sun', {x: 520 + (seed % 5) * 180, y: 560, r: 100}], ['clouds', {y: 260, n: 5, seed}]];
    case 'dusk': return [['sun', {x: 1500 - (seed % 4) * 200, y: 520, r: 120}], ['clouds', {y: 240, n: 6, seed}]];
    case 'storm': return [['clouds', {y: 140, n: 10, seed, op2: 0.9, s: 1.5, col: 'far'}], ['clouds', {y: 300, n: 8, seed: seed + 3, op2: 0.7, s: 1.2}]];
    case 'gold': return [['sun', {x: 960, y: 380, r: 130}], ['rays', {x: 960, y: 380, n: 9}], ['clouds', {y: 220, n: 4, seed}]];
    default: return [['sun', {x: 400 + (seed % 6) * 220, y: 230 + (seed % 3) * 40}], ['clouds', {y: 190, n: 6, seed}]];
  }
};
