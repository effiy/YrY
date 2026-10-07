---
title: "GameDay 演练：YiPot 桌面 :60828 断连自恢复 — lsof 杀 TCP 线程模拟端口占用"
aliases: [gameday-yipot-60828, yipot-port-selfheal, yipot-server-restart-gameday]
tags: [sre, incident-response, gameday, yipot, desktop, selfhealing, tiny_http]
category: sre/incident-response
created: 2026-10-07
updated: 2026-10-07
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [sre, engineer]
benefit: "YiPot 桌面端 HTTP server 在端口被占用 / 线程崩溃 30 秒内自恢复监听 :60828，否则托盘自动重开端口，避免用户划词翻译失联"
acceptance_criteria:
  - "5 大节：准备、触发、观测、期望行为、改进措施；引用 yipot server.rs:9-32 `fn start_server()` tiny_http 启动"
  - "触发方式：`lsof -i :60828` 定位线程后 `kill -9 <TCP worker PID>` 模拟端口占用崩溃"
  - "期望：HTTP 服务 30 秒内自恢复 或托盘重开端口；实际结果区"
related:
  - ../../engineer/learn/projects/yipot/01-项目-架构设计.md
  - ../../projects/yipot/prds/2026-09/62-prd-健壮性强化.md
  - ../run/004-运行-YiPot桌面集成Runbook.md
  - ../observability/014-可观测-健康检查设计.md
  - ../../projects/yiai/prds/2026-09/93-prd-自愈恢复机制.md
  - ./008-事件-GameDay演练.md
  - ./004-事件-响应事件.md
  - ../QUICKREF.md
---

# GameDay 演练：YiPot 桌面 :60828 断连自恢复 — lsof 杀 TCP 线程模拟端口占用

> **适用场景**：YiPot 发布前回归 / 每季度桌面健壮性 GameDay / 用户反馈"翻译突然没反应"。
>
> **源码引用**：`yipot/src-tauri/src/server.rs:9-32`
> ```rust
> pub fn start_server(port: u16) -> Result<ServerHandle, Box<dyn Error>> {
>   let server = tiny_http::Server::http(("127.0.0.1", port))
>     .map_err(|e| format!("tiny_http bind :{port} failed: {e}"))?;
>   // 线程池 worker 循环 accept；失败时上报 App event 触发 tray.rs 重启逻辑
>   Ok(spawn_workers(server, num_cpus::get().max(2)))
> }
> ```

| GameDay | 详情 |
|---|---|
| **演练 ID** | GD-YIPOT-PORT-018 |
| **演练目标** | tiny_http 监听线程崩溃或端口冲突时，30s 内自恢复；或托盘 (Tray) 收到 AppEvent 后重新调用 `start_server()` |
| **平台** | macOS (主测) + Windows (辅测) |
| **参与人** | YiPot TL + SRE oncall |
| **预计时长** | 30 分钟 |
| **日期** | 2026-10-07 |
| **判定** | ☐ PASS (30s 自恢复) / ☐ PARTIAL (托盘触发恢复) / ☐ FAIL (需手动重启 App) |

---

## 一、准备环境

### 1.1 环境 Checklist

| # | 项目 | 命令 / 动作 | Done |
|---|---|---|---|
| 1 | **YiPot.app 版本** | staging 候选包（含 server.rs 最新自愈代码） | ☐ |
| 2 | **健康基线 (runbook S1 + S3 + S5)** | 执行 `sre/run/0004-运行-YiPot桌面集成Runbook.md Script 1/3/5`，全部 PASS | ☐ |
| 3 | **:60828 非占用** | `lsof -iTCP:60828 -sTCP:LISTEN` 只 1 行 YiPot PID | ☐ |
| 4 | **脚本就位** | 第二节 trigger 脚本保存到本地可执行 | ☐ |
| 5 | **观测窗口打开** | 两个终端：watch `lsof -i :60828` + watch `pgrep -afil YiPot` | ☐ |
| 6 | **Console.app 打开 (macOS)** | Filter: `com.yipot.desktop` + `subsystem: tiny_http` | ☐ |
| 7 | **回滚方案** | 菜单托盘 → 退出 → 重开 YiPot.app；最坏情况重建 `~/Library/Application Support/com.yipot.desktop` | ☐ |

---

## 二、触发 (lsof -i :60828 → kill TCP 线程 / 模拟端口占用)

### 2.1 触发 A：硬杀 tiny_http worker 线程（模拟崩溃）

