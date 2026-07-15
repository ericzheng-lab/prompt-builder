const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }
assert(html.includes('pb-sprint-d'), 'marker');
assert(html.includes('Omni Reference') || html.includes('--oref'), 'MJ oref');
assert(html.includes('No negative prompts'), 'flux no neg');
assert(html.includes('layout.sections'), 'gptimage');
assert(html.includes('characters ≤5') || html.includes('characters'), 'nano refs');
assert(html.includes('Haunted'), 'chip enrich');
assert(html.includes('Matte-painting plate'), 'env chip');
assert(html.includes('One-sheet hierarchy'), 'poster chip');
assert(!/v8\.2/i.test(html), 'no V8.2');
const mc = html.slice(html.indexOf('const MODEL_CARDS={'), html.indexOf('function buildModelRules'));
assert(!/seedance|kling video|veo 3\.1/i.test(mc), 'no video in MODEL_CARDS');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);
for (const model of ['midjourney', 'flux', 'gptimage', 'nano']) {
  const i = mc.indexOf(model + ':{');
  const t = mc.indexOf('techniques:', i);
  const end = mc.indexOf('],', t);
  const slice = mc.slice(t, end > t ? end : t + 2000);
  const count = (slice.match(/"/g) || []).length / 2;
  assert(count >= 8, model + ' techniques too few: ' + count);
}
console.log('L1_SPRINT_D_PASS', { size });
