//! 配置与全局 Store（tauri-plugin-store）。
//!
//! 关键改进：
//!   - 所有 `unwrap()` 改为 `?` / `unwrap_or_else` / `log::warn!` 兜底
//!   - 拆分 `resolve_config_dir()` 与 `resolve_bundle_id()`，避免 8 处相同的拼接逻辑
//!   - 内置服务列表用数组 + `BTreeMap` 驱动，而不是 4 份手动 `vec![]` + 4 份 if/else
//!   - `get/set` 返回 `Option` / `Result`，调用方不再假设 APP 一定存在

use crate::{error::Error, APP};
use dirs::config_dir;
use log::{info, warn};
use serde_json::{json, Value};
use std::collections::BTreeMap;
use std::sync::Mutex;
use tauri::{Manager, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

pub struct StoreWrapper(pub Mutex<Store<Wry>>);

/// 解析 AppData 根目录：`$CONFIG_DIR/$BUNDLE_ID`
fn app_config_root(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    let id = app.config().tauri.bundle.identifier.clone();
    let base = config_dir()?;
    Some(base.join(id))
}

/// 不带 AppHandle 时，从 APP 全局拿 bundle id（调用方需保证 APP 已初始化）
pub fn app_config_root_global() -> Option<std::path::PathBuf> {
    let handle = APP.get()?;
    app_config_root(handle)
}

pub fn init_config(app: &mut tauri::App) {
    let handle = app.handle();
    let Some(root) = app_config_root(&handle) else {
        warn!("Unable to resolve config dir (os config_dir returned None)");
        // 降级：用 tauri-plugin-store 默认路径
        let store = StoreBuilder::new(handle, "config.json".into()).build();
        app.manage(StoreWrapper(Mutex::new(store)));
        return;
    };
    if let Err(e) = std::fs::create_dir_all(&root) {
        warn!("Create config dir {:?} failed: {}", root, e);
    }
    let config_path = root.join("config.json");
    info!("Load config from: {:?}", config_path);
    let mut store = StoreBuilder::new(handle, config_path).build();

    match store.load() {
        Ok(_) => info!("Config loaded"),
        Err(e) => {
            warn!("Config load error: {:?}; will create fresh store", e);
        }
    }
    app.manage(StoreWrapper(Mutex::new(store)));

    if let Err(e) = check_service_available() {
        warn!("check_service_available failed: {e}");
    }
}

// ---------------------------------------------------------------------------
// 内置服务注册表（单一 source of truth）
// ---------------------------------------------------------------------------

const BUILTIN_TRANSLATE: &[&str] = &[
    "alibaba", "baidu", "baidu_field", "bing", "bing_dict", "caiyun", "cambridge_dict", "chatglm",
    "deepl", "ecdict", "lingva", "geminipro", "niutrans", "ollama", "openai", "google",
    "tencent", "transmart", "volcengine", "yandex", "youdao",
];
const BUILTIN_RECOGNIZE: &[&str] = &[
    "baidu_ocr", "baidu_accurate_ocr", "baidu_img_ocr", "iflytek_ocr", "iflytek_intsig_ocr",
    "iflytek_latex_ocr", "qrcode", "simple_latex_ocr", "system", "tencent_ocr",
    "tencent_accurate_ocr", "tencent_img_ocr", "tesseract", "volcengine_ocr",
    "volcengine_multi_lang_ocr",
];
const BUILTIN_TTS: &[&str] = &["lingva_tts"];
const BUILTIN_COLLECTION: &[&str] = &["anki", "eudic"];

/// (config_key, builtin_list, plugin_subfolder)
const SERVICE_DIMENSIONS: &[(&str, &[&str], &str)] = &[
    ("recognize_service_list", BUILTIN_RECOGNIZE, "recognize"),
    ("translate_service_list", BUILTIN_TRANSLATE, "translate"),
    ("tts_service_list", BUILTIN_TTS, "tts"),
    ("collection_service_list", BUILTIN_COLLECTION, "collection"),
];

fn is_service_available(service_token: &str, builtin: &[&str], plugin_list: &[String]) -> bool {
    let name = service_token.split('@').next().unwrap_or("");
    if name.starts_with("plugin") {
        return plugin_list.iter().any(|p| p == name);
    }
    builtin.iter().any(|b| b == &name)
}

fn check_available(list: Vec<String>, builtin: &[&str], plugin: Vec<String>, key: &str) {
    let initial = list.len();
    let mut filtered = list.clone();
    for svc in list {
        if !is_service_available(&svc, builtin, &plugin) {
            filtered.retain(|x| x != &svc);
        }
    }
    if filtered.len() != initial {
        info!("Prune invalid entries from {key}: {initial} -> {}", filtered.len());
        set(key, filtered);
    }
}

pub fn check_service_available() -> Result<(), Error> {
    let mut plugin_by_type: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for (_, _, t) in SERVICE_DIMENSIONS {
        plugin_by_type.insert((*t).to_string(), get_plugin_list(t).unwrap_or_default());
    }

    for (key, builtin_list, plugin_type) in SERVICE_DIMENSIONS {
        if let Some(raw) = get(key) {
            let list: Vec<String> = serde_json::from_value(raw)?;
            let plugins = plugin_by_type.get(*plugin_type).cloned().unwrap_or_default();
            check_available(list, builtin_list, plugins, key);
        }
    }
    Ok(())
}

pub fn get_plugin_list(plugin_type: &str) -> Option<Vec<String>> {
    let root = app_config_root_global()?;
    let plugin_dir = root.join("plugins").join(plugin_type);

    let mut list = Vec::new();
    let read_dir = std::fs::read_dir(&plugin_dir).ok()?;
    for entry in read_dir.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let Some(name) = entry.file_name().to_str().map(|s| s.to_string()) else {
            continue;
        };
        if name.starts_with("plugin") {
            list.push(name);
        } else {
            // 清理旧命名（非 plugin 前缀的目录）
            if let Err(e) = std::fs::remove_dir_all(&path) {
                warn!("Cleanup stale plugin dir {:?} failed: {}", path, e);
            }
        }
    }
    Some(list)
}

