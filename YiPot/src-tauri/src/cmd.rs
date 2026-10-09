use crate::config::{self, StoreWrapper};
use crate::error::Error;
use crate::StringWrapper;
use crate::APP;
use log::{error, info, warn};
use serde_json::Value;
use tauri::Manager;

#[tauri::command]
pub fn get_text(state: tauri::State<StringWrapper>) -> String {
    state
        .0
        .lock()
        .map(|g| g.to_string())
        .unwrap_or_default()
}

/// 前端 watch 到磁盘变化时，强制重新 load store。
#[tauri::command]
pub fn reload_store() {
    let Some(handle) = APP.get() else {
        warn!("reload_store called before APP init");
        return;
    };
    let Some(state) = handle.try_state::<StoreWrapper>() else {
        warn!("reload_store: StoreWrapper not registered");
        return;
    };
    let Ok(mut store) = state.0.lock() else {
        warn!("reload_store: mutex poisoned");
        return;
    };
    if let Err(e) = store.load() {
        warn!("reload_store failed: {e}");
    }
}

fn cache_dir_for(app_handle: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    use dirs::cache_dir;
    let mut p = cache_dir()?;
    p.push(app_handle.config().tauri.bundle.identifier.clone());
    Some(p)
}

#[tauri::command]
pub fn cut_image(left: u32, top: u32, width: u32, height: u32, app_handle: tauri::AppHandle) {
    use image::GenericImageView;
    info!("cut_image: {}x{}+{}+{}", width, height, left, top);
    let Some(mut path) = cache_dir_for(&app_handle) else {
        warn!("cut_image: unable to resolve cache dir");
        return;
    };
    path.push("pot_screenshot.png");
    if !path.exists() {
        return;
    }
    let Ok(mut img) = image::open(&path) else {
        error!("cut_image: failed to open {:?}", path);
        return;
    };
    // 边界保护：防止 OOB 导致 panic
    let (img_w, img_h) = img.dimensions();
    let left = left.min(img_w.saturating_sub(1));
    let top = top.min(img_h.saturating_sub(1));
    let width = width.min(img_w.saturating_sub(left));
    let height = height.min(img_h.saturating_sub(top));
    if width == 0 || height == 0 {
        warn!("cut_image: resulting rect is empty");
        return;
    }
    let sub = img.crop(left, top, width, height);
    let mut out = path.clone();
    out.pop();
    out.push("yipot_screenshot_cut.png");
    if let Err(e) = sub.save(&out) {
        error!("cut_image save {:?} failed: {}", out, e);
    }
}

#[tauri::command]
pub fn get_base64(app_handle: tauri::AppHandle) -> String {
    use base64::{engine::general_purpose, Engine as _};
    use std::io::Read;

    let Some(mut path) = cache_dir_for(&app_handle) else {
        return String::new();
    };
    path.push("yipot_screenshot_cut.png");
    if !path.exists() {
        return String::new();
    }
    let Ok(mut file) = std::fs::File::open(path) else {
        return String::new();
    };
    let mut buf = Vec::new();
    if let Err(e) = file.read_to_end(&mut buf) {
        error!("get_base64 read failed: {e}");
        return String::new();
    }
    general_purpose::STANDARD.encode(&buf).replace("\r\n", "")
}

#[tauri::command]
pub fn copy_img(app_handle: tauri::AppHandle, width: usize, height: usize) -> Result<(), Error> {
    use arboard::{Clipboard, ImageData};
    use dirs::cache_dir;
    use image::ImageReader;
    use std::borrow::Cow;

    let mut cache = cache_dir().ok_or_else(|| Error::Other("Unable to resolve OS cache dir".into()))?;
    cache.push(app_handle.config().tauri.bundle.identifier.clone());
    cache.push("yipot_screenshot_cut.png");
    let data = ImageReader::open(&cache)?.decode()?;
    let img = ImageData { width, height, bytes: Cow::from(data.as_bytes()) };
    Clipboard::new()?.set_image(img)?;
    Ok(())
}

/// 设置进程级代理（reqwest / tauri 内部 HTTP 客户端会读 env）。
/// 返回 Ok(false) 表示配置缺失（调用方可决定是否 fallback），
/// Err 表示其他环境问题。
#[tauri::command]
pub fn set_proxy() -> Result<bool, Error> {
    fn as_str(v: &Value) -> Option<String> {
        v.as_str().map(|s| s.to_string())
    }
    let host = config::get("proxy_host").and_then(|v| as_str(&v));
    let port = config::get("proxy_port").and_then(|v| v.as_i64());
    let no_proxy = config::get("no_proxy").and_then(|v| as_str(&v));
    let (Some(host), Some(port), Some(no_proxy)) = (host, port, no_proxy) else {
        return Ok(false);
    };
    let proxy = format!("http://{host}:{port}");
    std::env::set_var("http_proxy", &proxy);
    std::env::set_var("https_proxy", &proxy);
    std::env::set_var("all_proxy", &proxy);
    std::env::set_var("no_proxy", &no_proxy);
    info!("proxy enabled via env: {proxy}");
    Ok(true)
}

/// 取消进程级代理（set_proxy 的逆操作）。
#[tauri::command]
pub fn unset_proxy() -> Result<(), Error> {
    for k in ["http_proxy", "https_proxy", "all_proxy", "no_proxy"] {
        std::env::remove_var(k);
    }
    info!("proxy env removed");
    Ok(())
}

// ---------------------------------------------------------------------------
// run_binary：在外部二进制目录中查找插件自带的可执行文件并运行
// ---------------------------------------------------------------------------

