import {Tod} from '../theme';
import {CamName} from '../engine/shot';

export type ShotProps = {
  duration: number;
  tod: Tod;
  cam: CamName;
  seed: number;
  focus?: [number, number];
  label?: string;
  labels?: boolean;
  slotText?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opt?: Record<string, any>;
};
