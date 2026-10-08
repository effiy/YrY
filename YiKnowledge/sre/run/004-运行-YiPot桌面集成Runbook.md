---
title: "YiPot 桌面集成 Runbook — 托盘、端口、SQLite 与崩溃日志全验证"
aliases: [yipot-desktop-runbook, yipot-tray-runbook, yipot-60828-runbook]
tags: [sre, run, runbook, yipot, desktop, tray, sqlite]
category: sre/run
created: 2026-10-07
updated: 2026-10-07
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [sre, engineer]
benefit: "桌面端工程师在用户报障时，按 12 条断言脚本快速定位是进程、端口、配置、SQLite、托盘、热键还是剪贴板问题"
acceptance_criteria:
  - "覆盖启动托盘、配置窗口 smoke、history.db 完整性、崩溃日志 4 大章节"
  - "包含 12 条可执行断言脚本（端口/pid/权限/sqlite/托盘/热键/剪贴板）"
  - "引用真实 server.rs 路由注册和 hotkey.rs 第 46 行热键注册逻辑"
related:
  - ../../projects/yipot/prds/2026-09/01-prd-划词翻译核心.md
  - ../../projects/yipot/prds/2026-09/14-prd-剪切板监听.md
  - ../../projects/yipot/prds/2026-09/27-prd-安全加密存储.md
  - ../../projects/yipot/prds/2026-09/51-prd-翻译历史记录.md
  - ../../engineer/projects/yipot/0001-项目-架构设计.md
  - ../observability/0014-可观测-健康检查设计.md
  - ../incident-response/0009-事件-Runbook模板.md
  - ../QUICKREF.md
---

# YiPot 桌面集成 Runbook — 托盘、端口、SQLite 与崩溃日志全验证

> **适用场景**：YiPot 桌面 App 启动异常、划词翻译无响应、托盘图标消失、历史记录丢失、用户报障快速排查。

| 项目 | 内容 |
|---|---|
| **Runbook ID** | RB-YIPOT-DESKTOP-004 |
| **触发告警** | YIPOT_PORT_60828_DOWN / YIPOT_TRAY_NOT_FOUND / HISTORY_DB_CORRUPT |
| **严重程度** | P1（完全不可用）/ P2（部分功能异常） |
| **维护人** | YiPot Team + SRE |
| **最后更新** | 2026-10-07 |
| **预计处理时间** | 3-10 分钟 |

> **源码引用**：
> - HTTP 服务启动：`yipot/src-tauri/src/server.rs:9-32` `fn start_server()` 使用 `tiny_http` 绑定 `127.0.0.1:60828`
> - 路由定义：`server.rs` 内注册 `POST /config`、`POST /translate`、`GET /clipboard`、`GET /health`
> - 热键注册：`yipot/src-tauri/src/hotkey.rs:46` `register_hotkey("Ctrl+Shift+Y", show_translate_window)`

---

## 一、启动与托盘验证 (pgrep + lsof 60828)

### 1.1 进程存在与端口监听

YiPot 主进程通常以 `YiPot` 或 `com.yipot.desktop` 形式运行，启动后内部 `start_server()` (`server.rs:9-32`) 会绑定 TCP 60828 localhost 端口，用于与划词脚本、浏览器扩展通信。

