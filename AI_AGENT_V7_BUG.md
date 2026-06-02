# V7 AI Agent — LLM 芯片预填与值抹除 Bug 记录

## Bug 描述

在 `V7/prompt-builder.html` 的 `routeToPreset()` 中，当 AI Agent 完成第一步分析并进行路由时，代码尝试将解析出的字段值预填到 Step 2 的 DOM 元素中：

```javascript
Object.keys(llmFieldValues).forEach(fid=>{
  const val=llmFieldValues[fid];
  if(!val)return;
  const el=document.getElementById("llm-"+fid);
  if(el&&(el.tagName==="INPUT"||el.tagName==="TEXTAREA")){
    el.value=val;
    el.dispatchEvent(new Event("input",{bubbles:true}));
  }
});
```

### 🔴 致命缺陷：

对于 LLM Preset 中的 `chips` 类型的字段（例如 Expression Sheet 分类中的 `expressions` 芯片字段）：
1. **UI 无法激活**：`chips` 类型的 DOM 元素是一组带有 `.llm-chip` 类的 `<button>` 元素，它们被包裹在 ID 为 `llm-chips-[fid]` 的容器里。由于不存在 ID 为 `llm-[fid]` 的输入框，这部分预填代码会直接跳过它们，用户在界面上看不到任何被高亮激活的 LLM 芯片。
2. **数据被覆写抹除**：当用户在 Step 2 点击 `⚡ Generate Prompt` 时，会触发 `runLLMPreset()`，其内部第一步是调用 `collectLLMFieldValues()`（L1864）。由于 DOM 中的芯片没有被激活，`collectLLMFieldValues()` 从 DOM 中读取芯片值时会得到空字符串 `""`，从而**无情地覆写并抹掉了**之前通过 `mapClassifierToPreset` 写入 `llmFieldValues[fid]` 中的值！

---

## 🛠 修复方案

将 `routeToPreset()` 中的预填循环（L2678-2686）修改为以下代码，增加对 `chips` 容器和自定义输入框（Custom Input）的支持：

```javascript
    // Pre-fill DOM elements from llmFieldValues so runLLMPreset() reads correct values
    Object.keys(llmFieldValues).forEach(fid=>{
      const val=llmFieldValues[fid];
      if(!val)return;
      
      // 1. 尝试寻找标准的 INPUT 或 TEXTAREA
      const el=document.getElementById("llm-"+fid);
      if(el&&(el.tagName==="INPUT"||el.tagName==="TEXTAREA")){
        el.value=val;
        el.dispatchEvent(new Event("input",{bubbles:true}));
      }
      
      // 2. 修复：处理 LLM 芯片字段的预填与高亮
      const chipsContainer=document.getElementById("llm-chips-"+fid);
      if(chipsContainer){
        const values=val.split(",").map(v=>v.trim().toLowerCase());
        // 激活匹配的芯片
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
