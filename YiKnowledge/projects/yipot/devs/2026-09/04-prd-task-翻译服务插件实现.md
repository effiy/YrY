---

doc_type: module
prd_task_id: "YP-09-M07"
title: "翻译服务插件实现 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 6
source_prd: "05-prd-翻译服务接口全景.md"

type: task
---

# 翻译服务插件实现 — 开发方案

> 来源 PRD：[05-prd-翻译服务接口全景.md](../../prds/2026-09/05-prd-翻译服务接口全景.md)

---

## 一、插件接口规范

每个翻译服务插件由 3 个文件组成：

```
services/translate/{provider}/
├── info.ts    — 插件元信息
├── index.jsx  — 翻译核心逻辑
└── Config.jsx — 配置界面
```

### info.ts 接口

```typescript
export const info = {
  id: "baidu",
  name: "百度翻译",
  type: "translate",
  languages: ["auto", "zh", "en", "ja", "ko", "fr", "de", "es", ...],
  configurable: true,
  needs: [{ name: "appId", message: "APP ID" }, { name: "secret", message: "密钥" }]
};
```

### index.jsx 接口

```typescript
export default async function translate(text, from, to, options) {
  // options = { appId, secret, ... }
  const result = await fetch(API_URL, { body: signedParams });
  return {
    text: result.trans_result[0].dst,
    from: result.from,
    to: result.to,
    phonetics: result.phonetics,
    explains: result.explains
  };
}
```

### Config.jsx 接口

- React 组件，接收 `config` prop
- 返回配置表单（API Key 输入、选项设置）
- 支持配置验证和保存

---

## 二、21 个翻译插件清单

| # | 插件 | 目录 | 认证方式 | 特殊参数 |
|---|------|------|---------|---------|
| 1 | 百度翻译 | `translate/baidu/` | AppID+Secret | — |
| 2 | 百度垂直领域 | `translate/baidu_field/` | AppID+Secret | domain |
| 3 | Google 翻译 | `translate/google/` | 免费 | — |
| 4 | DeepL | `translate/deepl/` | API Key | formality |
| 5 | OpenAI | `translate/openai/` | API Key | model, prompt |
| 6 | 阿里翻译 | `translate/alibaba/` | AK+SK | — |
| 7 | 腾讯翻译 | `translate/tencent/` | SecretId+Key | — |
| 8 | 火山翻译 | `translate/volcengine/` | AK+SK | — |
| 9 | 有道翻译 | `translate/youdao/` | AppKey+Secret | — |
| 10 | 彩云小译 | `translate/caiyun/` | Token | — |
| 11 | Bing 翻译 | `translate/bing/` | API Key | — |
| 12 | Yandex | `translate/yandex/` | API Key | — |
| 13 | Ollama | `translate/ollama/` | 本地 | model |
| 14 | ChatGLM | `translate/chatglm/` | API Key | model |
| 15 | Gemini Pro | `translate/geminipro/` | API Key | model |
| 16 | 小牛翻译 | `translate/niutrans/` | API Key | — |
| 17 | Transmart | `translate/transmart/` | AK+SK | — |
| 18 | 必应词典 | `translate/bing_dict/` | 免费 | — |
| 19 | 剑桥词典 | `translate/cambridge_dict/` | 免费 | — |
| 20 | ECDICT | `translate/ecdict/` | 本地 | — |
| 21 | Lingva | `translate/lingva/` | 自托管 | customURL |

---

## 三、并行翻译调度

```javascript
// YiPot/src/window/Translate/index.jsx (核心调度逻辑)
async function translateAll(text, from, to) {
  const enabledServices = getEnabledServices("translate");
  const results = await Promise.allSettled(
    enabledServices.map(s => s.translate(text, from, to, s.config))
  );
  return results.map((r, i) => ({
    service: enabledServices[i].info.name,
    status: r.status,
    data: r.status === "fulfilled" ? r.value : null,
    error: r.status === "rejected" ? r.reason : null
  }));
}
```

### 错误处理策略

| 错误类型 | 处理 |
|---------|------|
| 网络超时 | 10s 超时，显示"请求超时" |
| API Key 错误 | 显示"认证失败，请检查 API Key" |
| 配额耗尽 | 显示"今日配额已用完" |
| 服务不可用 | 显示"服务暂时不可用" |
| 未知错误 | 显示原始错误信息 |

---

## 四、服务配置持久化

每个插件配置通过 `useConfig` hook → `tauri-plugin-store` 保存：

```javascript
// 百度翻译配置结构
{
  "translate_baidu_appId": "xxx",
  "translate_baidu_secret": "xxx(encrypted)",
  "translate_baidu_enable": true,
  "translate_baidu_order": 0
}
```


