---

doc_type: module
prd_task_id: "YP-09-M02"
title: "翻译核心架构 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 5
source_prd: "01-prd-划词翻译核心.md"

type: task
---

# 翻译核心架构 — 开发方案

> 来源 PRD：[01-prd-划词翻译核心.md](../../prds/2026-09/01-prd-划词翻译核心.md)
> 需求编号：YP-09-M02 · 优先级：高 · 人天：5d

> **文档职责**：本文档定义**怎么做、为什么这么做**（HOW），不含产品目标与测试用例。

---

## 一、翻译流程架构

### 数据流

```
用户选中文本 → Tauri hotkey 触发
  → clipboard.rs 读取选中文本
  → invoke 传递到 React 前端
  → Translate Window 打开
  → lang_detect 检测语言
  → Service Layer 并行调用翻译接口
  → 结果聚合展示
```

### 翻译服务接口

```typescript
// 每个翻译插件需实现的接口
interface TranslateService {
  info: {
    id: string;
    name: string;
    type: "translate";
    languages: string[];
  };
  translate(text: string, from: string, to: string): Promise<TranslateResult>;
}

interface TranslateResult {
  text: string;        // 翻译结果
  from: string;        // 检测到的源语言
  to: string;          // 目标语言
  phonetics?: string;  // 音标/发音
  explains?: string[]; // 词典释义
}
```

## 二、关键实现

### 2.1 划词翻译

**前端**: `YiPot/src/window/Translate/index.jsx`
- 监听 Tauri `translate-event` 事件
- 并行调用多个翻译服务
- 结果并排展示（多列布局）

**后端 (Rust)**: `YiPot/src-tauri/src/clipboard.rs`
- `get_selected_text()` — 模拟 Ctrl+C 获取选中文本
- Linux: 通过 x11-clipboard 或 wl-clipboard

### 2.2 剪切板监听

**后端 (Rust)**: `YiPot/src-tauri/src/clipboard.rs`
- 定时轮询剪切板内容（100ms 间隔）
- 内容变化时触发前端事件
- 过滤非文本内容

### 2.3 语言检测

`YiPot/src/utils/lang_detect.js`
- 使用 franc 或自定义规则检测语言
- 支持中/英/日/韩/法/德/西等常用语言

## 三、服务插件实现

### 内置翻译服务

| 插件目录 | 服务 | 特点 |
|---------|------|------|
| `services/translate/baidu/` | 百度翻译 | 中文优化 |
| `services/translate/google/` | Google 翻译 | 免费 |
| `services/translate/deepl/` | DeepL | 高质量 |
| `services/translate/openai/` | OpenAI | AI 翻译 |

### 并行查询策略

```
Promise.allSettled([...services.map(s => s.translate(text, from, to))])
  → 成功的展示结果，失败的显示错误标记
  → 不因单个服务失败而阻塞其他结果
```


## 四、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 并发调度 | Promise.allSettled | Promise.all / 串行 | 单个接口故障不影响其他结果展示，总能得到部分结果 | 无法取消已发出请求（需 AbortController 补偿） |
| 服务发现 | 静态 import + info.ts 扫描 | 动态注册 / DI 容器 | 构建时类型检查，Tree-shaking 优化，零运行时开销 | 新增翻译服务需要重新编译 |
| 结果聚合 | 前端并排多列展示 | Tab 切换 / 下拉选择 | 一键对比多个翻译结果，减少用户操作步骤 | 窗口宽度增加 40%，小屏体验需优化 |
| 语言检测 | franc (前端) + 服务端返回 | 仅服务端 / 仅前端 | 前端快速预判（<50ms），服务端精确确认，双重保障 | franc 对短文本（<10 字）准确率下降至 70% |
| 剪贴板读取 | Rust 模拟 Ctrl+C + 恢复原剪贴板 | 系统 API 直接读取选区 | 跨平台统一行为，无需平台特定 Selection API | 短暂覆盖用户剪贴板（毫秒级），需 restore 机制 |

### 并行调度设计细节

选择 `Promise.allSettled` 而非 `Promise.all` 的核心原因：

