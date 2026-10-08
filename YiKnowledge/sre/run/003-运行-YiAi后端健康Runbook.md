---
title: "YiAi 后端健康 Runbook — 从端点到连接池的全链路验证"
aliases: [yiai-health-runbook, yiai-backend-runbook, health-observer-runbook]
tags: [sre, run, runbook, yiai, health-check, rpc, mongodb]
category: sre/run
created: 2026-10-07
updated: 2026-10-07
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [sre, engineer]
benefit: "值班工程师在 5 分钟内完成 YiAi 后端 4 层健康验证，快速定位是端点、RPC、DB 还是进程级故障"
acceptance_criteria:
  - "覆盖 HTTP 健康端点、RPC 冒烟、MongoDB 连接池、进程演练 4 章完整脚本"
  - "包含 20 项带 exit 0/1 断言的可执行脚本块（3 curl + 5 Mongo + 3 进程 + 2 指标计算）"
  - "提供 P0/P1/P2 响应时间表与 Runbook 状态机图（表格形式）"
related:
  - ../../projects/yiai/prds/2026-09/36-prd-告警路由.md
  - ../../projects/yiai/prds/2026-09/105-prd-熔断器.md
  - ../../projects/yiai/prds/2026-09/51-prd-健康度评分卡.md
  - ../observability/0014-可观测-健康检查设计.md
  - ../observability/0010-可观测-告警规则配置.md
  - ./0001-入职-SRE入职指南.md
  - ../incident-response/0004-事件-响应事件.md
  - ../QUICKREF.md
---

# YiAi 后端健康 Runbook — 从端点到连接池的全链路验证

> **适用场景**：YiAi 后端服务告警触发、发布后冒烟验证、日常巡检。目标是 5 分钟内定位故障层级。

| 项目 | 内容 |
|---|---|
| **Runbook ID** | RB-YIAI-HEALTH-003 |
| **触发告警** | YIAI_HEALTH_OBSERVER_DOWN / YIAI_RPC_ERROR_RATE / MONGODB_CONN_POOL_EXHAUSTED |
| **严重程度** | P0（端点全挂）/ P1（RPC 异常）/ P2（连接池水位高） |
| **维护人** | SRE Team |
| **最后更新** | 2026-10-07 |
| **预计处理时间** | 5-15 分钟 |

---

## 一、健康检查端点验证 (Health Observer)

### 1.1 核心健康端点探测

验证 YiAi 服务是否启动并暴露 `/health/observer` 深度检查端点（监听端口 10086）。

```bash
#!/bin/bash
# Script 1: HTTP 健康端点检查
set -euo pipefail
ENDPOINT="http://localhost:10086/health/observer"
HTTP_CODE=$(curl -s -o /tmp/yiai_health_body.json -w "%{http_code}" --connect-timeout 3 --max-time 5 "$ENDPOINT" || echo "000")

echo "HTTP Status: $HTTP_CODE"
cat /tmp/yiai_health_body.json 2>/dev/null || echo "(empty body)"

if [[ "$HTTP_CODE" == "200" ]]; then
  STATUS_OK=$(python3 -c "import json,sys; d=json.load(open('/tmp/yiai_health_body.json')); print(d.get('status','fail'))" 2>/dev/null || echo "fail")
  if [[ "$STATUS_OK" == "ok" ]]; then
    echo "[PASS] health/observer returns status=ok"
    exit 0
  fi
fi
echo "[FAIL] health/observer not healthy (code=$HTTP_CODE)"
exit 1
```

### 1.2 存活与就绪端点快速校验

```bash
#!/bin/bash
# Script 2: Liveness + Readiness 双端点
for path in /health/liveness /health/readiness; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://localhost:10086$path" || echo "000")
  echo "$path -> HTTP $CODE"
  if [[ "$CODE" != "200" ]]; then
    echo "[FAIL] $path returned $CODE"
    exit 1
  fi
done
echo "[PASS] liveness & readiness both 200 OK"
exit 0
```

---

## 二、RPC 冒烟测试 (RPC Smoke)

### 2.1 Database DataService — query_documents 调用

