---

doc_type: module
prd_task_id: "YP-09-S14"
title: "全局快捷键注册与管理 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "25-prd-快捷键注册管理.md"

type: task
---

# 全局快捷键注册与管理 — 开发方案

> 来源 PRD：[25-prd-快捷键注册管理.md](../../prds/2026-09/25-prd-快捷键注册管理.md)

## 架构概览

```
应用启动 (Tauri setup)
      │
      ▼
┌───────────────────────────────────────────────────────┐
│              Rust hotkey.rs 注册中心                    │
│                                                        │
│  register_shortcut("all")                              │
│    │                                                    │
│    ├── hotkey_selection_translate → selection_translate │
│    │   │ 默认: Ctrl+Alt+T (可自定义)                    │
│    │   │ 触发: 读取剪贴板/选区 → 调用翻译 → 弹出窗口    │
│    │                                                    │
│    ├── hotkey_input_translate → input_translate         │
│    │   │ 默认: Ctrl+Alt+I                               │
│    │   │ 触发: 弹出输入翻译窗口                         │
│    │                                                    │
│    ├── hotkey_ocr_recognize → ocr_recognize             │
│    │   │ 默认: Ctrl+Alt+O                               │
│    │   │ 触发: 截图 → OCR 识别 → 显示文字               │
│    │                                                    │
│    └── hotkey_ocr_translate → ocr_translate             │
│        │ 默认: Ctrl+Alt+P                               │
│        │ 触发: 截图 → OCR 识别 → 自动翻译               │
│                                                        │
│  Tauri global_shortcut_manager.register(hotkey, handler)│
│    │  系统级注册 (macOS: CGEvent / Windows: RegisterHotKey) │
│    ▼                                                    │
│  全局快捷键监听 (任何应用前台均可触发)                  │
└──────────────────────┬────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────┐
│            前端快捷键录制器 (React)                    │
│                                                        │
│  Config/pages/Hotkey/index.jsx                         │
│    │                                                    │
│    │  1. onClick → 开始录制                             │
│    │  2. onKeyDown → 捕获按键 (modifiers + key)        │
│    │  3. 格式化 "Ctrl+Alt+T" → 显示                    │
│    │  4. invoke("register_shortcut_by_frontend", ...)   │
│    │  5. Rust 端注销旧快捷键 → 注册新快捷键             │
│    │                                                    │
│    │  冲突检测: 同快捷键绑定多个功能时警告              │
│    │  一键恢复默认: reset 所有快捷键到预设值            │
│    ▼                                                    │
│  自定义快捷键即时生效                                  │
└───────────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

`YiPot/src-tauri/src/hotkey.rs` + `YiPot/src/window/Config/pages/Hotkey/index.jsx`

### Rust 注册引擎

```rust
// hotkey.rs
use tauri::GlobalShortcutManager;

pub fn register_shortcut(app_handle: &AppHandle, shortcut_id: &str) 
    -> Result<(), String> 
{
    match shortcut_id {
        "all" => {
            // 从配置读取每个快捷键，空值 → 不注册
            register(app_handle, "hotkey_selection_translate", 
                || selection_translate(app_handle), "")?;
            register(app_handle, "hotkey_input_translate", 
                || input_translate(app_handle), "")?;
            register(app_handle, "hotkey_ocr_recognize", 
                || ocr_recognize(app_handle), "")?;
            register(app_handle, "hotkey_ocr_translate", 
                || ocr_translate(app_handle), "")?;
        }
        id => {
            // 单独注册某个快捷键
            let handler = get_handler_for_id(id)?;
            register(app_handle, id, handler, "")?;
        }
    }
    Ok(())
}

fn register<F>(app: &AppHandle, name: &str, handler: F, key: &str) 
    -> Result<(), String>
where F: Fn() + Send + 'static
{
    // 1. 读取快捷键 (优先使用传入的 key，否则从配置读)
    let hotkey = if key.is_empty() {
        get_config(name).unwrap_or_default()
    } else {
        key.to_string()
    };

    // 2. 空快捷键 → 不注册
    if hotkey.is_empty() {
        return Ok(());
    }

    // 3. 注册全局快捷键
    app.global_shortcut_manager()
        .register(hotkey.as_str(), handler)
        .map_err(|e| format!("Failed to register {}: {}", name, e))
}

// 前端更新快捷键
#[tauri::command]
pub fn register_shortcut_by_frontend(
    app_handle: tauri::AppHandle,
    name: String,
    shortcut: String,
) -> Result<(), String> {
    // 1. 保存到配置
    set_config(&name, &shortcut);

    // 2. 冲突检测 (同 shortcut → 不同 name → 警告)
    if let Some(existing) = check_shortcut_conflict(&app_handle, &shortcut, &name) {
        return Err(format!("快捷键冲突: 已绑定到 {}", existing));
    }

    // 3. 注销所有 → 重新注册
    app_handle.global_shortcut_manager().unregister_all()
        .map_err(|e| e.to_string())?;
    register_shortcut(&app_handle, "all")
}
```

### 前端快捷键录制器

```javascript
// Config/pages/Hotkey/index.jsx
import { invoke } from "@tauri-apps/api/tauri";
import { useState, useCallback } from "react";

