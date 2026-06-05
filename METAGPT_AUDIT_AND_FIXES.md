# MetaGPT 多智能体审计报告与 V7 漏洞修复方案 (METAGPT_AUDIT_AND_FIXES)

本文件基于 MetaGPT 多智能体协同框架（产品经理 PM、系统架构师 Architect、项目经理 Project Manager、开发工程师 Engineer、测试工程师 QA）对 V7 AI Agent（意图分解路由系统）的审计结果，整理出全部潜在系统漏洞及具体的**代码级修复方案**。

---

## 📋 漏洞目录与修复指引

| ID | 角色 | 漏洞描述 | 严重级别 | 修复策略 |
| :--- | :--- | :--- | :--- | :--- |
| **ENG-0** | **Engineer** | LLM 芯片预填与 DOM 无法绑定，导致最终数据被 collect 覆写抹除 | 🔴 紧急 (P0) | 扩展预填循环，处理 chips 容器和自定义输入 |
| **ARCH-1** | **Architect** | JSON 解析器脆弱，LLM 返回非标 JSON 时会触发 JS 语法错误导致界面崩溃 | 🔴 严重 (P1) | 引入防御性 JSON 正则清洗与安全降级解析 |
| **ARCH-2** | **Architect** | System Prompt 静态硬编码分类和芯片，导致未来配置增删时发生 Schema 漂移 | 🟡 中等 (P2) | 改为运行时动态构建分类和芯片 Prompt 列表 |
| **PROJM-1**| **ProjM** | 全局 `_llmAbort` 竞争覆盖，导致多个 LLM 请求中途中止时逻辑互扰 | 🟡 低 (P3) | 划分独立的 `_agentAbort` 与 `_presetAbort` 控制器 |
| **ENG-1** | **Engineer** | Preset 缺乏 text/textarea 字段时映射算法出现空指针崩溃 | 🟡 低 (P3) | 增加字段类型校验的防护哨兵条件 |
| **QA-1** | **QA** | API 401 报错时 UI 状态未重置，且没有直观的修复配置跳转按钮 | 🟡 低 (P3) | 优化错误捕获，直接提供“前往配置 Settings”链接 |

---

## 🛠 各漏洞技术细节与代码级修复方案

### 🔴 ENG-0: LLM 芯片预填与 DOM 无法绑定 (已写入 AI_AGENT_V7_BUG)

* **问题源头**：在 `routeToPreset()` L2678-2686，仅能预填 `INPUT` 和 `TEXTAREA`，忽略了 `chips` 类型。导致数据在 `runLLMPreset()` 触发 `collectLLMFieldValues()` 时，被 DOM 中未激活的空芯片覆写抹除。
* **修复方案**：替换 `routeToPreset()` 中的预填代码段。
* **修复代码**：
```javascript
    // Pre-fill DOM elements from llmFieldValues so runLLMPreset() reads correct values
    Object.keys(llmFieldValues).forEach(fid=>{
      const val=llmFieldValues[fid];
      if(!val)return;
      
      // 1. 预填标准的 INPUT 或 TEXTAREA
      const el=document.getElementById("llm-"+fid);
      if(el&&(el.tagName==="INPUT"||el.tagName==="TEXTAREA")){
        el.value=val;
        el.dispatchEvent(new Event("input",{bubbles:true}));
      }
      
      // 2. 预填与激活 LLM 芯片字段
      const chipsContainer=document.getElementById("llm-chips-"+fid);
      if(chipsContainer){
        const values=val.split(",").map(v=>v.trim().toLowerCase());
        chipsContainer.querySelectorAll(".llm-chip").forEach(chip=>{
          const chipVal=chip.dataset.value;
          if(chipVal&&values.includes(chipVal.toLowerCase())){
            chip.classList.add("active");
          }
        });
        
        // 激活自定义输入（如果 AI 填入的值不在预设芯片中）
        const presetOpts=(preset.fieldOptions&&preset.fieldOptions[fid])||[];
        const customValues=val.split(",")
          .map(v=>v.trim())
          .filter(v=>v&&!presetOpts.some(o=>o.toLowerCase()===v.toLowerCase()));
          
        if(customValues.length){
          const customWrap=document.getElementById("llm-custom-"+fid);
          if(customWrap){
            customWrap.style.display="";
            const customInp=customWrap.querySelector("input");
            if(customInp){
              customInp.value=customValues.join(", ");
            }
          }
        }
      }
    });
```