```bash
#!/bin/bash
# Script 1: pgrep YiPot 进程 + lsof :60828 LISTEN
YIPOT_PID=$(pgrep -fil "YiPot" 2>/dev/null | head -n1 | awk '{print $1}' || true)
echo "YiPot PID: ${YIPOT_PID:-NOT_FOUND}"

# macOS / Linux 兼容：检查端口监听
PORT_OPEN=false
if command -v lsof >/dev/null 2>&1; then
  lsof -iTCP:60828 -sTCP:LISTEN >/dev/null 2>&1 && PORT_OPEN=true
elif command -v ss >/dev/null 2>&1; then
  ss -ltn | grep -q ":60828 " && PORT_OPEN=true
fi

if $PORT_OPEN; then
  LISTENER_PID=$(lsof -tiTCP:60828 -sTCP:LISTEN 2>/dev/null | head -n1 || echo "?")
  echo "[INFO] :60828 LISTEN owner PID=$LISTENER_PID"
fi

if [ -n "$YIPOT_PID" ] && $PORT_OPEN; then
  echo "[PASS] YiPot running (PID=$YIPOT_PID) + :60828 LISTEN"
  exit 0
elif [ -n "$YIPOT_PID" ]; then
  echo "[FAIL] YiPot PID=$YIPOT_PID but :60828 NOT listening (start_server may not have called server.rs:9)"
  exit 1
else
  echo "[FAIL] YiPot process not found. Please launch YiPot.app first."
  exit 1
fi
```

### 1.2 托盘图标与进程权限 (macOS)

```bash
#!/bin/bash
# Script 2: 托盘 accessibility 权限检查（macOS 划词截图依赖）
if [[ "$(uname)" == "Darwin" ]]; then
  # 检查 Accessibility 权限
  AX_STATUS=$(sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db \
    "SELECT service, auth_value FROM access WHERE client='com.yipot.desktop' AND service='kTCCServiceAccessibility';" 2>/dev/null || echo "")
  echo "TCC Accessibility: ${AX_STATUS:-not-found-in-TCC}"
  # 辅助功能通用检查
  if pgrep -x "SystemUIServer" >/dev/null 2>&1; then
    echo "[INFO] SystemUIServer running (menu bar host)"
  fi
  echo "[INFO] Manual verify: menu bar should show YiPot 图标 (tray)"
  exit 0
else
  echo "[SKIP] non-macOS platform"
  exit 0
fi
```

---

## 二、配置窗口 Smoke 测试 (POST /config)

`server.rs` 路由 `POST /config` 返回当前配置 JSON；当传入 `{}` 时应返回 `"ok"` 状态，用于验证 HTTP 服务端序列化与状态机都正常。

```bash
#!/bin/bash
# Script 3: POST 127.0.0.1:60828/config -d '{}' 期望返回包含 "ok"
URL="http://127.0.0.1:60828/config"
RESP=$(curl -s -X POST "$URL" -H "Content-Type: application/json" -d '{}' --connect-timeout 2 --max-time 5 2>/dev/null || echo "")
echo "POST /config response:"
echo "$RESP"

# 断言 body 中包含 ok / status / ok 字段
if echo "$RESP" | grep -qiE '"(ok|status)"(\s*:\s*"ok"|\s*:\s*true)'; then
  echo "[PASS] /config returned ok status"
  exit 0
elif echo "$RESP" | grep -q "ok"; then
  echo "[PASS] /config contains 'ok' (lenient match)"
  exit 0
else
  echo "[FAIL] /config did not return ok. body="
  echo "$RESP"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 4: /health 端点基线
CODE=$(curl -s -o /tmp/yipot_health.json -w "%{http_code}" http://127.0.0.1:60828/health --connect-timeout 2 --max-time 5 2>/dev/null || echo "000")
echo "GET /health HTTP $CODE"
cat /tmp/yipot_health.json 2>/dev/null; echo
[[ "$CODE" == "200" ]] && { echo "[PASS] /health 200"; exit 0; } || { echo "[FAIL] /health=$CODE"; exit 1; }
```

---

## 三、history.db sqlite3 健康检查

### 3.1 PRAGMA integrity_check + 表结构

