/**
 * Sprint B L1 — pure node, zero npm.
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

function parseAgentJson(raw) {
  if (raw == null) throw new Error('Empty agent response');
  let cleaned = String(raw)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  const s = cleaned.indexOf('{');
  const e = cleaned.lastIndexOf('}');
  if (s >= 0 && e > s) cleaned = cleaned.substring(s, e + 1);
  let result;
  try {
    result = JSON.parse(cleaned);
  } catch (err) {
    const soft = cleaned.replace(/[\u0000-\u001F]+/g, ' ');
    result = JSON.parse(soft);
  }
  if (!result || typeof result !== 'object') throw new Error('Agent response is not an object');
  if (result.chip_selections == null || typeof result.chip_selections !== 'object')
    result.chip_selections = {};
  if (result.prompt == null) result.prompt = '';
  if (result.rationale == null) result.rationale = '';
  if (result.clarifying_question == null) result.clarifying_question = '';
  if (!Array.isArray(result.quick_replies)) result.quick_replies = [];
  result.quick_replies = result.quick_replies
    .filter((x) => typeof x === 'string' && x.trim())
    .slice(0, 3);
  return result;
}

assert(html.includes('function parseAgentJson(raw)'), 'parseAgentJson in html');
assert(html.includes('trailing-comma cleanup'), 'comma clean comment');

{
  const r = parseAgentJson(
    '```json\n{"preset_id":null,"chip_selections":{},"prompt":"hi","rationale":"x","clarifying_question":"","quick_replies":["a",],}\n```'
  );
  assert(r.prompt === 'hi', 'fence parse');
  assert(Array.isArray(r.quick_replies) && r.quick_replies[0] === 'a', 'quick_replies');
}

{
  const r = parseAgentJson(
    'Here you go:\n{"preset_id":"env-concept","chip_selections":{"a":"b"},"prompt":"/imagine x","rationale":"ok","clarifying_question":"","quick_replies":[]}'
  );
  assert(r.preset_id === 'env-concept', 'noise wrap');
  assert(r.chip_selections.a === 'b', 'chips');
}

{
  const r = parseAgentJson('{"prompt":"p"}');
  assert(r.chip_selections && typeof r.chip_selections === 'object', 'default chips');
  assert(r.clarifying_question === '', 'default cq');
  assert(Array.isArray(r.quick_replies), 'default qr');
}

let threw = false;
try {
  parseAgentJson('not json at all {{{');
} catch (e) {
  threw = true;
}
assert(threw, 'malformed must throw');

assert(html.includes('const MODEL_CARDS={'), 'MODEL_CARDS');
assert(html.includes('version:"V8.1"'), 'V8.1');
assert(!/v8\.2/i.test(html), 'no V8.2');
assert(html.includes('AGENT_JSON_SCHEMA'), 'schema');
assert(html.includes('output_config'), 'anthropic structured');
assert(html.includes('response_format'), 'openai structured');
assert(html.includes('pb-conversations'), 'persistence key');
assert(html.includes('pickAgentQuickReply'), 'qr');
assert(html.includes('refineAgentPrompt'), 'refine');
assert(html.includes('formatAgentError'), 'err ux');
assert(html.includes('pb-sprint-b'), 'marker');
assert(/Act by default/i.test(html), 'act-by-default prompt');
assert(html.includes('newAgentChat'), 'new chat');
assert(!html.includes('LLM_SYSTEM_PROMPTS'), 'no old prompts');
assert(!html.includes('_llmAbort'), 'abort still split');
assert(html.includes('_agentAbort') && html.includes('_presetAbort'), 'abort split present');

const size = Buffer.byteLength(html, 'utf8');
assert(size < 320 * 1024, 'size ' + size + ' over budget');

console.log('L1_SPRINT_B_PASS', { size });
