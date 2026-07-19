# prompt-builder · DESIGN.md — 设计合同 v1(过渡合同)

> **本文件是设计合同(single source of truth)。** 任何 UI/物料改动必须符合本合同;偏离先修订合同。
> 配套 tokens:`design-tokens.css`。
> 状态标注:**LOCKED** = 铁律,改动需 Eric 批准;**CURRENT** = 现状转录(迁移基线,≠目标);**TBD** = 视觉方向待美指出 3-4 极端方向、Eric 挑定后回填转 LOCKED。
>
> **v1 的诚实声明**:prompt-builder 没有历史锁定视觉规范,且现状语言命中反-slop 禁用清单多项(见 §2 审计)。因此 v1 是**过渡合同**:先钉住不变量与禁区,目标视觉语言由设计生产线 P6-B(prompt-builder 宣传物料实证)产出后回填。

---

## 0. 定位(一句话)

**制片人的 prompt 工作台**:面向影视生产场景的 image-prompt 构建工具,portfolio opener,证明「The Producer Who Builds」。气质应是**片场工具**(果断、专业、可信),不是「AI 文创玩具」。挂在 ai.drsfilms.com 之下,与 drsfilms 品牌(电影质感、克制、单一强调)同一宇宙——但作为工作台,可读性优先于氛围。

## 1. 受众与场景

- **使用者**:影视同行(导演/制片/概念设计),要快速出可用 prompt。
- **围观者**(同样重要):看 Eric portfolio 的招聘方/同行——界面本身就是作品。
- 推论(LOCKED):界面视觉水准 = 简历水准;「能用但土」等于负资产。

## 2. 现状审计 — CURRENT(2026-07-18,main 分支实测)

当前语言:淡紫玻璃(`#ede6f2` 底 + 紫/蓝/绿三色渐变 + rgba 白玻璃卡片 + 14px 圆角 + Josefin Sans/Fraunces/JetBrains Mono)。

**反-slop 禁用清单命中项(机器实测)**:
| 命中 | 证据 |
|---|---|
| 紫系强调 | `--accent:#8a6aaa` `--accent2:#a080c0` |
| 多彩渐变底 | `--bg-grad` 紫→蓝→绿;landing 内 10 处 `linear-gradient` |
| 玻璃拟态 | app 内 14 处 `backdrop-filter`;`--glass` rgba 白玻璃 |
| 大圆角 | `--radius:14px / 10px / 7px` |
| 禁用字体 | JetBrains Mono(旧模板残留) |
| 强调色失焦 | accent 紫 + accent-2 蓝 + gold 金 + green + danger,≥5 个彩色并存 |

结论(LOCKED):**现状语言判定为待迁移,不得在新界面/新物料中延续**。现状 token 全表转录在 `design-tokens.css` CURRENT 段,仅作迁移对照。

## 3. 不变量铁律 — LOCKED(与目标方向无关,永远成立)

1. **Prompt/代码文本永远 mono**:等宽字体、左对齐、≥13px、可全选复制;prompt 输出区是产品主舞台,对比度 ≥ 7:1。
2. **单一强调色原则**:全站只有一个品牌强调色(方向定稿时选定);语义色(成功/危险)只做状态反馈,不参与品牌表达。
3. **字体总数 ≤ 4**,全部走 Google Fonts 显式声明;禁 system-ui 兜底当品牌字面。
4. **BYOK/agent 状态可视性**:key 状态、agent 运行态用文字+形状表达,不靠颜色单独编码。
5. **性能红线**:单文件应用,新增视觉资产不得使总文件 >360KB(既有工程约束);动效只用 opacity/transform。
6. **可达性**:正文对比 ≥ 4.5:1;焦点态可见(2px 实线 outline);`prefers-reduced-motion` 全局尊重。
7. **品牌同宇宙**:与 ai.drsfilms.com 母站气质连续(电影/制片语汇、克制、专业),不做孤岛风格。

## 4. 目标视觉方向 — TBD(P6-B 产出后回填)

流程(LOCKED):美指(fable5)按「永不从零」闸门拉齐现状+母站+弹药库 → 出 **3-4 个极端方向**(如:片场暗调工作台 / 剪辑室 NLE 密度风 / 纸面 call-sheet 风…) → 反-slop lint + 验收官过 → **Eric 挑** → 选定方向回填本节,CURRENT 语言废弃。
约束:候选方向必须全部避开 §2 命中项与 §6 denylist;必须满足 §3 铁律。

## 5. 宣传物料 register — LOCKED(流程)+ TBD(视觉)

**背景**:产品基本完成;Eric 判定现有宣传物料不达标(2026-07-18)。**现有物料废弃重做**,作为设计生产线模式B 第一个实证靶(P6-B)。

- 物料清单:landing 页刷新、发布封面/brand frames、HyperFrames 发布视频(HTML→MP4,禁用平台 Veo)、X/LinkedIn 配图。
- 素材铁律:一律从**真实产品截图**出发(脱敏 demo 数据),永不伪造 UI;视频配音走 GenerateAudio(TTS),配乐 Eric 自备。
- 视觉:与 §4 选定方向同源(产品 UI 与宣传物料一个语言,不再两张皮)。
- 消息层归 Marketer(Brief 进 _LAUNCH/);视觉执行归美指;发布永远过 Eric 审批门。

## 6. 禁用清单(anti-slop denylist)— LOCKED,机器可 grep

出现即 REJECT(新代码/新物料;CURRENT 存量迁移完成前豁免存量):

**颜色/效果**:`backdrop-filter`、`blur(`(玻璃拟态);品牌面渐变(`linear-gradient` 用于底色/按钮/标题,尤禁紫系 `#6366f1 #8b5cf6 #a855f7 #8a6aaa`);`#3b82f6`/`#6366f1` AI 默认蓝紫;glow/发光;film-grain(此仓非 drsfilms 母站,不继承其质感特例);`saturate(`;模糊柔影。
**几何/布局**:胶囊按钮(`999px`);无差别三列卡片墙;装饰性 emoji 按钮。
**字体**:Inter/Roboto/Arial/system-ui 当品牌字面;JetBrains Mono;Cormorant Garamond/Montserrat(旧模板);Space Grotesk(slop 收敛默认)。
**文案**:「Let's dive in」「game-changer」「thrilled to announce」类 AI 腔;首屏无一句说清「给谁/干什么」。

注:圆角上限、具体配色 denylist 细则随 §4 方向定稿后收紧。

## 7. 实现与验收接口

- 双仓同步纪律:标准正本 = `ericzheng-lab/prompt-builder`;`ai-drsfilms-portfolio/public/prompt-builder/` 为部署副本,两仓 commit 必须同步(本合同只入正本仓)。
- 单一写手:合同稳态由实现线维护;美指以文件提议修订。
- 验收官判定:§2 命中项复发、§3 铁律、§6 denylist = 机器可验 P0;§0/§5 气质符合度 = 结构化人审 P1。

*v1(过渡合同)· 2026-07-18 · P0 铸合同 loop-2(施工正本 cmrr78lrc0dg307adv66x9c2z)· 现状实测自 main@2026-07-18*