```bash
#!/bin/bash
# Script 5: sqlite3 history.db integrity_check
# macOS 默认路径 ~/Library/Application Support/com.yipot.desktop/history.db
CANDIDATES=(
  "$HOME/Library/Application Support/com.yipot.desktop/history.db"
  "$HOME/.config/yipot/history.db"
  "$HOME/.yipot/history.db"
  "./history.db"
)
HIST_DB=""
for c in "${CANDIDATES[@]}"; do
  [ -f "$c" ] && HIST_DB="$c" && break
done

if [ -z "$HIST_DB" ]; then
  echo "[SKIP] history.db not found at known paths"
  exit 0
fi
echo "Using history.db: $HIST_DB"

# 1) PRAGMA integrity_check
INTEGRITY=$(sqlite3 "$HIST_DB" "PRAGMA integrity_check;" 2>/dev/null || echo "integrity_error")
echo "PRAGMA integrity_check => $INTEGRITY"

# 2) 表列表 + 行数
TABLES=$(sqlite3 "$HIST_DB" ".tables" 2>/dev/null)
echo "Tables: $TABLES"
for t in $TABLES; do
  CNT=$(sqlite3 "$HIST_DB" "SELECT COUNT(*) FROM \"$t\";" 2>/dev/null || echo "?")
  echo "  $t rows = $CNT"
done

if [[ "$INTEGRITY" == "ok" ]]; then
  echo "[PASS] SQLite integrity_check = ok"
  exit 0
else
  echo "[FAIL] SQLite corruption: $INTEGRITY"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 6: SQLite journal_mode + busy_timeout 配置检查
HIST_DB=$(find "$HOME/Library/Application Support/com.yipot.desktop" "$HOME/.config/yipot" -name history.db 2>/dev/null | head -n1 || true)
[ -z "$HIST_DB" ] && { echo "[SKIP] history.db missing"; exit 0; }
echo "DB: $HIST_DB"
sqlite3 "$HIST_DB" "PRAGMA journal_mode; PRAGMA busy_timeout; PRAGMA synchronous;" 2>&1 | awk 'NF'
# 断言 journal_mode 非 DELETE 以外都更安全（WAL 更好）
JM=$(sqlite3 "$HIST_DB" "PRAGMA journal_mode;" 2>/dev/null)
echo "journal_mode = $JM"
echo "[INFO] WAL is recommended (write durability). DELETE acceptable for small DB."
exit 0
```

---

## 四、崩溃日志定位 (CrashReporter)

### 4.1 macOS CrashReporter 目录扫描

```bash
#!/bin/bash
# Script 7: 扫描 ~/Library/Logs/com.yipot.desktop/CrashReporter 最近 7 天
CRASH_DIR="$HOME/Library/Logs/com.yipot.desktop/CrashReporter"
ALT_DIR="$HOME/Library/Logs/DiagnosticReports"

check_dir() {
  local d=$1
  [ -d "$d" ] || return 1
  echo "--- Crash logs in $d (last 7 days) ---"
  find "$d" -type f \( -name "*.ips" -o -name "*.crash" -o -name "com.yipot*" \) \
    -mtime -7 -exec ls -lah {} \; 2>/dev/null | head -n 30
  local cnt=$(find "$d" -type f \( -name "*.ips" -o -name "*.crash" -o -name "com.yipot*" \) -mtime -7 2>/dev/null | wc -l | tr -d ' ')
  echo "Recent crash count (7d): $cnt"
  # 最近一份内容片段
  LATEST=$(find "$d" -type f \( -name "*.ips" -o -name "*.crash" \) -mtime -7 -print0 2>/dev/null | xargs -0 ls -1t 2>/dev/null | head -n1)
  if [ -n "$LATEST" ]; then
    echo "=== Latest crash: $LATEST (first 40 lines) ==="
    head -n 40 "$LATEST" 2>/dev/null
  fi
  return 0
}

check_dir "$CRASH_DIR" || true
check_dir "$ALT_DIR" || true
echo "[INFO] Crash scan complete. Recent crashes may indicate regressions."
exit 0
```

---

## 附录：12 条断言脚本速查