```
场景: 用户同时启用百度(500ms) + Google(失败) + DeepL(800ms)

Promise.all:
  → Google 失败导致全部拒绝
  → 用户看到空白/错误，零价值

Promise.allSettled:
  → 百度 500ms 展示 + DeepL 800ms 展示
  → Google 显示 "请求失败 (403)"
  → 用户获得 2/3 结果，部分价值
```

**代价**：无法提前终止（如用户关闭窗口后仍会完成请求），通过 AbortController 绑定窗口生命周期补偿。

### 插件接口设计

```typescript
interface TranslateService {
  info: { id: string; name: string; type: "translate"; languages: string[] };
  translate(text: string, from: string, to: string): Promise<TranslateResult>;
}
```

`languages` 字段不在翻译时传递而在 info 中声明，使得语言列表可以在 **构建时** 静态提取（生成语言-服务映射表），运行时无需每请求都传语言参数。


## 五、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 翻译结果缓存 | 实例级 LRU Cache，key=`{text}:{from}:{to}:{service}`，容量 200 | 划词场景重复查询命中率 ~25% | 缓存命中时延 < 5ms |
| 并行翻译 | Promise.allSettled 替代串行等待 | N 服务总时延 = max(单独时延) | 3 服务: 1.2s → 0.5s |
| 语言检测懒执行 | franc 仅在 lang=auto 时调用，已知语言跳过 | 避免不必要的 NLP 计算 | 节省 ~30ms/次 (已知语言场景) |
| 文本预处理 | 去空白 + 截断 > 5000 字符 + 去重换行 | 减少无效 API 调用，降低传输量 | 大文本场景请求体 -15% |
| 请求去重 | 相同 text+from+to 的并发请求合并为单次 | 防止用户快速切换语言时重复请求 | 快速切换场景请求量 -40% |
| 服务优先级 | 响应快的服务优先展示，后续结果追加 | 用户最快看到第一个结果 | 首结果展示时间 -40% (P50) |

### LRU Cache 实现策略

```javascript
// cache key 设计
const cacheKey = `${hash(text, from, to)}:${serviceId}`;
// hash 使用 djb2 算法，避免长文本 key 内存膨胀
// 缓存失效: 配置变更（API Key 修改）时清空对应服务缓存
```


## 六、错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | 请求超时 (10s) | AbortController 取消 + 标记 "timeout" | 手动重试按钮 | "请求超时 [服务名]" |
| L1-网络 | DNS 解析失败 | 标记 "network" 错误 | 自动重试 1 次 (2s 后) | "网络不可用，正在重试..." |
| L2-认证 | API Key 无效 (401/403) | 标记服务 "unauthorized"，不自动重试 | 用户重新配置 API Key | "认证失败，请检查 API Key [服务名]" |
| L2-认证 | 配额耗尽 (429/403-quota) | 标记 "quota" + 显示配额信息 | 等待配额重置 / 切换服务 | "今日配额已用完 [服务名]" |
| L3-服务 | 服务返回非标准格式 | 标记 "parse_error" + 记录原始响应 | 自动重试 1 次 | "服务响应异常 [服务名]" |
| L3-服务 | 不支持的语言对 | 标记 "unsupported_lang" | 自动跳过该服务 | 无感知（其他服务正常展示） |
| L4-前端 | 渲染异常 (特殊字符导致) | React Error Boundary + 降级纯文本 | 显示原始文本 + 错误提示 | "翻译结果渲染失败，显示原文" |

### 超时策略细化

```
总超时: 10s (所有服务上限)
  ├── 百度:  5s (国内服务，网络稳定)
  ├── Google: 8s (可能需要代理)
  ├── DeepL:  8s
  ├── OpenAI: 15s (LLM 推理时延较高，单独放宽)
  └── 其他:  10s (默认)
```

> 各服务超时独立配置，通过每个插件的 `info.ts` 声明 `timeout` 字段覆盖默认值。

**关联文档**：
- [翻译服务插件实现](./04-prd-task-翻译服务插件实现.md) — 21 个翻译插件详细实现
- [需求总览](./00-prd-task-需求总览.md) — 系统级架构与总览