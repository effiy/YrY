// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod backup;
mod clipboard;
mod cmd;
mod config;
mod error;
mod hotkey;
mod lang_detect;
mod screenshot;
mod server;
mod system_ocr;
mod tray;
mod window;

use backup::*;
use clipboard::*;
use cmd::*;
use config::*;
use hotkey::*;
use lang_detect::*;
use log::{error, info, warn};
use once_cell::sync::OnceCell;
use screenshot::screenshot;
use server::*;
use std::sync::Mutex;
use system_ocr::*;
use tauri::api::notification::Notification;
use tauri::Manager;
use tauri_plugin_log::LogTarget;
use tray::*;
use window::config_window;

// Global AppHandle
pub static APP: OnceCell<tauri::AppHandle> = OnceCell::new();

// Text to be translated
pub struct StringWrapper(pub Mutex<String>);

fn notify(app: &tauri::AppHandle, title: impl Into<String>, body: impl Into<String>) {
    let _ = Notification::new(app.config().tauri.bundle.identifier.clone())
        .title(title)
        .body(body)
        .icon("yipot")
        .show();
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, cwd| {
            notify(
                app,
                "The program is already running. Please do not start it again!",
                cwd,
            );
        }))
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout])
                .build(),
        )
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs_watch::init())
        .system_tray(tauri::SystemTray::new())
        .setup(|app| {
            info!("============== Start App ==============");
            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
                let trusted = macos_accessibility_client::accessibility::application_is_trusted_with_prompt();
                info!("MacOS Accessibility Trusted: {trusted}");
            }

            APP.get_or_init(|| app.handle());

            info!("Init Config Store");
            init_config(app);

            if is_first_run() {
                info!("First Run, opening config window");
                config_window();
            }

            app.manage(StringWrapper(Mutex::new("".to_string())));
            update_tray(app.app_handle(), "".to_string(), "".to_string());

            // Start HTTP server（非阻塞：失败只记 warn，不中断主流程）
            if let Err(e) = start_server() {
                warn!("start_server failed: {e}");
            }

            match register_shortcut("all") {
                Ok(()) => {}
                Err(e) => {
                    let handle = app.handle();
                    notify(
                        &handle,
                        "Failed to register global shortcut",
                        e,
                    );
                }
            }

            // 代理：proxy_enable=true 且 proxy_host 非空时才启用
            let proxy_enable = get("proxy_enable")
                .as_ref()
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            let proxy_host_nonempty = get("proxy_host")
                .as_ref()
                .and_then(|v| v.as_str())
                .map(|s| !s.is_empty())
                .unwrap_or(false);
            if proxy_enable && proxy_host_nonempty {
                if let Err(e) = set_proxy() {
                    warn!("set_proxy on startup failed: {e}");
                }
            }

            if get("translate_detect_engine")
                .as_ref()
                .and_then(|v| v.as_str())
                == Some("local")
            {
                init_lang_detect();
            }

            let clipboard_monitor = get("clipboard_monitor")
                .as_ref()
                .and_then(|v| v.as_bool())
                .unwrap_or_else(|| {
                    set("clipboard_monitor", false);
                    false
                });
            app.manage(ClipboardMonitorEnableWrapper(Mutex::new(
                clipboard_monitor.to_string(),
            )));
            start_clipboard_monitor(app.handle());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            reload_store,
            get_text,
            cut_image,
            get_base64,
            copy_img,
            system_ocr,
            set_proxy,
            unset_proxy,
            run_binary,
            open_devtools,
            register_shortcut_by_frontend,
            update_tray,
            screenshot,
            lang_detect,
            webdav,
            local,
            install_plugin,
            font_list,
            aliyun
        ])
        .on_system_tray_event(tray_event_handler)
        .build(tauri::generate_context!())
        .unwrap_or_else(|e| {
            // tauri build 失败：打到 stderr，避免 unwrap panic
            eprintln!("error while building tauri application: {e}");
            error!("tauri build failed: {e}");
            std::process::exit(1);
        })
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}
