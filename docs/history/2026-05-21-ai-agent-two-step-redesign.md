---
status: historical
supersededBy: agent-FIRST single-call architecture (5b8f942, 2026-06-30)
originalDate: 2026-05-21
archivedDate: 2026-08-13
---

> ## ⚠️ 这不是现行架构 — Historical, NOT current
>
> 本文提出的"两步走"方案已经不是这个项目现在的做法。原样阅读会误导。
>
> **演进链:**
>
> | 日期 | 变化 | 存档 |
> |---|---|---|
> | 2026-05-21 | AI Intent Decomposer(一次调用,通用 system prompt) | `57632da` |
> | 2026-05-21 | **本文提出改成两步走** | 本文 |
> | 2026-06-02 | 实现为 two-layer architecture(即本文的两步走) | `039bb71` |
> | 2026-06-05 | V7 沿用 two-layer | `c4d3167` |
> | 2026-06-30 | **改为 agent-FIRST 单次调用 — 现状** | `5b8f942` |
>
> 本文描述的 `applyIntentDecomposer()` / `runIntentDecomposer()` /
> `buildIntentDecomposerSystemPrompt()` 在现行代码中**已全部不存在**。
> 本文提出的新增函数里,只有 `silentClear()` 存留至今。
>
> **保留理由:** 记录当初为什么选两步走 —— 特别是"每个分类有专用 system prompt、
> 通用 prompt 拿不到这些专业知识"这个论点(见下方分类知识对照表),
> 以及两步方案 token 更少质量更高的测算。这是 two-layer 架构存在过的唯一设计说明,
> 也是日后追问"为什么 6-30 又改回单次调用"时的对照基准。
>
> **不要**把本文当作现行架构文档,不要照着它改代码。

---

# AI Agent 重构方案：两步 Agentic Workflow

## 问题：当前方案为什么不好

当前方案用**一个通用 system prompt** 一步到位生成分类 + 芯片 + prompt。

这绕过了 Prompt Builder 的核心价值——每个分类都有**专用 system prompt**，包含该类别特定的专业知识：

| 分类 | 专用 prompt 知道的事 | 通用 prompt 不知道的事 |
|------|---------------------|----------------------|
| Character Sheet | front/3-4/side/back 多角度一致性 | ✗ 只知道"画个角色" |
| Storyboard | 水平时间线、镜头运动箭头、导演批注 | ✗ 只知道"分镜" |
| Film Poster | 缩略图可读性、情感钩子、标题安全区 | ✗ 只知道"海报" |
| Prop Design | 博物馆级美照、正交视图、材质爆炸图 | ✗ 只知道"道具" |

**结论：用户用了最高级入口（AI Agent），反而拿到最低质量输出。**

---

## 方案：两步 Agentic Workflow

### 架构图

```
用户输入自然语言
       │
       ▼
  ┌──────────────────────┐
  │ Step 1: 意图分类       │  ← 轻量 LLM 调用（~200 token 响应）
  │ 返回 mode + category   │
  │ + field values         │
  └──────────┬───────────┘
             │
     ┌───────┴───────┐
     │               │
     ▼               ▼
  LLM 类分类      Tag 类分类
  (char-sheet,    (moodboard,
   storyboard,    styleframe,
   env-concept)   env-lighting)
     │               │
     ▼               ▼
  ┌────────────┐  ┌────────────┐
  │ Step 2A:   │  │ Step 2B:   │
  │ 打开 LLM   │  │ 填芯片     │
  │ Preset     │  │ + 字段     │
  │ 自动填字段  │  │ 走 standard│
  │ 自动调     │  │ assembly   │
  │ runLLMPreset│  └────────────┘
  └────────────┘
       │
       ▼
  复用现有专业 system prompt
  生成高质量 prompt
```

### Step 1：意图分类器

**LLM 调用目的**：仅做分类和字段提取，不生成 prompt。

