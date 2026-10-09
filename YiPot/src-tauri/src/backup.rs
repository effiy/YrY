//! 备份/恢复：webdav / 本地文件 / 阿里云 OSS（PUT 签名）三种后端。
//! 核心复用：pack_archive / unpack_archive，消除旧版三份重复的 zip 打包代码。

use crate::error::Error;
use dirs::config_dir;
use log::info;
use reqwest_dav::{Auth, ClientBuilder, Depth};
use std::io::Write;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use zip::read::ZipArchive;
use zip::write::SimpleFileOptions;

const BUNDLE_ID: &str = "com.yipot.desktop";
const ARCHIVE_NAME: &str = "archive.zip";

fn yipot_config_dir() -> Result<PathBuf, Error> {
    let base = config_dir().ok_or_else(|| Error::Backup("Unable to resolve OS config directory".into()))?;
    Ok(base.join(BUNDLE_ID))
}

/// 打包 3 份核心资产 → zip_path：
///   - config.json
///   - history.db（若存在）
///   - plugins/**（若存在）
fn pack_archive(zip_path: &Path) -> Result<(), Error> {
    let config_dir_path = yipot_config_dir()?;
    let config_path = config_dir_path.join("config.json");
    let database_path = config_dir_path.join("history.db");
    let plugin_path = config_dir_path.join("plugins");

    let file = std::fs::File::create(zip_path)?;
    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

    // 1) config.json（必须）
    zip.start_file("config.json", options)?;
    zip.write_all(&std::fs::read(&config_path)?)?;

    // 2) history.db（可选）
    if database_path.exists() {
        zip.start_file("history.db", options)?;
        zip.write_all(&std::fs::read(&database_path)?)?;
    }

    // 3) plugins 目录
    if plugin_path.exists() {
        for entry in WalkDir::new(&plugin_path) {
            let entry = entry?;
            let path = entry.path();
            if !path.is_file() {
                continue;
            }
            let relative = path
                .strip_prefix(&config_dir_path)
                .map_err(|_| Error::Backup("failed to strip prefix for plugin file".into()))?;
            let Some(name) = relative.to_str() else {
                return Err(Error::Backup("non-utf8 path in plugins dir".into()));
            };
            info!("backup add: {name}");
            zip.start_file(name, options)?;
            zip.write_all(&std::fs::read(path)?)?;
        }
    }

    zip.finish()?;
    Ok(())
}

/// 解压到 config_dir_path（覆盖）
fn unpack_archive(zip_path: &Path, dest_dir: &Path) -> Result<(), Error> {
    let file = std::fs::File::open(zip_path)?;
    let mut zip = ZipArchive::new(file)?;
    zip.extract(dest_dir)?;
    Ok(())
}

/// 临时归档：先在本地 pack → 调用 f(body: Vec<u8>) 上传
async fn with_packed_bytes<F, Fut>(f: F) -> Result<String, Error>
where
    F: FnOnce(Vec<u8>) -> Fut,
    Fut: std::future::Future<Output = Result<(), Error>>,
{
    let dest = yipot_config_dir()?.join(ARCHIVE_NAME);
    pack_archive(&dest)?;
    let bytes = std::fs::read(&dest)?;
    let _ = std::fs::remove_file(&dest);
    f(bytes).await?;
    Ok(String::new())
}

// ---------------------------------------------------------------------------
// WebDAV 后端
// ---------------------------------------------------------------------------

fn build_dav_clients(url: &str, username: &str, password: &str) -> Result<(reqwest_dav::Client, reqwest_dav::Client), Error> {
    let base = ClientBuilder::new()
        .set_host(url.to_string())
        .set_auth(Auth::Basic(username.to_string(), password.to_string()))
        .build()?;
    let trimmed = url.trim_end_matches('/').to_string();
    let sub = ClientBuilder::new()
        .set_host(format!("{trimmed}/yipot"))
        .set_auth(Auth::Basic(username.to_string(), password.to_string()))
        .build()?;
    Ok((base, sub))
}

#[tauri::command(async)]
pub async fn webdav(
    operate: &str,
    url: String,
    username: String,
    password: String,
    name: Option<String>,
) -> Result<String, Error> {
    let (base_client, sub_client) = build_dav_clients(&url, &username, &password)?;
    // 幂等：确保 /yipot 目录存在
    let _ = base_client.mkcol("/yipot").await;

    match operate {
        "list" => {
            let res = sub_client.list("/", Depth::Number(1)).await?;
            return Ok(serde_json::to_string(&res)?);
        }
        "get" => {
            let file_name = name.ok_or_else(|| Error::Backup("missing name for webdav get".into()))?;
            let bytes = sub_client.get(&format!("/{file_name}")).await?.bytes().await?;
            let dest_dir = yipot_config_dir()?;
            let zip_path = dest_dir.join(ARCHIVE_NAME);
            std::fs::write(&zip_path, &bytes)?;
            unpack_archive(&zip_path, &dest_dir)?;
            let _ = std::fs::remove_file(&zip_path);
            Ok(String::new())
        }
        "put" => {
            let file_name = name.ok_or_else(|| Error::Backup("missing name for webdav put".into()))?;
            with_packed_bytes(|b| async {
                sub_client
                    .put(&format!("/{file_name}"), b)
                    .await
                    .map_err(Error::WebDav)
            })
            .await
        }
        "delete" => {
            let file_name = name.ok_or_else(|| Error::Backup("missing name for webdav delete".into()))?;
            sub_client
                .delete(&format!("/{file_name}"))
                .await
                .map_err(Error::WebDav)?;
            Ok(String::new())
        }
        other => Err(Error::Backup(format!("unknown webdav operate: {other}"))),
    }
}

// ---------------------------------------------------------------------------
// 本地文件后端
// ---------------------------------------------------------------------------

#[tauri::command(async)]
pub async fn local(operate: &str, path: String) -> Result<String, Error> {
    match operate {
        "put" => {
            pack_archive(Path::new(&path))?;
            Ok(String::new())
        }
        "get" => {
            let dest_dir = yipot_config_dir()?;
            unpack_archive(Path::new(&path), &dest_dir)?;
            Ok(String::new())
        }
        other => Err(Error::Backup(format!("unknown local operate: {other}"))),
    }
}

// ---------------------------------------------------------------------------
// 阿里云 OSS（预签名 PUT/GET URL，客户端直传）
// ---------------------------------------------------------------------------

#[tauri::command(async)]
pub async fn aliyun(operate: &str, path: String, url: String) -> Result<String, Error> {
    match operate {
        "put" => {
            let body = std::fs::read(&path)?;
            let _ = reqwest::Client::new().put(&url).body(body).send().await?;
            Ok(String::new())
        }
        "get" => {
            let res = reqwest::Client::new().get(&url).send().await?;
            let bytes = res.bytes().await?;
            let dest_dir = yipot_config_dir()?;
            let zip_path = dest_dir.join(ARCHIVE_NAME);
            std::fs::write(&zip_path, &bytes)?;
            unpack_archive(&zip_path, &dest_dir)?;
            let _ = std::fs::remove_file(&zip_path);
            Ok(String::new())
        }
        other => Err(Error::Backup(format!("unknown aliyun operate: {other}"))),
    }
}
