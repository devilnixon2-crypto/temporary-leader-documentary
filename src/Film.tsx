import React from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame, interpolate, AbsoluteFill} from 'remotion';
import {FPS, H, W} from './theme';
import {Def, ShotView} from './shots';
import {TIMELINE} from './timeline';
import {rng} from './engine/rng';

const OV = 9;
export const frames = (d: Def) => Math.round(d.s * FPS);
export const TOTAL = TIMELINE.reduce((a, d) => a + frames(d), 0);

const edge = (n: number, count: number, len: number, seed: number) => {
  const r = rng(seed);
  return Array.from({length: count + 1}, (_, i) => (i / count) * len + (r() - 0.5) * 36);
};

const Wipe: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, OV], [0, 1], {extrapolateRight: 'clamp'});
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const kind = i % 4;
  let clip: string;
  if (kind === 3) clip = `circle(${p * 1300}px at ${W / 2}px ${H / 2}px)`;
  else {
    const horiz = kind !== 2;
    const pos = p * ((horiz ? W : H) + 200) - 100;
    const e = edge(i, 18, horiz ? H : W, i + 3);
    const pts: string[] = horiz ? ['0px 0px'] : ['0px 0px'];
    if (horiz) {
      e.forEach((v, k) => pts.push(`${pos + (k % 2 ? 26 : -26) + (v % 17)}px ${Math.min(H, (k / 18) * H)}px`));
      pts.push(`0px ${H}px`);
    } else {
      e.forEach((v, k) => pts.push(`${Math.min(W, (k / 18) * W)}px ${pos + (k % 2 ? 26 : -26) + (v % 17)}px`));
      pts.push(`${W}px 0px`);
    }
    clip = `polygon(${pts.join(',')})`;
  }
  return <AbsoluteFill style={{clipPath: clip}}>{children}</AbsoluteFill>;
};

export const Film: React.FC<{withAudio?: boolean; labels?: boolean; slotText?: boolean}> = ({withAudio = false, labels = false, slotText = true}) => {
  let cum = 0;
  return (
    <AbsoluteFill style={{background: '#251a13'}}>
      {withAudio && <Audio src={staticFile('narration.mp3')} />}
      {TIMELINE.map((d, i) => {
        const dur = frames(d);
        const start = cum;
        cum += dur;
        const from = i === 0 ? start : start - OV;
        const len = i === 0 ? dur : dur + OV;
        return (
          <Sequence key={d.id} from={from} durationInFrames={len}>
            <Wipe i={i}>
              <ShotView def={d} duration={len} labels={labels} slotText={slotText} />
            </Wipe>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
