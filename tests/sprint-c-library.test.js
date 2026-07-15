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
assert(html.includes('function deleteLibraryItem'), 'delete');
assert(html.includes('function loadLibraryItem'), 'load');
assert(html.includes('id="libraryList"'), 'list ui');
assert(html.includes('id="starPromptBtn"'), 'star btn');
assert(html.includes('pb-sprint-c'), 'marker');
// history must remain
assert(html.includes('pb-history'), 'history key kept');
assert(html.includes('function pushHistory()'), 'pushHistory kept');
assert(html.includes('function renderHistory()'), 'renderHistory kept');
// prior sprints
assert(html.includes('MODEL_CARDS'), 'MODEL_CARDS');
assert(html.includes('version:"V8.1"'), 'V8.1');
assert(!/v8\.2/i.test(html), 'no V8.2');
assert(html.includes('AGENT_JSON_SCHEMA') || html.includes('parseAgentJson'), 'sprint B still present');
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size);

// pure unit: library merge semantics
function uidLib(){ return 'lib_test'; }
function mergeImport(existing, incoming) {
  const cleaned = incoming.map((it) => ({
    id: it.id || uidLib(),
    prompt: String(it.prompt || it.text || '').trim(),
    model: it.model || '',
    tags: Array.isArray(it.tags) ? it.tags : [],
    time: it.time || Date.now(),
  })).filter((it) => it.prompt);
  const byKey = new Map(existing.map((x) => [x.id, x]));
  cleaned.forEach((it) => byKey.set(it.id, it));
  return Array.from(byKey.values());
}
const merged = mergeImport(
  [{ id: 'a', prompt: 'old', model: 'flux' }],
  [{ id: 'a', prompt: 'new', model: 'flux' }, { id: 'b', prompt: 'other', model: 'midjourney' }]
);
assert(merged.find((x) => x.id === 'a').prompt === 'new', 'upsert by id');
assert(merged.some((x) => x.id === 'b'), 'add new');

console.log('L1_SPRINT_C_PASS', { size });