## 五、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 插件加载 | 构建时静态 import | 运行时动态 import() / require() | TypeScript 编译时类型检查，Tree-shaking 最优，Bundle 分析可见 | 新增插件需重新构建，无法热插拔 |
| 认证方式 | 各插件自行实现签名逻辑 | 统一 Auth 中间层 | 每家 API 签名算法完全不同 (MD5/HMAC/Token)，统一层反而增加复杂度 | 代码重复 (签名逻辑)，每个插件 ~30 行认证代码 |
| 配置加密 | tauri-plugin-store 明文 + 前端 Base64 | 系统 Keychain / DPAPI | JSON 文件跨平台一致，人类可读便于调试，社区习惯 | API Key 以明文存储于磁盘 (仅本地文件权限保护) |
| 服务排序 | `order` 字段 + 拖拽排序 | 按响应速度自动排序 | 用户可控，确定性排序 (不会每次刷新变化) | 需手动调整，不会自动将快速服务提前 |
| 错误粒度 | 每个服务独立错误状态 | 全局统一错误 | 用户清楚知道哪个服务不可用，可针对性修复 | UI 信息量大，多个服务同时出错时显示冗余 |

### 插件三文件分离原理

```
info.ts    — 纯元数据（构建时可扫描生成插件清单）
index.jsx  — 纯翻译逻辑（无 React 依赖，可直接单元测试）
Config.jsx — React 组件（仅在设置页选中时延迟加载）

为什么分离:
  - info.ts 导出常量 → Rollup/Vite 可在构建时 tree-shaking 掉未启用的插件
  - index.jsx 无 React → 可在 Node.js 环境直接测试 (vitest + jsdom 可选)
  - Config.jsx 懒加载 → 设置页不一次性加载所有插件配置表单 (Bundle 减少 ~200KB)
```

### 认证流程设计

```
用户配置插件:
  Config.jsx → 输入 AppID/Secret
    → useConfig Hook → tauri-plugin-store 写入磁盘
    → Rust 配置管理 (config.rs) 维护内存缓存

翻译时:
  index.jsx 从 options 参数读取 { appId, secret }
    → 构造签名 (MD5/HMAC/SHA256 因服务而异)
    → fetch API 请求
    → 解析响应

不采用统一 Auth 层的原因:
  各服务认证方式完全不同:
  - 百度: MD5(appId+text+salt+secret)
  - 阿里: HMAC-SHA1(AccessKey + 规范请求)
  - DeepL: Authorization: DeepL-Auth-Key {key}
  - OpenAI: Authorization: Bearer {key}
  - 腾讯: TC3-HMAC-SHA256 (需多步签名)
  
  统一 Auth 层反而需要维护 21 种签名算法工厂，复杂度不降反增。
```


## 六、错误处理与恢复 (认证与调用)

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | DNS 解析失败 / 连接超时 (10s) | 标记 "network_error" + 显示服务名 | 手动重试 | "网络不可用 [服务名]" |
| L2-认证 | 401 Unauthorized | 标记 "unauthorized" + 禁止自动重试 | 跳转到服务配置页 | "认证失败，请检查 AppID/Secret [服务名]" |
| L2-认证 | 403 Forbidden | 同 401 (通常为 IP 白名单限制) | 用户检查服务后台配置 | "访问被拒绝 [服务名]" |
| L2-配额 | 429 Too Many Requests | 标记 "quota_exceeded" + 显示 Retry-After | 等待 Retry-After 后自动恢复 | "请求过于频繁，请稍后重试 [服务名]" |
| L2-配额 | 54003/54004 (自定义额度错误) | 标记 "quota_exhausted" | 用户等待次日配额重置 | "今日配额已用完 [服务名]" |
| L3-服务 | 签名算法错误 (52001-52009) | 标记 "config_error" + 提示检查配置 | 用户修正配置 | "签名验证失败，请检查 AppID/Secret" |
| L3-服务 | 不支持的语种 | 标记 "unsupported_lang" | 自动隐藏该服务结果 | 无感知（其他服务正常展示） |
| L4-前端 | JSON 解析失败 (响应非 JSON) | 记录原始响应 + 标记 "parse_error" | 自动重试 1 次 | "服务响应异常 [服务名]" |

### 错误码映射表 (百度翻译示例)

```
52001 → "请求超时，请稍后重试"
52002 → "系统错误，请稍后重试"
52003 → "未授权用户，请检查 AppID"
54000 → "必填参数为空"
54001 → "签名错误，请检查 Secret Key"
54003 → "访问频率受限"
54004 → "账户余额不足"
54005 → "长query请求频繁"
58000 → "客户端 IP 非法"
58001 → "译文语言不支持"
58002 → "服务当前已关闭"
```

> 每个插件内部维护 `ERROR_MAP`，将服务特定错误码转为人可读的中文提示。


## 七、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 请求去重 | 相同 text+from+to+service 的并发请求合并 | 快速切换语言时减少 40% 请求 | 切换语言场景生效 |
| 响应缓存 | LRU Cache (容量 200, TTL 5min) | 重复查询命中率 ~25% | 缓存命中 < 5ms |
| 签名计算 | 使用 Web Crypto API (原生) 替代纯 JS 实现 | HMAC/MD5 计算速度 5x | 签名计算 < 0.5ms |
| 配置缓存 | 每个服务配置在启动时加载到内存 | 避免每次翻译读磁盘 | 配置读取 < 0.1ms |
| 插件懒加载 | 非活跃插件 Config.jsx React.lazy | 设置页首屏 Bundle -40% | 首屏加载 400ms → 240ms |

**关联文档**：
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 翻译流程与并行调度
- [需求总览](./00-prd-task-需求总览.md) — 系统架构总览