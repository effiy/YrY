---
title: "多模型路由与 Fallback"
tags: [model-routing, fallback, reliability, cost-optimization]
category: ai
created: 2026-09-11
updated: 2026-09-23
source: internal
type: 需求
status: 需求已编写
roles: [product, engineer, sre]
---

# 多模型路由与 Fallback

## 背景

当前 YiAi 使用单一固定模型处理所有请求：
- 代码类请求无法使用专门的代码模型
- 模型不可用时服务直接中断
- 无法根据成本/延迟/能力动态选择最优模型

## 用户故事

- 作为用户，当主模型不可用时，我希望自动切换到备用模型而不中断服务
- 作为开发者，当我写代码时，希望自动使用代码专用模型
- 作为运维人员，我希望根据模型健康状态自动调整路由

## 功能需求

1. **多维度路由**：成本/延迟/能力（code/vision/reasoning）三维决策
2. **健康检查**：定期 ping 模型，延迟 > 500ms 降权
3. **Fallback 链**：primary→secondary→minimal 三级回退
4. **模型注册表**：capabilities tag + cost + context window 元数据
5. **性能追踪**：滑动窗口 avg/p50/p90 延迟统计

## 非功能需求

- 路由决策延迟 < 10ms
- Fallback 切换时间 < 1s
- 健康检查间隔 30s

## 验收标准

- [ ] 代码请求自动路由到 codellama
- [ ] 主模型不可用时自动 fallback
- [ ] Fallback 时前端显示提示
- [ ] 主模型恢复后自动切回
