---

doc_type: module
prd_task_id: "YP-09-S15"
title: "自动更新系统 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "26-prd-自动更新.md"

type: task
---

# 自动更新系统 — 开发方案

> 来源 PRD：[26-prd-自动更新.md](../../prds/2026-09/26-prd-自动更新.md)

## 架构概览

```
应用启动 (Tauri setup)
      │
      │  spawn 后台线程 (非阻塞)
      ▼
┌───────────────────────────────────────────────────────┐
│           Rust updater.rs (检查层)                     │
│                                                        │
│  check_update(app_handle)                              │
│    │                                                    │
│    │  1. GET https://api.github.com/repos/pot-app/     │
│    │     pot-desktop/releases/latest                   │
│    │  2. 解析 JSON → tag_name (如 "v1.2.3")           │
│    │  3. semver 比较: current < latest ?               │
│    │     ├── 否 → 无操作 (已是最新版本)                │
│    │     └── 是 → emit event "update:available"        │
│    │                                                    │
│    ▼                                                   │
└───────────────────────┬───────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│        更新窗口 (React — 独立 Tauri Window)            │
│                                                        │
│  YiPot/src/window/Updater/index.jsx                    │
│    │                                                    │
│    │  展示: 当前版本 → 最新版本                        │
│    │        更新日志 (Markdown 渲染)                   │
│    │        下载进度条                                 │
│    │                                                    │
│    │  "安装并重启" 按钮                                │
│    │    │  → invoke("install_update")                  │
│    │    ▼                                              │
└────────────────────┬──────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────────────┐
│         updater.mjs (Node.js 更新器脚本)               │
│                                                        │
│  async function update() {                             │
│    // 1. 关闭 Tauri 进程                              │
│    // 2. 下载新版本 .dmg (macOS) / .msi (Windows)     │
│    // 3. SHA256 完整性校验                             │
│    // 4. 卸载旧版本 (macOS: replace .app)              │
│    // 5. 启动新版本                                    │
│  }                                                     │
│                                                        │
│  updater-for-fix-runtime.mjs                           │
│    │  修复 macOS "damaged" 错误                        │
│    │  签名 ad-hoc code sign → 绕过 Gatekeeper         │
│    ▼                                                   │
│  新版本成功启动                                        │
└───────────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

`YiPot/src-tauri/src/updater.rs` + `YiPot/src/window/Updater/index.jsx` + `updater/updater.mjs` + `updater/updater-for-fix-runtime.mjs`

### Rust 版本检查

```rust
// updater.rs
use reqwest::Client;
use semver::Version;

pub async fn check_update(app_handle: AppHandle) -> Option<ReleaseInfo> {
    let client = Client::builder()
        .user_agent("pot-desktop")
        .timeout(Duration::from_secs(10))
        .build()
        .ok()?;

    // 请求 GitHub Release API
    let resp = client
        .get("https://api.github.com/repos/pot-app/pot-desktop/releases/latest")
        .header("Accept", "application/vnd.github.v3+json")
        .send()
        .await
        .ok()?;

    let release: serde_json::Value = resp.json().await.ok()?;
    let latest_version = release["tag_name"].as_str()?
        .trim_start_matches('v');

    // semver 比较
    let current = Version::parse(env!("CARGO_PKG_VERSION")).ok()?;
    let latest = Version::parse(latest_version).ok()?;

    if current < latest {
        // 提取各平台下载 URL
        let assets = release["assets"].as_array()?;
        let download_url = find_platform_asset(assets)?;
        let body = release["body"].as_str().unwrap_or("").to_string();
        
        let info = ReleaseInfo {
            current_version: current.to_string(),
            latest_version: latest.to_string(),
            download_url,
            changelog: body,
        };

        // 通知前端
        app_handle.emit_all("update:available", &info).ok()?;
        Some(info)
    } else {
        None  // 已是最新版本
    }
}

fn find_platform_asset(assets: &[serde_json::Value]) -> Option<String> {
    for asset in assets {
        let name = asset["name"].as_str()?;
        #[cfg(target_os = "macos")]
        if name.ends_with(".dmg") { return asset["browser_download_url"].as_str().map(String::from); }
        #[cfg(target_os = "windows")]
        if name.ends_with(".msi") || name.ends_with(".exe") { return asset["browser_download_url"].as_str().map(String::from); }
        #[cfg(target_os = "linux")]
        if name.ends_with(".AppImage") || name.ends_with(".deb") { return asset["browser_download_url"].as_str().map(String::from); }
    }
    None
}
```

### 更新器脚本

```javascript
// updater/updater.mjs
import { createWriteStream } from "fs";
import { createHash } from "crypto";
import { pipeline } from "stream/promises";
import fetch from "node-fetch";
import { execSync } from "child_process";
import { platform } from "os";

