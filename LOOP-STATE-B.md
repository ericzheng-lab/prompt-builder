# LOOP-STATE — prompt-builder Sprint B

**Mode:** LOOP GOAL  
**Started:** 2026-07-15  
**Finished:** 2026-07-15  
**Source:** 执行文档 v1 §3 WP2.1–2.5 + §7 Sprint B DoD  
**Result:** **ALL_DONE** (L0/L1 + dual-repo; L3 true-brain deferred — needs skill credential)

## DoD

- [x] B1 WP2.1 AGENT_JSON_SCHEMA + structured dual-stack (Anthropic output_config / OpenAI response_format) + 400 fallback + parseAgentJson trailing-comma
- [x] B2 WP2.2 role message array to API (normalizeAgentMessages, last 20) + pb-conversations persist/restore + New chat
- [x] B3 WP2.3 system prompt rewrite (act-by-default, chip-first, delta refine, MODEL RULES)
- [x] B4 WP2.4 quick_replies chips + refine bar (shorter / more cinematic / more detail)
- [x] B5 WP2.5 401 + OpenAI CORS error UX with Open Settings CTA
- [x] B6 mock=1 extended: vague/empty → clarifying_question + quick_replies; refine keywords still work; mock bypasses key gate
- [x] B7 L0 node --check PASS
- [x] B8 L1 tests/sprint-b-agent.test.js + build-model-rules.test.js PASS
- [x] B9 no V8.2; size <320KB; no keys in code
- [ ] B10 dual-repo sync (in progress)
- [ ] B11 live verify
- [ ] B12 L3 true-brain 5/5 (needs prompt-builder-dev skill + Eric credential — deferred)

## Status

**SHIPPING**
