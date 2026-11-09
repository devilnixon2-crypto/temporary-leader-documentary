import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {H, PALS, Pal, Tod, W} from '../theme';

export type Cam = {x: number; y: number; z: number; r?: number};
export type CamSpec = {from: Cam; to: Cam; ease?: 'io' | 'out' | 'lin'; shake?: number};
export type CamName =
  | 'pushIn' | 'pushInSlow' | 'pullOut' | 'panL' | 'panR' | 'tiltUp' | 'tiltDown'
  | 'craneDown' | 'orbitL' | 'orbitR' | 'driftL' | 'driftR' | 'still';

const mk = (from: Cam, to: Cam, ease: 'io' | 'out' | 'lin' = 'io', shake = 0.6): CamSpec => ({from, to, ease, shake});

export const camPreset = (name: CamName, fx = 960, fy = 540): CamSpec => {
  switch (name) {
    case 'pushIn': return mk({x: fx, y: fy, z: 1}, {x: fx, y: fy, z: 1.3});
    case 'pushInSlow': return mk({x: fx, y: fy, z: 1}, {x: fx, y: fy, z: 1.13}, 'lin');
    case 'pullOut': return mk({x: fx, y: fy, z: 1.3}, {x: fx, y: fy, z: 1});
    case 'panL': return mk({x: fx + 340, y: fy, z: 1.1}, {x: fx - 340, y: fy, z: 1.1});
    case 'panR': return mk({x: fx - 340, y: fy, z: 1.1}, {x: fx + 340, y: fy, z: 1.1});
    case 'tiltUp': return mk({x: fx, y: fy + 190, z: 1.14}, {x: fx, y: fy - 170, z: 1.14});
    case 'tiltDown': return mk({x: fx, y: fy - 170, z: 1.14}, {x: fx, y: fy + 190, z: 1.14});
    case 'craneDown': return mk({x: fx, y: fy - 170, z: 1.28}, {x: fx, y: fy + 40, z: 1.0});
    case 'orbitL': return mk({x: fx + 240, y: fy, z: 1.1, r: -1.3}, {x: fx - 240, y: fy, z: 1.18, r: 1.3});
    case 'orbitR': return mk({x: fx - 240, y: fy, z: 1.1, r: 1.3}, {x: fx + 240, y: fy, z: 1.18, r: -1.3});
    case 'driftL': return mk({x: fx + 130, y: fy, z: 1.05}, {x: fx - 130, y: fy, z: 1.05}, 'lin');
    case 'driftR': return mk({x: fx - 130, y: fy, z: 1.05}, {x: fx + 130, y: fy, z: 1.05}, 'lin');
    default: return mk({x: fx, y: fy, z: 1}, {x: fx, y: fy, z: 1.05}, 'lin');
  }
};

type Ctx = {frame: number; dur: number; t: number; cam: Required<Cam>; pal: Pal; tod: Tod; seed: number; slotText: boolean};

