---

doc_type: test
title: "YA-09-20: 文件存储抽象层 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-20"
source_prds: ["24-需求-文件存储抽象层"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-20: 文件存储抽象层 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖本地/S3/OSS 多后端可插拔架构、统一 StorageBackend 接口、后端热切换。

> 来源 PRD：[24-需求-文件存储抽象层.md](../../prds/2026-09/24-需求-文件存储抽象层.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | StorageBackend 接口实现 | pytest | 各后端 read/write/delete/list 接口一致性 |
| L2 集成测试 | 真实文件系统 + mock S3 | pytest + tmp_path + moto | 后端切换、路径安全、大文件读写 |

### 1.2 StorageBackend 统一接口

```python
class StorageBackend(ABC):
    @abstractmethod
    async def read(self, path: str) -> bytes: ...
    @abstractmethod
    async def write(self, path: str, data: bytes) -> None: ...
    @abstractmethod
    async def delete(self, path: str) -> None: ...
    @abstractmethod
    async def list(self, prefix: str) -> list[str]: ...
    @abstractmethod
    async def exists(self, path: str) -> bool: ...
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import os
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def test_file_content():
    """测试文件内容。"""
    return b"Hello, YiAi Storage Layer!\n" * 100

@pytest.fixture
def test_files_data():
    """多文件测试数据。"""
    return [
        ("/data/knowledge/test1.md", b"# Test Document 1\n\nContent 1"),
        ("/data/knowledge/test2.md", b"# Test Document 2\n\nContent 2"),
        ("/data/uploads/image.png", b"\x89PNG\r\n\x1a\n" + b"\x00" * 100),
    ]

@pytest.fixture
def local_backend(tmp_path):
    """本地文件系统后端。"""
    from storage.local import LocalStorageBackend
    return LocalStorageBackend(root_dir=str(tmp_path / "storage"))

@pytest.fixture
def mock_s3_backend():
    """Mock S3 后端——使用 moto。"""
    try:
        import boto3
        from moto import mock_s3
        mock = mock_s3()
        mock.start()
        s3 = boto3.client("s3", region_name="us-east-1")
        s3.create_bucket(Bucket="yiai-test-bucket")
        from storage.s3 import S3StorageBackend
        backend = S3StorageBackend(bucket="yiai-test-bucket", client=s3)
        yield backend
        mock.stop()
    except ImportError:
        pytest.skip("moto/boto3 not installed")

@pytest.fixture
def storage_config():
    """存储配置。"""
    return {
        "default_backend": "local",
        "backends": {
            "local": {"root_dir": "/data/yiai/storage"},
            "s3": {"bucket": "yiai-storage", "region": "us-east-1"},
            "oss": {"endpoint": "https://oss-cn-hangzhou.aliyuncs.com", "bucket": "yiai-storage"},
        },
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 本地文件系统后端

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-FS-01 | 写入并读取文件 | local_backend | 1. write("/test.txt", content)<br>2. read("/test.txt") | 读取内容与写入一致 | P0 |
| TC-FS-02 | 删除文件 | 文件已存在 | 1. write → delete<br>2. exists("/test.txt") | exists 返回 False | P1 |
| TC-FS-03 | 列出目录文件 | 3 个文件在 /data/ 下 | 1. list("/data/")<br>2. 检查结果 | 3 个文件路径 | P1 |
| TC-FS-04 | 大文件读写 | 10MB 文件 | 1. write 10MB<br>2. read 10MB | 完整读写，无截断 | P2 |
| TC-FS-05 | 路径遍历攻击防护 | path="../../../etc/passwd" | 1. write("../../../etc/passwd", content)<br>2. 检查行为 | 拒绝或规范化路径到 root_dir 内 | P0 |

### 3.2 S3 后端

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-FS-06 | S3 写入读取 | mock_s3_backend | 1. write("s3-key/test.txt", content)<br>2. read("s3-key/test.txt") | 读写一致 | P1 |
| TC-FS-07 | S3 文件不存在 | mock_s3_backend | 1. read("nonexistent.txt")<br>2. 检查异常 | FileNotFoundError | P1 |
| TC-FS-08 | S3 列出对象 | 3 个 S3 对象 | 1. list("s3-key/")<br>2. 检查数量 | 3 个对象 | P2 |

### 3.3 后端切换

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-FS-09 | 配置驱动切换本地→S3 | storage_config | 1. 修改 default_backend 为 "s3"<br>2. 执行文件操作 | 操作路由到 S3 后端 | P1 |
| TC-FS-10 | 相同接口不同后端 | local + S3 | 1. 对两个后端执行相同操作序列<br>2. 验证行为一致 | write/read/delete/list 行为一致 | P1 |
| TC-FS-11 | 未配置后端→报错 | backend name 不存在 | 1. 尝试使用未配置的后端<br>2. 检查异常 | "后端 xxx 未配置" | P2 |

### 3.4 接口一致性

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-FS-12 | write 幂等性 | 相同路径写两次 | 1. write(path, data1)<br>2. write(path, data2)<br>3. read(path) | 读取 data2（覆盖） | P2 |
| TC-FS-13 | 空文件写入 | data=b"" | 1. write(path, b"")<br>2. read(path) | 返回 b"" | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-FS-01 | 磁盘满时写入 | 本地磁盘空间不足 | IOError "磁盘空间不足" | P1 |
| EG-FS-02 | 并发写入同一文件 | 两个 write 同时写同一路径 | 最后一次写入获胜（或锁保护） | P1 |
| EG-FS-03 | 超长路径 | path 长度 > 255 字符 | 根据文件系统决定：允许或拒绝 | P2 |
| EG-FS-04 | 特殊字符路径 | path="test:file?.txt" | 根据存储后端处理：拒绝或转义 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-FS-01 | /read-file /write-file 行为不变 | 存储抽象层上线 | 现有文件读写端点行为不变 | P0 |
| RG-FS-02 | 知识库文件监视器兼容 | 存储后端切换 | 知识库扫描和 RAG 索引正常 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: LocalStorageBackend | TC-FS-01 ~ TC-FS-05 | 读写/删除/列表/大文件/路径安全 |
| FR2: S3StorageBackend | TC-FS-06 ~ TC-FS-08 | 读写/不存在/列表 |
| FR3: 后端切换 | TC-FS-09 ~ TC-FS-11 | 配置/一致性/报错 |
| FR4: 接口一致性 | TC-FS-12, TC-FS-13 | 幂等/空文件 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 真实 S3/OSS 测试 | mock 环境与真实云服务差异 | 添加 AWS S3/Aliyun OSS CI 集成测试 |
| 大文件流式传输 | 当前测试使用全量读写 | 添加流式上传/下载测试 |
| 文件元数据管理 | contentType/contentLength 等 | 添加元数据读写测试 |
| 签名 URL 生成 | 临时访问链接 | 添加预签名 URL 生成测试 |