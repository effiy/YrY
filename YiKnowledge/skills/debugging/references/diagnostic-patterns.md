---
title: 各语言/框架诊断技巧
updated: 2026-09-23
tags: [skill, reference, debugging, diagnostics]
type: reference
status: stable
---

# 诊断技巧与常见陷阱

## 通用诊断技巧

### 二分法定位（git bisect）

当你知道某个版本正常、当前版本异常时：

```bash
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-commit>
# git 会自动 checkout 中间提交，测试后标记 good/bad
git bisect run pnpm test  # 自动化二分查找
```

### 最小复现

从完整应用中剥离出最小复现代码的原则：

1. 复制完整功能到独立文件
2. 逐步删除与问题无关的代码
3. 每次删除后确认问题仍可复现
4. 当无法再删除任何代码时，得到最小复现

### 日志策略

| 策略 | 场景 | 示例 |
|------|------|------|
| 漏斗日志 | 追踪数据流 | 入口 → 处理 → 出口各打一条 |
| 比较日志 | 对比正常/异常 | 加条件分支日志 `if error: log details` |
| 时间戳日志 | 排查时序问题 | 每次日志带 `Date.now()` 或 `time.time()` |
| 堆栈日志 | 追查调用来源 | `console.trace()` / `traceback.print_stack()` |

## Python/FastAPI 诊断

### 常见陷阱

| 陷阱 | 表现 | 诊断方法 |
|------|------|---------|
| Motor cursor 未 await | 返回 coroutine 对象而非数据 | `print(type(result))` 看到 `<coroutine>` |
| asyncio.create_task 未保持引用 | 任务被 GC 静默取消 | 保存 task 引用到列表 |
| Pydantic 验证静默转换 | 输入值与预期不符 | 打印 `model_dump()` 检查实际值 |
| 异常处理器吞异常 | 500 变成 200，错误信息丢失 | 检查中间件 `try/except` 中是否有 `pass` |
| 事件循环嵌套 | `This event loop is already running` | 不要在 async 函数中调用 `asyncio.run()` |

### 快速诊断命令

```python
# 检查 Motor 连接状态
await db.client.admin.command('ping')

# 查看集合索引
await db.collection.index_information()

# 打印实际执行的查询
import logging; logging.basicConfig(level=logging.DEBUG)

# 检查 asyncio 运行中的任务
import asyncio; print(asyncio.all_tasks())
```

## TypeScript/Vue 诊断

### 常见陷阱

| 陷阱 | 表现 | 诊断方法 |
|------|------|---------|
| ref 值未 `.value` | 模板中正常，脚本中拿到 Ref 对象 | `console.log(JSON.stringify(val))` 看到 `{"__v_isRef":true}` |
| reactive 对象解构 | 解构后丢失响应性 | `console.log(isRef(val))` 返回 false |
| watch 未设置 immediate | 初始值不触发回调 | 组件创建时手动调用一次回调 |
| computed 副作用 | 依赖追踪外的值未更新 | 用 watch 替代 computed 处理副作用 |
| Pinia store 在 setup 外使用 | store 未初始化 | 确保在 `setup` 或 `store` 内部调用 `useXxxStore()` |

### 浏览器 DevTools 技巧

```javascript
// 检查 Vue 组件实例
$vm0  // 在 Console 中访问选中的组件

// 检查 Pinia store 状态
JSON.parse(JSON.stringify($vm0.$pinia.state.value))

// 追踪响应式依赖
import { onTrack, onTrigger } from 'vue'
watchEffect(() => {
  onTrack(e => console.log('track', e))
  onTrigger(e => console.log('trigger', e))
})
```

## Chrome Extension 诊断

### 常见陷阱

| 陷阱 | 表现 | 诊断方法 |
|------|------|---------|
| Service Worker 休眠 | 事件监听器失效 | `chrome.runtime.onConnect` 重连 |
| Content Script 隔离 | 访问不到页面变量 | 注入 `<script>` 标签到页面 DOM |
| storage 配额超限 | 写入静默失败 | `chrome.storage.local.getBytesInUse()` |
| 消息通道未响应 | sendMessage 无回调 | 检查接收端是否注册了 `onMessage` |

### 诊断入口

- Content Script：页面 DevTools → Console（选择 Content Script 上下文）
- Service Worker：`chrome://extensions` → 扩展详情 → Service Worker 链接
- Popup：右键扩展图标 → 检查弹出内容

## Rust/Tauri 诊断

### 常见陷阱

| 陷阱 | 表现 | 诊断方法 |
|------|------|---------|
| Mutex 死锁 | 应用挂起无响应 | `try_lock()` 检查锁状态 |
| Tauri 命令参数不匹配 | invoke 返回错误 | 检查前端调用参数名是否与 `#[tauri::command]` 签名一致 |
| 未处理的 Result | 编译警告 | `#[allow(unused_must_use)]` 是红色警报 |