function HotkeyRecorder({ name, defaultValue, onSave }) {
  const [recording, setRecording] = useState(false);
  const [current, setCurrent] = useState(defaultValue);

  const handleKeyDown = useCallback((e) => {
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();

    const parts = [];
    if (e.metaKey) parts.push("Meta");      // macOS Cmd
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");

    // 排除纯修饰键
    const keyName = e.key === "Meta" || e.key === "Control" 
      || e.key === "Alt" || e.key === "Shift" ? "" : e.key.toUpperCase();
    
    if (keyName) {
      parts.push(keyName);
      const shortcut = parts.join("+");
      setCurrent(shortcut);
      setRecording(false);
      onSave(name, shortcut);
    }
  }, [recording, name, onSave]);

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {recording ? "按下组合键..." : current || "未设置"}
    </div>
  );
}
```

### 冲突检测逻辑

```rust
fn check_shortcut_conflict(
    app: &AppHandle, 
    new_shortcut: &str, 
    current_name: &str
) -> Option<String> {
    let all_names = [
        "hotkey_selection_translate",
        "hotkey_input_translate",
        "hotkey_ocr_recognize",
        "hotkey_ocr_translate",
    ];
    for name in all_names {
        if name != current_name {
            let existing = get_config(name).unwrap_or_default();
            if existing == new_shortcut {
                return Some(name.to_string());
            }
        }
    }
    None
}
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| 注册层级 | Tauri global_shortcut_manager (系统级) | Electron 前端键盘事件 | 跨应用全局响应，任何前台应用均有效 | 系统级权限需要辅助功能授权 (macOS) |
| 注册时机 | 应用启动时一次性注册 4 个 | 按需注册 (首次触发功能时) | 划词翻译核心体验，必须始终可用 | 占用 4 个系统快捷键槽 |
| 自定义流程 | 前端录制 → invoke Rust 重新注册 | 前端修改 JSON 配置 → 重启生效 | 即时生效，用户体验流畅 | Rust 端需要完整的 unregister → re-register 流程 |
| 空快捷键 | 空字符串 → 不注册 | 空字符串 → 注册 disabled 状态 | 用户可选择不绑定某些功能，节省快捷键槽 | — |
| 冲突检测 | Rust 端检测 (所有已注册 shortcut) | 前端检测 | Rust 端有完整的 shortcut 注册状态 | 前端仅展示警告信息 |
| 默认快捷键 | Ctrl+Alt 系列 | Cmd+Shift (macOS 常见) | 跨平台统一体验，Ctrl+Alt 冲突最少 | macOS 用户可能不习惯 Ctrl 前缀 |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 快捷键响应 | <50ms 触发 handler | 系统级 Hook，内核级分发 | 用户感知即时 |
| 注册耗时 | <10ms per shortcut | 系统 API 单次注册，无网络 I/O | 启动时 4 个快捷键 <40ms |
| 配置读取 | O(1) 内存访问 | 快捷键字符串缓存到 HashMap | 不重复读取磁盘 |
| 冲突检测 | O(4) 遍历 | 仅 4 个快捷键，循环检查无性能问题 | — |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-系统 | 快捷键已被其他应用占用 | 注册失败 → 提示用户更改快捷键 | 用户自定义新快捷键 | Toast "快捷键冲突" |
| L1-系统 | macOS 辅助功能权限未授予 | 检测权限 → 引导用户到系统偏好设置 | 用户授权后自动注册 | 对话框 + 跳转链接 |
| L1-系统 | global_shortcut_manager 不可用 | 注册失败 → 功能降级为仅窗口内快捷键 | 窗口内键盘事件 | Toast "全局快捷键不可用" |
| L2-配置 | 快捷键配置格式错误 | 校验格式 (Modifier+Key) → 格式错则回退默认值 | 自动修正 | 无感知 |
| L2-配置 | 同快捷键绑定多个功能 | 冲突检测 → 前端警告 → 阻止保存 | 用户修改为不同快捷键 | 前端红色警告 |
| L3-运行时 | 快捷键注册后系统移除 | 定期检查注册状态 (每 30s) → 重新注册 | 自动恢复 | 无感知 |

---

**关联文档**：
- 桌面集成架构：[03-prd-task-桌面集成架构.md](./03-prd-task-桌面集成架构.md)
- 测试方案：[25-prd-test-快捷键注册管理](../../tests/2026-09/25-prd-test-快捷键注册管理.md)