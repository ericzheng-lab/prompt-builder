#!/usr/bin/env node
// Runs every tests/*.test.js from the repo root. Added 2026-08-11: the suite existed
// but package.json had no test script and CI only ran deploy, so contradictory version
// assertions accumulated unnoticed (sprint-b/c demanded V8.1 present while sprint-f/h
// demanded it absent) and the product shipped V7 long after Midjourney defaulted to V8.2.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'tests');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.js')).sort();
let failed = 0;
for (const f of files) {
  try {
    const out = execFileSync(process.execPath, [path.join(dir, f)], { cwd: root, encoding: 'utf8' });
    console.log(`PASS ${f} ${out.trim().split('\n').pop() || ''}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${f}\n${(e.stdout || '') + (e.stderr || '')}`);
  }
}
console.log(`\n${files.length - failed}/${files.length} test files passed`);
process.exit(failed ? 1 : 0);
