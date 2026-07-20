# WAVE 2 LOOP STATE — One-Sheet rollout

Classification: L2 full LGSA
Reason: two-stage, multi-file system reskin with more than three machine-verifiable acceptance criteria and an explicit Draft PR release gate.

## Loop 0 snapshot

- Repository: ericzheng-lab/prompt-builder
- Base: main at 630511e3ec79f675fa63c92ce6ab7b5bd6b8af6b
- Working branch: feat/onesheet-rollout
- App baseline: prompt-builder.html at 330,890 bytes
- Landing source: landing-onesheet-rev3.html.txt at 51,357 bytes
- Wave 2 source: wave2-tool-volume-mockups.html.txt at 39,139 bytes
- Locked contract source: feat/design-p0-contracts at 6f5e19a
- Legacy landing-bundle.jsx remains present but must no longer be referenced.

## Guardrails

- Never merge main or deploy any environment.
- Preserve DOM layout, feature positions, BYOK behavior, agent behavior, and Screen 03 emoji icons.
- Restrict implementation changes to the visual shell plus the required Service Worker cache fix.
- Keep prompt-builder.html at or below 360 KB.
- End at a Draft PR awaiting Eric's explicit ship it.

## Definition of Done

- [x] Locked DESIGN.md and design-tokens.css travel with the branch.
- [x] Landing rev3 is installed with cache-safe Service Worker behavior.
- [x] Landing release checks pass: anti-slop, CJK, billing, seven assets, CDN modules, script boundaries.
- [x] App color, surface, and typography shell matches One-Sheet tool volume.
- [x] Entry/category view matches Screen 03 while preserving emoji icons.
- [x] Main workbench and model/prompt surfaces match Screen 01.
- [x] Agent, settings, modal, and onboarding surfaces match Screen 02.
- [x] All forbidden legacy effects, radii, gradients, shadows, and fonts are removed.
- [x] Every Wave 2 implementation loop passes the required static size/lint checks.
- [ ] Independent final audit is clean.
- [x] Draft PR contains cache notes, emoji options, deployment-copy steps, and remaining risks.

## Loop log

- Loop 7: closed the merged art-direction and source-audit fix list without widening scope. Changed the onboarding primary button from Klein-blue fill to ink fill; raised every remaining 9px/10px functional label to 11px while preserving the 14px mono/prompt floor; retained emojis and all permitted blue dots. Full six-part validator: accent backgrounds 2 and both allowlisted dots, forbidden transitions 0, long animations 0, mono minimum 14px with enhanced output 14px, 9px/10px declarations 0, app 311,222 bytes plus 47,508 font bytes = 358,730 bytes total.
- Loop 6: repaired milestone REJECT findings without touching behavior: removed the Settings color transition, converted the typing indicator to three static dots, raised every explicit Sometype Mono use to at least 14px, and applied font-budget option B with role-specific Google Fonts text subsets shared by landing and app. Minified inline CSS/JS reduced prompt-builder.html from 352,339 to 311,224 bytes; measured font CSS plus unique WOFF2 payload is 47,508 bytes, for a 358,732-byte loaded total. Static checks: forbidden property transitions 0; long animations 0; mono floor validator PASS.
- Loop 5: reskinned the Agent column, settings drawer, freeform modal, and onboarding to Screen 02 tool volume. Replaced overlay blur/scrim color with flat opacity 0.34 on the underlying view, made the drawer 420px with a solid paper surface and ink rule, and raised Agent/settings mono text to 14px. Static check: 0 anti-slop P0, forbidden-effect grep 0, script SHA unchanged, app 352,339 bytes.
- Loop 4: reskinned the main workbench, sidebar fields, chips, model tabs, formula, prompt preview, actions, history, and library to Screen 01 tool volume. Static check: 0 anti-slop P0, forbidden-effect grep 0, script SHA unchanged, app 342,647 bytes. Browser mock flow on 65da446 passed: entry → Scene Concept → location → Fog chip → local generation → 108-character copy toast; screenshot confirmed square, three-column tool-volume layout and active model/chip blue hairlines.
- Loop 3: replaced the global app shell and entry/category region with One-Sheet tool volume. Removed all 15 backdrop-filter declarations, three shadows, three gradients, and zeroed 59 CSS radii plus three generated status radii. Preserved Screen 03 emoji icons. Static check: 0 anti-slop P0, forbidden-effect grep 0, script behavior byte-identical except the three square status styles, app 334,657 bytes. Browser mock flow on 37f74e2 passed: entry → Scene Concept → location → Fog chip active → local generation → 108-character copy toast.
- Loop 2: installed landing rev3; source remained byte-exact except the external sw-register.js tag. Bumped Service Worker cache to v5, removed HTML and legacy JSX from precache, made navigations network-first, and cache-busted registration. Stage 1 validator: 15/15 PASS; anti-slop 0; CJK 0; billing 1 at 12px minimum; seven assets present; inline business scripts limited to video and hook; index 51,402 bytes.
- Loop 1: imported the locked One-Sheet contract and tokens; remote commit a01c1cf6b6bb1e0e50505e8ddf2283097857aa23.

## Audit

Status: READY FOR RE-AUDIT.

Loops 6–7 repair the full merged art-direction and source-audit list. Independent machine re-audit remains pending; this status is not merge or deployment authorization.