/// 获取配置项；APP 未准备好或 store 内部拿不到 → 返回 None
pub fn get(key: &str) -> Option<Value> {
    let handle = APP.get()?;
    let state = handle.try_state::<StoreWrapper>()?;
    let store = state.0.lock().ok()?;
    store.get(key).cloned()
}

/// 写入配置项；失败只记 warn。
pub fn set<T: serde::ser::Serialize>(key: &str, value: T) {
    let Some(handle) = APP.get() else {
        warn!("set({key}) called before APP init");
        return;
    };
    let Some(state) = handle.try_state::<StoreWrapper>() else {
        warn!("set({key}) store state missing");
        return;
    };
    let Ok(mut store) = state.0.lock() else {
        warn!("set({key}) store mutex poisoned");
        return;
    };
    if let Err(e) = store.insert(key.to_string(), json!(value)) {
        warn!("store.insert({key}) failed: {e}");
        return;
    }
    if let Err(e) = store.save() {
        warn!("store.save({key}) failed: {e}");
    }
}

/// 删除配置项（给前端 deleteKey 命令的对应 Rust 接口未来使用）
#[allow(dead_code)]
pub fn delete(key: &str) {
    let Some(handle) = APP.get() else { return };
    let Some(state) = handle.try_state::<StoreWrapper>() else { return };
    let Ok(mut store) = state.0.lock() else { return };
    let _ = store.delete(key.to_string());
    let _ = store.save();
}

pub fn is_first_run() -> bool {
    APP.get()
        .and_then(|h| h.try_state::<StoreWrapper>())
        .and_then(|s| {
            let guard = s.0.lock().ok()?;
            Some(guard.is_empty())
        })
        .unwrap_or(true)
}
