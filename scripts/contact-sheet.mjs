// Renders one still per shot (at 45% of its length) into out/stills and writes out/stills/index.html
// Usage: npm run sheet            (all shots)
//        npm run sheet -- --only T-01,T-02
import fs from 'node:fs';
import {renderStill, getCompositions} from '@remotion/renderer';
import {makeBundle, browserOpts, arg} from './common.mjs';

const serveUrl = await makeBundle();
const props = {labels: true, slotText: true};
const comps = (await getCompositions(serveUrl, {inputProps: props, ...browserOpts})).filter((c) => c.id !== 'Film');
const only = arg('only')?.split(',');
let list = only ? comps.filter((c) => only.includes(c.id)) : comps;
const from = arg('from');
if (from) { const i = list.findIndex((c) => c.id === from); if (i > -1) list = list.slice(i); }
const upto = arg('count');
if (upto) list = list.slice(0, Number(upto));
fs.mkdirSync('out/stills', {recursive: true});
for (const c of list) {
  const frame = Math.round(c.durationInFrames * 0.45);
  await renderStill({composition: c, serveUrl, output: `out/stills/${c.id}.jpg`, frame, inputProps: props, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5, ...browserOpts});
  console.log('still', c.id);
}
const html = '<body style="background:#222;color:#eee;font:14px sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
  list.map((c) => `<figure style="margin:0"><img src="${c.id}.jpg" style="width:100%"><figcaption>${c.id}</figcaption></figure>`).join('') + '</body>';
fs.writeFileSync('out/stills/index.html', html);
console.log('Open out/stills/index.html');
