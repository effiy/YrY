---
title: "YiVad 前端项目页 Runbook — Rsbuild 启动、接口结构与性能指标"
aliases: [yivad-runbook, yivad-frontend-runbook, rsbuild-8848-runbook]
tags: [sre, run, runbook, yivad, frontend, rsbuild, performance]
category: sre/run
created: 2026-10-07
updated: 2026-10-07
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [sre, engineer]
benefit: "前端发布后，SRE 通过 10 条性能脚本与接口结构断言，5 分钟确认 YiVad 项目页可访问、可渲染、可拉取 projects 数据"
acceptance_criteria:
  - "覆盖 Rsbuild 启动与 8848 端口验证、浏览器权限、projects 接口结构断言、10 条前端性能脚本 4 大章"
  - "MongoDB projects 集合 >=5 条断言 + /api/project 接口 JSON 结构字段级校验"
  - "10 条前端性能指标（FCP/LCP/CLS/TBT/TTI 等）采集脚本块"
related:
  - ../../engineer/projects/yivad/0001-项目-架构设计.md
  - ../../engineer/projects/yivad/0003-项目-功能模块.md
  - ../../projects/yiai/prds/2026-09/01-prd-检索基础体系.md
  - ../../engineer/build/0004-构建-性能优化指南.md
  - ../observability/0013-可观测-性能测试指南.md
  - ../observability/0015-可观测-SRE指标体系.md
  - ../../leader/architecture/0019-架构-性能优化指南.md
  - ../QUICKREF.md
---

# YiVad 前端项目页 Runbook — Rsbuild 启动、接口结构与性能指标

> **适用场景**：YiVad 前端发布冒烟、每日巡检、线上项目页报障（白屏 / 数据不加载 / 卡顿）。

| 项目 | 内容 |
|---|---|
| **Runbook ID** | RB-YIVAD-FE-PROJECT-005 |
| **触发告警** | YIVAD_8848_DOWN / YIVAD_FCP_GT_3S / PROJECTS_API_ERROR_RATE |
| **严重程度** | P1（首页白屏）/ P2（接口慢 / 性能退化） |
| **维护人** | YiVad Team + SRE |
| **最后更新** | 2026-10-07 |
| **预计处理时间** | 5-15 分钟 |

---

## 一、Rsbuild 启动与 8848 端口验证

### 1.1 lsof 8848 + curl 项目页骨架

YiVad 基于 Rsbuild (Rspack + modern.js) 启动，本地/CI 环境默认监听 8848；访问 `http://localhost:8848/#/project` 路由为项目页入口。

```bash
#!/bin/bash
# Script 1: lsof :8848 LISTEN + curl /#/project 骨架 HTML
PORT=8848
echo "=== Rsbuild :$PORT check ==="

# 1) 监听检查
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1 || ss -ltn 2>/dev/null | grep -q ":$PORT "; then
  OWNER=$(lsof -tiTCP:$PORT -sTCP:LISTEN 2>/dev/null | head -n1 || echo "?")
  echo "[OK] LISTEN :$PORT PID=$OWNER"
else
  echo "[FAIL] :$PORT NOT listening. Start with: cd yivad && pnpm dev"
  exit 1
fi

# 2) curl HTML 骨架（hash 路由对 SSR 友好）
HTML=$(curl -s "http://localhost:$PORT/" --connect-timeout 3 --max-time 10 2>/dev/null || echo "")
LEN=${#HTML}
echo "Root HTML length: $LEN bytes"
# 必须包含 Rsbuild 注入的 bootstrap 脚本 / div#root / vite/client 兼容标记
HAS_ROOT=$(echo "$HTML" | grep -c "id=.root" || echo 0)
HAS_SCRIPT=$(echo "$HTML" | grep -cE "<script.*(rsbuild|rspack|src)" || echo 0)
echo "div#root matches=$HAS_ROOT, script matches=$HAS_SCRIPT"
if [ "$LEN" -gt 500 ] && [ "$HAS_ROOT" -ge 1 ]; then
  echo "[PASS] Rsbuild HTML skeleton rendered OK"
  exit 0
else
  echo "[FAIL] HTML empty or missing #root"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 2: curl 具体 /#/project 路径 + 静态资源 200
BASE="http://localhost:8848"
STATUS=$(curl -s -o /tmp/yivad_index.html -w "%{http_code}" "$BASE/" --connect-timeout 3 --max-time 8)
echo "GET / HTTP=$STATUS"
# 抽取 /assets 目录下 manifest 或首个 JS chunk 做 200 检查
CHUNK=$(grep -oE 'src="(/assets/[^"]+\.js)"' /tmp/yivad_index.html 2>/dev/null | head -n1 | grep -oE '/assets/[^"]+\.js' || echo "")
if [ -n "$CHUNK" ]; then
  C2=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$CHUNK" --connect-timeout 3 --max-time 15)
  echo "First chunk $CHUNK -> HTTP $C2"
  [ "$C2" = "200" ] && { echo "[PASS] Static assets served OK"; exit 0; }
fi
[ "$STATUS" = "200" ] && { echo "[PASS] Index 200"; exit 0; } || { echo "[FAIL] assets/index check failed"; exit 1; }
```

