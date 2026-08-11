# prompt-builder — Claude Code 项目规则

> 优先级:本文件 > vault CLAUDE.md > `~/.claude/CLAUDE.md`(全局)。全局的 Hard Gates 任何情况下不被覆盖。
> 本文件只写已对照 `origin/main` 核实过的事实。

## 这是什么

portfolio opener —— 已发布的第一件产品,不是竞争型大产品。纯前端 BYOK(自带 key),单文件形态。
live:`ai.drsfilms.com/prompt-builder`(由 `ai-drsfilms-portfolio` 仓库托管,见「已知坑 ①」)。

`package.json`(name `prompt-builder`,version 0.3.0)**没有任何依赖、没有构建步骤**,只有两个脚本包装 `bin/prompt-builder.js`(本地静态服务器,默认端口 4733)。产物就是仓库里的 `prompt-builder.html` / `index.html` / `landing-bundle.jsx` 本身。

## 开工先读

- 本文件
- `DESIGN.md` —— **在 main 上,是设计合同正本**
- `LOOP-STATE.md`(另有 `LOOP-STATE-B/C/D/E.md`、`WAVE2-LOOP-STATE.md`)

## 设计锁 —— `DESIGN.md` 是 single source of truth

文件首行自述为**「设计合同 v3(One-Sheet + landing hook 与媒体资产回收增补)」**,正文含 12 处 `LOCKED`。
(注:云端记忆称「v3.1」,仓库里核实到的版本号是 **v3**,以仓库为准。)

已逐条核实的锁:

| 锁 | 内容 | 出处 |
|---|---|---|
| 概念 | 艺术影院一号海报 One-Sheet;工具即作品;纯排版驱动 | `DESIGN.md:37` |
| 颜色 | 铜版纸白 `#FCFBF8` / 油墨黑 `#101010` / **唯一强调色克莱因蓝 `#002FA7`** | `DESIGN.md` |
| 圆角 | **0 圆角全站**(直角即品牌);阴影禁用,层级靠线与留白 | `DESIGN.md:37,72` |
| 四字族 | Anton(display,**禁用于正文**)· Oswald(billing caps,letter-spacing ≥0.08em)· Libre Franklin(UI 400/600)· Sometype Mono(≥14px,tabular-nums) | `DESIGN.md:51-54` |
| 禁用 | 第五字体族;Anton 用于正文;品牌角色位出现 Inter/Roboto/Arial/system-ui;JetBrains Mono;Cormorant/Montserrat;Space Grotesk;`border-radius > 0`;999px 胶囊;装饰 emoji 按钮 | `DESIGN.md:110,56,109` |
| 性能红线 | **单文件 ≤360KB**,4 个 Google Fonts 的加载体积计入核算 | `DESIGN.md:31` |
| 语言 | landing 与对外物料 **English only,CJK 字符 grep = 0**(产品内中英双语是功能卖点,不受此限) | `DESIGN.md:100` |

**实测现状(可作为回归基线)**:

```
prompt-builder.html   304.1 KB   ✅ 距 360KB 红线约 56KB 余量
index.html             50.9 KB   CJK = 0 ✅
landing-bundle.jsx     65.9 KB   CJK = 0 ✅
```

## 不变量(改坏了就是 bug)

- **范围 = IMAGE prompt only**。视频模型语法不在范围内
- **Midjourney 默认 V7,不是 V8.x**。已核实 `prompt-builder.html:1303` 的 `MODEL_CARDS.midjourney.version = "V7"`,identity 串里明写 `(V8.x not default here.)`;UI 下拉同为 `Midjourney V7`(`:751`),`:814` 有说明文案。**改默认版本前先问 Eric**
- 目标模型面:midjourney / flux(FLUX)/ gpt-image-2 / gemini-3-pro-image(`MODEL_CARDS` 32 处引用)
- 知识只进两层:`MODEL_CARDS` 的 per-model techniques/params/dos/donts,与 `FILM_LLM_PRESETS`(11 处)/ `fieldOptions`(14 处)chips。强去重,不要新开第三层知识
- 无 AI key 时,**手动 chip 选择是稳定真源**,系统只建议不自动替用户选

