# LOOP-STATE — prompt-builder Sprint A

**Mode:** LOOP GOAL  
**Started:** 2026-07-15  
**Finished:** 2026-07-15  
**Source:** 执行文档 v1 §7 Sprint A (blueprint attachment unavailable; DoD from §7)  
**Repo:** ericzheng-lab/prompt-builder → dual-sync ai-drsfilms-portfolio/public/prompt-builder/

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
- [ ] A11 Dual-repo sync (in progress)
- [ ] A12 Live URL verify

## Loop log

| # | Item | Status | Note |
|---|------|--------|------|
| 0 | bootstrap | done | base 5b8f942 HTML |
| 1 | A1–A6 code | done | single transform pass |
| 2 | L0/L1 | done | node --check + unit tests |
| 3 | dual commit | in_progress | |

## Status

**IN_PROGRESS** — shipping dual-repo + live verify
