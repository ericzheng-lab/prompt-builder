const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }
assert(html.includes('pb-sprint-h'), 'marker');
assert(html.includes('agent-resize-handle'), 'handle');
assert(html.includes('function initAgentResize'), 'initAgentResize');
assert(html.includes('initAgentResize()'), 'init call');
assert(html.includes('pb-agent-width'), 'persist key');
assert(html.includes('--agent-w'), 'css var');
assert(html.includes('col-resize'), 'cursor');
assert(html.includes('scrollIntoView'), 'scroll chips');
assert(html.includes('Image target'), 'settings MJ note');
assert(html.includes('Midjourney V8.2'), 'dropdown V8.2');
assert(html.includes('version:"V8.2"'), 'card V8.2');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);
console.log('L1_SPRINT_H_PASS', { size });
