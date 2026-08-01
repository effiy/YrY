---
paths:
  - "skills/rui-npm/**"
  - "skills/rui-npm/SKILL.md"
description: "个人 npm packages 管理规则"
---

# rui-npm 管理规则

> 个人 npm packages 管理的规则和约束，独立于实现细节。

## 命令族

| 命令 | 类型 | 作用 | 风险级别 | 确认要求 |
|------|------|------|:---:|:---:|
| search | 只读 | 按关键词搜索 npm registry | 低 | 无 |
| install | 写入 | 安装包到当前项目 | 中 | 包名验证 |
| update | 写入 | 更新指定包 | 中 | 变更日志审查 |
| list | 只读 | 列出已安装的包 | 低 | 无 |
| info | 只读 | 查看包元数据 | 低 | 无 |
| uninstall | 写入 | 卸载包 | 中 | 依赖检查 |
| publish | 写入 | 发布本地文件/目录到 npm | 高 | 二次确认 |
| npx | 执行 | 不安装直接运行 | 中 | 包名验证 |
| audit | 只读 | 安全审计 | 低 | 无 |
| cdn | 只读 | 获取 CDN 引用链接 | 低 | 无 |
| login | 写入 | 配置 Access Token | 高 | Token 安全 |
| my-packages | 只读 | 查看账号级包列表 | 低 | 需已登录 |
| deprecate | 写入 | 标记版本为 deprecated | 高 | 二次确认 |
| unpublish | 写入 | 从 registry 删除包/版本 | 极高 | 三次确认 |

## 安全约束

| 规则 | 说明 | 违反后果 |
|------|------|---------|
| Token 通过环境变量传入 | `NPM_TOKEN` 环境变量，不落盘 | Token 泄露 |
| 安装前检查包名合法性 | 防止 typosquatting 攻击 | 安装恶意包 |
| publish 前验证 package.json | name/version/description 必填 | 发布不完整包 |
| audit 阻断中高危 CVE | `npm audit --audit-level=moderate` | 供应链风险 |
| unpublish 三次确认 | 不可逆操作，需明确确认 | 误删关键包 |
| npx 执行前审查包来源 | 仅执行已知来源的包 | 执行恶意代码 |

## 版本管理策略

| 场景 | 策略 | 示例 |
|------|------|------|
| 安装新包 | 默认 latest，可指定 `@version` | `lodash@4.17.21` |
| 更新已有包 | 遵循 semver 范围，审查 changelog | `^1.2.3` → `^1.3.0` |
| 锁定版本 | `package-lock.json` 必须提交 | CI 环境一致性 |
| 版本冲突 | 提示冲突，手动解决 | 两个包依赖不同版本 |

## 降级策略

| 情况 | 降级行为 | 恢复方式 |
|------|---------|---------|
| npm registry 不可达 | 提示用户检查网络，给出诊断命令 | `npm ping` 验证 |
| Token 未配置 | 只读命令可用，写入命令提示 `login` | 配置 Token 后重试 |
| 包名冲突 | 提示已存在版本，建议 bump 或使用 alias | 手动指定版本 |
| publish 失败 | 诊断原因 (权限/版本/网络)，给出修复建议 | 修复后重试 |
| audit 超时 | 跳过审计，标注 `audit-skipped` | 手动 `npm audit` |
| npx 执行失败 | 不自动重试，提示原因和替代方案 | 手动安装后执行 |

## 集成点

| 消费方 | 消费方式 | 场景 |
|--------|---------|------|
| rui-init (初始化) | 安装项目依赖 | 项目初始化步骤 5 |
| rui-yry (自改进) | 依赖健康度检查 | D5 依赖退化诊断 |
| rui-analysis (分析) | 依赖安全扫描 | 安全漏洞扫描维度 |

## 核心规则

| # | 规则 | 设计理由 | 违反后果 |
|---|------|---------|---------|
| 1 | Token 通过环境变量传入，不落盘 | 安全基线 — 密钥不落盘 | Token 泄露 |
| 2 | 安装前检查包名合法性 | 防止拼写错误攻击 (typosquatting) | 安装恶意包 |
| 3 | publish 前验证 package.json 完整性 | 发布质量 — 必填字段不缺失 | 发布不完整包 |
| 4 | unpublish 需用户三次确认 | 不可逆操作 — npm 不允许恢复 | 误删关键包 |
| 5 | audit 发现中高危 CVE 时阻断安装 | 供应链安全 — 已知漏洞不可引入 | 引入安全漏洞 |
| 6 | npx 执行前审查包来源 | 任意代码执行 — 不可信来源不可执行 | 执行恶意代码 |
| 7 | package-lock.json 必须提交 | CI 环境一致性 — 版本锁定 | 环境差异导致 bug |

## 命令分类

### 只读命令 (安全，无需确认)

| 命令 | 数据源 | 缓存 |
|------|--------|:---:|
| search | npm registry | 5min |
| list | node_modules | 无 |
| info | npm registry | 10min |
| audit | npm registry | 无 |
| cdn | unpkg/jsDelivr/esm.sh | 1h |
| my-packages | npm registry | 5min |

### 写入命令 (需确认)

| 命令 | 风险 | 确认级别 |
|------|:---:|:---:|
| install | 中 | 包名验证 |
| update | 中 | changelog 审查 |
| uninstall | 中 | 依赖检查 |
| publish | 高 | 二次确认 |
| login | 高 | Token 安全 |
| deprecate | 高 | 二次确认 |
| unpublish | 极高 | 三次确认 |

## 边界场景

| 场景 | 处置 |
|------|------|
| 离线环境 | 只读命令使用缓存，写入命令提示联网 |
| 权限不足 | 提示 `EACCES`，建议使用 npx 或检查权限 |
| 包名 typosquatting 检测 | 检查 Levenshtein 距离 < 2 的知名包 |
| 安装脚本 (postinstall) | 审查安装脚本内容，有网络请求时警告 |
| 版本冲突 | 列出冲突包和版本，提示手动解决 |