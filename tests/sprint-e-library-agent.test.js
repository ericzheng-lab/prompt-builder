const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL', m); process.exit(1); } }

assert(html.includes('pb-sprint-e'), 'marker');
assert(html.includes('function getLibraryContext'), 'getLibraryContext');
assert(html.includes('const libraryContext='), 'libraryContext var');
assert(html.includes('libraryContext?'), 'injected in system prompt');
assert(html.includes('USER LIBRARY'), 'USER LIBRARY label');
assert(html.includes('getLibraryContext(targetModel,userMessage,5)') || html.includes('getLibraryContext(targetModel, userMessage, 5)'), 'call site');
// chips r2
assert(html.includes('Aloof'), 'chip r2 personality');
assert(html.includes('Brushed aluminum'), 'chip r2 materials');
assert(html.includes('Crash zoom') || html.includes('Rack focus'), 'chip r2 camera');
assert(html.includes('function getLibrary()'), 'getLibrary kept');
assert(html.includes('pb-library'), 'pb-library key');
assert(!/v8\.2/i.test(html), 'no V8.2');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);

// pure unit: scoring logic mirror
function scoreItems(list, targetModel, userMessage) {
  const msg = (userMessage || '').toLowerCase();
  return list.map((it) => {
    let score = 0;
    if (it.model && targetModel && it.model === targetModel) score += 50;
    (it.tags || []).forEach((t) => {
      if (String(t).toLowerCase() && msg.includes(String(t).toLowerCase())) score += 25;
    });
    return { id: it.id, score };
  }).sort((a, b) => b.score - a.score);
}
const ranked = scoreItems(
  [
    { id: 'a', model: 'flux', tags: ['noir'], prompt: 'x' },
    { id: 'b', model: 'midjourney', tags: ['poster'], prompt: 'y' },
    { id: 'c', model: 'flux', tags: [], prompt: 'z' },
  ],
  'flux',
  'make it noir'
);
assert(ranked[0].id === 'a', 'same model + tag wins');
assert(ranked[0].score >= 75, 'score');

console.log('L1_SPRINT_E_PASS', { size });