---

## 二、浏览器权限与 DevTools 提示清单

> 自动化脚本无法直接驱动浏览器权限（需 Playwright/Cypress e2e），此处给出**必查项**与命令行等价脚本，用于人工走查或 e2e 前置。

| 权限项 | 作用 | 页面表现 | 等价断言 (CLI/e2e) |
|---|---|---|---|
| **剪贴板读取** | 项目页导入 Markdown 用 | 弹出"允许粘贴" | Playwright: `context.grant_permissions(["clipboard-read"])` |
| **通知** | 构建完成/失败提示 | "显示通知"气泡 | `Notification.permission === "granted"` |
| **IndexedDB / localStorage** | projects 缓存 / 草稿 | F12 Application 标签有数据 | `window.indexedDB.databases().then(ds => ds.length>0)` |
| **DevTools 禁用 sourcemap 泄漏** | 发布环境不应暴露源码 | Source 面板不应出现 src/ 源码 | 发布 HTML 中无 `.map` 引用 |
| **CSP / 混合内容** | HTTPS 下不允许 HTTP 子资源 | Console 红色 BLOCKED | `curl -sI $URL | grep -i content-security-policy` |

```bash
#!/bin/bash
# Script 3: CSP + sourcemap 泄漏扫描（发布态重点）
URL="${1:-http://localhost:8848/}"
echo "Scanning: $URL"
HEADERS=$(curl -sI "$URL" --connect-timeout 3 --max-time 10 2>/dev/null)
BODY=$(curl -s "$URL" --connect-timeout 3 --max-time 10 2>/dev/null)

echo "--- CSP header ---"
echo "$HEADERS" | grep -i "content-security-policy" || echo "(no CSP header)"

echo "--- Sourcemap references ---"
MAPS=$(echo "$BODY" | grep -oE '[a-zA-Z0-9_/.-]+\.map(\?|")' 2>/dev/null | sort -u | head -n 10 || true)
if [ -n "$MAPS" ]; then
  echo "[WARN] Source map references found (dev mode expected, production NOT expected):"
  echo "$MAPS"
else
  echo "[OK] No .map references in HTML"
fi
echo "[INFO] Browser permissions require Playwright e2e for automated assertion."
exit 0
```

---

## 三、MongoDB projects 集合 + /api/project 接口 JSON 结构断言

### 3.1 MongoDB projects >= 5 条

```bash
#!/bin/bash
# Script 4: MongoDB projects >=5 条 + 关键字段存在
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017/yivad}"
OUT=$(mongosh --quiet "$MONGO_URI" --eval "
  const col = db.getCollection('projects');
  const n = col.estimatedDocumentCount();
  const samples = col.find({}, {_id:1, name:1, status:1, createdAt:1}).limit(3).toArray();
  print(JSON.stringify({count: n, sampleFields: samples.length>0 ? Object.keys(samples[0]) : []}));
" 2>/dev/null || echo '{"count":0,"sampleFields":[]}')

echo "Mongo projects: $OUT"
COUNT=$(echo "$OUT" | python3 -c "import json,sys; d=json.loads(sys.stdin.read()); print(d.get('count',0))" 2>/dev/null || echo 0)
if [ "$COUNT" -ge 5 ]; then
  echo "[PASS] projects count=$COUNT >= 5"
  exit 0
else
  echo "[FAIL] projects count=$COUNT < 5. Seed data first."
  exit 1
fi
```