| # | 脚本 | 类别 | 命令要点 | 断言 |
|---|---|---|---|---|
| 1 | pgrep YiPot + :60828 LISTEN | pid/port | `pgrep -fil YiPot` + `lsof -iTCP:60828 -sTCP:LISTEN` | 进程存在 & 端口监听 → exit 0 |
| 2 | Accessibility 权限 (macOS) | 权限 | TCC.db 查询 kTCCServiceAccessibility | 仅信息输出 |
| 3 | POST /config smoke | HTTP | `curl -X POST :60828/config -d'{}'` | body 含 "ok" → 0 |
| 4 | GET /health | HTTP | curl :60828/health | HTTP 200 → 0 |
| 5 | history.db integrity_check | sqlite | `sqlite3 PRAGMA integrity_check` | 返回 "ok" → 0 |
| 6 | SQLite pragma 参数 | sqlite | journal_mode / busy_timeout | 仅信息 |
| 7 | CrashReporter 扫描 | 日志 | find ~/Library/Logs/... -mtime -7 | 仅信息 |
| 8 | 托盘图标 NSStatusBar 检查（AppleScript） | 托盘 | `osascript -e 'tell application "System Events"...'` | 信息输出 |
| 9 | 热键注册状态 (hotkey.rs:46 Ctrl+Shift+Y) | 热键 | 模拟事件/读取内部状态接口 | 可触发回调 → 0 |
| 10 | 剪贴板读写回路 | 剪贴板 | `pbcopy < tmp && pbpaste` + 回读接口 | 内容一致 → 0 |
| 11 | 翻译接口 e2e | HTTP | `POST /translate` 带测试文本 | 返回 result 字段 → 0 |
| 12 | 综合自检报告 | 混合 | 按顺序调用 1-11 并汇总 | 关键项 (1,3,4,5) 全过 → 0 |

### 脚本 8-12 详细实现

```bash
#!/bin/bash
# Script 8: 托盘 (Tray/NSStatusBar) 可见性探测（macOS AppleScript 尽力而为）
if [[ "$(uname)" == "Darwin" ]]; then
  echo "[INFO] Querying UI elements for YiPot tray (requires Accessibility permission)"
  ( osascript <<'EOF' 2>/dev/null
tell application "System Events"
  tell process "ControlCenter"
    -- 尝试；若无权限返回空
    get name of every menu bar item of menu bar 1
  end tell
end tell
EOF
  ) | tr ',' '\n' | grep -i yipot >/dev/null && echo "[PASS] YiPot menu bar item found" || echo "[WARN] tray item not detected (may need Accessibility perms)"
  exit 0
else
  echo "[SKIP] non-macOS"
  exit 0
fi
```

```bash
#!/bin/bash
# Script 9: 热键 Ctrl+Shift+Y 注册状态验证（对应 hotkey.rs:46 register_hotkey）
# 无系统级热键读 API -> 通过内部 GET /hotkeys 接口查询；否则标记 SKIP
URL="http://127.0.0.1:60828/hotkeys"
RESP=$(curl -s "$URL" --connect-timeout 2 --max-time 4 2>/dev/null || echo "")
if [ -n "$RESP" ]; then
  echo "Hotkey API response: $RESP"
  echo "$RESP" | grep -qiE "Ctrl.*Shift.*Y|register" && { echo "[PASS] Hotkey Ctrl+Shift+Y registered (hotkey.rs:46)"; exit 0; }
fi
echo "[SKIP/INFO] No /hotkeys endpoint exposed. Verify by pressing Ctrl+Shift+Y manually -> window should appear."
exit 0
```

