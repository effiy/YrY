---

doc_type: test
title: 'YA-09-152: 依赖健康检查与供应链安全 — 外部依赖监控 + 漏洞扫描 + 许可证合规 + SBOM — 测试规格'
status: 待开始
priority: P2
owner: 陈铭
roles:
- engineer
- qa
created: 2026-09-11
updated: '2026-09-23'
project: YiAi
project_id: yiai
prd_month: '202609'
prd_task_id: YA-09-152
source_prds:
- 158-需求-依赖健康检查与供应链安全
source_modules: []
source_okr:
- yiai-001

type: test
---

# YA-09-152: 依赖健康检查与供应链安全 — 测试规格

> 来源 PRD：[158-需求-依赖健康检查与供应链安全.md](../../prds/2026-09/158-需求-依赖健康检查与供应链安全.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

## 一、测试范围与策略

### 测试范围

- **健康检查引擎**：`src/domain/healthensure/checker.py`（新建）— 统一的 `DependeHealtensChecker` 接口，MongoDB/Ollama/Redis/文件系统 4 种检查器实现
- **漏洞扫描**：`src/domain/healthensure/vulnerability.py`（新建）— `pip-audit` 集成接口，CVE 漏洞解析和过滤
- **许可证合规**：`src/domain/healthensure/license.py`（新建）— 依赖包许可证提取、合规清单对比
- **SBOM 生成**：`src/domain/healthensure/sbom.py`（新建）— CycloneDX JSON 格式 SBOM 自动生成
- **排除范围**：真实 CVE 数据库同步（依赖 pip-audit 正确性），断路器恢复后的自动验证

### 测试策略

| 层级 | 策略 | 工具 |
|------|------|------|
| 单元测试 | 各检查器的健康/降级/宕机状态

## 二、测试数据 / Fixtures

- `mock_pip_audit_output` — 测试数据 fixture
- `mock_license_check` — 测试数据 fixture


## 三、详细测试用例

### TC-01: MongoDB 健康检查——正常
- **P0** | `status == "healthy"`，`latency_ms` < 100ms | `details` 包含版本号、连接数

### TC-02: MongoDB 健康检查——超时
- **P1** | 

### TC-03: Ollama 健康检查
- **P1** | `status == "healthy"` | `details.models` 包含已加载模型列表

### TC-04: 聚合健康状态
- **P0** | `overall == "degraded"`（有降级组件） | `components` 列表包含 3 个检查结果

### TC-05: 漏洞扫描——CVE 解析
- **P0** | 返回 2 个漏洞记录 | `CVE-2020-14343` 标记为 `critical`

### TC-06: 许可证合规检查
- **P1** | 返回违规项 `[{"package": "GPL-library", "license": "GPL-3.0", "risk": "high"}]`

### TC-07: SBOM 生成
- **P1** | 返回有效 CycloneDX JSON | `bomFormat == "CycloneDX"`

### TC-08: 依赖版本过期检查
- **P2** | 返回 `[{"package": "requests", "current": "2.25.0", "latest": "2.32.0", "update_type": "minor"}]`

### TC-09: 断路器状态聚合
- **P2** | 

### TC-10: 健康检查 API 端点
- **P0** | 


## 四、边界与异常测试

### EC-01: 所有依赖不可用
- **步骤**：MongoDB/Ollama/Redis 全部不可用
- **预期**：`overall == "down"`，不崩溃，返回完整状态列表

### EC-02: pip-audit 未安装
- **步骤**：系统没有 pip-audit 命令
- **预期**：返回警告 `"pip-audit 不可用"`，不阻塞健康检查

### EC-03: 超大 SBOM 生成
- **步骤**：依赖包超过 200 个
- **预期**：SBOM 生成时间 < 5s（异步执行）

### EC-04: 许可证文件丢失的包
- **步骤**：依赖包缺少 LICENSE 文件
- **预期**：标记为 `"UNKNOWN"` 许可证，提示人工审查


## 五、回归测试

### RG-01: 健康检查不应该因自身异常导致服务不可用
- **步骤**：健康检查中 MongoDB 连接失败

### RG-02: 新增健康检查后，现有断路器（YA-09-13）和监控（YA-09-101）正常
- **步骤**：健康检查运行时触发断路器


## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| TC-10 | 健康检查 API | 四、4.1 |
| EC-01~04 | 边界/异常情况 | 七、风险与缓解 |
| RG-01/02 | 不引入新问题 | 八、回滚策略 |

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 真实 pip-audit 数据库同步 | 依赖外网 CVE 数据库 | 使用 mock 数据，CI 中可选真实扫描 |
| 许可证传染性分析（GPL→AGPL 遗传） | 需要深入理解许可证法律 | 补充人工审查流程，非自动化范畴 |

*测试规格基于 PRD [158-需求-依赖健康检查与供应链安全.md](../../prds/2026-09/158-需求-依赖健康检查与供应链安全.md) 提取，覆盖 10 个用例 + 4 个边界测试 + 2 个回归测试。*
