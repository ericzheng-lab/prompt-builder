const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }
assert(html.includes('pb-sprint-i'), 'marker');
assert(html.includes('min-height:44px'), '44px chips');
assert(html.includes('Copied') && html.includes('clipboard.writeText'), 'copy feedback');
assert(html.includes('pb-library-badge'), 'badge');
assert(html.includes('nearBottom'), 'scroll guard');
assert(!html.includes('Copy Prompt ⌘C'), 'no fake shortcut');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);
console.log('L1_SPRINT_I_PASS', { size });