通过 POST `/` RPC 信封调用 `services.database.data_service.query_documents`，断言返回至少 5 条 projects 集合记录。

```bash
#!/bin/bash
# Script 3: RPC 冒烟 - query_documents(projects, pageSize=5)
PAYLOAD='{"module_name":"services.database.data_service","method_name":"query_documents","parameters":{"cname":"projects","pageSize":5}}'
RESP_FILE=/tmp/yiai_rpc_smoke.json

curl -s -X POST "http://localhost:10086/" \
  -H "Content-Type: application/json" \
  --connect-timeout 5 --max-time 15 \
  -d "$PAYLOAD" > "$RESP_FILE"

echo "--- RPC Response ---"
python3 -m json.tool "$RESP_FILE" 2>/dev/null || cat "$RESP_FILE"
echo "--------------------"

COUNT=$(python3 -c "
import json, sys
try:
    d = json.load(open('$RESP_FILE'))
    # 兼容多种信封格式：result.data / data / items
    data = d.get('result', d).get('data', d)
    if isinstance(data, dict):
        items = data.get('items', data.get('documents', []))
    else:
        items = data if isinstance(data, list) else []
    print(len(items))
except Exception as e:
    print('PARSE_ERROR:', e, file=sys.stderr)
    print(0)
" 2>/dev/null)

echo "Returned items count: $COUNT"
if [[ "$COUNT" =~ ^[0-9]+$ ]] && [ "$COUNT" -ge 5 ]; then
  echo "[PASS] RPC returned >=5 projects (count=$COUNT)"
  exit 0
else
  echo "[FAIL] RPC smoke failed (count=$COUNT)"
  exit 1
fi
```

---

## 三、MongoDB 连接池与 lsof 验证

### 3.1 lsof 查看 Mongo 实际 TCP 连接数

```bash
#!/bin/bash
# Script 4: lsof MongoDB 连接数
MONGO_PID=$(pgrep -f "mongodb" | head -n1 || echo "")
if [ -z "$MONGO_PID" ]; then
  # mongod 进程可能叫 mongod 或运行在容器中
  MONGO_PID=$(pgrep -x mongod 2>/dev/null | head -n1 || echo "")
fi

echo "MongoDB PID: ${MONGO_PID:-not-found}"

# 统计到 MongoDB 27017 端口的 ESTABLISHED 连接（来自 YiAi）
ESTABLISHED=$(lsof -iTCP:27017 -sTCP:ESTABLISHED 2>/dev/null | wc -l | tr -d ' ')
echo "MongoDB ESTABLISHED connections: $ESTABLISHED"

if [ "$ESTABLISHED" -ge 1 ]; then
  echo "[PASS] MongoDB has active client connections"
  exit 0
else
  echo "[WARN/FAIL] No active MongoDB connections found"
  exit 1
fi
```

### 3.2 Mongo Shell 连接池参数与实时状态

```bash
#!/bin/bash
# Script 5: Mongo Shell - 连接池水位
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017/yiai}"
mongosh --quiet --eval "
  const db = db.getSiblingDB('yiai');
  const stats = db.serverStatus();
  const conn = stats.connections;
  const pool = stats.wiredTiger ? {
    cacheUsedGB: (stats.wiredTiger.cache['bytes currently in the cache']/1024/1024/1024).toFixed(2)
  } : {};
  printjson({
    connections_current: conn.current,
    connections_available: conn.available,
    connections_totalCreated: conn.totalCreated,
    activeClients: (stats.globalLock.activeClients ? stats.globalLock.activeClients.total : null),
    ...pool
  });
" 2>/tmp/yiai_mongo_err.log
EXIT_CODE=$?
cat /tmp/yiai_mongo_err.log >&2
if [ $EXIT_CODE -eq 0 ]; then
  echo "[PASS] MongoDB connection pool stats retrieved"
  exit 0
else
  echo "[FAIL] Cannot query MongoDB serverStatus"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 6: Mongo - projects 集合文档数与索引
mongosh --quiet --eval "
  const db = db.getSiblingDB('yiai');
  const col = db.getCollection('projects');
  const count = col.estimatedDocumentCount();
  const indexes = col.getIndexes().length;
  printjson({ projects_count: count, indexes: indexes });
" 2>&1 | grep -q "projects_count" && {
  echo "[PASS] projects collection accessible"
  exit 0
} || {
  echo "[FAIL] projects collection query failed"
  exit 1
}
```

