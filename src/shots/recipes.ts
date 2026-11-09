import {Tod} from '../theme';
import {Item, skyFor} from '../engine/compose';

// Ready-made backgrounds. Combine with extra items (crowds, puppets, fx) in the timeline.
export const R = {
  sky: skyFor,
  river: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['mountains', {y: 730, seed: s, peak: 300}], ['ridge', {y: 770, amp: 36, seed: s + 1, col: 'mid'}], ['river', {y: 810, seed: s}], ['ground', {y: 935, seed: s + 5, tex: 'plain'}]],
  valley: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['mountains', {y: 700, seed: s, peak: 340}], ['ridge', {y: 760, amp: 40, seed: s + 2, col: 'mid'}], ['fields', {y: 800, seed: s}], ['palms', {xs: [180, 640, 1480, 1860], y: 860, s: 0.7, seed: s}]],
  city: (tod: Tod, s = 1): Item[] => [
    ...skyFor(tod, s), ['skyline', {y: 690, seed: s}], ['ziggurat', {x: 520 + (s % 5) * 190, y: 770, tiers: 4}],
    ['village', {y: 884, seed: s, hmin: 110, hmax: 230}], ['palms', {xs: [140, 760, 1560, 1960], y: 880, s: 0.8, seed: s}],
    ['ground', {y: 890, seed: s}], ['smoke', {xs: [420, 1210, 1740], y: 720}], ['birds', {y: 230, seed: s}],
  ],
  plain: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['ridge', {y: 720, amp: 40, seed: s, col: 'far'}], ['ridge', {y: 800, amp: 30, seed: s + 1, col: 'mid'}], ['ground', {y: 900, seed: s}]],
  dunes: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['ridge', {y: 700, amp: 70, seed: s, col: 'far'}], ['ridge', {y: 780, amp: 60, seed: s + 3, col: 'mid'}], ['ground', {y: 900, seed: s, col: 'clay', tex: 'cracks'}]],
  hall: (tod: Tod, s = 1): Item[] => [['hall', {throne: 'dragon'}], ['dust', {n: 30, seed: s}]],
  camp: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['mountains', {y: 740, seed: s, peak: 260}], ['tents', {y: 820, n: 6}], ['ground', {y: 900, seed: s}], ['fire', {xs: [700, 1280], y: 920, s: 0.8}]],
  egypt: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['pyramid', {x: 420, y: 740}], ['river', {y: 800, seed: s}], ['pylon', {x: 1260, y: 830, w: 560, h: 400}], ['ground', {y: 930, seed: s, tex: 'plain'}], ['palms', {xs: [820, 1740], y: 900, s: 0.7}]],
  china: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['mountains', {y: 740, seed: s, peak: 260, col: 'far'}], ['wall', {y: 820, h: 150, seed: s, col: 'lacq'}], ['chinaHall', {x: 960 + (s % 3) * 120 - 120, y: 800, tiers: 2}], ['ground', {y: 900, seed: s, col: 'near', tex: 'plain'}]],
  andes: (tod: Tod, s = 1): Item[] => [...skyFor(tod, s), ['mountains', {y: 700, seed: s + 4, peak: 480, snow: true}], ['mountains', {y: 790, seed: s + 7, peak: 300, col: 'mid'}], ['ground', {y: 900, seed: s, tex: 'stones'}]],
};