**System Prompt**（精简版，~1500 token）：
```
You are a classifier for Prompt Builder. Given a user's natural language
description of what they want to create, determine:

1. mode: "film" or "general"
2. category: exact category ID
3. fields: key-value pairs to pre-fill in the selected category's form

## Film mode categories (with presetType):
- moodboard (tag) — visual tone & atmosphere
- styleframe (tag) — key moment visual
- colorscript (tag) — color progression
- storyboard (llm) — sequential breakdown
- char-design (llm) — full character concept
- char-sheet (llm) — multi-angle consistency
- char-expression (llm) — emotional range
- env-concept (llm) — environment concept art
- env-panorama (llm) — establishing shot
- env-lighting (tag) — lighting variation
- sb-sequence (llm) — multi-shot narrative
- sb-comic (llm) — panel-based storytelling
- prop-design (llm) — prop/costume reference
- vfx-ref (tag) — VFX breakdown
- film-poster (llm) — key art

## General mode categories:
[列出 general categories]

## Output JSON:
{
  "mode": "film",
  "category": "char-sheet",
  "presetType": "llm",
  "fields": {
    "character_name": "Neo",
    "age_gender": "30s male",
    "build": "Athletic, lean",
    "wardrobe": "Long black trench coat, sunglasses",
    "key_props": "Twin pistols, cellphone",
    "vibe": "Stoic, determined",
    "art_style": "cinematic realism",
    "directors_vision": "cyberpunk noir"
  },
  "chips": {
    "filmMood": ["Mysterious", "Gritty"],
    "filmStyle": ["Denis Villeneuve"]
  }
}

RULES:
1. category ID must exactly match list above
2. presetType must match the (tag) or (llm) marker
3. For LLM categories, fields keys should match that preset's field IDs
4. For tag categories, populate chips instead of fields
5. Keep user's language for descriptions, English for technical terms
```

**响应大小**: ~150-250 token（只有 JSON，没有 prompt 文本）

### Step 2A：LLM 分类路由（presetType === "llm"）

当分类器返回 `presetType: "llm"` 时：

```javascript
// 伪代码
const result = step1Result;

// 切模式
if(result.mode !== currentMode) switchMode(result.mode);

// 找到对应的 LLM preset
const cat = FILM_CATEGORIES.find(c => c.id === result.category);
const presetId = cat.presetId;

// 打开 LLM preset（这会渲染所有专用字段）
if(result.mode === "film") openFilmLLMPreset(presetId);
else openLLMPreset(presetId);

// 自动填充 LLM 字段
Object.entries(result.fields).forEach(([key, value]) => {
  const el = document.getElementById("llm-" + key);
  if(el) {
    el.value = value;
    llmFieldValues[key] = value;
  }
});

// 自动触发 runLLMPreset()
// 这里复用了该分类的专用 system prompt！
await runLLMPreset();
```

**关键点**：`runLLMPreset()` 使用的是 `FILM_LLM_PRESETS` 里该分类的 `systemPrompt`——这是你为每个分类精心设计的专业提示词。AI Agent 不再绕过它，而是**调用**它。

### Step 2B：Tag 分类路由（presetType === "tag"）

当分类器返回 `presetType: "tag"` 时：

```javascript
// 切模式
if(result.mode !== currentMode) switchMode(result.mode);

// 静默清空
silentClear();

// 填 subject/scene
document.getElementById("subject").value = result.fields.subject || "";
document.getElementById("scene").value = result.fields.scene || "";

// 填芯片
applyChipsFromResult(result.chips);

// 跳到 Step 2，走 standard assembly
assemblyMode = "standard";
goToStep(2);
```

---

## UI 交互流程设计

### 方案 A：全自动（推荐）

1. 用户点 "🤖 AI Agent" → 弹 modal → 输入描述
2. 点 "Analyze & Build" → 一个按钮完成两步
3. Step 1 完成后立刻自动进入 Step 2
4. 如果是 LLM 类：自动填字段 + 自动触发生成 → 用户看到 prompt 生成过程
5. 如果是 Tag 类：自动填芯片 → 用户看到已选中的芯片和实时预览
6. Modal 自动关闭

**优势**: 一步到位，体验流畅
**风险**: 两次 API 调用连续发生，需要处理中间加载状态

### 方案 B：可确认

1. 用户输入描述 → 点 "Analyze"
2. Step 1 完成后显示分类结果："我认为你想做一个 Character Sheet"
3. 用户确认或修改分类
4. 点 "Apply & Generate" → 进入 Step 2 自动填字段 + 生成

**优势**: 用户有修正机会
**风险**: 多一步操作，不够"agentic"

### 方案 C：混合

