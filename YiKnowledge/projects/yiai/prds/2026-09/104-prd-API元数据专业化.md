---
title: "YA-104-需求: API 元数据专业化 — OpenAPI 描述修正"
tags: [需求, OpenAPI, 专业化, 文档]
category: 项目/管理后台/需求
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
roles: [engineer]
---

# YA-104: API 元数据专业化

## 一、背景

YiAi FastAPI 应用的 OpenAPI 描述为 `"YiPet AI Service API"`，但实际服务所有前端（YiVad、YiPet）。描述不准确。

## 二、修复

`src/app.py`:
```python
# 修复前
FastAPI(title="YiAi API", description="YiPet AI Service API", version="1.0.0")

# 修复后  
FastAPI(title="YiAi API", description="Yi Family Backend — RPC envelope API serving YiVad and YiPet", version="1.0.0")
```

## 三、验收

- [x] `/docs` OpenAPI 页面显示正确的全栈描述
- [x] `/openapi.json` 包含准确的服务描述