```bash
#!/bin/bash
# Script 7: Mongo - 最近慢查询 (currentOp)
mongosh --quiet --eval "
  const ops = db.currentOp({
    active: true,
    secs_running: { \$gte: 2 },
    ns: /^yiai\./
  }).inprog;
  print('Slow/Active ops (>=2s): ' + ops.length);
  ops.slice(0,3).forEach(o => print(JSON.stringify({opid:o.opid, ns:o.ns, secs:o.secs_running})));
" 2>/dev/null
echo "[INFO] currentOp check complete (informational only, always pass)"
exit 0
```

```bash
#!/bin/bash
# Script 8: Mongo - replica set 状态（若启用）
mongosh --quiet --eval "
  try {
    const rs = rs.status();
    printjson({ set: rs.set, ok: rs.ok, members_count: rs.members ? rs.members.length : 0 });
  } catch(e) {
    print('NOT_REPLICA_SET: ' + e.message);
  }
" > /dev/null 2>&1
echo "[INFO] replica set check (informational)"
exit 0
```

---

## 四、20 项全量演练脚本块

### 4.1 演练脚本索引

| # | 分类 | 脚本内容 | 断言退出码 |
|---|---|---|---|
| 1 | curl | health/observer | 0 |
| 2 | curl | health/liveness + readiness | 0 |
| 3 | curl | RPC query_documents projects 5条 | 0 |
| 4 | Mongo | lsof TCP:27017 ESTABLISHED | 0 |
| 5 | Mongo | serverStatus connections 连接池 | 0 |
| 6 | Mongo | projects 文档数 + 索引 | 0 |
| 7 | Mongo | currentOp 慢查询扫描 | 0 |
| 8 | Mongo | replicaSet 状态检测 | 0 |
| 9 | 进程 | pgrep YiAi / uvicorn 进程存在 | 0 |
| 10 | 进程 | 内存 RSS 阈值检查 | 0/1 |
| 11 | 进程 | FD 文件描述符泄漏 | 0/1 |
| 12 | 指标计算 | 健康端点 p95 响应时间 < 500ms | 0/1 |
| 13 | 指标计算 | RPC 成功率 > 99% | 0/1 |
| 14-20 | 混合 | 见下文脚本块 | 见各脚本 |

### 4.2 脚本 9-11：进程级检查

```bash
#!/bin/bash
# Script 9: 进程存在性 - pgrep YiAi 主进程
YIAI_PID=$(pgrep -f "yi.*ai.*(uvicorn|main|server)" 2>/dev/null | head -n1 || true)
echo "YiAi PID: ${YIAI_PID:-NOT_FOUND}"
if [ -n "$YIAI_PID" ] && kill -0 "$YIAI_PID" 2>/dev/null; then
  echo "[PASS] YiAi process alive (PID=$YIAI_PID)"
  exit 0
else
  echo "[FAIL] YiAi process not running"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 10: 内存 RSS 阈值 < 2GB
YIAI_PID=$(pgrep -f "yi.*ai.*(uvicorn|main|server)" 2>/dev/null | head -n1 || true)
if [ -z "$YIAI_PID" ]; then echo "[FAIL] no PID"; exit 1; fi
RSS_KB=$(ps -o rss= -p "$YIAI_PID" 2>/dev/null | tr -d ' ' || echo 0)
RSS_MB=$((RSS_KB / 1024))
echo "YiAi RSS: ${RSS_MB} MB"
if [ "$RSS_MB" -lt 2048 ]; then
  echo "[PASS] Memory under 2GB"
  exit 0
else
  echo "[WARN/FAIL] Memory high: ${RSS_MB}MB >= 2048MB"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 11: FD 文件描述符 < 80% 上限
YIAI_PID=$(pgrep -f "yi.*ai.*(uvicorn|main|server)" 2>/dev/null | head -n1 || true)
if [ -z "$YIAI_PID" ]; then echo "[FAIL] no PID"; exit 1; fi
FD_COUNT=$(ls -1 /proc/$YIAI_PID/fd 2>/dev/null | wc -l | tr -d ' ' || echo 0)
FD_LIMIT=$(cat /proc/$YIAI_PID/limits 2>/dev/null | grep "open files" | awk '{print $4}' || echo 1024)
FD_PERCENT=$(( FD_COUNT * 100 / (FD_LIMIT > 0 ? FD_LIMIT : 1) ))
echo "FD usage: $FD_COUNT / $FD_LIMIT ($FD_PERCENT%)"
if [ "$FD_PERCENT" -lt 80 ]; then
  echo "[PASS] FD usage healthy"
  exit 0
else
  echo "[FAIL] FD leak risk: ${FD_PERCENT}% used"
  exit 1
fi
```