## 已知坑

### ① 双 repo 同步(最容易翻车的一条)

`prompt-builder.html` 同时存在于两处,必须**字节一致**:

```
standalone : prompt-builder            origin/main:prompt-builder.html
portfolio  : ai-drsfilms-portfolio     origin/main:public/prompt-builder/prompt-builder.html
```

**本次核实两处 sha256 相同(`9785cddf…`,311485 bytes),当前是同步的。** 任何改动必须两处同时提交,并用 live URL 复核 —— `push ≠ 上线`。

改完自查:

```bash
shasum -a 256 prompt-builder.html
shasum -a 256 <portfolio>/public/prompt-builder/prompt-builder.html
```

### ② PWA service worker 缓存会把旧壳喂给老用户

`sw.js` 存在且当前 `CACHE_NAME = 'prompt-builder-v5-onesheet-2026-07-20'`(`sw.js:1`)。任何改动必须:
bump `CACHE_NAME` → 导航/HTML 请求走 network-first → 注册 URL 加 cache-bust(`sw.js?v=…`)→ 上线后开无痕窗口复核。

### ③ landing 白屏

`landing-bundle.jsx` 是单一 React 树,浏览器内 Babel 编译、**没有构建期检查**。组件引用未定义变量 → 整页空白。典型错误是传 `t.accent` 而不是裸 `accent`。
`node --check` 过 **≠** landing 活着;必须 smoke 真实 landing 页面。

### ④ 没有 lockfile,`npm ci` 必然失败(设计如此,不是 bug)

仓库无 `package-lock.json` 且零依赖,`npm ci` 报 `EUSAGE: can only install with an existing package-lock.json`。**不要为了让 `npm ci` 通过而去生成 lockfile** —— 这个仓库本来就没有依赖树。

### ⑤ 本机 node 有两套

nvm v22.22.2(标准,见 `.nvmrc`)与 homebrew v26.5.0。GUI 启动、不 source `.zshrc` 的进程会落到 homebrew 那套。

## 构建与验证

**本仓库没有构建步骤。** 实测可用的验证手段:

```bash
node --check bin/prompt-builder.js          # ✅ 实测通过
npm start                                    # = node ./bin/prompt-builder.js open
npm run serve                                # = node ./bin/prompt-builder.js serve(默认 :4733)

# 设计合同的机器判据(改完必跑)
wc -c prompt-builder.html                    # 必须 < 368640(360KB)
grep -c '[一-鿿]' index.html landing-bundle.jsx   # 对外物料必须为 0
```

`DESIGN.md:118` 另有验收官清单,其中 `lint-anti-slop.py --repo prompt-builder` **不在本仓库内**,需从外部工具链取。

node 版本见 `.nvmrc`(22.22.2)。

## key 纪律

BYOK key 只走用户浏览器内的设置 / 安全 credential,**绝不进聊天、日志或仓库**。只写变量名,不写值。

## Release Gate

自主可做:只读审计 · feature branch · commit/push · Draft PR · CI · 非生产 preview
必须等 Eric 明确批准:merge 到 main · 生产部署/流量切换 · 对外发布 · 破坏性操作 · 意外付费
`push ≠ live`:报告完成前必须验证真实 live URL/版本(本项目尤其:还要确认 portfolio 侧副本也上了)

## LOOP-STATE 协议

多步施工:判级(L0/L1/L2)→ 机器可验 DoD → 短 loop(计划→做→验证→修正)→ 每 loop commit。
状态外置到 `LOOP-STATE.md` 并随 commit 走。
L2(多文件系统性改动 / 触碰生产 / 0→1 模块)额外要求:动手前只读 Loop 0 快照 + 完工前独立盲审到 clean。
