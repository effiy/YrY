use crate::config::{get, set};
use crate::window::{input_translate, ocr_recognize, ocr_translate, selection_translate};
use crate::APP;
use log::{info, warn};
use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use tauri::{AppHandle, GlobalShortcutManager};

// per-name throttle：同一热键名称 150ms 内只允许执行 1 次 handler。
// 解决 macOS 上 Tauri GlobalShortcut 在 keyDown/keyUp 各触发一次 callback
// 导致的「按一次划词翻译 = selection_translate() 跑两遍」→ 前端焦点抖动 + detect 死循环。
static HANDLER_LAST_FIRED_AT: OnceLock<Mutex<HashMap<String, u64>>> = OnceLock::new();
const HANDLER_THROTTLE_MS: u64 = 150;

fn should_fire(name: &str) -> bool {
    let now_millis = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);
    let map = HANDLER_LAST_FIRED_AT.get_or_init(|| Mutex::new(HashMap::new()));
    let mut guard = match map.lock() {
        Ok(g) => g,
        Err(_) => return true,
    };
    let last = guard.get(name).copied().unwrap_or(0);
    if now_millis.saturating_sub(last) < HANDLER_THROTTLE_MS {
        warn!(
            "Throttled global shortcut {}: last={} now={} delta<{}ms",
            name, last, now_millis, HANDLER_THROTTLE_MS
        );
        return false;
    }
    guard.insert(name.to_string(), now_millis);
    true
}

fn register<F>(app_handle: &AppHandle, name: &str, handler: F, key: &str) -> Result<(), String>
where
    F: Fn() + Send + 'static,
{
    // 同名热键：新 key 生效前必须先注销旧 key，否则会在同一个（或不同）key 上
    // 累计挂载多个 handler → 用户按 1 次热键触发 N 次 selection_translate() →
    // 重复 show/setFocus/emit(new_text) → 窗口一直闪。
    if let Some(old) = get(name).and_then(|v| v.as_str().map(|s| s.to_string())) {
        if !old.is_empty() {
            let _ = app_handle.global_shortcut_manager().unregister(old.as_str());
        }
    }
    let hotkey = {
        if key.is_empty() {
            match get(name) {
                Some(v) => v.as_str().unwrap_or("").to_string(),
                None => {
                    set(name, "");
                    String::new()
                }
            }
        } else {
            key.to_string()
        }
    };

    if !hotkey.is_empty() {
        let name_for_throttle = name.to_string();
        // 包一层：所有通过 Tauri 注册的全局热键都统一走 per-name 150ms 节流。
        // 彻底消除 macOS keyDown+keyUp 双回调与多 handler 叠加导致的「1 次按键 N 次动作」。
        let throttled = move || {
            if should_fire(&name_for_throttle) {
                handler();
            }
        };
        match app_handle
            .global_shortcut_manager()
            .register(hotkey.as_str(), throttled)
        {
            Ok(()) => {
                info!("Registered global shortcut: {} for {}", hotkey, name);
            }
            Err(e) => {
                warn!("Failed to register global shortcut: {} {:?}", hotkey, e);
                return Err(e.to_string());
            }
        };
    }
    Ok(())
}

// Register global shortcuts
pub fn register_shortcut(shortcut: &str) -> Result<(), String> {
    let app_handle = APP
        .get()
        .ok_or_else(|| "APP handle not initialized when registering shortcut".to_string())?;
    match shortcut {
        "hotkey_selection_translate" => register(
            app_handle,
            "hotkey_selection_translate",
            selection_translate,
            "",
        )?,
        "hotkey_input_translate" => {
            register(app_handle, "hotkey_input_translate", input_translate, "")?
        }
        "hotkey_ocr_recognize" => register(app_handle, "hotkey_ocr_recognize", ocr_recognize, "")?,
        "hotkey_ocr_translate" => register(app_handle, "hotkey_ocr_translate", ocr_translate, "")?,
        "all" => {
            register(
                app_handle,
                "hotkey_selection_translate",
                selection_translate,
                "",
            )?;
            register(app_handle, "hotkey_input_translate", input_translate, "")?;
            register(app_handle, "hotkey_ocr_recognize", ocr_recognize, "")?;
            register(app_handle, "hotkey_ocr_translate", ocr_translate, "")?;
        }
        _ => {}
    }
    Ok(())
}

#[tauri::command]
pub fn register_shortcut_by_frontend(name: &str, shortcut: &str) -> Result<(), String> {
    let app_handle = APP
        .get()
        .ok_or_else(|| "APP handle not initialized when registering shortcut from FE".to_string())?;
    match name {
        "hotkey_selection_translate" => register(
            app_handle,
            "hotkey_selection_translate",
            selection_translate,
            shortcut,
        )?,
        "hotkey_input_translate" => register(
            app_handle,
            "hotkey_input_translate",
            input_translate,
            shortcut,
        )?,
        "hotkey_ocr_recognize" => {
            register(app_handle, "hotkey_ocr_recognize", ocr_recognize, shortcut)?
        }
        "hotkey_ocr_translate" => {
            register(app_handle, "hotkey_ocr_translate", ocr_translate, shortcut)?
        }
        _ => {}
    }
    Ok(())
}
