import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Tod} from '../theme';
import {CamName} from '../engine/shot';
import {Item} from '../engine/compose';
import {ShotProps} from './types';
import {Calendar, MapScene, DoorLocks, LocksOrders, RatchetScene, FamilyTree, Threads, Balance, CompoundGrowth, ImageSlot} from './special';
import {Composite, Handover, Triptych, PathsDiverge, OracleBones, KingList, Horus, Succession, ScrollScene, ComposeShot} from './special2';
import {Strip} from './Strip';

export type Def = {
  id: string; s: number; tod: Tod; cam: CamName; note: string;
  comp?: string; seed?: number; focus?: [number, number]; label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opt?: Record<string, any>; items?: Item[];
};

const SPECIAL: Record<string, React.FC<ShotProps>> = {
  calendar: Calendar, map: MapScene, door: DoorLocks, locks: LocksOrders, ratchet: RatchetScene, tree: FamilyTree, threads: Threads,
  balance: Balance, compound: CompoundGrowth, slot: ImageSlot, composite: Composite, handover: Handover, triptych: Triptych,
  paths: PathsDiverge, oracle: OracleBones, kinglist: KingList, horus: Horus, succession: Succession, scroll: ScrollScene,
};

export const ShotView: React.FC<{def: Def; duration: number; labels?: boolean; slotText?: boolean}> = ({def, duration, labels = false, slotText = true}) => {
  const base: ShotProps = {duration, tod: def.tod, cam: def.cam, seed: def.seed ?? 1, focus: def.focus, label: def.label, slotText, opt: def.opt};
  const Special = def.comp ? SPECIAL[def.comp] : undefined;
  return (
    <AbsoluteFill>
      {Special ? <Special {...base} /> : <ComposeShot {...base} items={def.items ?? []} />}
      {labels && def.label && def.comp !== 'slot' && <Strip text={def.label} duration={duration} />}
    </AbsoluteFill>
  );
};
