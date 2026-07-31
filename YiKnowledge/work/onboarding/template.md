---
title: 新人引导模板
tags: [模板, 新人, 引导, onboarding]
category: work/onboarding
created: 2026-07-31
updated: 2026-07-31
source: internal
type: template
status: stable
---

# 新人引导模板

> 每个 Yi 家族项目（YiAi / YiVad / YiPet / 未来新增）都应在 `YiKnowledge/projects/<项目名>/onboarding.md` 落一份新人引导。本模板规定其结构，复制后填占位符即可。

## 如何使用本模板

1. 复制本文件到 `YiKnowledge/projects/<项目名>/onboarding.md`
2. 替换所有 `{{...}}` 占位符（项目名、端口、命令、URL 等）
3. 删除「如何使用本模板」章节
4. 在 frontmatter 把 `category` 改成 `projects/<项目名>`
5. 实际项目可增删章节内的条目，但 **8 个章节的顺序与标题保持一致**，便于跨项目对照
6. 写完后在 `YiKnowledge/INDEX.md` 的 projects 区登记一行

---

# {{项目名}} 新人引导

> {{一句话定位：技术栈 + 在 Yi 家族中的角色}}

## 1. 项目定位

{{项目名}} 是 Yi 家族的 {{后端 / 管理后台 / 浏览器扩展 / ...}}，{{核心职责}}。技术栈：{{语言}} + {{框架}} + {{构建工具}}。{{对外端口 / 加载方式}}。

## 2. 首日 setup（30 分钟跑通）

### 前置依赖

- {{Node.js 18+ / Python 3.10+ / Chrome 114+}}
- {{依赖的其他 Yi 项目在跑，例如 YiAi 在 `http://localhost:10086`}}
- {{其他外部依赖，例如 MongoDB / Ollama}}

### 步骤

```bash
# 1. 克隆（如已在 YrY 仓库内可跳过）
cd /path/to/YrY/{{项目名}}

# 2. 装依赖
{{install_cmd}}   # npm install / pnpm install / pip install -r requirements.txt

# 3. 起服务
{{dev_command}}   # npm run dev / pnpm dev / python main.py

# 4. 类型检查 + 构建（可选，验证环境）
{{typecheck_cmd}}   # npm run typecheck / pnpm type:check / python -m py_compile
```

### 验证清单

- [ ] 浏览器打开 `{{verify_url}}` 看到 {{期望页面}}
- [ ] DevTools Console 无 error
- [ ] {{关键功能验证，例如 SSE 流式返回 / 扩展 popup 弹出 / Swagger 可见}}
- [ ] `{{typecheck_cmd}}` 退出码 0

## 3. 三个高频 workflow

### Workflow A：{{加一个 UI 组件 / 加一个 RPC 端点 / 加一个菜单页}}

{{场景一句话}}。

1. {{在哪个目录建什么文件}}
2. {{调用哪个 service / store / API}}
3. {{i18n / 路由 / manifest 等附属改动}}
4. {{验证方式}}

### Workflow B：{{加一个 service / 加一个独立路由 / 接 chrome API}}

{{场景一句话}}。

1. {{步骤 1}}
2. {{步骤 2}}
3. {{步骤 3}}

### Workflow C：{{aicr 评审 + RAG 对话 / 触发 RAG 重建 / 跨世界通信}}

{{场景一句话}}。

1. {{步骤 1}}
2. {{步骤 2}}
3. {{步骤 3}}

## 4. 新人坑速查

| 现象 | 原因 | 解决 |
|---|---|---|
| {{现象}} | {{原因}} | {{解决，指向具体文件 / 铁律}} |

> 跨项目通用坑（务必保留）：
> - RPC 参数用 `filter` 不是 `query`（铁律）
> - `/read-file` / `/write-file` 用 `target_file` 不是 `path`（铁律）
> - 路径别名用 `@/` 指向 `src/`

## 5. 接下来读什么

| 文档 | 看什么 |
|---|---|
| `{{项目名}}/CLAUDE.md`（仓库根） | 模块边界、跨项目协议、铁律 |
| `YiKnowledge/projects/{{项目名}}/engineering/readme.md` | 架构图、数据流、目录结构 |
| {{项目内其他关键文件}} | {{看什么}} |

## 6. Day-1 任务清单

- [ ] `{{install_cmd}}` + `{{dev_command}}` 跑通，`{{verify_url}}` 可访问
- [ ] `{{typecheck_cmd}}` 退出 0
- [ ] 读完 `{{项目名}}/CLAUDE.md` 的 Module Boundaries + Cross-project protocol 两节
- [ ] {{加一个 Hello World 级别的最小改动，提交 PR}}
- [ ] {{跑一次端到端验证，例如 RPC 调一次 / 扩展装上 / RAG 查一次}}
- [ ] 找同事做一次 30 分钟走读

## 7. 负责人 / 联系人

| 角色 | 名字 | 联系方式 |
|---|---|---|
| 项目主负责人 | TBD | TBD |
| {{架构 / 前端 / 后端}} | TBD | TBD |
| {{核心模块 1}} | TBD | TBD |
| {{核心模块 2}} | TBD | TBD |
| Code review | TBD | TBD |

> 占位字段，请项目主负责人填入后删除本行。

## 8. 常见报错速查表

| 报错信息 | 原因 | 解决 |
|---|---|---|
| `{{报错}}` | {{原因}} | {{解决，指向具体文件}} |

---

有疑问先看 §4 和 §8；找不到答案再问 §7 里的对应负责人。
