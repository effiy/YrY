# YrY

> Claude Code 插件/配置 · 规则完整性与集成契约。

## 项目概览

**YrY** 是一个 元项目(插件/配置)（single 架构），基于 待补充 生态构建。
本项目管理 Claude Code 的 agents/rules/skills 配置，提供 SDLC 管线编排（故事 → 文档 → 代码 → 交付），集成企微通知与文档同步。

| 属性 | 值 |
|------|-----|
| 类型 | 元项目(插件/配置) |
| 架构 | single |
| 生态 | 待补充 |
| 管线 | /rui init → /rui doc → /rui code → 交付 |
| 安全底线 | 认证不可绕过 · 密钥不落盘 · 输入必校验 |

## 技术栈

| 类别 | 技术 |
|------|------|
| 运行时 | 待补充 |
| 核心框架 | 待补充 |
| 关键依赖 | 待补充 |
| 构建工具 | 待配置 |
| 测试框架 | 待配置 |
| 测试命令 | `待配置` |

## 目录结构

```
YrY/
├── src/                        # 源代码
├── tests/                      # 测试文件
├── docs/                       # 项目文档
│   └── 故事任务面板/            # SDLC 故事产出（每故事独立子目录）
├── .claude/                    # Claude Code 配置
│   ├── agents/                 # 6 角色契约（pm · coder · tester · reporter · security · self-improve）
│   ├── rules/                  # 跨场景约束（管线 · 交付门 · 文档生成 · 自改进）
│   ├── skills/                 # 技能定义（rui · rui-claude · wework-bot · import-docs）
│   └── settings.json           # 权限 + Stop hooks（文档同步 · 企微通知）
├── CLAUDE.md                   # AI 协作指令（基础信念 · 工作原则 · 项目约束）
└── README.md                   # 本文件
```

## 快速开始

```bash
# 1. 安装依赖
见构建文档

# 2. 构建
待配置

# 3. 运行测试
待配置

# 4. 启动
见运行文档
```

> **SDLC 管线命令**（详见 [CLAUDE.md](./CLAUDE.md)）：
> `/rui init` 建立基线 → `/rui doc <需求>` 拆故事 → `/rui code <name>` 实现交付。
> `/rui list` 查看进度，`/rui` 获取推荐。

## 核心模块

### 管线编排 — `skills/rui/`
命令面定义（SKILL.md）、文档公式（formulas.md）、目录/数据契约（coder.md）及 init · list · recommend · state · loop 等执行脚本。

### 角色系统 — `agents/`
6 个角色的行为契约：pm（决策）、coder（实现）、tester（质量）、reporter（报告）、security（安全）、self-improve（改进）。

### 交付管线 — `rules/` + hooks
code-pipeline（分支隔离 + 测试先行）、delivery-gate（三步交付）、doc-generation（文档模板）、self-improve（复盘改进）、rui-claude（配置管理）。

### 集成服务 — `skills/import-docs/` · `skills/wework-bot/`
import-docs 批量同步文档到远端 API；wework-bot 通过企微机器人发送管线通知。

## SDLC 管线

```mermaid
flowchart LR
    A[需求解析] --> B[自适应规划] --> C[影响分析] --> D[架构设计] --> E[文档基线]
    E --> F[Gate A<br/>测试先行] --> G[逐模块实现<br/>P0 清零] --> H[Gate B<br/>验证闭合] --> I[自改进] --> J[交付]
    J --> K1[文档同步] --> K2[企微通知]
```

每阶段产出对应编号文件（01–08 故事文档），交付时自动触发 import-docs 同步 + wework-bot 通知。完整命令参考见 [CLAUDE.md](./CLAUDE.md)。
