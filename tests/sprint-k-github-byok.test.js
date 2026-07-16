const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','prompt-builder.html'),'utf8');
const lb=fs.readFileSync(path.join(__dirname,'..','landing-bundle.jsx'),'utf8');
function assert(c,m){if(!c){console.error('FAIL',m);process.exit(1);}}
assert(html.includes('pb-sprint-k'),'marker k')
assert(html.includes('github.com/ericzheng-lab/prompt-builder'),'github link in app')
assert(html.includes('byokTopStatus'),'byok still')
assert(lb.includes('github.com/ericzheng-lab/prompt-builder'),'github in landing')
assert(lb.includes('ByokStrip'),'byok strip still')
assert(lb.includes('Try demo') && lb.includes('Open with BYOK'),'byok ctas')
const size=require('fs').statSync(path.join(__dirname,'..','prompt-builder.html')).size;
assert(size<350*1024,'size '+size)
console.log('L1_K_PASS',size);