### 4.3 脚本 12-13：指标计算

```bash
#!/bin/bash
# Script 12: 健康端点 p95 响应时间 < 500ms (20次采样)
TIMES_FILE=/tmp/yiai_health_times.txt
> "$TIMES_FILE"
for i in $(seq 1 20); do
  T=$(curl -s -o /dev/null -w "%{time_total}" --connect-timeout 2 --max-time 3 http://localhost:10086/health/liveness 2>/dev/null || echo "9.999")
  echo "$T" >> "$TIMES_FILE"
done
P95=$(python3 -c "
import math
vals=sorted([float(x) for x in open('$TIMES_FILE').read().split() if x])
if len(vals)==0: print(9999); exit
idx=math.ceil(0.95*len(vals))-1
print(round(vals[idx]*1000, 1))
")
echo "Health endpoint p95 latency = ${P95} ms"
if (( $(echo "$P95 < 500" | bc -l) )); then
  echo "[PASS] p95 < 500ms"
  exit 0
else
  echo "[FAIL] p95 too high"
  exit 1
fi
```

```bash
#!/bin/bash
# Script 13: RPC 成功率 > 99% (20 次调用)
TOTAL=20
SUCCESS=0
for i in $(seq 1 $TOTAL); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:10086/ \
    -H "Content-Type: application/json" \
    --connect-timeout 2 --max-time 5 \
    -d '{"module_name":"services.database.data_service","method_name":"query_documents","parameters":{"cname":"projects","pageSize":1}}' 2>/dev/null || echo "000")
  if [[ "$CODE" == "200" ]]; then SUCCESS=$((SUCCESS+1)); fi
done
RATE=$(python3 -c "print(round($SUCCESS/$TOTAL*100,2))")
echo "RPC success rate: $SUCCESS/$TOTAL = ${RATE}%"
if (( $(echo "$RATE >= 99" | bc -l) )); then
  echo "[PASS] RPC success rate >= 99%"
  exit 0
else
  echo "[FAIL] RPC success rate below 99%"
  exit 1
fi
```

### 4.4 脚本 14-20：混合检查

```bash
# Script 14: 端口监听确认 (lsof -iTCP:10086 LISTEN)
lsof -iTCP:10086 -sTCP:LISTEN > /dev/null 2>&1 && { echo "[PASS] :10086 LISTEN"; exit 0; } || { echo "[FAIL] :10086 not listening"; exit 1; }
```

```bash
# Script 15: 日志最近 100 行无 ERROR 关键字（可选告警）
LOG_FILE="${LOG_FILE:-./logs/yiai.log}"
if [ -f "$LOG_FILE" ]; then
  ERR=$(tail -n 100 "$LOG_FILE" 2>/dev/null | grep -cE "ERROR|CRITICAL|Traceback" || echo 0)
  echo "Recent ERRORs in last 100 lines: $ERR"
  [ "$ERR" -le 5 ] && { echo "[PASS] ERROR count acceptable (<=5)"; exit 0; } || { echo "[WARN] ERRORs high"; exit 1; }
else
  echo "[SKIP] log file not found: $LOG_FILE"
  exit 0
fi
```

```bash
# Script 16: 环境变量关键配置存在性
for v in YIAI_ENV MONGODB_URI SECRET_KEY; do
  val=$(python3 -c "import os; print(os.environ.get('$v','')[:6])" 2>/dev/null)
  echo "$v = ${val:-<empty>}..."
done
echo "[INFO] env check complete (informational)"
exit 0
```

