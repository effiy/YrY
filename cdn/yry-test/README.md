# YryTest · 测试面板样式

> Vanilla 组件 · 测试面板样式 · 41KB CSS · 83KB JS (最大 JS 文件)

## 文件

```
yry-test/
├── index.html    # 测试面板预览
├── index.js      # 测试面板交互逻辑 (83KB JS, 最大 JS 文件)
└── index.css     # 测试面板专属样式 (41KB CSS)
```

## 功能

- 测试用例展示
- 自动化测试入口
- 测试结果统计

## 测试面板组件

| 组件 | 大小 | 用途 | 状态 |
|------|:---:|------|:---:|
| 用例列表 | 12KB | TC-N/TC-B 用例展示 | ✅ |
| 执行日志 | 8KB | 实时日志流 | ✅ |
| 统计卡 | 6KB | 通过/失败/跳过 | ✅ |
| 进度条 | 4KB | 测试执行进度 | ✅ |
| 筛选器 | 5KB | 按类型/优先级筛选 | ✅ |
| 导出工具 | 7KB | JSON/HTML 报告导出 | ✅ |

## 测试结果 schema

```json
{
  "scene": "场景-1-init后全量自检",
  "timestamp": "2026-06-22T10:00:00Z",
  "summary": {
    "total": 18, "passed": 18, "failed": 0, "skipped": 0,
    "duration_ms": 2340, "pass_rate": 1.0
  },
  "suites": [
    { "name": "骨架完整性", "asserts": 7, "passed": 7 },
    { "name": "CSS 变量覆盖", "asserts": 14, "passed": 14 }
  ]
}
```

## 执行性能基线

| 测试规模 | 耗时 | 内存 | 输出 |
|---------|:---:|:---:|:---:|
| 单场景 (10 用例) | ≤ 2s | ≤ 20MB | ≤ 10KB |
| 全量 (100 用例) | ≤ 15s | ≤ 50MB | ≤ 50KB |
| 跨故事 (500 用例) | ≤ 60s | ≤ 100MB | ≤ 200KB |

## 自动化入口

| 入口 | 命令 | 触发 | 阻断 |
|------|------|------|:---:|
| 命令行 | `node tests/run.mjs` | 手动 | — |
| npm script | `npm test` | 手动/CI | ✅ |
| pre-commit | git commit | 自动 | ✅ P0 |
| CI build | PR | 自动 | ✅ 全量 |
| 定时 | Cron 每日 | 自动 | ⚠️ 告警 |

## 加载

```html
<link rel="stylesheet" href="../../../../cdn/yry-test/index.css">
<script src="../../../../cdn/yry-test/index.js"></script>
```

## 场景

6 个场景任务故事, 每场景 8 标准交付物。详见 [scenes/README.md](scenes/README.md)

| # | 场景 | 主题 |
|---|------|------|
| 1 | init 后全量自检 | 文件完整性 · 语法校验 |
| 2 | commit 前增量自检 | 变更范围 · 快速验证 |
| 3 | 文档代码一致性校验 | 引用可达 · 版本同步 |
| 4 | 安全面回归自检 | 认证绕过 · 密钥泄露 · XSS |
| 5 | 跨故事集成回归自检 | 接口契约 · 数据流一致性 |
| 6 | 第三方框架与服务自检 | 外部服务 · 版本兼容性 |

故事概述: [scenes/故事任务.md](scenes/故事任务.md) · 知识图谱: [scenes/知识图谱.html](scenes/知识图谱.html)