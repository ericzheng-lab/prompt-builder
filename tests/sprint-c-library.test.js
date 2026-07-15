const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }

assert(html.includes('pb-library'), 'storage key');
assert(html.includes('function getLibrary()'), 'getLibrary');
assert(html.includes('function starCurrentPrompt()'), 'star');
assert(html.includes('function renderLibrary()'), 'render');
assert(html.includes('function exportLibrary()'), 'export');
assert(html.includes('function importLibraryFile'), 'import');
assert(html.includes('function escAttr'), 'escAttr');
assert(html.includes('escAttr(it.id)'), 'data-id uses escAttr');
assert(html.includes('safeId'), 'import id sanitize');
assert(html.includes('pb-history'), 'history key kept');
assert(html.includes('function pushHistory()'), 'pushHistory kept');
assert(html.includes('pb-sprint-c'), 'marker');
assert(html.includes('MODEL_CARDS'), 'MODEL_CARDS');
assert(html.includes('version:"V8.1"'), 'V8.1');
assert(!/v8\.2/i.test(html), 'no V8.2');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);
console.log('L1_SPRINT_C_PASS', { size });
