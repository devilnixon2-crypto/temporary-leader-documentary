// Writes SHOTLIST.md from src/timeline.ts (shot id, length, camera, time of day, narration cue).
import fs from 'node:fs';
import ts from 'typescript';

const src = fs.readFileSync('src/timeline.ts', 'utf8');
const js = ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
const stub = new Proxy({}, {get: () => () => []});
const mod = {exports: {}};
new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({R: stub}));
const T = mod.exports.TIMELINE;
let total = 0;
let out = '# Shot list\n\n| Shot | Sec | Starts | Camera | Time | Cue (what the narration is saying) |\n|---|---|---|---|---|---|\n';
for (const d of T) {
  const m = Math.floor(total / 60), s = Math.round(total % 60);
  out += `| ${d.id} | ${d.s} | ${m}:${String(s).padStart(2, '0')} | ${d.cam} | ${d.tod} | ${d.comp === 'slot' ? '**ADD YOUR IMAGE:** ' + d.label : d.note} |\n`;
  total += d.s;
}
out += `\nTotal: ${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, '0')} (${T.length} shots). Slots for your own images: ${T.filter((d) => d.comp === 'slot').length}.\n`;
fs.writeFileSync('SHOTLIST.md', out);
console.log('SHOTLIST.md written:', T.length, 'shots,', Math.round(total), 'seconds');
