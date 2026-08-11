// Single source of truth for the Midjourney version shipped by this product.
// Added 2026-08-11: V7 survived in the live product for weeks past Midjourney's own
// V8.2 default (2026-07-24) because tests/ was never wired into `npm test`, so
// contradictory version assertions accumulated unnoticed.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'prompt-builder.html'), 'utf8');
function assert(c, m) { if (!c) { console.error('FAIL: ' + m); process.exit(1); } }

assert(html.includes('version:"V8.2"'), 'MODEL_CARDS.midjourney must be V8.2');
assert(!/version:"V7"/.test(html), 'no V7 model card may remain');
assert(!/version:"V8\.1"/.test(html), 'no V8.1 model card may remain');
assert(html.includes('<option value="midjourney">Midjourney V8.2</option>'), 'dropdown label must read V8.2');
assert(!/title:"Midjourney V7/.test(html), 'no V7 preset title');

// V7 may survive ONLY as an explanation of the --oref downgrade trap, never as a target.
const v7hits = (html.match(/V7/g) || []).length;
assert(v7hits <= 3, 'V7 mentions must stay confined to the --oref trap note (found ' + v7hits + ')');
assert(/rendered by V7/.test(html), 'the --oref "Uses V7" trap must stay documented');

// V8-family facts users get wrong.
assert(/--q/.test(html), 'V8 has no quality dial - must be stated');
assert(/--sv 7/.test(html), 'V8 style-reference baseline --sv 7 must be stated');
console.log('MJ_VERSION_TRUTH_PASS', { v7MentionsAllowedAsTrapNote: v7hits });
