const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
const lb = fs.readFileSync(path.join(__dirname, '..', 'landing-bundle.jsx'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }
assert(html.includes('pb-sprint-j'), 'marker');
assert(html.includes('byokTopStatus'), 'top bar status');
assert(html.includes('toggleMockMode'), 'toggle');
assert(html.includes('Bring your own key'), 'settings explain');
assert(html.includes('Try without key'), 'try without key');
assert(html.includes('function updateBYOKIndicator'), 'byok indicator');
assert(lb.includes('ByokStrip') || lb.includes('BYOK — your key'), 'landing BYOK');
assert(lb.includes('/prompt-builder/prompt-builder?mock=1') || lb.includes('Try demo'), 'landing mock link');
assert(!/V8\.1/.test(html), 'no V8.1');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 350 * 1024, 'size '+size); // bumped to 350 for BYOK chrome
console.log('L1_SPRINT_J_PASS', { size });
