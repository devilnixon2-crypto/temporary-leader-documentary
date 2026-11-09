// Renders every shot as its own 1080p clip into out/clips (ideal for editing in Premiere/DaVinci/CapCut).
//   npm run render:clips                       all shots (resumes: skips clips that already exist)
//   npm run render:clips -- --only C3-11,C3-12 just those shots
//   npm run render:clips -- --from C4-01       from a shot onward
//   npm run render:clips -- --prefix C3-       one whole chapter
//   npm run render:clips -- --labels           include the optional paper labels
//   npm run render:clips -- --force            re-render even if the file exists
//   npm run render:clips -- --no-slot-text     hide the 'ADD IMAGE' text on placeholder shots
import fs from 'node:fs';
import {renderMedia, getCompositions} from '@remotion/renderer';
import {makeBundle, browserOpts, arg} from './common.mjs';

const labels = process.argv.includes('--labels');
const force = process.argv.includes('--force');
const only = arg('only')?.split(',');
const from = arg('from');
const prefix = arg('prefix');
const inputProps = {labels, slotText: !process.argv.includes('--no-slot-text')};

const serveUrl = await makeBundle();
let comps = (await getCompositions(serveUrl, {inputProps, ...browserOpts})).filter((c) => c.id !== 'Film');
if (only) comps = comps.filter((c) => only.includes(c.id));
if (prefix) comps = comps.filter((c) => c.id.startsWith(prefix));
if (from) { const i = comps.findIndex((c) => c.id === from); if (i > -1) comps = comps.slice(i); }
fs.mkdirSync('out/clips', {recursive: true});

let n = 0;
for (const c of comps) {
  const out = `out/clips/${c.id}.mp4`;
  n++;
  if (!force && fs.existsSync(out)) { console.log(`[${n}/${comps.length}] skip ${c.id}`); continue; }
  const t0 = Date.now();
  await renderMedia({composition: c, serveUrl, codec: 'h264', outputLocation: out, inputProps, crf: 16, pixelFormat: 'yuv420p', ...browserOpts});
  console.log(`[${n}/${comps.length}] ${c.id} done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
console.log('All clips are in out/clips');