async function update(downloadUrl, expectedSha256) {
  const tmpFile = `/tmp/pot-update-${Date.now()}.${platform() === "darwin" ? "dmg" : "msi"}`;

  // 1. 下载新版本 (带进度)
  const response = await fetch(downloadUrl);
  const totalSize = parseInt(response.headers.get("content-length"), 10);
  let downloaded = 0;

  response.body.on("data", (chunk) => {
    downloaded += chunk.length;
    process.send?.({ type: "progress", percent: downloaded / totalSize });
  });

  const fileStream = createWriteStream(tmpFile);
  await pipeline(response.body, fileStream);

  // 2. SHA256 校验
  if (expectedSha256) {
    const actualHash = await sha256File(tmpFile);
    if (actualHash !== expectedSha256) {
      throw new Error(`SHA256 mismatch: expected ${expectedSha256}, got ${actualHash}`);
    }
  }

  // 3. 关闭 Tauri 进程
  process.send?.({ type: "status", text: "正在关闭应用..." });
  execSync("pkill -f pot-desktop");

  // 4. 安装新版本 (平台特定)
  if (platform() === "darwin") {
    // macOS: 挂载 DMG → 复制 .app → 弹出 DMG
    execSync(`hdiutil attach "${tmpFile}" -nobrowse`);
    execSync("cp -R /Volumes/Pot/Pot.app /Applications/Pot.app");
    execSync("hdiutil detach /Volumes/Pot");
  } else if (platform() === "win32") {
    // Windows: msiexec 静默安装
    execSync(`msiexec /i "${tmpFile}" /quiet /norestart`);
  }

  // 5. 启动新版本
  execSync("open /Applications/Pot.app");
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

export { update };
```

### 前端更新窗口

```javascript
// window/Updater/index.jsx
import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

export default function UpdaterWindow() {
  const [release, setRelease] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");  // idle | downloading | installing

  useEffect(() => {
    // 监听 Rust 端 update:available 事件
    const unlisten = listen("update:available", (event) => {
      setRelease(event.payload);
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  const handleInstall = async () => {
    setStatus("downloading");
    await invoke("install_update", { url: release.download_url });
  };

  return (
    <div>
      <h2>发现新版本 {release?.latest_version}</h2>
      <p>当前版本: {release?.current_version}</p>
      <Markdown>{release?.changelog}</Markdown>
      {status === "downloading" && <ProgressBar percent={progress} />}
      <button onClick={handleInstall} disabled={status !== "idle"}>
        {status === "idle" ? "安装并重启" : "安装中..."}
      </button>
    </div>
  );
}
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| 更新源 | GitHub Release API | 自建更新服务器 | GitHub 免费 CDN，版本管理一体化 | 依赖 GitHub 可用性（国内可能慢） |
| 更新模式 | 手动确认更新 | 静默后台更新 | 更新日志展示 + 用户确认，安全可控 | 用户需手动点击安装 |
| 检查时机 | 启动时后台检查 (非阻塞) | 定时轮询 | 不阻塞启动流程，用户几乎无感知 | 可能漏掉运行期间的更新 |
| 完整性校验 | SHA256 | MD5 | SHA256 抗碰撞性强，防止下载损坏/篡改 | 校验耗时可忽略 (文件下载后才校验) |
| macOS 签名 | ad-hoc code sign (updater-for-fix-runtime) | Apple 开发者证书签名 | 非签名应用可运行（需用户手动 Gatekeeper 放行） | 每次更新可能需重新放行 |
| 更新 UI | 独立 Tauri Window | 主窗口弹窗 | 不阻塞翻译窗口，更新过程可继续使用 | 额外窗口管理 |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 版本检查 | 不阻塞启动 | spawn tokio task 后台执行 | 启动时间不受 GitHub API 延迟影响 |
| 下载速度 | 接近带宽上限 | Node.js stream pipeline，无内存缓冲 | GBit 网络可满速下载 |
| 请求缓存 | 避免频繁 GitHub API 调用 | 一天内最多检查一次 (本地时间戳) | 反复重启不触发 API 限流 |
| GitHub Rate Limit | 不触发 403 | User-Agent + 缓存 + 无认证请求 (60 req/hr) | 60 req/hr 对桌面应用充足 |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | GitHub API 不可达 | 静默失败，不弹窗 | 下次启动重试 | 无感知 |
| L1-网络 | 下载中断/超时 | 断点续传 (记录已下载字节) | Range 请求续传 | 下载进度回退后继续 |
| L2-校验 | SHA256 不匹配 | 删除已下载文件 → 重新下载 | 自动重试 1 次 | Toast "安装包校验失败，正在重试" |
| L2-安装 | 磁盘空间不足 | 检查可用空间 → 提示清理 | 用户清理后重试 | 对话框 "磁盘空间不足" |
| L2-安装 | macOS DMG 挂载失败 | 提示用户手动下载安装 | 弹出 GitHub Release 页面链接 | 对话框 + 打开浏览器 |
| L3-权限 | macOS 无 /Applications 写入权限 | 提示手动操作 | 用户手动拖拽 .app 到 Applications | 对话框 |
| L3-进程 | pkill 失败 (进程名不匹配) | 提示用户手动关闭旧版本 | 用户手动关闭后重试 | 对话框 |

---

**关联文档**：
- 构建系统与自动更新：[09-prd-task-构建系统与自动更新.md](./09-prd-task-构建系统与自动更新.md)
- 测试方案：[26-prd-test-自动更新](../../tests/2026-09/26-prd-test-自动更新.md)