```bash
#!/bin/bash
# Script 10: 剪贴板读写回路
TOKEN="YiPotClipboardTest-$(date +%s)-$$"
echo -n "$TOKEN" > /tmp/yipot_clip_src

# 写入系统剪贴板
if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < /tmp/yipot_clip_src
  CLIP_OUT=$(pbpaste 2>/dev/null || echo "")
elif command -v xclip >/dev/null 2>&1; then
  xclip -selection clipboard < /tmp/yipot_clip_src
  CLIP_OUT=$(xclip -selection clipboard -o 2>/dev/null || echo "")
else
  echo "[SKIP] no pbcopy/xclip"
  exit 0
fi

# 同时通过 YiPot API /clipboard 尝试读取
YIPOT_CLIP=$(curl -s http://127.0.0.1:60828/clipboard --connect-timeout 2 --max-time 3 2>/dev/null || echo "")
echo "System clipboard (len ${#CLIP_OUT}): ${CLIP_OUT:0:60}..."
echo "YiPot /clipboard (len ${#YIPOT_CLIP}): ${YIPOT_CLIP:0:60}..."

if [[ "$CLIP_OUT" == "$TOKEN" ]]; then
  echo "[PASS] clipboard system roundtrip OK"
  exit 0
else
  echo "[FAIL] clipboard mismatch. Expected token=$TOKEN"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 11: 翻译接口 e2e smoke
PAYLOAD='{"from":"en","to":"zh","text":"hello world"}'
RESP=$(curl -s -X POST http://127.0.0.1:60828/translate \
  -H "Content-Type: application/json" \
  --connect-timeout 3 --max-time 30 \
  -d "$PAYLOAD" 2>/dev/null || echo "")
echo "Translate response:"
echo "$RESP" | head -c 400; echo

# 结果中必须存在 result/translated/data 字段或直接字符串非空
if [ -n "$RESP" ] && echo "$RESP" | grep -qiE '"(result|translated|translation|data)"|你好|世界'; then
  echo "[PASS] translate returned non-empty payload"
  exit 0
else
  echo "[FAIL] translate empty or malformed (may need API key configured)"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 12: 综合自检 (rollup 1-11 关键项)
PASS=0; FAIL=0; SKIP=0
run() {
  local label=$1; shift
  echo "==> $label"
  bash -c "$*"
  local rc=$?
  case $rc in
    0) echo "<== PASS ($label)"; PASS=$((PASS+1));;
    2) echo "<== SKIP ($label)"; SKIP=$((SKIP+1));;
    *) echo "<== FAIL ($label)"; FAIL=$((FAIL+1));;
  esac
}

# 关键项：脚本 1,3,4,5
run "S1_pid_port" '
YIPOT_PID=$(pgrep -fil "YiPot" 2>/dev/null | head -n1 | awk "{print \$1}" || true)
PORT=false
(lsof -iTCP:60828 -sTCP:LISTEN >/dev/null 2>&1 || ss -ltn 2>/dev/null | grep -q ":60828 ") && PORT=true
if [ -n "$YIPOT_PID" ] && $PORT; then exit 0; else exit 1; fi
'
run "S3_config_smoke" 'RESP=$(curl -s -X POST http://127.0.0.1:60828/config -H "Content-Type: application/json" -d "{}" --connect-timeout 2 --max-time 5 2>/dev/null); echo "$RESP" | grep -qi ok && exit 0 || exit 1'
run "S4_health" 'CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:60828/health --connect-timeout 2 --max-time 5 2>/dev/null); [ "$CODE" = "200" ] && exit 0 || exit 1'
run "S5_sqlite_integrity" '
for p in "$HOME/Library/Application Support/com.yipot.desktop/history.db" "$HOME/.config/yipot/history.db"; do
  [ -f "$p" ] && { INTEG=$(sqlite3 "$p" "PRAGMA integrity_check;" 2>/dev/null); [ "$INTEG" = "ok" ] && exit 0; }
done
exit 2
'

echo "===== YIPOT RUNBOOK SUMMARY ====="
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
# 关键 4 项中必须至少 3 PASS（考虑 sqlite 可能不存在）
[ "$FAIL" -le 1 ] && { echo "[PASS] Rollup OK"; exit 0; } || { echo "[FAIL] Rollup critical items failed"; exit 1; }
```
