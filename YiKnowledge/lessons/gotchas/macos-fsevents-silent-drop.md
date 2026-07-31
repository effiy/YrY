---
title: macOS FSEvents 静默丢事件
tags: [陷阱, macOS, 文件监控, FSEvents]
category: lessons/gotchas
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# macOS FSEvents 静默丢事件

## 1. 现象

在 macOS 上用 `watchfiles`（Rust）或 `watchdog`（Python）做文件监控，**事件静默丢失**：

- 文件改了，监控没触发
- 大批量改动只触发几个
- 重启后正常几分钟，然后失效

watchfiles 文档明确说 macOS FSEvents 不可靠，但开发者常假设跨平台一致。

## 2. 根因

- macOS 文件系统事件通过 FSEvents API 提供
- FSEvents 在某些场景（多用户、网络驱动、APFS 快照、特定 macOS 版本）下不稳定
- 事件可能合并、延迟、丢弃
- 与 Linux inotify 不同，FSEvents 不是实时保证

## 3. 影响范围

- 文件同步工具（如 Rclone、Syncthing 在 Mac 上）
- 热重载开发服务器
- 知识库监控自动更新
- CI 文件变更检测

## 4. 解决方案

### 方案 1：用轮询替代（推荐）

放弃事件驱动，改用 apscheduler 周期性扫描：

```python
from apscheduler.schedulers.background import BackgroundScheduler

def scan_and_update():
    files = glob.glob("knowledge/**/*.md", recursive=True)
    for f in files:
        mtime = os.path.getmtime(f)
        if mtime > last_scan_time:
            process(f)

scheduler = BackgroundScheduler()
scheduler.add_job(scan_and_update, 'interval', seconds=30)
scheduler.start()
```

优点：稳定可靠、跨平台一致、实现简单。
缺点：延迟（30s 轮询 → 最差延迟 30s）；CPU 占用（小目录影响小）。

### 方案 2：watchfiles 的 force-polling 模式

```python
from watchfiles import watch

for changes in watch("./target", force_polling=True):
    ...
```

把底层切到轮询而非 FSEvents。性能尚可，仍是 watchfiles API。

### 方案 3：用 fsevents 库直接监听（不推荐）

复杂且不稳定，不解决问题。

## 5. 选型决策

| 场景 | 推荐 |
|---|---|
| 知识库 / 文档监控 | apscheduler 30s 轮询 |
| 开发热重载 | watchfiles force_polling |
| 大目录同步 | 定时全量对比 |
| Linux 上 | watchfiles / inotify 正常用 |

## 6. 预防措施

- 跨平台项目不要假设 FSEvents 与 inotify 等价
- 文档明确标注 macOS 的特殊性
- CI 跑 Linux，避免 macOS 不稳定影响 CI
- 关键功能加 fallback（轮询 + 事件双轨）

## 7. 类似陷阱

- Windows ReadDirectoryChangesW 也有边界（缓冲区溢出丢事件）
- 网络驱动（NFS / SMB）事件不可靠
- 容器内文件挂载事件丢失（Docker for Mac 已知问题）

## 8. 本团队落地

- YiKnowledge 监控：apscheduler 30s 轮询（替代原 watchfiles）
- 文档同步：定时全量对比 + 增量处理

## 9. 关联记忆

- 个人 memory: `project_macos_fsevents_broken.md`
- 工具：[watchfiles 文档](https://watchfiles.helpmanual.io) 明确警告 macOS 不稳定
