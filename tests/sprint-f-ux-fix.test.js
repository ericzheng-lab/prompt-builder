const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }

assert(html.includes('pb-sprint-f'), 'marker');
assert(html.includes('data-agent-qr'), 'data-agent-qr');
assert(html.includes('bindAgentMessageClicks'), 'delegation');
assert(!html.includes('onclick="pickAgentQuickReply(${JSON.stringify'), 'no broken onclick stringify');
assert(html.includes('version:"V8.2"'), 'MJ V8.2');
assert(!/V8\.1/.test(html), 'no V8.1');
assert(html.includes('function escAttr'), 'escAttr');
assert(html.includes('Midjourney V8.2'), 'V8.2 label');

const landing = fs.readFileSync(path.join(__dirname, '..', 'landing-bundle.jsx'), 'utf8');
assert(landing.includes('/prompt-builder/prompt-builder'), 'landing absolute app href');
assert(!/href="prompt-builder"/.test(landing), 'no relative prompt-builder href');

const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);
console.log('L1_SPRINT_F_PASS', { size });
