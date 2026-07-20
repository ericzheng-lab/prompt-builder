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
- [ ] Main workbench and model/prompt surfaces match Screen 01.
- [ ] Agent, settings, modal, and onboarding surfaces match Screen 02.
- [ ] All forbidden legacy effects, radii, gradients, shadows, and fonts are removed.
- [ ] Every Wave 2 loop passes the mock flow and size/lint checks.
- [ ] Independent final audit is clean.
- [ ] Draft PR contains cache notes, emoji options, deployment-copy steps, and remaining risks.

## Loop log

- Loop 3: replaced the global app shell and entry/category region with One-Sheet tool volume. Removed all 15 backdrop-filter declarations, three shadows, three gradients, and zeroed 59 CSS radii plus three generated status radii. Preserved Screen 03 emoji icons. Static check: 0 anti-slop P0, forbidden-effect grep 0, script behavior byte-identical except the three square status styles, app 334,657 bytes.
- Loop 2: installed landing rev3; source remained byte-exact except the external sw-register.js tag. Bumped Service Worker cache to v5, removed HTML and legacy JSX from precache, made navigations network-first, and cache-busted registration. Stage 1 validator: 15/15 PASS; anti-slop 0; CJK 0; billing 1 at 12px minimum; seven assets present; inline business scripts limited to video and hook; index 51,402 bytes.
- Loop 1: imported the locked One-Sheet contract and tokens; remote commit a01c1cf6b6bb1e0e50505e8ddf2283097857aa23.

## Audit

Pending after all implementation loops are green.
