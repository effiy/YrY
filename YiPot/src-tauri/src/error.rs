//! YiPot 统一错误类型。
//! 约束：
//!   - 所有 Tauri command 返回 `Result<T, Error>`，前端能通过序列化后的字符串拿到明确原因
//!   - 禁止在调用链上直接 `unwrap` / `expect`：失败情况要么用 `?` 传播成语义错误，要么记 `warn!` 并兜底
//!   - 区分「用户操作错误」「环境错误」「插件错误」「配置错误」，未来可在 UI 层分别提示

use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    // ---------- 底层通用错误 ----------
    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Serde(#[from] serde_json::Error),

    #[error(transparent)]
    Reqwest(#[from] reqwest::Error),

    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error(transparent)]
    StripPrefix(#[from] std::path::StripPrefixError),

    #[error(transparent)]
    Zip(#[from] zip::result::ZipError),

    #[error(transparent)]
    WalkDir(#[from] walkdir::Error),

    #[error(transparent)]
    Arboard(#[from] arboard::Error),

    #[error(transparent)]
    Image(#[from] image::ImageError),

    #[error(transparent)]
    FontSelection(#[from] font_kit::error::SelectionError),

    // ---------- 三方库特定错误 ----------
    #[error("webdav protocol error: {0}")]
    WebDav(#[from] reqwest_dav::Error),

    #[error("webdav transport error: {0}")]
    WebDavHttp(#[from] reqwest_dav::re_exports::reqwest::Error),

    // ---------- 语义化业务错误 ----------
    #[allow(dead_code)]
    #[error("config: {0}")]
    Config(String),

    #[error("plugin: {0}")]
    Plugin(String),

    #[error("backup: {0}")]
    Backup(String),

    #[allow(dead_code)]
    #[error("hotkey: {0}")]
    Hotkey(String),

    /// 兜底「其他类型」，给无法分类的字符串错误使用
    #[error("{0}")]
    Other(String),
}

impl From<Box<dyn std::error::Error + Send + Sync>> for Error {
    fn from(e: Box<dyn std::error::Error + Send + Sync>) -> Self {
        Self::Other(e.to_string())
    }
}

/// 前端只能看到字符串错误（Tauri 的跨边界约束），所以统一序列化为错误消息。
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

/// 方便从静态字符串快速构造 Error。
impl From<&'static str> for Error {
    fn from(s: &'static str) -> Self {
        Self::Other(s.to_string())
    }
}

impl From<String> for Error {
    fn from(s: String) -> Self {
        Self::Other(s)
    }
}
