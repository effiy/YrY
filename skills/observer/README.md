# observer

快速参考：Agent Harness Performance Observer，为 `api.effiy.cn/mcp` 提供可靠性封装。

## 命令

```bash
# 通过 Observer 调用 MCP 工具
node skills/observer/scripts/observer-client.js --call read_file --args '{"target_file":"README.md"}'

# 健康检查
node skills/observer/scripts/observer-client.js --health

# 将缓冲区中的遥测数据刷盘
node skills/observer/scripts/observer-client.js --flush
```

## 可靠性特性

| 特性 | 实现 | 保护对象 |
|------|------|----------|
| **内存爆炸修复** | 固定大小环形缓冲区 + 尾采样 | 本地进程内存 |
| **节流** | 每类工具的 Token Bucket | MCP 服务端 + 本地 CPU |
| **沙箱访问修复** | 路径白名单 + 模块名过滤 | 工作区文件系统 |
| **懒启动** | 首次 `callTool()` 时才建立 SSE | 文件描述符 |
| **重入守卫** | 调用深度计数 + 递归锁 | 无限循环 / 栈溢出 |

## 在脚本中使用

```javascript
const { ObserverClient } = require('./skills/observer/scripts/observer-client.js');

const client = new ObserverClient();

try {
  const result = await client.callTool('read_file', { target_file: 'README.md' });
  console.log(result);
} finally {
  await client.disconnect();
}
```

## 遥测输出

`docs/.memory/observer-telemetry.jsonl` — 每 30 秒自动刷盘，或进程退出时刷盘。

```json
{"ts":1714723200000,"tool":"read_file","depth":1,"latency":45,"error":null,"size":1234}
```
