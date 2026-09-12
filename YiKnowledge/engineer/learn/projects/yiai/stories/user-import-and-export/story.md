---
title: User Import and Export
key: 4c24ad48-e7d2-4428-8cc4-6569378468e5
tags:
- users
- import
- export
- csv
- batch
- user-management
- fastapi
category: engineer/learn/projects/yiai/stories
created: '2026-07-26'
updated: 2026-09-10
source: internal
type: story
status: testing
project: YiAi
story_name: user-import-and-export
---

# 用户导入与导出

批量操作用户管理功能：支持 CSV/JSON 文件上传批量创建用户，以及 CSV 导出下载所有符合条件的用户数据用于离线审计验证。

## 功能概述

通过两个互补的端点提供高效的大规模用户数据管理能力：

### 导入功能
- **入口**：`POST /users/import`
- **支持格式**：CSV（推荐，Excel 兼容）或 JSON
- **批量处理**：单次请求支持创建多个用户，带逐行错误报告
- **数据校验**：必填字段（username、password）验证，重复检查，格式校验

### 导出功能
- **入口**：`GET /users/export`
- **支持格式**：CSV
- **筛选支持**：可按角色、状态、创建时间范围过滤导出范围
- **用途**：离线审计、数据备份、跨系统迁移

## 技术实现要点

### 后端端点（YiAi）

```python
# server/routes/users.py
@router.post("/import")
async def import_users(file: UploadFile = File(...)):
    # 1. 解析 CSV/JSON 文件
    # 2. 逐行验证必填字段和数据格式
    # 3. 批量写入 MongoDB（users 集合）
    # 4. 返回成功计数 + 错误报告
    pass

@router.get("/export")
async def export_users(
    role: str = None,
    status: str = None,
    created_after: datetime = None,
    created_before: datetime = None
):
    # 1. 构建 MongoDB 过滤条件
    # 2. 查询匹配的用户
    # 3. 生成 CSV 文件流
    # 4. 返回 StreamingResponse
    pass
```

### 前端集成（YiVad）

YiVad 的设置 → 导入页面 (`/import`) 提供 UI 操作界面：
- 文件拖拽上传区域（CSV/JSON）
- 导入预览（显示即将创建的用户列表）
- 导入进度指示器
- 错误报告弹窗（逐行显示导入失败的原因）

## 适用场景

| 场景 | 使用方式 |
|---|---|
| 批量创建初始用户 | 准备 CSV 模板 → 导入 → 验证导出 |
| 跨系统迁移用户数据 | 从旧系统导出 CSV → 映射字段 → 导入 YiAi |
| 季度用户审计 | 导出全量用户 CSV → Excel 分析 → 对比权限配置 |
| 权限批量变更 | 导出 → 修改 CSV → 重新导入（带 upsert） |

## 反模式

| 反模式 | 为什么有问题 | 正确做法 |
|---|---|---|
| 不做导入预览直接批量创建 | 格式错误或脏数据会污染数据库 | 先显示导入预览，用户确认后再执行 |
| 导入时不做重复检查 | 重复用户可能导致数据混乱 | 基于 username 或 email 做唯一性检查 |
| 导出全量数据到内存再返回 | 大规模用户数据会导致内存溢出 | 使用流式导出（逐行生成 CSV）|