# LOOP-STATE — prompt-builder Sprint A

**Mode:** LOOP GOAL  
**Started:** 2026-07-15  
**Finished:** 2026-07-15  
**Source:** 执行文档 v1 §7 Sprint A (attachment 401; DoD from §7)  
**Result:** **ALL_DONE**

## DoD

- [x] A1 MODEL_CARDS skeleton + buildModelRules assembler (replaces LLM_SYSTEM_PROMPTS)
- [x] A2 Four cards rewritten with official facts (MJ V8.1 only — no V8.2; FLUX.2; gpt-image-2; gemini-3-pro-image); each has version + updated
- [x] A3 All call sites use buildModelRules (runAgent, runLLMPreset, runEnhance)
- [x] A4 WP2.6 abort isolation: _agentAbort / _presetAbort (no shared _llmAbort)
- [x] A5 WP2.7 model ID placeholder + datalist; runLLMPreset max_tokens → 1600
- [x] A6 `?mock=1` demo mode (canned agent JSON, ~500ms delay, no real key)
- [x] A7 L0: node --check on extracted script — PASS
- [x] A8 L1: tests/build-model-rules.test.js — PASS
- [x] A9 Full-file grep: zero V8.2
- [x] A10 Zero npm deps; no keys in code
- [x] A11 Dual-repo sync
- [x] A12 Live URL verify (277908 bytes, pb-sprint-a marker present)

## Commits

| Repo | SHA | Notes |
|------|-----|-------|
| ericzheng-lab/prompt-builder | `7dd54cfb4f5649b3e9a093daf1c3bcc8f62a5efb` | html + LOOP-STATE + tests |
| ericzheng-lab/ai-drsfilms-portfolio | `eb56a90df2b997a2974db446a3c48408b7e72c3a` | public/prompt-builder/prompt-builder.html |

## Live

- URL: https://ai.drsfilms.com/prompt-builder/prompt-builder
- Demo: https://ai.drsfilms.com/prompt-builder/prompt-builder?mock=1
- Marker: `<!-- pb-sprint-a: MODEL_CARDS V8.1 mock=1 2026-07-15 -->`
- Bytes: 277908 (under 320KB budget)

## Status

**ALL_DONE**