---

### 🔴 ARCH-1: 防御性 JSON 解析器 (Defensive JSON Parser)

* **问题源头**：`classifyIntent()` 中对 LLM 的返回结果直接进行 `JSON.parse()`。如果 LLM 在输出 JSON 时末尾有多余的逗号、包含前置解释、或者带有 Markdown 代码块包裹，程序将直接抛出 JS 语法错误导致白屏或按钮卡死。
* **修复方案**：重构 `classifyIntent()` 的响应解析逻辑，增加正则预清洗和容错初始化。
* **修复代码**：
```javascript
// 替换 classifyIntent() (L2582) 中的解析部分
.then(raw => {
  let cleaned = raw.trim();
  
  // 1. 剥离 Markdown Fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  
  // 2. 提取最外层花括号包裹的内容
  const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
  if (s >= 0 && e > s) {
    cleaned = cleaned.substring(s, e + 1);
  }
  
  let json;
  try {
    // 3. 剥离 JSON 尾部的非法逗号（LLM 常见语法错误）
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1'); 
    json = JSON.parse(cleaned);
  } catch (parseErr) {
    console.warn("JSON parse failed, attempting loose regex extraction:", parseErr);
    // 4. 极致降级备份：尝试用正则硬抓取核心字段
    json = {
      mode: cleaned.includes('"mode": "film"') || cleaned.includes('"mode":"film"') ? "film" : "general",
      category: (cleaned.match(/"category"\s*:\s*"([^"]+)"/) || [])[1] || "",
      subject: (cleaned.match(/"subject"\s*:\s*"([^"]+)"/) || [])[1] || "AI Intent Scene",
      scene: (cleaned.match(/"scene"\s*:\s*"([^"]+)"/) || [])[1] || "",
      chips: {}
    };
  }

  // 5. 确保核心结构完整性，防止后继逻辑空指针崩溃
  if (!json.category) json.category = json.mode === "film" ? "moodboard" : "scene";
  if (!json.subject) json.subject = "AI Created Scene";
  json.chips = json.chips || {};
  
  aiAgentResult = json;
  // ...渲染 UI 逻辑保持不变...
})
```

---

### 🟡 ARCH-2: 动态 System Prompt 生成器 (Dynamic Schema Prompt)

* **问题源头**：`buildClassifierPrompt()` 静态硬编码了全部的 Mode、Category ID 和芯片定义。未来修改 `FILM_CATEGORIES` 或 `PRESET_CATEGORIES` 时，两边数据结构容易脱节。
* **修复方案**：利用当前的静态数组（`FILM_CATEGORIES`、`PRESET_CATEGORIES`、`STYLES`、`FILM_SHOT_SIZE` 等）在运行时实时拼接 System Prompt。
* **修复代码**：
```javascript
function buildClassifierPrompt(){
  // 动态读取当前的 Film 类分类
  const filmCats = FILM_CATEGORIES
    .filter(c => c.presetType !== "custom")
    .map(c => `- ${c.id}: ${c.name} ${c.presetType === "llm" ? "(presetType: llm)" : "(presetType: tag)"}`)
    .join("\n");

  // 动态读取当前的 General 类分类
  const genCats = PRESET_CATEGORIES
    .filter(c => !c.isCustom)
    .map(c => `- ${c.id}: ${c.name}`)
    .join("\n");

  return `You are an intent classifier for Prompt Builder. Classify the user's description into a mode and category.

## MODES AND CATEGORIES

### Film & TV (mode: "film"):
${filmCats}

### General (mode: "general"):
${genCats}

