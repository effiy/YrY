---
title: STRIDE-YiKnowledge威胁模型
tags:
  - perfbaseline
  - stride
  - threat
  - security
  - yiknowledge
  - threat-model
  - risk
  - rag
  - fsevents
category: projects/yiknowledge/bugs/2026-09
created: 2026-10-07
updated: 2026-10-07
source: internal
type: baseline / analysis
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - sre
  - engineer
  - security
benefit: 覆盖 YiKnowledge Frontmatter 索引/文件名遍历/任意 tags/RAG 外泄/FSEvents 竞态五类 STRIDE 核心风险，对应 bugs 命名/同步/Frontmatter 三个子目录，防止知识库本地文件系统成为提权与内部文档外泄入口。
acceptance_criteria:
  - STRIDE 6 行矩阵覆盖：仿冒 category=root、篡改 ../ 遍历 + 任意 tags、泄露 RAG 外泄、DoS FSEvents 竞态 01 同步 bug、提权无并说明理由
  - 引用 yiknowledge bugs 命名/同步/Frontmatter 三个子目录的条目，每个子目录至少对应 1 条缓解
  - 缓解路线图 30/60/90 天 覆盖 Frontmatter schema 校验、路径 jail、RAG 安全边界、FSEvents 原子写 4 项可上线交付
related:
  - ../../prds/2026-09/04-质量治理-Frontmatter规范.md
  - ../../prds/2026-09/05-稳定性修复-文件同步.md
  - ../../prds/2026-09/07-监控-RAG检索质量.md
  - ../命名/README.md
  - ../同步/01-bug-FSEvents竞态批量失败.md
  - ../Frontmatter/01-Frontmatter-arbitrary-tags未校验.md
---

## 一、STRIDE 威胁矩阵（6 行 × 4 列）

| STRIDE 类别 | 威胁场景 | 影响 | 可能性 | 缓解措施 |
| --- | --- | --- | --- | --- |
| **S 仿冒 (Spoofing)** | Frontmatter `category` 被写成 `root` 获得索引特权：curator 扫描时把 `category=root` 的文档置顶到首页与全局推荐列表；恶意文档作者把自己的 "推广/钓鱼" 文章改 `category: root` 即可获得全局曝光。 | 中：首页推荐位被劫持、内部项目知识被恶意内容挤出首页。 | 高：04-Frontmatter 规范 写了 "建议枚举" 但缺强制校验，Frontmatter/01 bug 已记录 arbitrary tags，同类逻辑 category 也绕。 | (1) 04-质量治理-Frontmatter规范 落地：category 枚举白名单，非 `projects/* / sre/* / engineer/* ...` 8 个根前缀一律写入 `yiknowledge_warnings` 并 skip 索引；(2) "root" 关键词禁用 + 额外告警；(3) 首页推荐位必须人工标记 `featured: true` + review 审批双条件，禁止单字段升级。 |
| **T 篡改 (Tampering)** | 双篡改入口：① 文件名 `../` 遍历：curator `writeFile(docs/some-project/../../sensitive/contract.md, content)` 写出 projects 沙箱 → 覆盖 `~/敏感合同.md`；② Frontmatter arbitrary tags：tags 写 `<script>` / `onerror=` → curator 的 11-prd 标签云渲染时 XSS，或 tags 超长 1MB → 索引 Redis OOM。 | 高：① 本地任意文件覆写等于部分文件系统写权限；② 标签云 XSS = curator 管理端会话劫持。 | 高：① 路径拼接直接用 `path.join(baseDir, userSuppliedCategory, fileName)` 无 `resolve` 回查；② bugs/Frontmatter/01 已复现。 | (1) 路径写前 jail：`resolved = fs.realpath(baseDir + category + name)` 必须 startsWith `baseDir`，否则抛 `PathTraversal`；(2) tags schema：数量 ≤ 12 / 单条长度 ≤ 32 / charset `[a-zA-Z0-9_-/]`；(3) bugs/命名/ 下的 "命名自动规范化" 管道接入：非法字符自动替换成 `-`。 |
| **R 抵赖 (Repudiation)** | 文档重命名/移动操作审计缺失：curator rename 跨目录仅更新 frontmatter `category`，不写入 oplog；管理员误删一篇 docs 后无法追溯是哪次操作谁触发的。 | 低：单用户本地场景抵赖意义弱；若开启团队共享 git repo 则必要。 | 中：curator 月活 12% 用户使用 rename 功能。 | (1) 所有 rename/move/delete 操作追加 `$INDEX_ROOT/.yiknowledge/oplog.ndjson`，记录 `{op, ts, user, from, to, sha256_prev}`；(2) 05-稳定性修复-文件同步 同步器集成；(3) 审计界面 "操作历史" 页。 |
| **I 信息泄露 (Information Disclosure)** | RAG 把 internal 文档外泄：`/search/rag` 接口对所有本地文档默认 embedding，未过滤 `security_classification=internal`；用户问 "公司客户合同" → RAG 命中 `private/contracts/2026/*.md` 拼接上下文 → LLM 生成返回给未授权查询者。 | 高：内部最敏感合同/财务/HR 文档直接外泄到提问端。 | 中：07-RAG检索质量 监控仅关注 "召回率"，未接入安全过滤管道。 | (1) Frontmatter schema 新增必填 `security_classification ∈ {public, internal, confidential, secret}`；(2) embedding 前：对 `internal+` 默认只在 `role=owner` 查询时召回；(3) RAG 管道接入 `DocSecurityFilter`：context 中一旦出现 `confidential/secret` 关键词就在 LLM 前被替换为 "[已脱敏 请登录管理员账号查询]"；(4) 内部文档样本测试：敏感问答命中率必须为 0。 |
| **D 拒绝服务 (Denial of Service)** | FSEvents 竞态 01 同步 bug：macOS fseventsd 批量事件重排导致 `rename(old→new)` 先到 `create(new)` 再到 `unlink(old)` 并发写入 → curator watcher `bulk_write` 同 ID 双写冲突 → 部分写失败 → MongoDB 事务中断回滚 → 后续事件堆积 watcher OOM。对应 bugs/同步/01 + bugs/命名/01。 | 中：不丢数据（磁盘有文件）但索引停摆 ≥ 10min，期间 RAG 搜索结果全部过期。 | 高：bugs/同步/01 已复现 4 次，每次 200~1200 文件 rename 批量触发。 | (1) 05-稳定性修复-文件同步 落地：FSEvents 合并 500ms 窗口 + per-path 幂等版本号 `{path, inode, mtime_ns}` 三元组；(2) bulk_write `ordered=false + upsert` 容忍部分失败；(3) 失败队列死信 + 2s / 4s / 8s 指数退避重试；(4) 竞态 watchdog：队列 > 4096 暂停消费先 flush。 |
| **E 提权 (Elevation of Privilege)** | **无**：YiKnowledge 默认全部是本地文件系统 + 用户态进程，不涉及 OS 内核权限/跨账户提权。若未来接入多租户云部署 + 共享存储再重评 E 类。 | 无 | 无 | **无**（版本保留：接入云端 S3 + IAM 共享时必须重审 E 类提权）。 |

