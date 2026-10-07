---

doc_type: test
title: "YA-08-05: 文件管理服务 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-05"
source_prds: ["05-需求-文件管理服务"]
source_modules: ["05-prd-task-文件管理服务"]
source_okr: [yiai-003]

type: test
---

# YA-08-05: 文件管理服务 — 测试规格

> 来源 PRD：[05-需求-文件管理服务.md](../../prds/2026-08/05-需求-文件管理服务.md)
> 开发方案：[05-prd-task-文件管理服务.md](../../devs/2026-08/05-prd-task-文件管理服务.md)
> 需求编号：YA-08-05 -- 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖文件 CRUD、双写持久化、路径安全、OSS 上传。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock 文件系统和 MongoDB） | 每次提交 |
| L2 集成 | pytest + httpx + tmp_path | 临时目录 + MongoDB | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `validate_path()` 路径安全校验 | L1 |
| COV-2 | `read_file()` 文件读取 + 编码检测 | L2 |
| COV-3 | `write_file()` 文件写入 + MongoDB 备份 | L2 |
| COV-4 | `delete_file()` 磁盘 + MongoDB 双删 | L2 |
| COV-5 | `rename_file()` 路径变更 + 备份迁移 | L2 |
| COV-6 | `list_files()` 目录列表 + 白名单限制 | L2 |
| COV-7 | 双写持久化（磁盘 + MongoDB static_files） | L2 |
| COV-8 | 编码检测（chardet） | L1 |
| COV-9 | 大文件保护（max_size 10MB） | L2 |
| COV-10 | `target_file` 参数名契约 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `tmp_yiknowledge` | tmp_path 模拟 YiKnowledge 目录 | 路径安全测试 |
| `sample_md_file` | `# Test\n\nContent` 的 .md 文件 | 文件读写往返 |
| `gbk_file` | GBK 编码的 .md 文件 | 编码检测测试 |
| `large_file` | 15MB 文本文件 | max_size 保护测试 |
| `traversal_path` | `../../etc/passwd` | 路径遍历攻击测试 |

---

## 二、单元测试

### 2.1 路径安全（COV-1 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-FS-01 | `validate_path` 拒绝 `../` 遍历 | 1. `validate_path("../../etc/passwd")` | 返回 None（拒绝） | P0 | 已完成 |
| UT-FS-02 | `validate_path` 拒绝绝对路径 | 1. `validate_path("/etc/passwd")` | 返回 None | P0 | 待实现 |
| UT-FS-03 | `validate_path` 白名单内路径放行 | 1. `validate_path("YiKnowledge/README.md")` | 返回 `os.path.realpath` 规范化后的路径 | P0 | 待实现 |
| UT-FS-04 | `validate_path` 拒绝白名单外路径 | 1. `validate_path("/tmp/outside.md")` | 返回 None | P0 | 待实现 |
| UT-FS-05 | `validate_path` 拒绝不支持的扩展名 | 1. `validate_path("YiKnowledge/test.exe")` | 返回 None（`.exe` 不在 ALLOWED_EXTENSIONS） | P0 | 待实现 |
| UT-FS-06 | `validate_path` 符号链接逃逸 → 拒绝 | 1. 创建指向白名单外的符号链接；2. 校验 | `os.path.realpath` 解析后拒绝 | P1 | 待实现 |
| UT-FS-07 | `validate_path` macOS /tmp 符号链接兼容 | 1. `/tmp` → `/private/tmp`；2. 白名单也做 realpath | 双重匹配确保兼容 | P1 | 待实现 |