const DEFAULT: Ctx = {frame: 0, dur: 300, t: 0, cam: {x: 960, y: 540, z: 1, r: 0}, pal: PALS.day, tod: 'day', seed: 1, slotText: true};
const C = createContext<Ctx>(DEFAULT);
export const useShot = () => useContext(C);

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const Shot: React.FC<{
  duration: number;
  tod?: Tod;
  seed?: number;
  cam?: CamSpec;
  slotText?: boolean;
  sky?: [string, string];
  children: React.ReactNode;
}> = ({duration, tod = 'day', seed = 1, cam = camPreset('pushInSlow'), slotText = true, sky, children}) => {
  const frame = useCurrentFrame();
  const pal = PALS[tod];
  const t = Math.min(1, frame / Math.max(1, duration - 1));
  const e = cam.ease === 'lin' ? (x: number) => x : cam.ease === 'out' ? Easing.out(Easing.cubic) : Easing.inOut(Easing.sin);
  const k = e(t);
  const sh = cam.shake ?? 0.6;
  const c: Required<Cam> = {
    x: lerp(cam.from.x, cam.to.x, k) + (Math.sin(frame / 37) * 4 + Math.sin(frame / 13) * 1.5) * sh,
    y: lerp(cam.from.y, cam.to.y, k) + (Math.cos(frame / 41) * 3 + Math.cos(frame / 17) * 1.2) * sh,
    z: lerp(cam.from.z, cam.to.z, k),
    r: lerp(cam.from.r ?? 0, cam.to.r ?? 0, k) + Math.sin(frame / 53) * 0.12 * sh,
  };
  const top = sky?.[0] ?? pal.skyTop;
  const bot = sky?.[1] ?? pal.skyBottom;
  const fade = interpolate(frame, [0, 4, duration - 4, duration], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <C.Provider value={{frame, dur: duration, t, cam: c, pal, tod, seed, slotText}}>
      <AbsoluteFill style={{background: pal.ink, overflow: 'hidden'}}>
        <AbsoluteFill style={{background: `linear-gradient(${top}, ${bot})`, opacity: fade}}>
          <svg width={0} height={0} style={{position: 'absolute'}}>
            <defs>
              <radialGradient id="g-glow">
                <stop offset="0" stopColor={pal.glow} stopOpacity={0.95} />
                <stop offset="0.35" stopColor={pal.glow} stopOpacity={0.35} />
                <stop offset="1" stopColor={pal.glow} stopOpacity={0} />
              </radialGradient>
              <linearGradient id="g-fog" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={pal.mist} stopOpacity={0} />
                <stop offset="0.55" stopColor={pal.mist} stopOpacity={1} />
                <stop offset="1" stopColor={pal.mist} stopOpacity={0} />
              </linearGradient>
              <pattern id="p-brick" width={48} height={24} patternUnits="userSpaceOnUse">
                <rect width={48} height={24} fill="none" />
                <path d="M0 0H48M0 12H48M0 0V12M24 12V24M48 0V12" stroke={pal.ink} strokeWidth={2} fill="none" />
              </pattern>
              <pattern id="p-stripe" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <rect width={5} height={14} fill={pal.ink} />
              </pattern>
              <pattern id="p-dots" width={18} height={18} patternUnits="userSpaceOnUse">
                <circle cx={4} cy={4} r={2.2} fill={pal.ink} />
              </pattern>
            </defs>
          </svg>
          <AbsoluteFill style={{transform: `rotate(${c.r}deg) scale(${1 + Math.abs(c.r) * 0.03})`}}>{children}</AbsoluteFill>
          <Overlay />
        </AbsoluteFill>
      </AbsoluteFill>
    </C.Provider>
  );
};

// Pre-baked paper textures: generated once per page load (cheap), instead of an expensive SVG noise filter every frame.
const tex: {grain?: string; fibre?: string} = {};
const makeTex = (kind: 'grain' | 'fibre') => {
  const size = 256;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(size, size);
  let a = kind === 'grain' ? 1234567 : 7654321;
  const rnd = () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
  const rows = Array.from({length: size}, () => rnd());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const k = (y * size + x) * 4;
      const v = kind === 'grain' ? 120 + rnd() * 135 : 150 + (rows[y] - 0.5) * 110 + Math.sin(x / 11 + rows[y] * 9) * 24 + (rnd() - 0.5) * 30;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.max(0, Math.min(255, v));
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL('image/png');
};

const Overlay: React.FC = () => {
  const {pal, frame} = useShot();
  if (!tex.grain) tex.grain = makeTex('grain');
  if (!tex.fibre) tex.fibre = makeTex('fibre');
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, ${pal.ink} 130%)`, opacity: pal.vig * 1.4, pointerEvents: 'none'}} />
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.12 + 0.04 * Math.sin(frame / 60), background: `radial-gradient(ellipse at ${20 + 12 * Math.sin(frame / 200)}% -10%, ${pal.glow}, rgba(0,0,0,0) 60%)`, pointerEvents: 'none'}} />
      <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: 0.2, pointerEvents: 'none', backgroundImage: `url(${tex.grain})`, backgroundSize: '256px 256px'}} />
      <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: 0.05, pointerEvents: 'none', backgroundImage: `url(${tex.fibre})`, backgroundSize: '512px 512px'}} />
    </>
  );
};

/** One parallax plane. depth 0 = far, 1 = near, >1 = foreground. */
export const Plane: React.FC<{depth: number; children: React.ReactNode; blur?: number; shadow?: boolean; opacity?: number}> = ({
  depth, children, blur = 0, shadow, opacity = 1,
}) => {
  const {cam} = useShot();
  const p = 0.1 + 1.0 * depth;
  const sd = 1 + (cam.z - 1) * (0.55 + 0.9 * depth);
  const tx = -(960 + (cam.x - 960) * p);
  const ty = -(540 + (cam.y - 540) * p);
  const useShadow = shadow ?? depth >= 0.3;
  const filters: string[] = [];
  if (useShadow) filters.push(`drop-shadow(0px ${Math.round(3 + depth * 11)}px ${Math.round(5 + depth * 11)}px rgba(30,20,12,${(0.14 + depth * 0.22).toFixed(2)}))`);
  if (blur) filters.push(`blur(${blur}px)`);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', opacity,
          transform: `translate(${W / 2}px, ${H / 2}px) scale(${sd}) translate(${tx}px, ${ty}px)`,
          filter: filters.length ? filters.join(' ') : undefined,
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
          {children}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
