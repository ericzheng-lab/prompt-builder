/**
 * L1 unit tests — pure node, zero npm deps.
 * Extracts MODEL_CARDS + buildModelRules from prompt-builder.html and validates.
 */
const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'prompt-builder.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

// Extract MODEL_CARDS object + buildModelRules function as source
const cardsStart = html.indexOf('const MODEL_CARDS={');
assert(cardsStart >= 0, 'MODEL_CARDS not found');
const fnStart = html.indexOf('function buildModelRules(model)', cardsStart);
assert(fnStart >= 0, 'buildModelRules not found');
// end of buildModelRules: find closing brace after function body
let i = html.indexOf('{', fnStart);
let depth = 0;
let end = -1;
for (; i < html.length; i++) {
  if (html[i] === '{') depth++;
  else if (html[i] === '}') {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
assert(end > 0, 'could not bound buildModelRules');
const extract = html.slice(cardsStart, end);
// Evaluate in isolation
const sandbox = {};
const fn = new Function(extract + '\n; return { MODEL_CARDS, buildModelRules };');
const { MODEL_CARDS, buildModelRules } = fn();

const models = ['midjourney', 'flux', 'gptimage', 'nano'];
for (const m of models) {
  assert(MODEL_CARDS[m], `missing card ${m}`);
  assert(MODEL_CARDS[m].version, `${m} missing version`);
  assert(MODEL_CARDS[m].updated, `${m} missing updated`);
  assert(Array.isArray(MODEL_CARDS[m].structure), `${m} structure`);
  assert(Array.isArray(MODEL_CARDS[m].params), `${m} params`);
  assert(Array.isArray(MODEL_CARDS[m].dos), `${m} dos`);
  assert(Array.isArray(MODEL_CARDS[m].donts), `${m} donts`);
  assert(Array.isArray(MODEL_CARDS[m].techniques), `${m} techniques`);
  assert(MODEL_CARDS[m].example, `${m} example`);
  const rules = buildModelRules(m);
  assert(typeof rules === 'string' && rules.length > 80, `${m} rules too short`);
  assert(rules.includes(MODEL_CARDS[m].version), `${m} version in rules`);
  assert(rules.includes('FORMAT:'), `${m} FORMAT section`);
  assert(rules.includes('STRUCTURE'), `${m} STRUCTURE section`);
}

assert(MODEL_CARDS.midjourney.version === 'V8.2', 'MJ must be V8.2 (official default since 2026-07-24)');
assert(MODEL_CARDS.flux.version === 'FLUX.2', 'Flux must be FLUX.2');
assert(MODEL_CARDS.gptimage.version === 'gpt-image-2', 'gptimage version');
assert(MODEL_CARDS.nano.version === 'gemini-3-pro-image', 'nano version');

// Full-file red line
assert(/version:"V8\.2"/.test(html), 'V8.2 must be the pinned Midjourney version');
assert(!html.includes('LLM_SYSTEM_PROMPTS'), 'LLM_SYSTEM_PROMPTS must be gone');
assert(html.includes('isMockMode'), 'mock mode helper required');
assert(html.includes('_agentAbort'), 'abort isolation agent');
assert(html.includes('_presetAbort'), 'abort isolation preset');
assert(!html.includes('_llmAbort'), 'old _llmAbort must be gone');
assert(html.includes('claude-sonnet-5'), 'model placeholder refresh');
assert(html.includes('list="modelNameSuggestions"'), 'datalist wired');

// buildModelRules unknown model
assert(buildModelRules('nope') === '', 'unknown model returns empty');

// Size budget soft check
const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, `file size ${size} exceeds 320KB budget`);

console.log('L1_PASS', {
  models: models.length,
  mj: MODEL_CARDS.midjourney.version,
  bytes: size,
  sampleRulesLen: buildModelRules('midjourney').length
});