```bash
#!/bin/bash
# GD-YIPOT-18 Trigger A: kill TCP worker threads by LWP (macOS) or threads on Linux
# 先用 lsof 找到监听 :60828 的主进程，再找其 HTTP 工作线程 LWP kill -9
set -u

YIPOT_MAIN_PID=$(lsof -tiTCP:60828 -sTCP:LISTEN 2>/dev/null | head -n1)
if [ -z "$YIPOT_MAIN_PID" ]; then
  echo "[ABORT] :60828 not LISTEN - please launch YiPot.app first"
  exit 2
fi
echo "YiPot main PID = $YIPOT_MAIN_PID"

# 找所有该进程下的轻量级线程/子进程（macOS 下 ps -M）
# 策略：找到该进程的所有 TCP 工作线程 (LWP)
if [[ "$(uname)" == "Darwin" ]]; then
  # macOS 上取线程数量，kill 掉前 N 个工作线程 via MACH 端口不易 -> 退而求其次，
  # 直接对监听端口上所有 ESTABLISHED/LISTEN 关联 fd 做 shutdown 模拟：
  # 简化：用 python 做一个端口占用程序 (nc/python) 先 stop server -> 瞬间启一个 dummy server 占 60828 -> 杀 dummy
  echo "[Step 1] Kill the YiPot tiny_http server thread via signal-crash proxy: we bind a conflicting socket to trigger a restart"
  # 直接对主进程发 SIGUSR1 看是否触发 reload（如果实现了 SIGHUP handler；否则我们做方案 B）
else
  # Linux
  ps -eLf | awk -v p="$YIPOT_MAIN_PID" '$3==p {print $2,$4}' | head
fi

# 替代方案（更可靠）：直接向 main PID 发送一系列信号：让其监听线程崩溃
# 先用 python 模拟端口占用冲突 (方案 B 更通用)
echo "[Trigger] 占用 :60828 让 start_server 下次 bind 失败，并同时模拟 worker 崩溃"
echo "[T0] 记录监听消失时间：$(date +%H:%M:%S)"

# 强制关闭 YiPot.app 启动端口 -> 观测其自愈（我们用 Python 先占住 60828 再放开）
python3 - <<'PYEOF' &
import socket, time, sys
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 0)
# 方案：杀 YiPot listen fd -> 这里简单：我们 kill -9 主进程内 HTTP 线程所在进程组的 listen worker
# 兼容做法：我们向 YiPot main pid 发 SIGTERM 信号的子集 -> 实际上最像"端口占用线程崩溃"的是：
#   * 第一步杀掉 listen fd 所属进程，导致端口释放；
#   * 立即由我们的 dummy socket 抢占；
#   * 10 秒后 dummy 释放；
#   * 观测 YiPot 是否在我们释放后 30 秒内重新抢到端口，或在抢占期间仍通过托盘重试逻辑直到成功。
print("[dummy port squatter] pid=", __import__("os").getpid(), flush=True)
time.sleep(2)
sys.exit(0)
PYEOF
DUMMY=$!

# 与此同时 -> 杀死 YiPot main 内 HTTP server 主循环 (如果能定位)。
# Tauri 下 tiny_http worker 线程就是主进程的一个线程：我们尝试发送 ABRT 信号给整个进程 (不可) -> 退而：用 lsof 找到 ESTABLISHED 连接 (通过 ESTABLISHED 关闭一些 fd，或我们直接用方案：强制 crash)
# 真实可用做法：让 start_server() 调用 panic。使用调试接口：
#   (lldb) attach $YIPOT_MAIN_PID ; breakpoint set -f server.rs -l 20 ; continue ; signal SIGABRT
# 非开发环境：直接用"端口占用模拟"方案。
echo "[T+0s] 执行端口占用模拟 (方案 B)：kill YiPot 进程的 listen socket 占用者, 然后立刻用 python bind :60828 保持 10 秒"

# 简单直接方式：使用 nc / python 临时 listen 冲突 -> 我们实际直接做 触发+观测 组合
kill -0 "$YIPOT_MAIN_PID" && echo "YiPot alive"
# 记录消失时间
echo "T_DISAPPEAR_EXPECTED=$(date +%s)" > /tmp/yipot_gd18_ts.txt
echo "[准备就绪，请手动执行下一步（见脚本2），或直接 kill -9 $YIPOT_MAIN_PID 中 tcp worker 对应子进程/线程（如果能识别）]"
echo "为避免误杀，我们改用 Trigger B（推荐）"
```

### 2.2 触发 B：端口占用模拟 (推荐，无需杀进程)

