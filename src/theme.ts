export const W = 1920;
export const H = 1080;
export const FPS = 30;

export type Tod = 'dawn' | 'day' | 'dusk' | 'night' | 'storm' | 'gold';

export type Pal = {
  skyTop: string; skyBottom: string; mist: string; far: string; mid: string; clay: string;
  near: string; ink: string; river: string; riverDeep: string; bone: string; lacq: string;
  glow: string; gold: string; red: string; vig: number; lamp: number;
};

export const RED = '#b5402c'; // the composite leader ONLY
export const GOLD = '#d9a441'; // the single accent

const base = {gold: GOLD, red: RED};

export const PALS: Record<Tod, Pal> = {
  day: {...base, skyTop: '#e9cfa1', skyBottom: '#f6e9cf', mist: '#e3d2b3', far: '#d2bb94', mid: '#b8966a', clay: '#8c6a47', near: '#4e3a29', ink: '#251a13', river: '#7a9a94', riverDeep: '#44655f', bone: '#f0e4c9', lacq: '#8a3a2c', glow: '#ffe3a0', vig: 0.28, lamp: 0},
  dawn: {...base, skyTop: '#e6a98e', skyBottom: '#f8dfbd', mist: '#ecc9b0', far: '#d3a58f', mid: '#b0836d', clay: '#8a5f4c', near: '#4a3430', ink: '#291a17', river: '#8e9a9a', riverDeep: '#566a70', bone: '#f5e3cc', lacq: '#85382d', glow: '#ffcf8a', vig: 0.3, lamp: 0.2},
  dusk: {...base, skyTop: '#7b5b78', skyBottom: '#f0b97f', mist: '#d49b7c', far: '#b07a72', mid: '#8c5f58', clay: '#6b4540', near: '#3a2630', ink: '#1c1219', river: '#8a7a86', riverDeep: '#4a4560', bone: '#f1d9b8', lacq: '#6e2e2c', glow: '#ffc470', vig: 0.38, lamp: 0.6},
  night: {...base, skyTop: '#16152b', skyBottom: '#3a3862', mist: '#3e3b66', far: '#34315a', mid: '#2a2848', clay: '#222040', near: '#171629', ink: '#0c0b18', river: '#3d4a6e', riverDeep: '#252d52', bone: '#c9c3d8', lacq: '#3a1c24', glow: '#ffcf70', vig: 0.5, lamp: 1},
  storm: {...base, skyTop: '#5f5c5a', skyBottom: '#a39b8e', mist: '#9b9284', far: '#86796a', mid: '#6c5c4c', clay: '#554637', near: '#352a21', ink: '#1a1410', river: '#5d6f6c', riverDeep: '#34443f', bone: '#d9ccb4', lacq: '#5e2c24', glow: '#f0d9a0', vig: 0.45, lamp: 0.3},
  gold: {...base, skyTop: '#f3c46b', skyBottom: '#fff0c9', mist: '#f4dfae', far: '#e0bd7e', mid: '#c99c5a', clay: '#a07a45', near: '#5b4128', ink: '#2a1c10', river: '#9fb09a', riverDeep: '#5f7d70', bone: '#fff3d6', lacq: '#8a3a2c', glow: '#fff0b0', vig: 0.25, lamp: 0.2},
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
