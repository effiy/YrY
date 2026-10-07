---

doc_type: module
prd_task_id: "YP-09-S14"
title: "快捷键管理 — 开发方案"
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

# 快捷键管理 — 开发方案

> 来源 PRD：[25-prd-快捷键注册管理.md](../../prds/2026-09/25-prd-快捷键注册管理.md)

## Rust 实现

`YiPot/src-tauri/src/hotkey.rs`

### register 函数

```rust
fn register<F>(app_handle: &AppHandle, name: &str, handler: F, key: &str) -> Result<(), String>
where F: Fn() + Send + 'static
{
    let hotkey = if key.is_empty() {
        // 从配置读取
        get(name).map_or(String::new(), |v| v.as_str().unwrap().to_string())
    } else {
        key.to_string()
    };

    if !hotkey.is_empty() {
        app_handle.global_shortcut_manager()
            .register(hotkey.as_str(), handler)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

### 注册入口

```rust
pub fn register_shortcut(shortcut: &str) -> Result<(), String> {
    match shortcut {
        "all" => {
            register(app, "hotkey_selection_translate", selection_translate, "")?;
            register(app, "hotkey_input_translate", input_translate, "")?;
            register(app, "hotkey_ocr_recognize", ocr_recognize, "")?;
            register(app, "hotkey_ocr_translate", ocr_translate, "")?;
        }
        _ => ... // 单独注册
    }
}
```

### 前端更新快捷键

```rust
#[tauri::command]
pub fn register_shortcut_by_frontend(name: &str, shortcut: &str) -> Result<(), String> {
    // 1. 保存到配置
    set(name, shortcut);
    // 2. 注销旧快捷键 → 注册新快捷键
    app.unregister_all();
    register_shortcut("all")
}
```

## 前端快捷键录制器

`YiPot/src/window/Config/pages/Hotkey/index.jsx`:
- `onKeyDown` 捕获按键 → 格式化为快捷键字符串
- `invoke("register_shortcut_by_frontend", ...)` 更新 Rust 端


## 设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 注册方式 | Tauri global_shortcut_manager | 系统级 Hook (CGEvent/SetWindowsHookEx) | 跨平台统一 API，Rust 类型安全，Tauri 生命周期管理自动释放 | Tauri API 无法实现按键录制（需要 keydown/keyup 事件流） |
| 录制实现 | 前端 `onKeyDown` 捕获 → 格式化为快捷键字符串 → invoke 注册 | Rust 端 Hook 捕获 | 前端 keydown/keyup 事件流是唯一可靠的按键录制方式 | 分隔前端"录制"和 Rust"注册"两个阶段 |
| 配置存储 | `hotkey_{action}` 格式 key 存在 tauri-plugin-store | 独立快捷键配置文件 | 与所有配置统一存储，备份恢复时一并处理 | 快捷键 key 命名冲突风险 (通过前缀避免) |
| 冲突检测 | 前端检测 (注册前检查所有已注册快捷键) | Rust 端拒绝注册 | 前端可提供可视化冲突提示 + 建议 | 竞态条件: 快速切换可能短暂冲突 |
| 更新策略 | 全量注销 + 全量重注册 (unregister_all → register("all")) | 增量注销 + 注册单个 | 实现简单可靠，全量操作 < 1ms | 短暂时间窗口内无快捷键响应 (~500us) |
| 默认快捷键 | Ctrl+Shift+字母 (跨平台友好) | Cmd+字母 (macOS 习惯) | Ctrl+Shift 在所有平台上不与系统快捷键冲突 | macOS 用户习惯 Cmd，但 Cmd 多已被菜单栏占用 |

### 快捷键命名规范

```
配置 key: hotkey_{action}
action: selection_translate | input_translate | ocr_recognize | ocr_translate | show_hide

存储内容: 快捷键字符串
格式: Modifier+Key (Tauri global_shortcut_manager 格式)
示例: "Ctrl+Shift+T", "Alt+A", "Super+F"

Modifier 支持:
  Ctrl  (所有平台)
  Alt   (所有平台)  
  Shift (所有平台)
  Super (Windows: Win, macOS: Cmd, Linux: Meta)
  
Key 支持:
  字母: A-Z
  数字: 0-9
  功能键: F1-F12
  特殊键: Space, Tab, Escape, Enter
```

### 默认快捷键选择原则

```
Ctrl+Shift+T (划词翻译): 
  不与任何主流软件冲突，T=Translate 易记
  
Ctrl+Shift+F (输入翻译):
  F=Find/Free，区别于划词翻译

Ctrl+Shift+O (截图 OCR):
  O=OCR，不与系统截图快捷键冲突

Ctrl+Shift+S (截图翻译):
  S=Scan/Screenshot，注意不与保存快捷键冲突 (保存是 Ctrl+S，这里多 Shift)

Ctrl+Shift+P (显示/隐藏):
  P=Panel/Pot，切换显示状态
