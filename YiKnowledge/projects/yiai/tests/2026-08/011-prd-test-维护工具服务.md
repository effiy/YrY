---

doc_type: test
title: "维护工具服务 — 未引用图片清理与会话垃圾回收 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-13"
source_prds: ["11-需求-维护工具服务"]
source_modules: ["11-prd-task-维护工具服务"]
source_okr: [yiai-003]

type: test
---

# 维护工具服务 — 未引用图片清理与会话垃圾回收 — 测试规格

> 来源 PRD：[11-需求-维护工具服务.md](../../prds/2026-08/11-需求-维护工具服务.md)
> 开发方案：[11-prd-task-维护工具服务.md](../../devs/2026-08/11-prd-task-维护工具服务.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。覆盖图片扫描、3 种引用提取模式、dry_run 安全模式、会话垃圾回收。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock 文件系统和 MongoDB） | 每次提交 |
| L2 集成 | pytest + mongomock + tmp_path | 临时文件目录 + mock MongoDB | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `scan_static_images()` 图片文件扫描 | L1 |
| COV-2 | `extract_referenced_images()` 3 种正则引用提取 | L1 |
| COV-3 | `_extract_refs_from_value()` 递归遍历 str/list/dict | L1 |
| COV-4 | `find_unused_images()` 差集计算 + 大小写不敏感 | L1 |
| COV-5 | `POST /cleanup-unused-images` dry_run=true 预览 | L2 |
| COV-6 | `POST /cleanup-unused-images` dry_run=false 实际删除 | L2 |
| COV-7 | `delete_image_files()` 文件删除 + freed_space 计算 | L2 |
| COV-8 | `cleanup_sessions_with_missing_images()` 会话清理 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `temp_static_dir` | tmp_path 含 5 个图片文件（.png/.jpg/.svg） | 图片扫描测试 |
| `session_with_refs` | `{key: "s1", messages: [{content: "![](/static/img1.png)"}, {content: '<img src="/static/img2.jpg">'}]}` | 引用提取测试 |
| `session_without_refs` | `{key: "s2", messages: [{content: "纯文本无图片"}]}` | 无引用会话测试 |
| `nested_session` | 含嵌套 dict/list 的消息结构 | 递归提取测试 |

---

## 二、测试用例

### 2.1 图片扫描（COV-1 . L1）

> 自动化落点：`tests/unit/test_maintenance.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MAINT-001 | 扫描 static 目录下所有图片 | 1. 在 tmp_path 创建 `img1.png`, `img2.jpg`, `doc.txt`, `data.json`；2. 调用 `scan_static_images(tmp_path)` | 返回 `{"img1.png", "img2.jpg"}`（仅图片，不含 .txt/.json） | P0 | 待实现 |
| TC-MAINT-002 | 支持 8 种图片扩展名 | 1. 创建 .png/.jpg/.jpeg/.gif/.webp/.svg/.bmp/.ico 文件；2. 扫描 | 全部 8 个被识别 | P0 | 待实现 |
| TC-MAINT-003 | 不存在的目录返回空集合 | 1. 传入不存在的路径 | 返回 `set()`，不抛异常 | P1 | 待实现 |
| TC-MAINT-004 | 空目录返回空集合 | 1. 传入空目录 | 返回 `set()` | P1 | 待实现 |
| TC-MAINT-005 | 递归扫描子目录 | 1. 创建 `subdir/img3.png`；2. 扫描父目录 | `img3.png` 包含在结果中 | P0 | 待实现 |

### 2.2 引用提取（COV-2 + COV-3 . L1）

> 自动化落点：`tests/unit/test_maintenance.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MAINT-006 | Markdown `![]()` 图片提取 | 1. 输入 `"![](/static/img1.png) 和 ![](/static/img2.jpg)"`；2. 调用 `extract_referenced_images` | 返回 `{"/static/img1.png", "/static/img2.jpg"}` | P0 | 待实现 |
| TC-MAINT-007 | HTML `<img src="">` 提取 | 1. 输入 `'<img src="/static/img1.png"> <img src="/static/img2.jpg">'` | 返回 `{"/static/img1.png", "/static/img2.jpg"}` | P0 | 待实现 |
| TC-MAINT-008 | `/static/` 路径直接引用提取 | 1. 输入 `"路径: /static/img1.png 和 https://host/static/img2.jpg"` | 返回包含 `/static/img1.png` 和 `/static/img2.jpg` | P0 | 待实现 |
| TC-MAINT-009 | 无引用的文本返回空集合 | 1. 输入 `"纯文本无图片"` | 返回 `set()` | P0 | 待实现 |
| TC-MAINT-010 | 递归提取嵌套 dict 中的引用 | 1. 输入 `{"messages": [{"content": "![](/static/a.png)"}], "description": "<img src='/static/b.jpg'>"}` | 返回 `{"/static/a.png", "/static/b.jpg"}` | P0 | 待实现 |
| TC-MAINT-011 | 递归提取嵌套 list 中的引用 | 1. 输入 `[{"text": "![](/static/a.png)"}, {"html": "<img src='/static/b.jpg'>"}]` | 返回 `{"/static/a.png", "/static/b.jpg"}` | P1 | 待实现 |
| TC-MAINT-012 | 同一图片多次引用去重 | 1. 输入 `"![](/static/a.png) ![](/static/a.png) ![](/static/a.png)"` | 返回 `{"/static/a.png"}`（去重） | P1 | 待实现 |

### 2.3 未使用图片识别（COV-4 . L1）

> 自动化落点：`tests/unit/test_maintenance.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MAINT-013 | 差集计算识别未使用图片 | 1. `static = {"a.png", "b.png", "c.png"}`；2. `referenced = {"a.png"}`；3. `find_unused_images(static, referenced)` | 返回 `{"b.png", "c.png"}` | P0 | 待实现 |
| TC-MAINT-014 | 大小写不敏感比较 | 1. `static = {"IMG.PNG"}`；2. `referenced = {"img.png"}` | 返回 `set()`（视为已引用） | P0 | 待实现 |
| TC-MAINT-015 | 所有图片都被引用 → 空集合 | 1. `static = {"a.png", "b.png"}`；2. `referenced = {"a.png", "b.png"}` | 返回 `set()` | P1 | 待实现 |
| TC-MAINT-016 | 无图片被引用 → 返回全部 static | 1. `static = {"a.png", "b.png"}`；2. `referenced = {}` | 返回 `{"a.png", "b.png"}` | P1 | 待实现 |

### 2.4 dry_run 安全模式（COV-5 + COV-6 . L2）

> 自动化落点：`tests/api/test_maintenance.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MAINT-017 | `dry_run=true` 仅预览不删除 | 1. 创建临时图片文件；2. 调用 `POST /cleanup-unused-images` 带 `{dry_run: true}`；3. 检查文件 | 文件仍然存在，响应中 `deleted_count: 0`，`unused_images` 列表有数据 | P0 | 待实现 |
| TC-MAINT-018 | `dry_run=false` 执行实际删除 | 1. 创建未引用图片；2. 调用 `POST /cleanup-unused-images` 带 `{dry_run: false}`；3. 检查文件 | 未引用图片被删除，响应中 `deleted_count > 0`，`freed_space_mb > 0` | P0 | 待实现 |
| TC-MAINT-019 | 默认 `dry_run=true` | 1. 调用 `POST /cleanup-unused-images` 不带 `dry_run` 参数 | 默认 `dry_run = true`，不删除文件 | P0 | 待实现 |
| TC-MAINT-020 | 响应包含 total_images_found/referenced/unused 统计 | 1. 调用接口；2. 检查 `summary` | 包含 `total_images_found`, `total_images_referenced`, `unused_images_count`, `unused_images_size_mb` | P0 | 待实现 |
| TC-MAINT-021 | `unused_images` 列表包含 path 和 size | 1. 调用接口；2. 检查 `unused_images[0]` | 每个条目包含 `{path, size_bytes, size_kb}` | P1 | 待实现 |

### 2.5 会话清理（COV-7 + COV-8 . L2）

> 自动化落点：`tests/api/test_maintenance.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MAINT-022 | `cleanup_sessions=true` 清理无效会话 | 1. MongoDB 含引用不存在图片的会话；2. 调用 `POST /cleanup-unused-images` 带 `{cleanup_sessions: true}` | 无效会话被删除，响应中 `cleaned_sessions_count > 0` | P1 | 待实现 |
| TC-MAINT-023 | 默认 `cleanup_sessions=false` | 1. 调用接口不带 `cleanup_sessions` | 不清理会话，`cleaned_sessions_count: 0` | P1 | 待实现 |
| TC-MAINT-024 | 图片删除后 freed_space 计算正确 | 1. 创建 3 个未引用图片共 50KB；2. 执行 dry_run=false | `freed_space_mb` 约为 0.05 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MAINT-EDGE-001 | static 目录不存在 | 1. 传入不存在的 static 路径；2. 扫描 | 返回空集合，不抛异常 | P1 | 待实现 |
| TC-MAINT-EDGE-002 | 无 sessions 集合 → 所有图片标记为未引用 | 1. MongoDB 中无 sessions 集合；2. 扫描 | 所有图片标记为未引用 | P1 | 待实现 |
| TC-MAINT-EDGE-003 | 大型 sessions 集合（1000+ 文档） | 1. 插入 1000 条会话（每条含 3 个图片引用）；2. 扫描 | 性能可接受（< 5s），引用提取完整 | P2 | 待实现 |
| TC-MAINT-EDGE-004 | 图片文件名含特殊字符（空格、中文） | 1. 创建 `"我的 图片.png"`；2. 引用提取和匹配 | 正确识别和匹配 | P1 | 待实现 |
| TC-MAINT-EDGE-005 | 部分文件删除失败（权限问题） | 1. 创建只读图片；2. 执行 dry_run=false | 跳过失败文件，记录日志，继续删除其他文件 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-MAINT-REG-001 | 缺陷 1：仅扫描 sessions 集合 | 在 bugs 集合中引用图片 | 当前可能误删 bugs 引用的图片（已知限制） | P2 | 待实现 |
| TC-MAINT-REG-002 | 缺陷 2：正则可能遗漏 | base64 内嵌图片引用 | 不识别 base64 内嵌（已知限制） | P2 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 图片扫描 | 8 种图片扩展名，递归扫描 | TC-MAINT-001 ~ 005 |
| FR-02 3 种引用提取 | Markdown/HTML/路径正则 | TC-MAINT-006 ~ 012 |
| FR-03 未使用图片识别 | 差集 + 大小写不敏感 | TC-MAINT-013 ~ 016 |
| FR-04 dry_run 安全模式 | 默认预览，确认后删除 | TC-MAINT-017 ~ 021 |
| FR-05 会话垃圾回收 | 可选清理无效会话 | TC-MAINT-022 ~ 024 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 其他集合（bugs/issues/static_files）的图片引用 | 可能误删跨集合引用的图片 | 扩展到扫描所有 MongoDB 集合 |
| G-2 | 无定时自动清理 | 存储空间持续增长 | 集成 apscheduler 定时任务 |
| G-3 | 大文件系统中的性能 | 10000+ 图片时扫描耗时 | 增加增量扫描和进度报告 |
| G-4 | 文件删除不可逆 | dry_run 后误操作无法恢复 | 增加回收站机制（移动到 .trash/ 而非直接删除） |