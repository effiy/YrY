use crate::clipboard::*;
use crate::config::{get, set};
use crate::window::config_window;
use crate::window::input_translate;
use crate::window::ocr_recognize;
use crate::window::ocr_translate;
use log::info;
use tauri::CustomMenuItem;
use tauri::GlobalShortcutManager;
use tauri::SystemTrayEvent;
use tauri::SystemTrayMenu;
use tauri::SystemTrayMenuItem;
use tauri::SystemTraySubmenu;
use tauri::{AppHandle, Manager};

/// Tray menu item localized labels (id → text).
/// Order of fields must match [`TRAY_MENU_ORDER`] so caller can destructure
/// positionally without a struct (avoids allocating a String per menu item
/// twice — once here, once inside tauri::CustomMenuItem).
struct TrayLabels<'a> {
    input_translate: &'a str,
    clipboard_monitor: &'a str,
    auto_copy_title: &'a str,
    copy_source: &'a str,
    copy_target: &'a str,
    copy_source_target: &'a str,
    copy_disable: &'a str,
    ocr_recognize: &'a str,
    ocr_translate: &'a str,
    config: &'a str,
    view_log: &'a str,
    restart: &'a str,
    quit: &'a str,
}

/// Stable identifier ordering for the tray menu.
/// Kept as a constant so every localized builder below produces menus with
/// identical item sequences; otherwise cross-language testing becomes very
/// painful when items appear/disappear based on locale.
const TRAY_MENU_ORDER: &[&str] = &[
    "input_translate",
    "clipboard_monitor",
    "auto_copy_submenu", // source / target / source+target / disable
    "separator_ocr",
    "ocr_recognize",
    "ocr_translate",
    "separator_config",
    "config",
    "view_log",
    "separator_power",
    "restart",
    "quit",
];

fn build_tray_menu(labels: TrayLabels) -> SystemTrayMenu {
    let _ = TRAY_MENU_ORDER; // silence unused-const lint in debug builds

    let input_translate = CustomMenuItem::new("input_translate", labels.input_translate);
    let clipboard_monitor = CustomMenuItem::new("clipboard_monitor", labels.clipboard_monitor);
    let copy_source = CustomMenuItem::new("copy_source", labels.copy_source);
    let copy_target = CustomMenuItem::new("copy_target", labels.copy_target);
    let copy_source_target = CustomMenuItem::new("copy_source_target", labels.copy_source_target);
    let copy_disable = CustomMenuItem::new("copy_disable", labels.copy_disable);
    let ocr_recognize = CustomMenuItem::new("ocr_recognize", labels.ocr_recognize);
    let ocr_translate = CustomMenuItem::new("ocr_translate", labels.ocr_translate);
    let config = CustomMenuItem::new("config", labels.config);
    let view_log = CustomMenuItem::new("view_log", labels.view_log);
    let restart = CustomMenuItem::new("restart", labels.restart);
    let quit = CustomMenuItem::new("quit", labels.quit);

    SystemTrayMenu::new()
        .add_item(input_translate)
        .add_item(clipboard_monitor)
        .add_submenu(SystemTraySubmenu::new(
            labels.auto_copy_title,
            SystemTrayMenu::new()
                .add_item(copy_source)
                .add_item(copy_target)
                .add_item(copy_source_target)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(copy_disable),
        ))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(ocr_recognize)
        .add_item(ocr_translate)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(config)
        .add_item(view_log)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(restart)
        .add_item(quit)
}

#[tauri::command]
pub fn update_tray(app_handle: tauri::AppHandle, mut language: String, mut copy_mode: String) {
    let tray_handle = app_handle.tray_handle();

    if language.is_empty() {
        language = match get("app_language") {
            Some(v) => v.as_str().unwrap_or("en").to_string(),
            None => {
                set("app_language", "en");
                "en".to_string()
            }
        };
    }
    if copy_mode.is_empty() {
        copy_mode = match get("translate_auto_copy") {
            Some(v) => v.as_str().unwrap_or("disable").to_string(),
            None => {
                set("translate_auto_copy", "disable");
                "disable".to_string()
            }
        };
    }

    info!(
        "Update tray with language: {}, copy mode: {}",
        language, copy_mode
    );
    tray_handle
        .set_menu(match language.as_str() {
            "en" => tray_menu_en(),
            "zh_cn" => tray_menu_zh_cn(),
            "zh_tw" => tray_menu_zh_tw(),
            "ja" => tray_menu_ja(),
            "ko" => tray_menu_ko(),
            "fr" => tray_menu_fr(),
            "de" => tray_menu_de(),
            "ru" => tray_menu_ru(),
            "pt_br" => tray_menu_pt_br(),
            "fa" => tray_menu_fa(),
            "uk" => tray_menu_uk(),
            _ => tray_menu_en(),
        })
        .unwrap();
    #[cfg(not(target_os = "linux"))]
    tray_handle
        .set_tooltip(&format!("YiPot {}", app_handle.package_info().version))
        .unwrap();

    let enable_clipboard_monitor = match get("clipboard_monitor") {
        Some(v) => v.as_bool().unwrap_or(false),
        None => {
            set("clipboard_monitor", false);
            false
        }
    };

    tray_handle
        .get_item("clipboard_monitor")
        .set_selected(enable_clipboard_monitor)
        .unwrap();

    match copy_mode.as_str() {
        "source" => tray_handle
            .get_item("copy_source")
            .set_selected(true)
            .unwrap(),
        "target" => tray_handle
            .get_item("copy_target")
            .set_selected(true)
            .unwrap(),
        "source_target" => tray_handle
            .get_item("copy_source_target")
            .set_selected(true)
            .unwrap(),
        "disable" => tray_handle
            .get_item("copy_disable")
            .set_selected(true)
            .unwrap(),
        _ => {}
    }
}