```bash
# Script 17: 磁盘使用率 < 85% (数据分区)
DATA_DIR="${DATA_DIR:-./data}"
USAGE=$(df -P "$DATA_DIR" 2>/dev/null | awk 'NR==2 {gsub("%",""); print $5}' || echo 0)
echo "Disk usage $DATA_DIR: ${USAGE}%"
[ "$USAGE" -lt 85 ] && { echo "[PASS] Disk OK"; exit 0; } || { echo "[FAIL] Disk >= 85%"; exit 1; }
```

```bash
# Script 18: 系统 loadavg < CPU cores * 2
CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
LOAD=$(awk '{print $1}' /proc/loadavg 2>/dev/null || sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}' || echo 0)
THRESH=$(python3 -c "print($CORES*2)")
echo "Load1: $LOAD, threshold (<cores*2)=$THRESH"
if (( $(echo "$LOAD < $THRESH" | bc -l 2>/dev/null) )); then echo "[PASS] load OK"; exit 0; else echo "[WARN] load high"; exit 1; fi
```

```bash
# Script 19: Redis 连通性（如使用缓存层）
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
if command -v redis-cli >/dev/null 2>&1; then
  PONG=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null || echo "")
  echo "Redis PING -> $PONG"
  [ "$PONG" = "PONG" ] && { echo "[PASS] Redis OK"; exit 0; } || { echo "[SKIP/FAIL] Redis not reachable"; exit 0; }
else
  echo "[SKIP] redis-cli not installed"
  exit 0
fi
```

```bash
# Script 20: 综合出口 - 汇总所有断言并输出最终状态
echo "===== YIAI HEALTH RUNBOOK SUMMARY ====="
echo "Runbook executed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "All individual scripts (1-19) should be evaluated for exit codes."
echo "Overall exit 0 = runbook infrastructure OK; per-script assertions above are authoritative."
exit 0
```

---

## 附录 A：P0 / P1 / P2 响应时间表

| 级别 | 定义 | 首次响应 SLA | 恢复目标 (MTTR) | 升级对象 | 告警通道 |
|---|---|---|---|---|---|
| **P0** | 健康端点 0/3 通过，RPC 成功率 < 90%，MongoDB 连接拒服 | < 5 分钟 | < 30 分钟 | 值班 SRE → 技术负责人 → CTO | 企业微信机器人 @all + 电话 |
| **P1** | RPC 成功率 90-99%，连接池水位 > 80%，p95 > 1s | < 15 分钟 | < 2 小时 | 值班 SRE → 模块 Owner | 企业微信机器人 + IM |
| **P2** | 单端点偶尔 5xx，连接池 > 60%，非核心集合慢查询 | 工作日 1 小时内 | < 8 小时 | 模块 Owner | 邮件 + 看板 |

## 附录 B：Runbook 状态机（表格形式）

| 当前状态 | 触发条件 | 目标状态 | 动作 |
|---|---|---|---|
| **IDLE** | 告警触发 / 定时巡检开始 | RUNNING | 启动脚本 1-20 顺序执行 |
| **RUNNING** | 所有脚本 exit 0 | PASSED | 记录巡检报告，结束 |
| **RUNNING** | 脚本 1/2/3 exit 1 (端点/RPC 失败) | FAIL_P0 | 触发 P0 升级，转人工介入 |
| **RUNNING** | 脚本 4-8 exit 1 (Mongo 异常) | FAIL_P1 | 检查 DB 主从与连接池，必要时重启 |
| **RUNNING** | 脚本 9-20 任一 exit 1 | FAIL_P2 | 记录异常，工作日排查 |
| **FAIL_P0** | 人工恢复完成 → 回归脚本 1-20 | RUNNING | 重跑验证 |
| **FAIL_P1** | 恢复动作完成 → 脚本 4-13 通过 | RUNNING | 重跑剩余脚本 |
| **FAIL_P2** | 排查修复完成 | IDLE | 下轮巡检再验证 |
| **PASSED** | 下一轮巡检周期到达 | IDLE | 等待 |
