const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','prompt-builder.html'),'utf8');
function assert(c,m){if(!c){console.error('FAIL',m);process.exit(1);}}
assert(html.includes('pb-sprint-l'),'marker l')
assert(html.includes('pb-onboarding-overlay'),'overlay')
assert(html.includes('setupOnboardingTour'),'setup fn')
assert(html.includes('Quick Tour'),'tour copy')
assert(html.includes('Bring your own key'),'byok step')
assert(html.includes('Try without key')||html.includes('?mock=1'),'mock mention')
assert(html.includes('github.com/ericzheng-lab/prompt-builder'),'github still')
const size=Buffer.byteLength(html,'utf8');
assert(size<360*1024,'size '+size);
console.log('L1_L_PASS',size);
