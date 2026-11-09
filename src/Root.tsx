import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './theme';
import {Film, TOTAL, frames} from './Film';
import {TIMELINE} from './timeline';
import {ShotView} from './shots';

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{withAudio: false, labels: false, slotText: true}} />
    {TIMELINE.map((d) => (
      <Composition
        key={d.id}
        id={d.id}
        component={(props: {labels?: boolean; slotText?: boolean}) => <ShotView def={d} duration={frames(d)} labels={props.labels} slotText={props.slotText} />}
        durationInFrames={frames(d)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{labels: false, slotText: true}}
      />
    ))}
  </>
);
