---
title: 代码审查检查清单
updated: 2026-09-23
tags: [skill, reference, review, checklist]
type: reference
status: stable
---

# 代码审查检查清单

## 通用检查项（所有语言）

### 安全
- [ ] 无硬编码的密码、Token、密钥
- [ ] 用户输入经过校验和转义
- [ ] SQL/命令通过参数化构建，非字符串拼接
- [ ] 敏感操作有认证和授权检查
- [ ] 日志中无敏感信息（密码、Token、PII）
- [ ] 文件上传有类型和大小限制

### 正确性
- [ ] 条件分支覆盖所有可能值
- [ ] 循环有明确的终止条件
- [ ] 空值（null/undefined/None/空字符串）有处理
- [ ] 异步操作正确 await，错误被捕获
- [ ] 数字运算考虑除零、溢出、精度问题
- [ ] 日期/时区处理正确

### 性能
- [ ] 无不必要的循环内 I/O 操作
- [ ] 大数据集有分页或流式处理
- [ ] 事件监听器和定时器在组件销毁时清理
- [ ] 缓存键使用稳定引用（非每次渲染重建对象）

### 可维护性
- [ ] 命名准确描述意图
- [ ] 函数职责单一，长度合理（≤50 行）
- [ ] 无魔数（使用命名常量）
- [ ] 注释解释「为什么」，而非「是什么」
- [ ] 无未使用的导入和变量
- [ ] 错误消息包含足够的调试信息

### 架构
- [ ] 不跨模块边界访问内部实现
- [ ] 无循环依赖
- [ ] 新代码放在正确的模块/目录中
- [ ] 遵循项目既有的模式和约定

## TypeScript/Vue（YiVad）

- [ ] 使用 Composition API（`<script setup lang="ts">`）
- [ ] Props 和 Emits 有完整类型定义
- [ ] `v-auth` 指令用于按钮级权限控制
- [ ] API 调用通过 `RequestHttp` 封装
- [ ] Pinia store 使用 `storeToRefs` 保持响应性
- [ ] 组件不直接访问路由 query/params 做数据查询（通过 store）
- [ ] `watch` 和 `watchEffect` 在 `onUnmounted` 中清理
- [ ] ProTable 列配置使用 `shallowRef` 或放在 `setup` 外部

## Python/FastAPI（YiAi）

- [ ] 使用 `async/await` 配合 Motor 异步驱动
- [ ] RPC 参数名遵循协议（`filter`、`cname`、`target_file`）
- [ ] 异常使用项目标准错误码（1001-9999）
- [ ] 文件路径使用 `pathlib.Path` 而非字符串拼接
- [ ] 配置文件通过 `config.yaml` 或环境变量加载
- [ ] 数据库查询有限制和投影（避免全表扫描）
- [ ] typing 类型注解完整（函数签名 + 复杂类型）

## Chrome Extension（YiPet）

- [ ] Content Script 不直接访问 `chrome.storage`（通过消息传递）
- [ ] Service Worker 中不使用 DOM API
- [ ] 消息传递使用 `chrome.runtime.sendMessage` 有错误回调
- [ ] manifest.json 权限遵循最小权限原则
- [ ] Service Worker 唤醒后有状态恢复逻辑
- [ ] API 调用通过 `ApiClient` 层封装