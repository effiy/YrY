---
title: 严重级别判定指南
updated: 2026-09-23
tags: [skill, reference, review, severity]
type: reference
status: stable
---

# 严重级别判定指南

## 级别定义

| 级别 | 标签 | 定义 | 阻塞合并 |
|------|------|------|---------|
| P0 | 🔴 严重 | 安全漏洞、数据丢失风险、线上崩溃 | 是 |
| P1 | 🟠 重要 | 功能异常、性能退化、明显的正确性问题 | 应该 |
| P2 | 🟡 建议 | 可维护性问题、轻微性能损耗 | 否 |
| P3 | 🟢 可选 | 风格偏好、小优化、替代方案建议 | 否 |

## 判定流程

```
发现潜在问题
    │
    ▼
是否会导致安全漏洞/数据丢失/线上崩溃？
    │
    ├── 是 → P0 🔴
    │
    └── 否
        │
        ▼
      是否会导致功能异常或明显性能退化？
        │
        ├── 是 → P1 🟠
        │
        └── 否
            │
            ▼
          是否显著降低可维护性或为重复代码？
            │
            ├── 是 → P2 🟡
            │
            └── 否 → P3 🟢
```

## 典型示例

### P0 🔴 严重

```python
# 硬编码 JWT Secret
JWT_SECRET = "my-secret-key-123"  # P0: 密钥硬编码

# 命令注入
os.system(f"rm -rf {user_input}")  # P0: 未校验的用户输入拼接到 shell

# 无认证的敏感操作
@app.post("/api/admin/delete-all")  # P0: 无认证保护
async def delete_all():
    await db.users.delete_many({})
```

```typescript
// 用户输入直接插入 DOM
<div v-html="userProvidedContent"></div>  // P0: XSS 风险

// Token 暴露在客户端代码中
const API_KEY = "sk-abc123xyz";  // P0: 密钥硬编码在前端
```

### P1 🟠 重要

```python
# 空查询导致全表扫描
results = await db.users.find({}).to_list(None)  # P1: 无限制查询

# 未处理的异步异常
async def process():
    result = await external_api.call()  # P1: 无 try/except
    return result.data  # P1: 可能 AttributeError

# RPC 参数名错误
parameters = {"query": "some-filter"}  # P1: 应为 "filter"
```

```typescript
// 未清理的定时器
onMounted(() => {
  setInterval(() => fetchData(), 5000)  // P1: 组件卸载后继续运行
})

// Promise 未处理 rejection
fetchUserData().then(data => {  // P1: 缺少 .catch()
  user.value = data
})
```

### P2 🟡 建议

```python
# 重复代码 — 三次相同的验证逻辑
if not request.name:
    raise ValidationError("name required")
if not request.email:
    raise ValidationError("email required")
if not request.phone:
    raise ValidationError("phone required")
# P2: 建议抽取为 validate_required_fields()

# 函数过长
async def handle_request(request):  # 80 lines
    # ... P2: 建议拆分为多个职责单一的函数
```

```typescript
// 模糊的命名
const d = computed(() => items.value.filter(i => i.s === 'active'))
// P2: 'd' 和 'i.s' 含义不清

// Any 类型
function process(data: any) {  // P2: 建议定义具体类型
  return data.result
}
```

### P3 🟢 可选

```typescript
// 可以使用更简洁的写法
if (items.value.length === 0) {  // P3: 可写为 if (!items.value.length)
  return []
}

// 导入顺序
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/main'
// P3: 第三方导入 → 项目导入（如果项目有此约定）
```

## 提升和降低级别

### 提升级别的因素

- 影响面大（核心路径、高流量端点）
- 容易触发（常规操作即可触发）
- 难以检测（静默失败，无日志/告警）

### 降低级别的因素

- 受限于内部环境（仅在开发环境可触发）
- 已有防御层（上游参数校验和已拦截）
- 修复成本远高于风险（代码即将废弃）

## 审查中的常见争议

| 争议场景 | 建议判定 |
|---------|---------|
| 「这里应该用 interface 还是 type」 | P3 — 风格偏好 |
| 「这个函数可以再拆一个」35 行 | P3 — 未超过 50 行阈值 |
| 「这里加个缓存会更好」但当前量级不大 | P2 — 建议优化但非紧急 |
| 「变量名不够准确」但上下文能理解 | P2 — 可维护性问题 |
| 「缺少错误处理」用户输入场景 | P1 — 功能异常风险 |
| 「配置硬编码」可运行时修改的配置 | P2 — 建议提取但非安全风险 |