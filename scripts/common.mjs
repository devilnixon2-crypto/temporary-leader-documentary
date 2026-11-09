import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';

// Optional: set BROWSER_EXE to use a specific Chrome/Chromium instead of Remotion's own download.
export const browserOpts = process.env.BROWSER_EXE
  ? {browserExecutable: process.env.BROWSER_EXE, chromeMode: 'chrome-for-testing', chromiumOptions: {gl: 'swangle'}}
  : {};

export const makeBundle = async () => {
  const entry = path.resolve('src/index.ts');
  return bundle({entryPoint: entry, onProgress: () => undefined});
};

export const pick = async (serveUrl, id, inputProps) =>
  selectComposition({serveUrl, id, inputProps, ...browserOpts});

export const arg = (name) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : undefined;
};