```

> **选择 Ctrl+Shift 组合而非 Ctrl+Alt 的原因**：Ctrl+Alt 在许多非英文键盘布局中用于 AltGr（输入特殊字符），会导致快捷键无法触发。


## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-注册 | 快捷键被其他应用占用 | 前端冲突检测 → 红色高亮 + 提示 | 用户修改快捷键 | "快捷键 [Ctrl+Shift+T] 已被占用" |
| L1-注册 | 快捷键格式无效 (如单字母) | 前端校验 + 拒绝 | 用户修改为合法格式 | "快捷键必须包含修饰键 (Ctrl/Alt/Shift/Super)" |
| L2-更新 | 全量重注册失败 (平台 API 返回错误) | 保留旧快捷键注册 (不回滚) + 日志 | 用户重试 | "快捷键更新失败，请重试" |
| L2-更新 | 单个快捷键注销失败 | 忽略该错误 + 继续注册其他快捷键 | 自动跳过 | 无感知（仅日志） |
| L3-录制 | 前端录制到非法按键 (如仅修饰键) | 自动过滤 + 等待完整组合键 | 用户释放按键 | 不展示 (等待中) |
| L3-录制 | 修饰键 + Tab (Tab 用于切换焦点) | e.preventDefault() 阻止默认行为 | 正常录制 | 键盘焦点不变 |
| L4-平台 | Wayland 不支持全局快捷键 | 日志警告 + 托盘菜单降级 | 用户编辑 compositor 配置 | "Wayland 下部分快捷键可能不可用，请使用托盘菜单" |

### 冲突检测实现

```javascript
// 前端冲突检测
function checkConflict(newShortcut, exceptAction) {
  const allShortcuts = {
    "hotkey_selection_translate": getConfig("hotkey_selection_translate"),
    "hotkey_input_translate": getConfig("hotkey_input_translate"),
    "hotkey_ocr_recognize": getConfig("hotkey_ocr_recognize"),
    "hotkey_ocr_translate": getConfig("hotkey_ocr_translate"),
    "hotkey_show_hide": getConfig("hotkey_show_hide")
  };
  
  for (const [action, shortcut] of Object.entries(allShortcuts)) {
    if (action !== exceptAction && shortcut === newShortcut) {
      return { conflict: true, action, shortcut };
    }
  }
  return { conflict: false };
}
```

> **注意**：前端冲突检测仅检测与其他 Pot 快捷键的冲突，无法检测与系统/其他应用的冲突。系统级冲突由 Tauri 的 `register()` 返回 Err 捕获。


## 性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 全量更新 | unregister_all → register("all") 全量重建 | 避免逐个比较差异的复杂度 | 更新耗时 < 1ms |
| 空快捷键跳过 | 空字符串不注册 (而非注册无效快捷键) | 避免无效注册调用 | — |
| 录制 debounce | 按键事件 50ms debounce (过滤重复 keydown) | 避免同一按键多次触发 | — |
| 注册缓存 | 记录当前已注册快捷键，相同则跳过 | 避免不必要的注销/注册 | 窗口打开时不重置快捷键 |


## 跨平台实现差异

| 功能 | macOS | Windows | Linux (X11) | Linux (Wayland) |
|------|-------|---------|-------------|-----------------|
| 快捷键注册 | CGEvent (Tauri API 封装) | RegisterHotKey (Tauri API 封装) | X11 GrabKey (Tauri API 封装) | wlr-layer-shell (协议限制) |
| 系统级快捷键 | 支持 (无需额外权限) | 支持 | 支持 | 不支持 (受 compositor 策略限制) |
| Super 键 | Cmd (command) | Win 键 | Meta / Super 键 | Meta / Super 键 |
| 快捷键最大数量 | 无限制 | ~100 (系统全局限制) | 无限制 | 取决于 compositor |
| 与系统应用冲突 | 部分系统快捷键不可注册 (如 Cmd+Space) | 部分全局快捷键不可注册 | 取决于窗口管理器 | 取决于 compositor |
| 录制时按键隔离 | keydown 正常捕获 | keydown 正常捕获 | keydown 正常捕获 | keydown 正常捕获 |
| 快捷键录制器 | React onKeyDown (所有平台统一) | 同左 | 同左 | 同左 |

### Wayland 快捷键限制

```
Wayland 的全局快捷键受 compositor 策略限制:
  - GNOME (Mutter): 应用无法注册全局快捷键
  - KDE (KWin): KWin script 可注册
  - Sway (wlroots): 需在 sway config 中绑定

降级方案:
  1. Wayland 检测: 检查 $XDG_SESSION_TYPE == "wayland"
  2. 托盘菜单: 所有功能从托盘菜单可访问
  3. 用户文档: "Wayland 用户请使用托盘菜单或配置 compositor 快捷键"
```

### 前端录制器实现 (所有平台统一)

```javascript
// Hotkey/index.jsx — 快捷键录制器
const HotkeyRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [keys, setKeys] = useState(new Set());

  const onKeyDown = (e) => {
    e.preventDefault();
    const newKeys = new Set(keys);
    
    // 记录修饰键
    if (e.ctrlKey) newKeys.add("Ctrl");
    if (e.altKey) newKeys.add("Alt");
    if (e.shiftKey) newKeys.add("Shift");
    if (e.metaKey) newKeys.add("Super");
    
    // 记录主键 (非修饰键)
    if (!["Control","Alt","Shift","Meta"].includes(e.key)) {
      newKeys.add(e.key.toUpperCase());
      // 组装快捷键字符串: "Ctrl+Shift+T"
      const shortcut = [...newKeys].join("+");
      setRecording(false);
      onShortcutChange(shortcut);
    }
  };

  return <input onKeyDown={onKeyDown} value={displayShortcut} readOnly />;
};
```

**关联文档**：
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — hotkey.rs 模块 + 托盘
- [需求总览](./00-prd-task-需求总览.md) — 系统架构总览