## 二、风险等级总表 P0 / P1 / P2

| 风险 ID | STRIDE 类别 | 摘要 | 影响 | 可能性 | 综合等级 | 对应 bug 子目录 |
| --- | --- | --- | --- | --- | --- | --- |
| YIKNOW-STRIDE-001 | T 篡改 | 文件名 `../` 遍历跨沙箱覆写任意文件 | 高 | 高 | **P0** | 命名 / 同步 |
| YIKNOW-STRIDE-002 | I 信息泄露 | RAG 不过滤 classification 导致 internal 外泄 | 高 | 中 | **P0** | Frontmatter / RAG 07-prd |
| YIKNOW-STRIDE-003 | D DoS | FSEvents 竞态 bulk_write 冲突 → 索引停摆 | 中 | 高 | **P1** | 同步 / 命名 / 01-bug |
| YIKNOW-STRIDE-004 | T 篡改 | arbitrary tags 1MB + XSS → Redis OOM / 标签云 XSS | 中 | 高 | **P1** | Frontmatter / 01-arbitrary-tags |
| YIKNOW-STRIDE-005 | S 仿冒 | category=root 劫持首页推荐 | 中 | 高 | **P1** | Frontmatter / 04 规范 |
| YIKNOW-STRIDE-006 | R 抵赖 | rename/delete 无 oplog 追溯 | 低 | 中 | **P2** | 同步 / 命名 |
| YIKNOW-STRIDE-007 | E 提权 | 无（云部署共享存储上线再评） | 无 | 无 | — | — |

## 三、缓解路线图 30 / 60 / 90 天

| 阶段 | 交付物 | 对应风险 | 验收标准 |
| --- | --- | --- | --- |
| **30 天 (T+0 ~ T+30)** | ① 路径 jail：写前 `realpath + startsWith(baseDir)`；② Frontmatter schema：category 枚举 + tags 长度/charset 校验；③ RAG `security_classification` 必填 + owner 才召回 internal | 001, 004, 002 | ① `../../etc/passwd` 遍历样本 100% 拒绝；② 128 条非法 tags 样本 0 通过；③ internal 文档样本查询命中率 = 0。 |
| **60 天 (T+31 ~ T+60)** | ④ 05-同步 FSEvents 500ms 合并 + 三元组幂等 + 死信重试；⑤ category=root 禁用 + 推荐位双条件；⑥ 操作历史 oplog 落地 | 003, 005, 006 | ④ 1200 文件 rename 批量竞态 0 次回滚；⑤ category=root 写入 100% 告警并 skip；⑥ 最近 100 条 rename/delete 操作 100% 可查。 |
| **90 天 (T+61 ~ T+90)** | ⑦ 07-RAG 检索监控接入 `DocSecurityFilter` 指标；⑧ STRIDE 用例集成 curator 测试套件；⑨ Frontmatter/命名/同步 bugs 三个子目录条目闭环，bug 关单率 ≥ 95% | 002, 全, 全 | ⑦ RAG 安全过滤 dashboard ≥ 1 条告警/周；⑧ 发布门禁：P0 用例 CI 失败 = 0；⑨ 三目录积压 bug ≤ 2 条（P2 可留）。 |
