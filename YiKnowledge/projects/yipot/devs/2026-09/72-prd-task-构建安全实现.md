---

doc_type: module
prd_task_id: "YP-09-M13"
title: "构建发布与安全 — 开发方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 3
source_prd: "11-prd-构建发布与安全.md"

type: task
---

# 构建发布与安全 — 开发方案

> 来源 PRD：[11-prd-构建发布与安全.md](../../prds/2026-09/11-prd-构建发布与安全.md)
> 需求编号：YP-09-M13 · 优先级：P2 · 人天：3d

> **文档职责**：本文档定义三大平台构建系统、自动更新、API Key 加密、macOS 权限、代码签名的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、构建系统

### 1.1 构建栈

```
Vite 5 (前端打包) + Cargo (Rust 编译) + Tauri Bundler (平台打包)
     │                    │                        │
  package.json        Cargo.toml              tauri.conf.json
  vite.config.ts      src-tauri/              src-tauri/tauri.conf.json
```

### 1.2 tauri.conf.json 关键配置

```json
{
  "build": {
    "beforeBuildCommand": "pnpm build",
    "beforeDevCommand": "pnpm dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "YiPot",
    "version": "3.0.0"
  },
  "tauri": {
    "macOSPrivateApi": false,
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://*.baidu.com https://*.googleapis.com https://*.microsoft.com https://api.deepl.com"
    }
  },
  "plugins": {
    "autostart": {},
    "log": {},
    "store": {},
    "single-instance": {}
  }
}
```

### 1.3 平台构建产物

| 平台 | 命令 | 产物 |
|------|------|------|
| macOS | `pnpm tauri build --target universal-apple-darwin` | `.dmg` (x86 + arm64) |
| Windows | `pnpm tauri build --target x86_64-pc-windows-msvc` | `.msi` + `.exe` |
| Linux | `pnpm tauri build --target x86_64-unknown-linux-gnu` | `.deb` + `.AppImage` + `.rpm` |

---

## 二、自动更新

### 2.1 更新检查流程

```
应用启动
    │
    ▼
检查 GitHub Release API (异步, 不阻塞)
    │  GET https://api.github.com/repos/<owner>/<repo>/releases/latest
    │  header: X-GitHub-Api-Version: 2022-11-28
    ▼
比较版本号 (semver)
    ├─ 当前版本 > 最新 → 无操作
    └─ 最新 > 当前 → 显示更新窗口
         ├─ 用户点击"更新"
         │    ├─ 下载 .dmg/.msi/.AppImage
         │    ├─ 校验 SHA256
         │    └─ 启动安装器 → 关闭应用
         └─ 用户点击"稍后" → 关闭窗口
```

### 2.2 Rust 更新模块

```rust
// updater.rs
use tauri::api::process::Command;

#[tauri::command]
async fn check_update() -> Result<UpdateInfo, String> {
    let client = reqwest::Client::new();
    let release: GitHubRelease = client
        .get("https://api.github.com/repos/pot-app/pot-desktop/releases/latest")
        .header("User-Agent", "YiPot-Updater")
        .send().await?.json().await?;
    
    let current = env!("CARGO_PKG_VERSION");
    if semver::Version::parse(&release.tag_name)? > semver::Version::parse(current)? {
        Ok(UpdateInfo {
            available: true,
            version: release.tag_name,
            body: release.body,
            assets: release.assets.iter().map(|a| AssetInfo {
                name: a.name.clone(),
                download_url: a.browser_download_url.clone(),
                size: a.size,
            }).collect(),
        })
    } else {
        Ok(UpdateInfo { available: false, ..Default::default() })
    }
}

#[tauri::command]
async fn download_update(url: String, on_progress: tauri::EventHandler) -> Result<(), String> {
    // 1. 下载到临时文件 (支持断点续传)
    // 2. SHA256 校验
    // 3. 触发安装
}
```

### 2.3 更新窗口

```typescript
// Updater/index.jsx — 更新窗口 React 组件
function UpdaterWindow({ updateInfo }: Props) {
  const [progress, setProgress] = useState(0);
  
  const handleUpdate = async () => {
    const asset = selectAsset(updateInfo.assets);
    await invoke('download_update', {
      url: asset.download_url,
      onProgress: new EventHandler((p) => setProgress(p)),
    });
    // 下载完成后 Rust 侧自动触发安装
  };
  
  return (
    <div>
      <h2>发现新版本 {updateInfo.version}</h2>
      <Markdown>{updateInfo.body}</Markdown>
      <ProgressBar value={progress} />
      <Button onClick={handleUpdate}>立即更新</Button>
      <Button variant="ghost">稍后提醒</Button>
    </div>
  );
}
```

---

## 三、安全实现

### 3.1 CSP (Content Security Policy)

