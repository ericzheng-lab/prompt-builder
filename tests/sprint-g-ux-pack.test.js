const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }
assert(html.includes('pb-sprint-g'), 'marker');
assert(html.includes('agentMockBanner'), 'banner el');
assert(html.includes('function applyMockBanner'), 'applyMockBanner');
assert(html.includes('What are we making'), 'empty title');
assert(html.includes('agentWelcomeStarters'), 'starters');
assert(html.includes('data-agent-starter'), 'starter attrs');
assert(html.includes('function bindAgentWelcomeStarters'), 'bind starters');
assert(html.includes('min-height:36px'), 'touch target');
assert(html.includes('min-height:40px') || html.includes('min-height:32px'), 'starter/refine height');
assert(html.includes('Mock mode') || html.includes('mock mode') || html.includes('Demo mode'), 'mock copy');
// mock byok
assert(html.includes('Demo') && html.includes('isMockMode'), 'mock byok');
assert(!/V8\.1/.test(html), 'no V8.1');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);
console.log('L1_SPRINT_G_PASS', { size });