pub fn tray_event_handler<'a>(app: &'a AppHandle, event: SystemTrayEvent) {
    match event {
        #[cfg(target_os = "windows")]
        SystemTrayEvent::LeftClick { .. } => on_tray_click(),
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "input_translate" => on_input_translate_click(),
            "copy_source" => on_auto_copy_click(app, "source"),
            "clipboard_monitor" => on_clipboard_monitor_click(app),
            "copy_target" => on_auto_copy_click(app, "target"),
            "copy_source_target" => on_auto_copy_click(app, "source_target"),
            "copy_disable" => on_auto_copy_click(app, "disable"),
            "ocr_recognize" => on_ocr_recognize_click(),
            "ocr_translate" => on_ocr_translate_click(),
            "config" => on_config_click(),
            "view_log" => on_view_log_click(app),
            "restart" => on_restart_click(app),
            "quit" => on_quit_click(app),
            _ => {}
        },
        _ => {}
    }
}

#[cfg(target_os = "windows")]
fn on_tray_click() {
    let event = match get("tray_click_event") {
        Some(v) => v.as_str().unwrap_or("config").to_string(),
        None => {
            set("tray_click_event", "config");
            "config".to_string()
        }
    };
    match event.as_str() {
        "config" => config_window(),
        "translate" => input_translate(),
        "ocr_recognize" => ocr_recognize(),
        "ocr_translate" => ocr_translate(),
        "disable" => {}
        _ => config_window(),
    }
}

fn on_input_translate_click() {
    input_translate();
}

fn on_clipboard_monitor_click(app: &AppHandle) {
    let enable_clipboard_monitor = match get("clipboard_monitor") {
        Some(v) => v.as_bool().unwrap_or(false),
        None => {
            set("clipboard_monitor", false);
            false
        }
    };
    let current = !enable_clipboard_monitor;
    // Update Config File
    set("clipboard_monitor", current);
    // Update State and Start Monitor
    let state = app.state::<ClipboardMonitorEnableWrapper>();
    state
        .0
        .lock()
        .unwrap()
        .replace_range(.., &current.to_string());
    if current {
        start_clipboard_monitor(app.app_handle());
    }
    // Update Tray Menu Status
    app.tray_handle()
        .get_item("clipboard_monitor")
        .set_selected(current)
        .unwrap();
}

fn on_auto_copy_click(app: &AppHandle, mode: &str) {
    info!("Set copy mode to: {}", mode);
    set("translate_auto_copy", mode);
    app.emit_all("translate_auto_copy_changed", mode).unwrap();
    update_tray(app.app_handle(), "".to_string(), mode.to_string());
}

fn on_ocr_recognize_click() {
    ocr_recognize();
}

fn on_ocr_translate_click() {
    ocr_translate();
}

fn on_config_click() {
    config_window();
}

fn on_view_log_click(app: &AppHandle) {
    use tauri::api::path::app_log_dir;
    match app_log_dir(&app.config()) {
        Some(log_path) => {
            let _ = tauri::api::shell::open(&app.shell_scope(), log_path.to_str().unwrap_or("."), None);
        }
        None => {
            info!("Log directory not available on this platform.");
        }
    }
}

fn on_restart_click(app: &AppHandle) {
    info!("============== Restart App ==============");
    app.restart();
}

fn on_quit_click(app: &AppHandle) {
    let _ = app.global_shortcut_manager().unregister_all();
    info!("============== Quit App ==============");
    app.exit(0);
}

fn tray_menu_en() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "Input Translate",
        clipboard_monitor: "Clipboard Monitor",
        auto_copy_title: "Auto Copy",
        copy_source: "Source",
        copy_target: "Target",
        copy_source_target: "Source+Target",
        copy_disable: "Disable",
        ocr_recognize: "OCR Recognize",
        ocr_translate: "OCR Translate",
        config: "Config",
        view_log: "View Log",
        restart: "Restart",
        quit: "Quit",
    })
}

fn tray_menu_zh_cn() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "输入翻译",
        clipboard_monitor: "监听剪切板",
        auto_copy_title: "自动复制",
        copy_source: "原文",
        copy_target: "译文",
        copy_source_target: "原文+译文",
        copy_disable: "关闭",
        ocr_recognize: "文字识别",
        ocr_translate: "截图翻译",
        config: "偏好设置",
        view_log: "查看日志",
        restart: "重启应用",
        quit: "退出",
    })
}

