---

doc_type: module
prd_task_id: "YP-09-S13"
title: "生词本导出 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "24-prd-生词本导出.md"

type: task
---

# 生词本导出 — 开发方案

## 源码

`YiPot/src/services/collection/anki/` + `eudic/`

## Anki 导出

```javascript
export default async function addWord(word, translation, options) {
  const res = await fetch("http://127.0.0.1:8765", {
    method: "POST",
    body: JSON.stringify({
      action: "addNote",
      version: 6,
      params: {
        note: {
          deckName: options.deck || "Pot",
          modelName: options.model || "Basic",
          fields: {
            Front: word,
            Back: translation
          }
        }
      }
    })
  });
  return res.json();
}
```

## 欧路词典

```javascript
export default async function addWord(word, translation, options) {
  const url = `eudic://dict/${encodeURIComponent(word)}`;
  window.open(url);
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| Anki 协议 | AnkiConnect HTTP API | 标准协议，无需额外安装 |
| 欧路 | URL Scheme | 直接跳到欧路词典 App |
| 去重策略 | 前端 Set + AnkiConnect `findNotes` | 避免重复添加 |
| 批量导出 | 一次 `addNotes` 而非多次 `addNote` | 降低 HTTP 往返次数 |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| Anki 批量添加 | `addNotes` API 替代逐条 `addNote` | 100 条从 100 次请求降至 1 次 |
| AnkiConnect 连接缓存 | 首次验证后可复用连接状态 | 后续操作免验证 |
| 去重预检 | `findNotes` 批量查询已有卡片 | 避免逐个检查的 O(n) HTTP 调用 |
| 欧路 Scheme 降级 | Scheme 不可用时提示手动复制 | 用户不卡在失败页面 |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| AnkiConnect 未启动 | `ANKI-NOT` | 轮询 3 次（间隔 500ms） | "请先启动 Anki 并安装 AnkiConnect 插件" |
| AnkiConnect 版本不兼容 | `ANKI-VER` | 检查 API version >= 6 | "AnkiConnect 版本过低，请升级" |
| 牌组不存在 | `ANKI-DECK` | 自动创建目标牌组 | "已自动创建牌组「{name}」" |
| 欧路 URL Scheme 未注册 | `EUDI-NOT` | 提示用户安装欧路词典 | "未检测到欧路词典，请先安装" |
| 网络超时（Anki 端口） | `ANKI-TO` | 3s 超时，提示本地连接问题 | "无法连接 Anki，请检查 Anki 是否运行" |
| 字段值包含特殊字符 | `ANKI-FMT` | JSON 序列化转义 | 静默处理 |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [24-prd-生词本导出](../prds/2026-09/24-prd-生词本导出.md) | 上游 PRD | 功能需求定义 |
| [24-prd-test-生词本导出](../tests/2026-09/24-prd-test-生词本导出.md) | 下游测试 | 测试用例与验证方案 |
| [37-prd-task-设置页面](./37-prd-task-设置页面.md) | 配置 | 导出设置（牌组、字段映射） |
| 项目 `src/services/collection/` | 源码 | 生词本服务实现 |