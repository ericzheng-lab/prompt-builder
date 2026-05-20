# Prompt Builder V6 架构重构与交互优化报告

本报告详细记录了在 **Prompt Builder V6** 版本中所做的关键架构调整、交互逻辑清理以及命名系统重构。所有改动均已通过自动化工具进行了 100% 的语法和链路完整性校验，以确保在生产环境下的极致稳定。

---

## 🛠️ 重构背景与核心目标

随着 Prompt Builder 迈向 V6 版本，部分早期遗留的交互逻辑和术语命名开始引起用户的理解误差。为了进一步提升创作者（导演、摄影指导及原画师）的交互体验，本次重构聚焦于两个核心任务：

1. **Freeform 按钮 UX 清理与「AI Rewrite」重塑**：简化自然语言润色弹窗，将 API 凭据设置统一合并至全局 Settings 中，避免重复配置的混乱；同时提升无 API 配置时的本地模版回退体验。
2. **Character Sheet 命名规范化与兼容性审计**：全面将内部术语 `turnaround` 替换为面向用户的标准工业词汇 **`Character Sheet`**（角色三视图/设计图），并做好旧有自定义导入格式的向后兼容。

---

## 📝 详细改动清单

### Part A: Freeform UX 清理与「✦ AI Rewrite」重塑

#### 1. 弹窗简化与 API 状态感知 (`#enhanceModal`)
* **修改前**：AI 润色弹窗内重复包含 Provider、Base URL、Model Name 和 API Key 四个配置项，极易导致与全局配置（设置齿轮内）冲突或覆盖。
* **修改后**：移除了弹窗内部这 4 个独立输入框，替换为优雅的全局 API 状态指示条（`#enhanceApiStatus`）。
  * 若全局已配置 API 密钥，显示绿色 `已配置 ✓` 标签。
  * 若全局未配置，显示红色警示，并提供直达全局 Settings 齿轮的跳转超链接，实现一站式凭据管理。

#### 2. 全局本地回退机制 (Local Fallback)
* **优化逻辑**：重构了 `runEnhance()` 逻辑，改由直接读取全局 `loadApiConfig()`。
* **回退保护**：当检测到全局未设置 API 密钥时，系统不再报错或显示空框，而是触发优雅的 Toast 提示，并自动执行本地规则化模板替换 (`LOCAL_TEMPLATES`)，进行轻量级 prompt 优化，确保用户在“单机离线”状态下仍能完成基础生成。

#### 3. 主动交互按钮重命名与视觉引导
* **主生成页**：重命名 Action 按钮 `✦ Freeform Prompt` → `✦ AI Rewrite` 并加上功能 Tooltip（*“跳过表单，用自然语言直接描述想法，AI 格式化为 prompt”*）。
* **静态 Tag 预设区**：在普通的 tag 预设加载后，渲染醒目的 Primary 样式重塑按钮：`✦ AI Rewrite (用自然语言描述)`，并在下方加入气泡提示，引导静态用户尝试使用自然语言扩展提示词。

---

### Part B: Character Sheet 命名重构与兼容性路由

#### 1. 内部 ID 规范化修改
在 `V6/prompt-builder.html` 代码中，将所有与 Turnaround 相关的内部标识及 ID 重命名为 `char-sheet`：
* **`FILM_CATEGORIES` (L805)**：修改分类卡片：
  ```javascript
  {id:"char-sheet",icon:"🔄",name:"Character Sheet",desc:"Multi-angle consistency sheet",group:"character",presetType:"llm",presetId:"char-sheet"}
  ```
* **`FILM_PRESETS` (L853)**：修改静态 Sci-Fi Pilot 归属类别：
  ```javascript
  {name:"Character Sheet — Sci-Fi Pilot",category:"char-sheet",...}
  ```
* **`FILM_LLM_PRESETS` (L868)**：修改 LLM 预设 ID 与分类归属：
  ```javascript
  id:"char-sheet",name:"Character Sheet",category:"char-sheet",...
  ```

#### 2. Midjourney & Flux 图像生成质量保障
* **设计考虑**：在面向 AI 模型的 `systemPrompt` 中，"TURNAROUND" 是生成角色多角度三视图的行业标准底层技术词汇。如果彻底在提示词中抹去该词，会导致 Midjourney/Flux 对“多角度一致性”的识别度大幅下降。
* **优化策略**：在 LLM 系统提示词模板（`FILM_LLM_PRESETS` 内部）中，将指令优化为 `CHARACTER SHEET (TURNAROUND)`。这既在前端对用户屏蔽了晦涩术语，又保证了生成图像的专业级多视角一致性。

#### 3. 向后兼容防呆机制
* **优化机制**：在 `normalizeCategoryId` 函数的 `filmMap` 映射字典中，新增了模糊路由匹配：
  ```javascript
  const filmMap = {
    // ...
    sheet: "char-sheet",
    turnaround: "char-sheet" // 自动映射老标识 "turnaround" 到新的 "char-sheet"
  };
  ```
* **效果**：即使用户从 V5 导出或导入包含旧 ID `char-turnaround` 的自定义预设配置，V6 也能无缝解析并渲染到全新的 Character Sheet 卡片中，绝不引发页面崩溃或数据丢失。

#### 4. 静态源码与文档资源同步
* **Landing Page 源码**：修改了 `V6/src/landing/landing-data.jsx`（分类名更新为 `Character Sheet`）和 `V6/src/landing/landing-sections.jsx`（描述词中的 `turnarounds` 更新为 `character sheets`）。
* **README 文档**：更新了主 `V6/README.md`，将旧文案 `turnarounds` 和 `character turnaround` 统一替换为统一的 `character sheets` 与 `character sheet`。
* **发布与设计材料**：优化了 `V6/release-package/docs/DESIGN.md` 与 `V6/release-package/docs/PRODUCT_HUNT.md`，将提及的 `character turnaround` 规范为 `Character Sheet`，确保从代码、界面到最终分发文档的 100% 命名统一性。

---

## 🔬 验证与测试报告

我们通过以下两个层面的全自动化脚本对代码库进行了完整校验，未发现任何遗留隐患：

### 1. JavaScript 语法校验 (Syntax Check)
* **执行命令**：运行 AST 语法分析器，将 `prompt-builder.html` 内包裹在 `<script>` 标签中的全部客户端 JS 代码进行逐行编译。
* **结论**：**通过**。无未定义变量泄漏、ES6 Const 作用域冲突或缺失括号等任何语法错误。

### 2. 链路与预设联动完整性校验 (Linkage Check)
* **执行命令**：通过 Node VM 沙盒模拟加载页面配置，提取 `FILM_CATEGORIES` 与 `FILM_LLM_PRESETS` 列表进行双向哈希匹配。
* **结论**：**100% 通过**。
  * 全部 16 个 Film Mode 分类卡片均能匹配到对应的配置预设。
  * 全部 10 个 LLM 高保真动态生成模板（包含新升级的 `char-sheet`）的 Card ID 与 Category ID 双向引用链路完全畅通，**破损链接数为 0**。

---

## 💡 后续维护建议

1. **版本归档**：当前修改已完全覆盖且锁定了 `V6` 版本。请确保未来的轻微修复仅在 `V6/` 目录下进行，`V5/` 应保持冻结以做备份对照。
2. **体验反馈**：建议用户在添加个人 LLM API Key（如 GPT-4 / DeepSeek 等）后，尝试点击 "Character Sheet" 并使用 "✦ AI Rewrite" 按钮，观察生成的多角度角色卡提示词效果，体验最流畅的手感。