fn tray_menu_zh_tw() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "輸入翻譯",
        clipboard_monitor: "偵聽剪貼簿",
        auto_copy_title: "自動複製",
        copy_source: "原文",
        copy_target: "譯文",
        copy_source_target: "原文+譯文",
        copy_disable: "關閉",
        ocr_recognize: "文字識別",
        ocr_translate: "截圖翻譯",
        config: "偏好設定",
        view_log: "查看日誌",
        restart: "重啓程式",
        quit: "退出",
    })
}

fn tray_menu_ja() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "翻訳を入力",
        clipboard_monitor: "クリップボードを監視する",
        auto_copy_title: "自動コピー",
        copy_source: "原文",
        copy_target: "訳文",
        copy_source_target: "原文+訳文",
        copy_disable: "閉じる",
        ocr_recognize: "テキスト認識",
        ocr_translate: "スクリーンショットの翻訳",
        config: "プリファレンス設定",
        view_log: "ログを見る",
        restart: "アプリの再起動",
        quit: "退出する",
    })
}

fn tray_menu_ko() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "입력 번역",
        clipboard_monitor: "감청 전단판",
        auto_copy_title: "자동 복사",
        copy_source: "원문",
        copy_target: "번역문",
        copy_source_target: "원문+번역문",
        copy_disable: "닫기",
        ocr_recognize: "문자인식",
        ocr_translate: "스크린샷 번역",
        config: "기본 설정",
        view_log: "로그 보기",
        restart: "응용 프로그램 다시 시작",
        quit: "퇴출",
    })
}

fn tray_menu_fr() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "Traduction d'entrée",
        clipboard_monitor: "Surveiller le presse-papiers",
        auto_copy_title: "Copier automatiquement",
        copy_source: "Source",
        copy_target: "Cible",
        copy_source_target: "Source+Cible",
        copy_disable: "Désactiver",
        ocr_recognize: "Reconnaissance de texte",
        ocr_translate: "Traduction d'image",
        config: "Paramètres",
        view_log: "Voir le journal",
        restart: "Redémarrer l'application",
        quit: "Quitter",
    })
}

fn tray_menu_de() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "Eingabeübersetzung",
        clipboard_monitor: "Zwischenablage überwachen",
        auto_copy_title: "Automatisch kopieren",
        copy_source: "Quelle",
        copy_target: "Ziel",
        copy_source_target: "Quelle+Ziel",
        copy_disable: "Deaktivieren",
        ocr_recognize: "Texterkennung",
        ocr_translate: "Bildübersetzung",
        config: "Einstellungen",
        view_log: "Protokoll anzeigen",
        restart: "Anwendung neu starten",
        quit: "Beenden",
    })
}

fn tray_menu_ru() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "Ввод перевода",
        clipboard_monitor: "Следить за буфером обмена",
        auto_copy_title: "Автоматическое копирование",
        copy_source: "Источник",
        copy_target: "Цель",
        copy_source_target: "Источник+Цель",
        copy_disable: "Отключить",
        ocr_recognize: "Распознавание текста",
        ocr_translate: "Перевод изображения",
        config: "Настройки",
        view_log: "Просмотр журнала",
        restart: "Перезапустить приложение",
        quit: "Выход",
    })
}

fn tray_menu_fa() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "متن",
        clipboard_monitor: "گوش دادن به تخته برش",
        auto_copy_title: "کپی خودکار",
        copy_source: "منبع",
        copy_target: "هدف",
        copy_source_target: "منبع + هدف",
        copy_disable: "متن",
        ocr_recognize: "تشخیص متن",
        ocr_translate: "ترجمه عکس",
        config: "تنظیمات ترجیح",
        view_log: "مشاهده گزارشات",
        restart: "راه‌اندازی مجدد برنامه",
        quit: "خروج",
    })
}

fn tray_menu_pt_br() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "Traduzir Entrada",
        clipboard_monitor: "Monitorando a área de transferência",
        auto_copy_title: "Copiar Automaticamente",
        copy_source: "Origem",
        copy_target: "Destino",
        copy_source_target: "Origem+Destino",
        copy_disable: "Desabilitar",
        ocr_recognize: "Reconhecimento de Texto",
        ocr_translate: "Tradução de Imagem",
        config: "Configurações",
        view_log: "Exibir Registro",
        restart: "Reiniciar aplicativo",
        quit: "Sair",
    })
}

fn tray_menu_uk() -> tauri::SystemTrayMenu {
    build_tray_menu(TrayLabels {
        input_translate: "Введення перекладу",
        clipboard_monitor: "Стежити за буфером обміну",
        auto_copy_title: "Автоматичне копіювання",
        copy_source: "Джерело",
        copy_target: "Мета",
        copy_source_target: "Джерело+Мета",
        copy_disable: "Відключивши",
        ocr_recognize: "Розпізнавання тексту",
        ocr_translate: "Переклад зображення",
        config: "Настройка",
        view_log: "Перегляд журналу",
        restart: "Перезапустити додаток",
        quit: "Вихід",
    })
}
