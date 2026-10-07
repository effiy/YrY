---

doc_type: test
title: "YA-09-40: 服务容器化构建优化 — 多阶段 Dockerfile 与镜像体积缩减 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-40"
source_prds: ["44-需求-Docker多阶段构建"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-40: 服务容器化构建优化 — 测试规格

> **文档职责**：本文档定义 Docker 多阶段构建的**怎么验证**（VERIFY），覆盖镜像体积、构建缓存、安全扫描和启动验证。

> 来源 PRD：[44-需求-Docker多阶段构建.md](../../prds/2026-09/44-需求-Docker多阶段构建.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | Dockerfile 指令分析 | docker build --check | 指令正确性、阶段依赖 |
| L2 集成 | 完整构建 + 运行 | docker build + docker run | 构建成功、服务启动 |
| L4 性能 | 镜像大小 + 构建时间 | docker images + time | 镜像 < 300MB, 构建 < 5min |

### 1.2 测试数据

```python
@pytest.fixture
def dockerfile_path():
    return "/path/to/YiAi/Dockerfile"

@pytest.fixture
def expected_image_size_mb():
    return 300  # 目标最大 300MB

@pytest.fixture
def expected_stages():
    return ["builder", "production"]
```

---

## 二、测试用例

### 2.1 镜像体积

#### TC-DKR-001: 生产镜像 < 300MB

| **ID** | TC-DKR-001 |
| **层级** | L4 性能 |
| **优先级** | P0 |
| **步骤** | 1. `docker build -t yiai:test .`<br/>2. `docker images yiai:test --format '{{.Size}}'` |
| **预期结果** | - 镜像体积 < 300MB<br/>- 不含构建工具链（gcc、pip-tools）<br/>- 不含 `__pycache__` |

#### TC-DKR-002: Builder 阶段不进入最终镜像

| **ID** | TC-DKR-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 检查 Dockerfile 的 `COPY --from=builder` 指令<br/>2. `docker run yiai:test which gcc` |
| **预期结果** | - gcc 不存在<br/>- pip 在最终镜像中仅安装运行依赖（不含 dev） |

### 2.2 构建缓存

#### TC-DKR-003: 源码未变时利用层缓存

| **ID** | TC-DKR-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 首次 `docker build`<br/>2. 不修改任何文件，再次 `docker build` |
| **预期结果** | - 第二次构建全部使用缓存<br/>- `Using cache` 输出覆盖所有层<br/>- 构建时间 < 10s |

#### TC-DKR-004: requirements.txt 变更时重建 pip install 层

| **ID** | TC-DKR-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 修改 `requirements.txt`<br/>2. 重新构建 |
| **预期结果** | - pip install 层重建<br/>- 其他层仍使用缓存<br/>- 正确安装新依赖 |

### 2.3 安全扫描

#### TC-DKR-005: 无高危 CVE（Trivy 扫描）

| **ID** | TC-DKR-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `docker build -t yiai:scan .`<br/>2. `trivy image yiai:scan --severity HIGH,CRITICAL` |
| **预期结果** | - 0 个 HIGH/CRITICAL CVE<br/>- Tolerable MEDIUM CVE 列表可控 |

#### TC-DKR-006: 非 root 用户运行

| **ID** | TC-DKR-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `docker run yiai:test whoami` |
| **预期结果** | - 输出非 `root`<br/>- UID > 1000<br/>- `/app` 目录 owner 为非 root |

---

## 三、边界与异常测试

### TC-EDGE-001: 无网络构建
**步骤**：`docker build --network=none`。  
**预期结果**：pip install 失败，构建报错（预期行为——提示需要网络）。

### TC-EDGE-002: 超大 requirements.txt（500+ 依赖）
**步骤**：添加 500 个假依赖后构建。  
**预期结果**：构建成功但 > 300MB，触发 WARNING 告警。

### TC-EDGE-003: .dockerignore 排除 node_modules/.git
**步骤**：检查 `.dockerignore` 包含 `node_modules`、`.git`、`__pycache__`。  
**预期结果**：构建上下文中无这些目录。

---

## 四、回归测试

### TC-REG-001: 容器内运行全部测试
**步骤**：`docker run yiai:test python -m pytest tests/ -v`。  
**预期结果**：100% 通过（L1+L2 测试）。

### TC-REG-002: 容器化服务端点验证
**步骤**：`docker run -d -p 10086:10086 yiai:test` 后发送 RPC 请求。  
**预期结果**：端点正常响应。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-镜像体积 | TC-DKR-001~002 | L1+L4 |
| FR-构建缓存 | TC-DKR-003~004 | L2 |
| FR-安全扫描 | TC-DKR-005~006 | L2 |
| FR-边界 | TC-EDGE-001~003 | L2 |
| FR-回归 | TC-REG-001~002 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| ARM64 架构 | 当前仅测试 amd64 | CI 增加 ARM runner |
| Distroless 基础镜像 | 当前使用 slim 镜像 | 评估 Distroless 兼容性后切换 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/44-需求-Docker多阶段构建.md`*