#[tauri::command(async)]
pub async fn run_binary(
    app_handle: tauri::AppHandle,
    plugin_type: String,
    plugin_name: String,
    cmd_name: String,
    args: Vec<String>,
) -> Result<String, Error> {
    use crate::config;
    use std::process::Command;

    let Some(root) = config::app_config_root_global() else {
        return Err(Error::Plugin("app config dir unavailable".into()));
    };
    let plugin_dir = root.join("plugins").join(&plugin_type).join(&plugin_name);

    // 约定：binaries/ 下以 cmd_name 命名的可执行（+ .exe / 平台后缀）
    let candidates = [
        plugin_dir.join("binaries").join(&cmd_name),
        plugin_dir.join("binaries").join(format!("{cmd_name}.exe")),
        plugin_dir.join(&cmd_name),
        plugin_dir.join(format!("{cmd_name}.exe")),
    ];
    let binary = candidates
        .iter()
        .find(|p| p.exists())
        .ok_or_else(|| Error::Plugin(format!("binary {cmd_name} not found under {plugin_dir:?}")))?;

    let output = Command::new(binary)
        .args(&args)
        .output()
        .map_err(|e| Error::Plugin(format!("run_binary exec failed: {e}")))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(Error::Plugin(format!(
            "binary {cmd_name} exit={}: {stderr}",
            output.status
        )));
    }
    // 触发一次 app_handle 使用：保留未来需要时扩展
    let _ = app_handle;
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

// ---------------------------------------------------------------------------
// open_devtools：为前端 dev_mode 下的 F12 提供统一入口
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn open_devtools(app_handle: tauri::AppHandle) {
    let window = app_handle
        .get_focused_window()
        .or_else(|| app_handle.windows().into_values().next());
    let Some(window) = window else {
        warn!("open_devtools: no window available");
        return;
    };
    #[cfg(debug_assertions)]
    {
        window.open_devtools();
    }
    #[cfg(not(debug_assertions))]
    {
        let _ = window;
    }
}

// ---------------------------------------------------------------------------
// install_plugin：从本地 .potext 解压安装到 plugins/<type>/<name>/
// ---------------------------------------------------------------------------

#[tauri::command(async)]
pub async fn install_plugin(path_list: Vec<String>) -> Result<usize, Error> {
    use crate::config;
    use std::io::Read;
    use zip::ZipArchive;

    let Some(root) = config::app_config_root_global() else {
        return Err(Error::Plugin("app config dir unavailable".into()));
    };
    let plugins_root = root.join("plugins");
    std::fs::create_dir_all(&plugins_root)?;

    let mut installed = 0usize;
    for path in &path_list {
        let file = match std::fs::File::open(path) {
            Ok(f) => f,
            Err(e) => {
                warn!("install_plugin open {path} failed: {e}");
                continue;
            }
        };
        let mut zip = match ZipArchive::new(file) {
            Ok(z) => z,
            Err(e) => {
                warn!("install_plugin invalid zip {path}: {e}");
                continue;
            }
        };

        // 读取 info.json / package.json，取 type 和 name（找不到则用目录名）
        let mut ptype: Option<String> = None;
        let mut pname: Option<String> = None;
        for i in 0..zip.len() {
            let Ok(mut entry) = zip.by_index(i) else { continue };
            let name = entry.name().replace('\\', "/");
            let basename = name.rsplit('/').next().unwrap_or("");
            if basename != "info.json" && basename != "package.json" {
                continue;
            }
            let mut buf = String::new();
            let _ = entry.read_to_string(&mut buf);
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&buf) {
                ptype = v
                    .get("type")
                    .and_then(|s| s.as_str())
                    .map(|s| s.to_string())
                    .or(ptype);
                pname = v
                    .get("name")
                    .and_then(|s| s.as_str())
                    .map(|s| s.to_string())
                    .or(pname);
            }
        }

        let ptype = ptype.unwrap_or_else(|| "translate".to_string());
        let pname = pname.unwrap_or_else(|| {
            std::path::Path::new(path)
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("plugin")
                .to_string()
        });
        // 强制 plugin 前缀：与 get_plugin_list 清理逻辑保持一致
        let safe_name = if pname.starts_with("plugin") { pname } else { format!("plugin_{pname}") };
        let dest = plugins_root.join(&ptype).join(&safe_name);
        let _ = std::fs::remove_dir_all(&dest);
        std::fs::create_dir_all(&dest)?;

        if let Err(e) = zip.extract(&dest) {
            warn!("install_plugin extract {path} failed: {e}");
            continue;
        }
        installed += 1;
        info!("installed plugin {ptype}/{safe_name} from {path}");
    }
    Ok(installed)
}

// ---------------------------------------------------------------------------
// font_list：通过 font-kit 枚举系统字体，返回家族名去重列表
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn font_list() -> Result<Vec<String>, Error> {
    use font_kit::family_name::FamilyName;
    use font_kit::source::SystemSource;
    use std::collections::BTreeSet;

    let source = SystemSource::new();
    let families = source.all_families().unwrap_or_default();
    let mut set: BTreeSet<String> = BTreeSet::new();
    for name in families {
        set.insert(name);
    }
    // 保证默认值存在（与前端 useConfig 默认值对齐）
    set.insert("sans-serif".to_string());
    set.insert("serif".to_string());
    set.insert("monospace".to_string());
    // 兜底：如果 font-kit 拿不到字体，至少给 3 个通用族 + 常见几个
    if set.len() <= 3 {
        for extra in [
            "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimHei",
            "Arial", "Helvetica Neue", "Segoe UI", "Noto Sans CJK SC",
        ] {
            set.insert(extra.to_string());
        }
    }
    // FamilyName 避免未使用警告
    let _ = FamilyName::SansSerif;
    Ok(set.into_iter().collect())
}