## CHIP VALUES (pick from these exact values only):
Film chips:
Shot sizes: ${FILM_SHOT_SIZE.join(", ")}
Angles: ${FILM_ANGLE.join(", ")}
Lenses: ${FILM_LENS.join(", ")}
Lighting: ${FILM_LIGHTING_SETUP.join(", ")}
Time: ${FILM_TIME.join(", ")}
Moods: ${FILM_MOOD_FILM.join(", ")}
Style refs: ${FILM_STYLE_REF.join(", ")}

General chips:
Styles: ${STYLES.join(", ")}
Lighting: ${LIGHTING.join(", ")}
Moods: ${MOODS.join(", ")}
Colors: ${COLORS.join(", ")}
Details: ${DETAILS.join(", ")}

## OUTPUT: Return ONLY valid JSON. No markdown, no explanation.
{
  "mode": "film" or "general",
  "category": "<exact category id>",
  "subject": "<main subject description>",
  "scene": "<environment/background description>",
  "chips": { "shotSize": [], "angle": [], "lens": [], "filmLighting": [], "time": [], "filmMood": [], "filmStyle": [], "style": [], "lighting": [], "mood": [], "color": [], "detail": [] }
}

RULES:
1. Chip values MUST exactly match lists above. Do not invent.
2. Category IDs MUST exactly match.
3. Keep user's language (Chinese ok), but technical terms in English.
4. Output at least subject + 2-3 chip selections.`;
}
```

---

### 🟡 PROJM-1: 异步中止控制器隔离 (Abort Namespace Isolation)

* **问题源头**：单全局变量 `_llmAbort` 容易发生竞争覆盖。如果用户在意图识别阶段触发了 Abort，会误杀正在进行的 Preset 生成请求。
* **修复方案**：引入 `_agentAbort` 和 `_presetAbort` 进行隔离。
* **修复代码**：
```javascript
// 1. 在脚本开头或者初始化区声明两个独立控制器
let _agentAbort = null;
let _presetAbort = null;

// L2220 runLLMPreset() 内修改为：
if(_presetAbort)_presetAbort.abort();
_presetAbort=new AbortController();
const signal=_presetAbort.signal; // 替换原 _llmAbort.signal

// L2579 classifyIntent() 内修改为：
if(_agentAbort)_agentAbort.abort();
_agentAbort=new AbortController();
const signal=_agentAbort.signal; // 传给 callFn 替换原 ac.signal
```

---

### 🟡 ENG-1: Preset 字段防空哨兵保护

* **问题源头**：如果 Preset 中全是芯片而无文本输入框，`textFields[0]` 为空，引发空指针崩溃。
* **修复方案**：添加缺省防护边界。
* **修复代码**：
```javascript
// 修改 mapClassifierToPreset() L2715 处：
if(requiredTextField){
  llmFieldValues[requiredTextField.id]=json.subject||"";
}else if(textFields && textFields.length > 0){
  llmFieldValues[textFields[0].id]=json.subject||"";
}
if(textFields && textFields.length>1&&textFields[1]!==requiredTextField){
  llmFieldValues[textFields[1].id]=json.scene||"";
}
```

---

### 🟡 QA-1: 授权错误 UX 优雅降级

* **问题源头**：API 报错时，错误文案挤在极小的角标栏，且无直观的补救指引。
* **修复方案**：检测 401 状态码，直接提供便捷配置 Settings 的跳转链接。
* **修复代码**：
```javascript
// 修改 classifyIntent() 的 .catch() L2600 处：
.catch(err=>{
  if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("key")) {
    statusEl.innerHTML=`<span class="ai-agent-error">⚠ API Key 授权失败或未配置。 <a href="#" onclick="event.preventDefault();openSettings()" style="color:var(--blue);text-decoration:underline;">前往 Settings 页面配置</a></span>`;
  } else {
    statusEl.innerHTML=`<span class="ai-agent-error">Error: ${err.message||"Failed to parse AI response"}</span>`;
  }
  aiAgentResult=null;genBtn.style.display="none";
})
```

---

## 📈 执行状态建议

该方案已完成了所有智能体层面的逻辑验证。此文件可作为后续**一步到位实施 V7 彻底重构的蓝图指南**。
