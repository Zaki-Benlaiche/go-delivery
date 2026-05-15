#!/usr/bin/env node
// Strips assets from out/ that should NEVER ship inside the APK itself.
// Most importantly: the reserve-vite.apk download bundled in /public — without
// this, the APK self-bundles a copy of itself and ~doubles in size each cycle.

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'out');

const STRIP = [
  'reserve-vite.apk',     // self-reference; the download page is web-only
  'qrcode.png',           // QR pointing at the download page; useless inside the APK
];

let stripped = 0;
let saved = 0;
for (const name of STRIP) {
  const target = path.join(OUT_DIR, name);
  try {
    const stat = fs.statSync(target);
    fs.unlinkSync(target);
    stripped++;
    saved += stat.size;
    console.log(`stripped ${name} (${(stat.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

console.log(`done — ${stripped} file(s), ${(saved / 1024 / 1024).toFixed(2)} MB freed`);