```bash
#!/bin/bash
# GD-YIPOT-18 Trigger B: Bind :60828 抢先 10s, 模拟 YiPot start_server() bind error 场景
# 前提：人为关闭 YiPot 的监听者（发指令让它 crash via internal debug 或重启）
# 这里我们做一个干净做法：
# 1. 记下 T0，让 YiPot 失去 60828；
# 2. 我们占 10 秒，释放
# 3. 观测 YiPot 是否在释放后 30 秒内 bind 成功（也即 40 秒窗口内恢复）

YIPOT_PID_BEFORE=$(lsof -tiTCP:60828 -sTCP:LISTEN 2>/dev/null | head -n1)
if [ -z "$YIPOT_PID_BEFORE" ]; then
  echo "[SKIP] YiPot 尚未监听 :60828。请先打开 YiPot.app -> 划词一次 -> 验证健康基线 Script 1"
  exit 2
fi

T0=$(date +%s)
echo "[T0] YIPOT_PID_BEFORE=$YIPOT_PID_BEFORE"
echo "[TRIGGER] 现在：1) 托盘菜单 -> Debug -> Restart Internal Server（若实现）；2) 或通过 lldb 让 start_server() 返回 Err"
echo "[若无法手动触发，则直接执行：kill $YIPOT_PID_BEFORE (注意：这是整个 App 重启路径；我们观察它重启后端口恢复) ]"

# 为了不把用户 App 搞崩，这里我们采用"温和"端口占用：
# 使用 SO_REUSEPORT 抢占（如果 YiPot 没开），或直接在重启间隙 bind 住 10 秒
(python3 -u - <<'PYEOF' &) >/tmp/yipot_dummy_bind.log 2>&1 &
import socket, time
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
    except Exception:
        pass
    s.bind(("127.0.0.1", 60828))
    s.listen(128)
    print(f"[{__import__('datetime').datetime.now()}] DUMMY bound :60828", flush=True)
    time.sleep(10)
    s.close()
    print(f"[{__import__('datetime').datetime.now()}] DUMMY released :60828", flush=True)
except Exception as e:
    print(f"DUMMY BIND FAILED (端口已被占用且无法抢占，正常现象): {e}", flush=True)
PYEOF
DUMMY_PID=$!
disown

echo "[T+0s] Triggered at $(date +%H:%M:%S). dummy_pid=$DUMMY_PID"
echo "[INFO] 现在立即手工执行：托盘菜单重启 server 或通过快捷键 Ctrl+Shift+Option+Y (Debug Restart)；或我们退化成观察 YiPot 自动重连逻辑"
echo "T0=$T0" > /tmp/yipot_gd18_t0.txt
```

---

## 三、观测 (观测 :60828 + pgrep YiPot + start_server 返回值)

```bash
#!/bin/bash
# GD-YIPOT-18 Observer 每 1s 采样端口/进程/HTTP health，持续 60 秒
T0=$(cat /tmp/yipot_gd18_t0.txt 2>/dev/null || date +%s)
END=$((T0 + 60))
echo "时间(s) | LISTEN(:60828) PID | pgrep YiPot | GET /health status | start_server status"
echo "--------+--------------------+------------+-------------------+---------------------"
while [ "$(date +%s)" -le "$END" ]; do
  NOW=$(date +%s)
  ELAPSED=$((NOW - T0))
  LPID=$(lsof -tiTCP:60828 -sTCP:LISTEN 2>/dev/null | head -n1 || echo "-")
  PPID=$(pgrep -fil YiPot 2>/dev/null | head -n1 | awk '{print $1}' || echo "-")
  H=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 1 --max-time 1 http://127.0.0.1:60828/health 2>/dev/null || echo "000")
  # 调用 POST /config 判断 server.rs start_server 是否真的 OK（不止 LISTEN）
  CFG_OK="-"
  if [[ "$H" == "200" ]]; then
    curl -s -X POST http://127.0.0.1:60828/config -d '{}' --connect-timeout 1 --max-time 1 2>/dev/null | grep -qi ok && CFG_OK="up" || CFG_OK="listen-but-not-ready"
  else
    CFG_OK="down"
  fi
  printf "  T+%02ds  | %18s | %10s | %17s | %s\n" "$ELAPSED" "$LPID" "$PPID" "$H" "$CFG_OK"
  sleep 1
done | tee /tmp/yipot_gd18_observ.log
```

```bash
# 观测辅助：tail CrashReporter（如 runbook Script 7）
CRASH_DIR="$HOME/Library/Logs/com.yipot.desktop/CrashReporter"
[ -d "$CRASH_DIR" ] && fswatch -o "$CRASH_DIR" 2>/dev/null &
echo "Crash dir watch: $CRASH_DIR (fswatch 若未装则手动 ls)"
```

### 观测指标表

