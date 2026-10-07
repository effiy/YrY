---

doc_type: module
prd_task_id: "YP-09-S05"
title: "截图与选区交互 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 2
source_prd: "16-prd-截图与选区.md"

type: task
---

# 截图与选区交互 — 开发方案

> 来源 PRD：[16-prd-截图与选区.md](../../prds/2026-09/16-prd-截图与选区.md)
> 需求编号：YP-09-S05 · 优先级：P0 · 人天：2d

> **文档职责**：本文档定义截图窗口（macOS screencapture + Win/Linux Canvas）的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、双模式截图架构

```
截图触发 (OCR/翻译快捷键 or 托盘)
    │
    ├── macOS → screencapture -i (系统原生)
    │   └── 保存 PNG 到临时路径 → read back → base64
    │
    └── Win/Linux → 自定义 Canvas 窗口
        ├── 全屏截图 (Rust screenshot crate)
        ├── Canvas 选区组件
        ├── 裁剪选区 → PNG bytes
        └── 转 base64
```

### 1.1 macOS: screencapture 系统调用

```rust
// screenshot.rs — macOS 原生截图
#[cfg(target_os = "macos")]
#[tauri::command]
fn capture_macos() -> Result<Vec<u8>, String> {
    let temp_dir = std::env::temp_dir();
    let path = temp_dir.join(format!("yipot_screenshot_{}.png", chrono::Utc::now().timestamp()));
    
    // 调用系统 screencapture 命令
    let output = std::process::Command::new("/usr/sbin/screencapture")
        .arg("-i")       // 交互模式 (手动框选)
        .arg("-r")       // 不播放快门音效
        .arg("-x")       // 不播放快门音效 (备用)
        .arg(path.to_str().unwrap())
        .output()
        .map_err(|e| format!("screencapture 执行失败: {e}"))?;
    
    if !output.status.success() {
        // 用户取消 (Esc) 返回 exit code 1
        return Err("用户取消截图".into());
    }
    
    // 读取截图文件
    let bytes = std::fs::read(&path)
        .map_err(|e| format!("读取截图文件失败: {e}"))?;
    
    // 清理临时文件
    std::fs::remove_file(&path).ok();
    
    Ok(bytes)
}
```

**决策理由**：macOS 的 `screencapture -i` 是系统级原生工具，提供完整的手势操作（Space 切换窗口截图、Option 修改选区锚点、Shift 锁定方向），体验远超自行实现。

### 1.2 Win/Linux: 自定义 Canvas 截图窗口

```rust
// 创建全屏截图窗口
#[cfg(not(target_os = "macos"))]
pub fn create_screenshot_window(app: &AppHandle) {
    tauri::WindowBuilder::new(app, "screenshot", tauri::WindowUrl::App("screenshot.html".into()))
        .fullscreen(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .build()
        .unwrap();
}
```

**React Canvas 选区组件**：

```typescript
// Screenshot/index.jsx — 核心 Canvas 交互
function ScreenshotCanvas({ onComplete, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selecting, setSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [confirmed, setConfirmed] = useState(false);

  // 初始化: 捕获全屏画面
  useEffect(() => {
    invoke<Uint8Array>('capture_screen_full').then(bytes => {
      const ctx = canvasRef.current!.getContext('2d')!;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        // 叠加半透明暗色蒙版
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      };
      img.src = URL.createObjectURL(new Blob([bytes]));
    });
  }, []);

  // 选区绘制逻辑
  const drawSelection = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    // 重新绘制底层 (保留截图 + 蒙版)
    redrawBase(ctx);
    
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);
    
    // 清空选区区域 (显示原图亮度)
    ctx.clearRect(x, y, w, h);
    
    // 选区边框
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    // 尺寸标注
    const label = `${w} × ${h}`;
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(label, x + 8, y - 8);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selecting) return;
    setCurrentPos({ x: e.clientX, y: e.clientY });
    drawSelection();
  };

  const handleMouseUp = () => {
    setSelecting(false);
    setConfirmed(true);
  };

  const confirmSelection = async () => {
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);
    
    if (w < 10 || h < 10) {
      onCancel(); // 选区过小
      return;
    }
    
    // 裁剪选区
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = w;
    cropCanvas.height = h;
    const cropCtx = cropCanvas.getContext('2d')!;
    cropCtx.drawImage(canvasRef.current!, x, y, w, h, 0, 0, w, h);
    
    // 导出为 PNG → base64
    const base64 = cropCanvas.toDataURL('image/png');
    onComplete(base64);
  };

  // 键盘事件
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && confirmed) confirmSelection();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [confirmed, startPos, currentPos]);

  return (
    <canvas
      ref={canvasRef}
      width={window.screen.width}
      height={window.screen.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: 'crosshair' }}
    />
  );
}
```