```json
// tauri.conf.json → tauri.security.csp
"default-src 'self'",
"script-src 'self'",              // 禁止 inline script/eval
"style-src 'self' 'unsafe-inline'", // 允许 style inline (NextUI 需要)
"connect-src 'self' 
  https://aip.baidubce.com
  https://api.deepl.com
  https://translation.googleapis.com
  https://api.cognitive.microsoft.com
  https://*.volcengineapi.com
  https://api.github.com",        // 仅允许已知翻译/OCR/更新 API
"img-src 'self' data: blob:"      // 支持截图显示
```

### 3.2 macOS 权限管理

```rust
// permissions.rs — 权限检测与引导
#[cfg(target_os = "macos")]
pub fn check_accessibility_permission() -> bool {
    // 通过 macos_accessibility_client crate 检测
    macos_accessibility_client::application_is_trusted()
}

#[cfg(target_os = "macos")]
pub fn prompt_screen_recording_permission() {
    // 引导用户: 系统偏好设置 → 安全性与隐私 → 屏幕录制
    // 打开系统偏好设置 URL
    std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture")
        .output()
        .ok();
}
```

### 3.3 隐私保护措施

| 措施 | 实现 |
|------|------|
| 翻译内容不入日志 | Rust log 层过滤 `text` 字段 |
| 本地 OCR 无数据上传 | 仅系统 API/本地库, 不发起网络请求 |
| HTTP 仅绑定 127.0.0.1 | 绑定地址硬编码, 不可配置为 0.0.0.0 |
| 剪贴板监听可随时关闭 | `clipboard_monitor` 配置开关, 默认 false |
| API Key 加密存储 | AES-256-CBC + PBKDF2 密钥派生 (见配置管理模块) |

### 3.4 macOS 代码签名与公证

```yaml
# GitHub Actions macOS 构建 job
- name: Build and Sign
  run: |
    pnpm tauri build --target universal-apple-darwin
  env:
    APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
    APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
    APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}

- name: Notarize
  run: |
    xcrun notarytool submit target/release/bundle/dmg/YiPot.dmg \
      --apple-id ${{ secrets.APPLE_ID }} \
      --team-id ${{ secrets.APPLE_TEAM_ID }} \
      --password ${{ secrets.APPLE_APP_PASSWORD }} \
      --wait
```

---

## 四、CI 构建矩阵 (GitHub Actions)

```yaml
strategy:
  matrix:
    include:
      - os: macos-latest
        target: universal-apple-darwin
        artifact: dmg
      - os: windows-latest
        target: x86_64-pc-windows-msvc
        artifact: msi
      - os: ubuntu-latest
        target: x86_64-unknown-linux-gnu
        artifact: deb
```

---

## 五、设计决策

| 决策 | 理由 |
|------|------|
| GitHub Release 作为更新源 | 免费、CDN 加速、自动生成 changelog |
| 不自动安装更新 | 用户体验: 翻译中突然关闭应用会造成数据丢失; 手动确认安全 |
| CSP 白名单方式 | 防御深度: 即使 XSS 注入也无法请求未授权域名 |
| macOS 使用 system extension 检查权限 | `macos_accessibility_client` crate 封装系统 API, 可靠 |
| Tauri 1.6 (非 2.x) | Pot-App 上游社区选型 1.6 稳定版, 兼容现有插件生态 |

---

## 六、错误处理

| 错误 | 处理 |
|------|------|
| 构建时网络错误 | CI 重试 3 次 npm/cargo 依赖下载, 使用 actions/cache 缓存 |
| macOS 公证失败 | CI 通知开发者, 阻止发布; 检查证书有效期 |
| 自动更新下载中断 | 支持断点续传, 进度持久化; 重启后从断点继续 |
| 磁盘空间不足 | 提示"磁盘空间不足, 需要 XX MB" |
| macOS 辅助功能权限撤销 | 检测并提示"权限已移除, 请重新授权" |
| Windows Defender 误报 | 提交误报到 Microsoft; 代码签名证书可降低误报率 |

---

## 七、交叉引用

- 开发方案: [29-prd-task-自动更新](./29-prd-task-自动更新.md)
- 开发方案: [35-prd-task-配置备份实现](./35-prd-task-配置备份实现.md) (API Key 加密)
- PRD: [26-prd-自动更新](../../prds/2026-09/26-prd-自动更新.md)
- PRD: [27-prd-安全加密存储](../../prds/2026-09/27-prd-安全加密存储.md)
- PRD: [49-prd-macOS平台适配](../../prds/2026-09/49-prd-macOS平台适配.md)
- PRD: [50-prd-WindowsLinux平台适配](../../prds/2026-09/50-prd-WindowsLinux平台适配.md)