| 指标 | 含义 | 触发前 | T+10s (dummy 占口中) | T+20s (dummy 释放后) | T+40s | T+60s |
|---|---|---|---|---|---|---|
| `:60828 LISTEN` 存在 | `lsof -iTCP:60828 -sTCP:LISTEN` 行数 | ☐=1 | ☐= dummy / 0 / YiPot | ☐ YiPot=1? | ☐=1? | ☐=1? |
| pgrep YiPot 主进程存活 | `pgrep -fil YiPot` 数量 | ☐=1 | ☐ | ☐ | ☐ | ☐ |
| GET /health HTTP 200 | curl :60828/health | ☐ PASS | ☐ FAIL/PASS | ☐ PASS? | ☐ PASS? | ☐ PASS? |
| POST /config 返回 ok | server.rs 路由工作 | ☐ PASS | ☐ FAIL | ☐ PASS? | ☐ PASS? | ☐ PASS? |
| 托盘图标是否仍显示 | 人工/AppleScript | ☐ yes | ☐ | ☐ | ☐ | ☐ |
| start_server 是否已被 Tray 重试 | Console.app 日志 `start_server retry=` | ☐ 0 次 | ☐ n 次 | ☐ n 次 | ☐ n 次 | ☐ |
| CrashReporter 是否新增 ips 文件 | find CrashReporter -mmin -1 | ☐ 0 | ☐ | ☐ | ☐ | ☐ |

---

## 四、期望行为 — 实际结果

### 4.1 期望行为 (Expected)

> 引用 `server.rs:9-32`：失败后 上报 `AppEvent::ServerError(port)`，由 tray.rs 启动指数退避重试（300ms / 600ms / 1.2s / 2.4s / 5s / 5s 上限）。

| # | 期望 |
|---|---|
| E1 | `dummy` 抢端口 10 秒期间 → YiPot `start_server()` bind 失败 → **不崩溃**，控制台日志显示 `bind error, retry in X ms` |
| E2 | dummy 释放后 (T+10s)，YiPot 下一轮重试立即 bind → **T+15s 以内** :60828 LISTEN=YiPot |
| E3 | 最坏 (无退避重试逻辑)：托盘菜单用户可视看到"⚠️ 端口占用"提示 → 点击一次"重启翻译服务" → **30s 内** 恢复 GET /health=200 |
| E4 | 全程 pgrep YiPot=1，进程不 crash，history.db 不被锁坏（Script 5 再次跑 integrity_check=ok） |
| E5 | :60828 恢复后，POST /config 立即 ok (路由已注册 = `start_server()` 返回 `Ok(ServerHandle)` 而非临时 Ok) |

### 4.2 实际结果 (Actual, **演练当场填写**)

```markdown
T_recover_listen = T+______s (YiPot 重新 LISTEN :60828)
T_recover_health = T+______s (/health 200)
T_recover_config = T+______s (/config ok)

是否满足 30s 内自恢复：☐ YES  ☐ NO（实际=______s  ☐ 仅托盘触发才恢复）
是否有 crash：☐ NO  ☐ YES（ips= ____ 个）
pgrep YiPot 是否始终=1：☐ YES  ☐ NO（消失 ____ 秒）
SQLite integrity_check 演练后：☐ ok  ☐ corrupt

异常现象 / 根因线索：
1. ___________________________________________________
2. ___________________________________________________
3. ___________________________________________________
```

---

## 五、改进措施

| # | 改进项 | Owner | 优先级 | 截止 | 关联文件 |
|---|---|---|---|---|---|
| 1 | `server.rs:start_server` 在 `tiny_http::Server::http` 返回 Err 时增加 `tokio::time::sleep` 指数退避循环 + `retry_count` 指标 | ☐ YiPot TL | P0 (若 FAIL) | 2026-10-14 | `yipot/src-tauri/src/server.rs:9-32` |
| 2 | 托盘 Tray 菜单增加 "🔄 重启翻译服务" 项 → 失败时闪烁红色圆点状态 | ☐ YiPot UI | P1 | 2026-10-21 | `tray.rs` |
| 3 | 本地 CrashReporter 新增 ips 时 POST 到内部 `/diag` 接口（有网即上传） | ☐ YiPot | P1 | 2026-10-28 | 62-prd-健壮性强化.md |
| 4 | macOS TCC 权限丢失导致的"健康端点位 000" → 增加引导用户开权限的弹框 | ☐ YiPot | P2 | 2026-11-04 | runbook Script 2 |
| 5 | | ☐ | | | |

---

## 演练结束 Checklist

- [ ] **环境恢复**：`pgrep -fil YiPot` 确认 1 个；`Script 1/3/5` 重新跑全 PASS
- [ ] **留档**：`/tmp/yipot_gd18_observ.log` + 截图（端口 LISTEN 时序 + Console.app 重试日志 → 存 `sre/incident-response/gameday-logs/2026-10-07-GD-018/`
- [ ] **改进项转 Issue**：本文件 第五节 改进项 逐条创建工程 Issue / 放到 PRD-62 健壮性强化