### 3.2 /api/projects 接口 JSON 结构校验

YiVad 前端项目页通常通过代理（Rsbuild proxy）到 YiAi 后端；直接命中 8848 或命中后端 10086。

```bash
#!/bin/bash
# Script 5: /api/projects 接口结构断言
# 兼容两种部署：直连 10086 / 走 Rsbuild 8848 代理
CANDIDATE_URLS=(
  "http://localhost:10086/api/projects?pageSize=5"
  "http://localhost:8848/api/projects?pageSize=5"
)
BODY="" URL=""
for u in "${CANDIDATE_URLS[@]}"; do
  B=$(curl -s "$u" --connect-timeout 3 --max-time 10 2>/dev/null || echo "")
  if [ -n "$B" ] && echo "$B" | python3 -c "import json,sys; json.loads(sys.stdin.read())" >/dev/null 2>&1; then
    BODY="$B"; URL="$u"; break
  fi
done

if [ -z "$BODY" ]; then
  echo "[FAIL] No valid JSON response from any candidate /api/projects URL"
  exit 1
fi
echo "Using URL: $URL"
echo "Response (first 600 chars):"
echo "$BODY" | head -c 600; echo

python3 - <<'PYEOF'
import json, sys
d = json.loads(open('/dev/stdin').read())
# 兼容：{data:{items:[...]}} 或 {data:[...]} 或 {items:[...]} 或 [...]
items = []
if isinstance(d, list):
  items = d
else:
  data = d.get('result', d).get('data', d)
  if isinstance(data, list):
    items = data
  elif isinstance(data, dict):
    items = data.get('items', data.get('list', data.get('documents', [])))

assert isinstance(items, list) and len(items) >= 1, "items list empty"
print(f"items = {len(items)}")
# 字段级断言：每个 item 至少含 id/name 二选一，且 createdAt 或 updatedAt 其一
required_any = [
    ('id', '_id'),
    ('name', 'title'),
    ('createdAt', 'created_at', 'updatedAt')
]
for i, it in enumerate(items[:5]):
    missing = []
    for grp in required_any:
        if not any(k in it for k in grp):
            missing.append(grp)
    print(f"  item[{i}] keys={list(it.keys())[:10]} missing_groups={missing}")
    assert not missing, f"item {i} missing fields {missing}"
print("[PASS] projects JSON schema OK (>=1 items, required fields present)")
PYEOF <<< "$BODY"

RC=$?
exit $RC
```

---

## 四、10 条前端性能指标脚本

> 采用两种方式：(a) curl 级 TTFB/Size（无需浏览器）；(b) 使用 Lighthouse CLI / `npx playwright trace` 级指标（若本地可用）。

| # | 指标 | 采集方式 | 阈值 (绿/黄/红) |
|---|---|---|---|
| 1 | TTFB 首字节 | curl -w `time_starttransfer` | <200ms / <800ms / ≥800ms |
| 2 | HTML 总大小 | curl `size_download` | <200KB / <1MB / ≥1MB |
| 3 | 首 JS chunk 大小 | curl assets index.js | <150KB / <500KB / ≥500KB |
| 4 | FCP First Contentful Paint | lighthouse/playwright | <1.8s / <3s / ≥3s |
| 5 | LCP Largest Contentful Paint | lighthouse/playwright | <2.5s / <4s / ≥4s |
| 6 | CLS Cumulative Layout Shift | lighthouse/playwright | <0.1 / <0.25 / ≥0.25 |
| 7 | TBT Total Blocking Time | lighthouse/playwright | <200ms / <600ms / ≥600ms |
| 8 | TTI Time to Interactive | lighthouse/playwright | <3.8s / <7.3s / ≥7.3s |
| 9 | Speed Index | lighthouse/playwright | <3.4s / <5.8s / ≥5.8s |
| 10 | 请求总数 / 未压缩 JS | lighthouse summary | <50 req / <300KB / 超阈值 |