---

## 二、全屏截图获取 (Rust 侧)

```rust
// 非 macOS 平台: 使用 screenshots crate 获取全屏画面
#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn capture_screen_full() -> Result<Vec<u8>, String> {
    use screenshots::Screen;
    
    let screens = Screen::all()
        .map_err(|e| format!("获取屏幕信息失败: {e}"))?;
    
    // 多显示器: 返回最后一个屏幕 (主屏) 的截图
    // 后续可能扩展为返回所有屏幕的复合图像
    let screen = screens.first()
        .ok_or("未检测到显示器")?;
    
    let image = screen.capture()
        .map_err(|e| format!("截图失败: {e}"))?;
    
    // 编码为 PNG
    let mut png_bytes = Vec::new();
    image.write_to(&mut std::io::Cursor::new(&mut png_bytes), image::ImageFormat::Png)
        .map_err(|e| format!("PNG 编码失败: {e}"))?;
    
    Ok(png_bytes)
}
```

---

## 三、图片处理管线

### 3.1 预处理

```typescript
// imageProcessor.ts — 截图后处理
async function preprocessScreenshot(
  imageBase64: string,
  options: { maxWidth?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidth = 2048, quality = 0.8 } = options;
  
  const img = await loadImage(imageBase64);
  
  // 缩放 (如果超过最大宽度)
  if (img.width > maxWidth) {
    return resizeImage(img, { width: maxWidth, quality });
  }
  
  return imageBase64;
}
```

### 3.2 多显示器支持

```typescript
// 多显示器: Canvas 覆盖所有显示器
function getTotalScreenBounds(): { width: number; height: number; x: number; y: number } {
  // 使用 window.screen API (Tauri 环境下可用)
  const screens = window.screen; // 已通过 Tauri 扩展
  // ...计算所有屏幕的总边界
}
```

---

## 四、设计决策

| 决策 | 理由 |
|------|------|
| macOS 使用 screencapture 而非自行实现 | 系统原生的手势/窗口截图/选区锚点操作体验极好, 重新实现成本高且效果差 |
| Canvas 而非 DOM 绘制选区 | Canvas 对逐像素操作更高效; 选区清空 (clearRect) 无需操作 DOM 元素 |
| 选区限制 ≥ 10x10px | 防止误触产生过小选区; 极小的区域通常无有效文字 |
| PNG 编码 ≤ 100ms 目标 | 使用 Rust side 的 `image` crate 原生编码, 避免 JS 端编码的性能瓶颈 |
| 临时文件即时清理 | 隐私: 截图临时文件不残留; 异常情况由系统 tmp 目录自动回收 |

---

## 五、错误处理

| 错误 | 处理 |
|------|------|
| macOS screencapture 失败 (权限不足) | 提示"需要屏幕录制权限", 引导系统偏好设置 |
| macOS screencapture 返回非 0 (用户取消) | 静默处理, 不创建 OCR/翻译窗口 |
| 截图区域 < 10x10px | 取消操作, 不创建窗口 |
| 截图 PNG 编码失败 | 日志记录, 提示"截图保存失败" |
| PNG → base64 超 10MB | 自动缩放至 2048px 宽 + JPEG 质量 60% |
| 多显示器识别异常 | fallback 到主显示器 |

---

## 六、性能指标

| 操作 | 目标 | 测量 |
|------|------|------|
| macOS screencapture 到 PNG 就绪 | ≤ 100ms | 从调用到文件读取完毕 |
| Win/Linux 全屏截图 PNG 编码 | ≤ 100ms | screenshots crate 计时 |
| Canvas 选区绘制 | 60fps | requestAnimationFrame |
| PNG 转 base64 | ≤ 50ms (1920x1080) | atob 计时 |
| 截图窗口创建到渲染完毕 | ≤ 50ms | React Profiler |

---

## 七、交叉引用

- 开发方案: [29-prd-task-OCR截图实现](./29-prd-task-OCR截图实现.md) (截图 → OCR 流水线)
- 开发方案: [25-prd-task-Rust截图OCR](./25-prd-task-Rust截图OCR.md) (Rust 侧截图实现)
- PRD: [02-prd-OCR与截图识别](../../prds/2026-09/02-prd-OCR与截图识别.md)
- PRD: [42-prd-Rust截图OCR语言检测](../../prds/2026-09/42-prd-Rust截图OCR语言检测.md)