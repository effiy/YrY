---

doc_type: module
prd_task_id: "YP-09-S01"
title: "百度翻译服务 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "12-prd-百度翻译服务.md"

type: task
---

# 百度翻译服务 — 开发方案

> 来源 PRD：[12-prd-百度翻译服务.md](../../prds/2026-09/12-prd-百度翻译服务.md)

## 源码

`YiPot/src/services/translate/baidu/`

### 签名算法

```javascript
import md5 from "md5";
const salt = Date.now();
const sign = md5(appId + text + salt + secret);
```

### API 请求

```javascript
export default async function translate(text, from, to, options) {
  const salt = Date.now();
  const params = new URLSearchParams({
    q: text, from, to, appid: options.appId, salt,
    sign: md5(options.appId + text + salt + options.secret)
  });

  const res = await fetch("https://api.fanyi.baidu.com/api/trans/vip/translate", {
    method: "POST", body: params
  });
  const data = await res.json();

  if (data.error_code) throw new Error(ERROR_MAP[data.error_code]);

  return {
    text: data.trans_result.map(r => r.dst).join(""),
    from: data.from, to: data.to
  };
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 签名位置 | 前端计算 MD5 | 避免 Rust→JS 传参延迟，MD5 计算 < 1ms |
| 超时策略 | 5s（国内服务快） | 百度国内服务延迟低，5s 足够，快速失败 |
| 错误码映射 | 前端映射表 | 30 个错误码 → 中文提示，用户可读 |

## 性能优化

| 优化 | 收益 |
|------|------|
| 单词查询缓存 (LRU) | 命中率 ~20%，跳过 API |
| salt 使用时间戳 | 确保每次签名不同，但无需额外随机数生成 |
| 词典释义按需返回 | 仅单词查询时解析 dict 字段 |

## 错误处理

| 错误码 | 含义 | 处理 |
|--------|------|------|
| 52000 | 成功 | — |
| 52001 | 请求超时 | 显示"请求超时" + 重试 |
| 52002 | 系统错误 | 显示"百度服务异常" |
| 52003 | 未授权用户 | 显示"App ID 无效" |
| 54000 | 必填参数为空 | 检查传参 |
| 54001 | 签名错误 | 显示"Secret 错误" |
| 54003 | 访问频率受限 | 显示"请求过频" + 1s 冷却 |
| 58001 | 不支持的语言 | 跳过该服务 |

### 完整错误码映射

```javascript
const ERROR_MAP = {
  52001: "请求超时，请稍后重试",
  52002: "系统错误，请稍后重试",
  52003: "未授权用户，请检查 AppID",
  54000: "必填参数为空",
  54001: "签名错误，请检查 Secret Key",
  54003: "访问频率受限",
  54004: "账户余额不足",
  54005: "长文本请求频率过高",
  58000: "客户端 IP 非法，请检查 IP 白名单",
  58001: "译文语言不支持",
  58002: "服务已关闭",
  90107: "认证失败，请检查 AppID 或 Secret"
};
```

### 错误重试策略细化

```
网络错误 (TypeError: Failed to fetch): 自动重试 1 次 (500ms 退避)
HTTP 5xx: 自动重试 1 次 (1s 退避)
HTTP 429: 等待 Retry-After header (默认 1s) → 重试 1 次
业务错误 (4xx): 不重试，直接展示错误提示
签名错误 (54001): 不重试，提示用户检查配置
```

> **不重试原因**：认证/签名/配额等错误属于"确定性失败"，重试只会浪费用户配额和网络资源。

### 多结果 merge 策略

百度翻译 API 对多段文本（如通过换行符分隔）返回 `trans_result` 数组：
```javascript
// 输入: "hello\nworld"
// 响应: trans_result: [{src:"hello", dst:"你好"}, {src:"world", dst:"世界"}]
// 前端合并: 按原分隔符 join
const translated = data.trans_result.map(r => r.dst).join("\n");
```

> 保持原文的换行结构，使翻译结果在视觉上对齐原文。

## 跨平台实现差异

| 方面 | 说明 |
|------|------|
| 平台差异 | 无。百度翻译为纯 HTTP API，前端 fetch 调用，所有平台行为一致 |
| 代理支持 | 通过系统代理设置（环境变量 HTTP_PROXY），无需额外处理 |
| 离线支持 | 不支持。无 API Key 或无网络时自动跳过 |

**关联文档**：
- [翻译服务插件实现](./04-prd-task-翻译服务插件实现.md) — 插件架构与配置持久化
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 翻译流程与并行调度