### 2.2 文件读取（COV-2 + COV-8 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-FS-08 | `read_file` 读取 markdown 文件 | 1. `read_file({target_file: "test.md"})` | 返回 `{content, encoding, size, mtime, path}` | P0 | 已完成 |
| UT-FS-09 | `read_file` 文件不存在 → DATA_NOT_FOUND | 1. 读取不存在的文件 | 返回 ErrorCode 3002 | P0 | 已完成 |
| UT-FS-10 | `read_file` 编码检测（chardet） | 1. 读取 GBK 编码文件 | 自动检测为 GBK，正确解码 | P0 | 待实现 |
| UT-FS-11 | `read_file` UTF-8 BOM 文件 → UTF-8-SIG | 1. 读取 `\xef\xbb\xbf` 开头的文件 | 正确检测 BOM，不乱码 | P0 | 待实现 |
| UT-FS-12 | `read_file` 超 max_size → 拒绝 | 1. 读取 15MB 文件，max_size=10MB | 返回错误（文件过大） | P0 | 待实现 |
| UT-FS-13 | `read_file` 二进制文件 → 拒绝 | 1. 读取 .so/.dll 文件 | 返回错误（不支持的文件类型） | P1 | 待实现 |

### 2.3 文件写入 + 备份（COV-3 + COV-7 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-FS-14 | `write_file` 磁盘写入 + MongoDB 备份 | 1. 写入已有文件 | 文件内容更新，MongoDB `static_files` 有旧内容备份记录 | P0 | 已完成 |
| UT-FS-15 | `write_file` 新文件创建 | 1. 写入不存在的文件 | 文件创建，无备份记录（新文件） | P0 | 待实现 |
| UT-FS-16 | `write_file` 路径遍历被拒绝 | 1. `write_file({target_file: "../../etc/passwd", content: "x"})` | 返回 PERMISSION_DENIED | P0 | 已完成 |
| UT-FS-17 | `write_file` 双写：MongoDB 不可用 | 1. Mock MongoDB 不可用；2. 写入文件 | 磁盘写入成功，MongoDB upsert 静默失败（WARNING 日志），不阻塞 | P0 | 已完成 |
| UT-FS-18 | `write_file` 双写：磁盘满 | 1. Mock 磁盘写入失败 | 返回错误，不写 MongoDB（保持一致性） | P0 | 已完成 |
| UT-FS-19 | `target_file` 参数契约（非 path） | 1. 使用 `target_file` 参数名 | 正常工作；使用 `path` 应返回错误或警告 | P0 | 已完成 |
| UT-FS-20 | `write_file` base64 解码失败 | 1. 传入非 base64 的 content（如 is_base64=true） | 返回 INVALID_PARAMS | P0 | 已完成 |
| UT-FS-21 | `write_file` 文件重命名时备份迁移 | 1. 文件名从 old.md 改为 new.md | MongoDB 中备份的 `path` 更新，旧路径不产生孤儿记录 | P1 | 待实现 |

### 2.4 文件删除 + 重命名（COV-4 + COV-5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-FS-22 | `delete_file` 磁盘 + MongoDB 双删 | 1. 删除已有文件 | 磁盘文件删除，MongoDB 记录删除 | P0 | 已完成 |
| UT-FS-23 | `delete_file` 不存在 → 返回错误 | 1. 删除不存在的文件 | 返回 ErrorCode 3002 | P1 | 待实现 |
| UT-FS-24 | `rename_file` 旧路径 → 新路径 | 1. `rename_file(old_path, new_path)` | 旧路径 404，新路径可访问 | P0 | 已完成 |
| UT-FS-25 | `rename_file` 路径遍历拒绝 | 1. 重命名到白名单外路径 | 返回错误 | P1 | 待实现 |
| UT-FS-26 | `list_files` 仅列出白名单目录内文件 | 1. `list_files("YiKnowledge")` | 仅返回 YiKnowledge 目录下的文件列表 | P1 | 待实现 |

---

