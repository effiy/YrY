---

doc_type: module
prd_task_id: "YP-09-S24"
title: "翻译窗口交互 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "35-prd-翻译窗口交互.md"

type: task
---

# 翻译窗口交互 — 开发方案

## 源码

`YiPot/src/window/Translate/index.jsx`

### 主组件结构

```jsx
export default function Translate() {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [isListening, setIsListening] = useState(false);

  // 监听 Tauri 事件
  useEffect(() => {
    const unlisten = listen("new_text", (event) => {
      setText(event.payload);
      if (event.payload !== "[INPUT_TRANSLATE]") {
        translateAll(event.payload);
      }
    });
    return () => unlisten.then(fn => fn());
  }, []);

  // 剪切板监听
  useEffect(() => {
    const unlisten = listen("clipboard-changed", (event) => {
      if (isListening) translateAll(event.payload);
    });
    return () => unlisten.then(fn => fn());
  }, [isListening]);

  return (
    <div className="translate-window">
      <WindowControl />            {/* 窗口控制按钮 */}
      <LanguageArea />             {/* 语言选择器 + 监听开关 */}
      <SourceArea text={text} />   {/* 原文区域 */}
      <TargetArea results={results} /> {/* 翻译结果 */}
    </div>
  );
}
```

### SourceArea 组件

- 显示原文（可编辑）
- 输入翻译模式下自动聚焦
- 语言自动检测标识

### TargetArea 组件

- 遍历 results 数组
- 每个服务结果独立卡片
- 成功: 显示译文 + 操作栏
- 失败: 显示错误信息 + 重试按钮

### 窗口控制

`YiPot/src/components/WindowControl/index.jsx`:
- macOS: 红绿灯按钮
- Win/Linux: 关闭/最小化按钮