Step 1 结果显示在 modal 里让用户看到（分类 + 字段预览），但底部有两个按钮：
- "Apply & Generate" → 全自动（方案 A）
- "Apply Fields Only" → 只填字段不触发生成，用户手动调整后自己点 Generate

---

## 与当前代码的兼容性

### 需要修改的函数

| 函数 | 改动 |
|------|------|
| `buildIntentDecomposerSystemPrompt()` | 重写为精简分类器 prompt（不含 prompt 生成指令） |
| `runIntentDecomposer()` | 改返回结构（去掉 `prompt` 字段） |
| `applyIntentDecomposer()` | 重写为两步路由逻辑 |

### 需要新增的函数

| 函数 | 作用 |
|------|------|
| `silentClear()` | 静默清空（不触发 toast 和 updatePreview） |
| `autoFillLLMFields(fields)` | 自动填充 LLM preset 的表单字段 |
| `applyChipsFromResult(chips)` | 从分类器结果填充芯片 |

### 不需要修改的函数

| 函数 | 原因 |
|------|------|
| `openFilmLLMPreset()` | 原样复用 |
| `openLLMPreset()` | 原样复用 |
| `runLLMPreset()` | 原样复用——核心价值在这里 |
| `renderLLMFields()` | 原样复用 |
| `switchMode()` | 原样复用 |

---

## LLM Preset 字段 ID 映射表

为了让 Step 1 的分类器知道每个 LLM 类分类有哪些字段，需要在 system prompt 里列出字段 ID。以下是从 `FILM_LLM_PRESETS` 提取的字段：

| Preset ID | 字段 IDs |
|-----------|---------|
| char-sheet | character_name, age_gender, build, wardrobe, key_props, vibe, art_style, directors_vision |
| char-design | character_name, age_gender, build, wardrobe, key_props, vibe, art_style, directors_vision |
| char-expression | character_name, appearance, expressions (chips), art_style, consistency_markers |
| env-concept | location_description, time_and_weather, mood, architectural_style, key_elements, art_style |
| env-panorama | location, time_weather, key_landmarks, atmosphere, art_style, camera_note |
| storyboard-... | scene_narrative, shot_count, sequence_flow (chips), camera_movement, mood |
| sb-sequence-llm | scene_narrative, shot_count, sequence_flow (chips), camera_movement, mood |
| sb-comic | story_synopsis, panel_count, panel_flow (chips), art_style, dialogue_style |
| prop-design | prop_name, era_genre, materials, wear_level, key_details, art_style |
| film-poster | film_title, genre, tagline, main_visual, color_palette, typography_style |

这些字段 ID 需要嵌入 Step 1 的 system prompt，让 LLM 知道该返回哪些 key-value。

---

## Token 消耗对比

| | 当前方案 | 两步方案 |
|---|---------|---------|
| System prompt | ~3500 token | Step 1: ~1500 + Step 2: 现有 preset prompt (~500) |
| 响应 | ~800 token | Step 1: ~200 + Step 2: ~800 |
| **总计** | ~4300 token | ~3000 token |
| **Prompt 质量** | 通用，低 | 专业，高 |

两步方案实际上 **token 更少，质量更高**。

---

## 风险和 Edge Case

1. **Step 1 分类错误**: 用户描述模糊 → LLM 选了错误的分类。缓解方案：方案 B 或 C 让用户确认。
2. **字段 ID 不匹配**: LLM 返回的字段 key 和 preset 定义的不一致。缓解方案：用模糊匹配（Levenshtein 或 includes）。
3. **两次 API 延迟叠加**: Step 1 (~1-2s) + Step 2 (~3-5s)。缓解方案：显示分步进度条，"Classifying..." → "Generating..."。
4. **Tag 类分类没有 prompt 生成**: Tag 类走 standard assembly，输出质量取决于芯片拼装公式。这是可接受的——tag 类本来就不需要 LLM 生成。

---

## 推荐

**用方案 C（混合模式）**：
- Step 1 结果展示在 modal 里（分类 + 字段预览），给用户一个确认的机会
- 提供 "Apply & Generate"（全自动）和 "Apply Fields Only"（半自动）两个按钮
- 这才是真正的 agentic：AI 做决策，用户有最终控制权

**工作量估算**: 重写 ~150 行 JS（主要是 `applyIntentDecomposer()` 和 system prompt），其余全部复用现有代码。