## 三、集成测试

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| IT-FS-01 | `write_file` → `read_file` 往返 | 1. 写入 "hello world"；2. 读取同一文件 | 内容一致 | P0 | 已完成 |
| IT-FS-02 | OSS 上传 → URL 可访问 | 1. 上传文件到 OSS | 返回可访问 URL | P0 | 已完成 |
| IT-FS-03 | 并发写入同一文件 → 乐观锁保护 | 1. 两个请求同时写同一文件 | 一个成功，一个返回冲突（mtime 版本冲突） | P1 | 待实现 |
| IT-FS-04 | 大文件分块读取（> 50MB） | 1. 读取 100MB 文件 | 使用 `chunked read`，内存不超 文件大小 × 0.1 | P2 | 待实现 |

---

## 四、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FS-EDGE-001 | 空文件读取 → 返回空字符串 | 1. 读取 0 字节文件 | `content = ""`, `size = 0` | P1 | 待实现 |
| TC-FS-EDGE-002 | 文件名含空格和特殊字符 | 1. `target_file: "my file (v2).md"` | 正常处理 | P1 | 待实现 |
| TC-FS-EDGE-003 | 中文字符文件名 | 1. `target_file: "我的文档.md"` | 正常处理 | P1 | 待实现 |
| TC-FS-EDGE-004 | 写入只读目录 → 错误 | 1. 写入到无写权限的目录 | 返回错误，不崩溃 | P1 | 待实现 |
| TC-FS-EDGE-005 | Windows 路径分隔符 `\` → 兼容处理 | 1. `target_file: "YiKnowledge\\README.md"` | 统一为 `/` 分隔符 | P2 | 待实现 |
| TC-FS-EDGE-006 | 写入时同路径目录创建（os.makedirs） | 1. 写入 `new_dir/sub/file.md`；2. 目录不存在 | 自动创建父目录，路径在白名单内 | P1 | 待实现 |

---

## 五、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-FS-REG-001 | 缺陷 1：macOS /tmp 符号链接匹配失败 | `/tmp/file.md` → `/private/tmp/file.md` | realpath 双向匹配，放行 | P0 | 待实现 |
| TC-FS-REG-002 | 缺陷 2：UTF-8 BOM 文件检测为 ISO-8859-1 | BOM 开头文件编码检测 | BOM 检测优先于 chardet | P0 | 待实现 |
| TC-FS-REG-003 | 缺陷 3：文件重命名产生孤儿备份记录 | git mv old.md → new.md | 旧 path 备份文档更新 path，不产生孤儿 | P1 | 待实现 |
| TC-FS-REG-004 | 缺陷 4：Docker overlay2 mtime_ns 精度不足 | 乐观锁在 Docker 中失效 | 使用 version 组合锁 | P1 | 待实现 |

---

## 六、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 路径安全校验 | 拒绝 ../ + 白名单 + 符号链接 | UT-FS-01 ~ 07 |
| FR-02 文件读取 | 内容 + 编码 + 大小限制 | UT-FS-08 ~ 13 |
| FR-03 文件写入 + 备份 | 磁盘 + MongoDB 双写 | UT-FS-14 ~ 21 |
| FR-04 文件删除 | 磁盘 + MongoDB 双删 | UT-FS-22 ~ 23 |
| FR-05 文件重命名 | 路径变更 + 备份迁移 | UT-FS-24 ~ 25 |
| FR-06 目录列表 | 白名单限制 | UT-FS-26 |
| FR-07 往返一致性 | write → read 一致 | IT-FS-01 |
| FR-08 OSS 上传 | 可访问 URL | IT-FS-02 |
| FR-09 target_file 参数名 | 使用 target_file 非 path | UT-FS-19 |

---

## 七、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 文件差异对比（Diff View）未测试 | 前端变更对比功能 | 后续实现再测试 |
| G-2 | 分布式文件锁未测试 | 多实例部署时乐观锁不够 | 引入 Redis 分布式锁后补充 |
| G-3 | 大文件分块上传未实现 | > 10MB 文件无法上传 | 后续实现 chunked upload |
| G-4 | 非 UTF-8 编码文件写回可能乱码 | write_file 强制写入 UTF-8 | 写入时增加编码参数 |