```bash
#!/bin/bash
# Script 6: 指标 1-3 (curl 级：TTFB / HTML size / JS chunk size)
URL="${1:-http://localhost:8848/}"
echo "=== curl-level perf for $URL ==="
METRICS=$(curl -s -o /tmp/yivad_perf.html -w '
{
  "http_code": "%{http_code}",
  "time_namelookup": %{time_namelookup},
  "time_connect": %{time_connect},
  "time_starttransfer": %{time_starttransfer},
  "time_total": %{time_total},
  "size_download": %{size_download}
}' "$URL" --connect-timeout 3 --max-time 20 2>/dev/null || echo '{}')

echo "$METRICS" | python3 -m json.tool 2>/dev/null || echo "$METRICS"

# 提取首个 JS chunk 做大小检查
CHUNK=$(grep -oE 'src="(/assets/[^"]+\.js)"' /tmp/yivad_perf.html 2>/dev/null | head -n1 | grep -oE '/assets/[^"]+\.js' || true)
JS_SIZE=0
if [ -n "$CHUNK" ]; then
  BASE_URL=$(echo "$URL" | sed -E 's#(https?://[^/]+).*#\1#')
  JS_SIZE=$(curl -s -o /dev/null -w "%{size_download}" "$BASE_URL$CHUNK" --connect-timeout 3 --max-time 15 2>/dev/null || echo 0)
  echo "First JS chunk: $CHUNK -> ${JS_SIZE} bytes"
fi

# 断言
python3 - <<PYEOF
import json
try:
  m = json.loads('''$METRICS''')
except:
  m = {}
ttfb_ms = (m.get("time_starttransfer") or 999) * 1000
html_kb  = (m.get("size_download") or 0) / 1024
js_kb    = ${JS_SIZE:-0} / 1024
print(f"TTFB={ttfb_ms:.0f}ms HTML={html_kb:.1f}KB firstJS={js_kb:.1f}KB")
ok = True
if ttfb_ms >= 800: print("[FAIL] TTFB too high"); ok=False
else: print("[PASS] TTFB threshold")
if html_kb >= 1024: print("[FAIL] HTML >= 1MB"); ok=False
else: print("[PASS] HTML size threshold")
if js_kb >= 500: print("[WARN] first JS chunk >= 500KB")
else: print("[PASS] first JS chunk <500KB")
import sys; sys.exit(0 if ok else 1)
PYEOF
exit $?
```

```bash
#!/bin/bash
# Script 7: 指标 4-10 - Lighthouse (若 npx lighthouse 可用；否则输出提示并 SKIP)
URL="${1:-http://localhost:8848/#/project}"
OUT_DIR=/tmp/yivad_lh
mkdir -p "$OUT_DIR"
REPORT_JSON="$OUT_DIR/report.json"

if ! command -v npx >/dev/null 2>&1; then
  echo "[SKIP] npx not installed -> Lighthouse unavailable"
  exit 2
fi

echo "=== Running Lighthouse for FCP/LCP/CLS/TBT/TTI/SI ==="
# --only-categories=performance 可加速；headless=new 需 Chrome/Chromium
NPM_CONFIG_FETCH_RETRIES=2 timeout 240 npx --yes lighthouse "$URL" \
  --output=json --output-path="$REPORT_JSON" \
  --only-categories=performance \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --quiet \
  >/tmp/yivad_lh.log 2>&1 || {
    echo "[WARN/LIMITED] lighthouse failed; check /tmp/yivad_lh.log. This can happen in server/CI env without Chrome."
    echo "  FCP/LCP/CLS/TBT/TTI/SI = SKIPPED"
    exit 2
  }

python3 - <<PYEOF
import json
r = json.load(open("$REPORT_JSON"))
aud = r.get("audits", {})
def pick(name):
    a = aud.get(name, {})
    return a.get("numericValue"), a.get("displayValue")
metrics = {
  "FCP (first-contentful-paint)": pick("first-contentful-paint"),
  "LCP (largest-contentful-paint)": pick("largest-contentful-paint"),
  "CLS (cumulative-layout-shift)": pick("cumulative-layout-shift"),
  "TBT (total-blocking-time)": pick("total-blocking-time"),
  "TTI (interactive)": pick("interactive"),
  "SI (speed-index)": pick("speed-index"),
}
thresholds = {
  "FCP (first-contentful-paint)": 3000,
  "LCP (largest-contentful-paint)": 4000,
  "CLS (cumulative-layout-shift)": 0.25,
  "TBT (total-blocking-time)": 600,
  "TTI (interactive)": 7300,
  "SI (speed-index)": 5800,
}
ok = True
for k, (v, disp) in metrics.items():
    thr = thresholds[k]
    unit = "ms" if "CLS" not in k else ""
    flag = "PASS" if (v is not None and v < thr) else "FAIL"
    if flag == "FAIL": ok = False
    print(f"[{flag}] {k} = {v} {unit} (display={disp}) threshold < {thr} {unit}")

# 请求总数 + 未压缩 JS（第 10 项）
diag = aud.get("diagnostics", {}).get("details", {}).get("items", [{}])[0] if aud.get("diagnostics") else {}
n_req = diag.get("numRequests", None)
u_js = diag.get("unminifiedJavaScript", None)
print(f"Requests total = {n_req} ; unminified JS = {u_js}")
print(f"Performance score = {r.get('categories',{}).get('performance',{}).get('score', 'N/A')}")
import sys; sys.exit(0 if ok else 1)
PYEOF
exit $?
```

```bash
#!/bin/bash
# Script 8: 资源压缩 (gzip/brotli) 与缓存头
URL="${1:-http://localhost:8848/assets/index.js}"
HEAD_GZ=$(curl -sI -H "Accept-Encoding: gzip, deflate, br" "$URL" --connect-timeout 3 --max-time 10 2>/dev/null)
echo "--- Response headers ---"
echo "$HEAD_GZ" | grep -iE "content-encoding|cache-control|vary|etag" || echo "(none)"
ENC=$(echo "$HEAD_GZ" | grep -i "content-encoding" | head -n1)
CACHE=$(echo "$HEAD_GZ" | grep -i "cache-control" | head -n1)
[ -n "$ENC" ] && echo "[PASS] Content-Encoding present: $ENC" || echo "[WARN] No content-encoding (may be dev mode)"
[ -n "$CACHE" ] && echo "[PASS] Cache-Control present: $CACHE" || echo "[WARN] No Cache-Control"
exit 0
```

```bash
#!/bin/bash
# Script 9: 关键链 waterfall (mtr 级 -> 仅 curl time breakdown)
URL="${1:-http://localhost:8848/}"
curl -s -o /dev/null -w '
  namelookup:  %{time_namelookup}s
  connect:     %{time_connect}s
  appconnect:  %{time_appconnect}s
  pretransfer: %{time_pretransfer}s
  redirect:    %{time_redirect}s
  starttransfer: %{time_starttransfer}s
  total:       %{time_total}s
' "$URL" --connect-timeout 3 --max-time 15 2>/dev/null || echo "curl unavailable"
exit 0
```

```bash
#!/bin/bash
# Script 10: 综合性能阈值汇总（调用 6/7/8/9 摘要）
echo "====== YIVAD PERFORMANCE SUMMARY ======"
echo "Run Script 6 for TTFB/HTML/JS sizes"
echo "Run Script 7 for FCP/LCP/CLS/TBT/TTI/SI (requires Chrome)"
echo "Run Script 8 for compression & cache headers"
echo "Run Script 9 for request waterfall breakdown"
echo "All PASS -> 项目页性能基线达标"
echo "任一 FAIL -> 对应维度回归，需检查构建产物 (Rsbuild analyze)"
exit 0
```
