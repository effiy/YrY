# verification-loop 快速索引

`verification-loop` 用于对构建、集成、部署等非 UI 场景执行全面验证。核心理念是"不依赖重试，依赖准备"——在执行前先把所有可能导致失败的问题找出来并修复。行为真源在 `SKILL.md`。

## 快速开始

```bash
/verification-loop <验证目标>
```

示例：

```bash
/verification-loop "npm run build"
/verification-loop "Vite 打包"
/verification-loop "TypeScript 类型检查"
```

## 文件职责

| 文件           | 职责                           |
| -------------- | ------------------------------ |
| `SKILL.md`     | 探针步骤、四阶段流程、输出格式 |

## 工作流程

1. **MCP 可用性探针**：检查 playwright / filesystem 等工具是否可用，禁止静默降级。
2. **阶段 1：环境快照**：读取 `package.json`、构建配置、Node 版本要求。
3. **阶段 2：静态预检**：依赖完整性、类型、import 路径、环境变量、lint 规则。
4. **阶段 3：环境对齐**：确认当前环境满足配置要求。
5. **阶段 4：一次执行 + 结果断言**：只执行一次，失败后给出一次性修复清单。

## 使用原则

1. 前置探针有阻断项时禁止进入阶段 1；阶段 1-3 有阻断项时禁止进入阶段 4。
2. 验证命令名称必须取自 `package.json scripts`，不得假设或硬编码。
3. 阶段 4 失败后不自动重试，给出"一次性修复清单"交由调用方决策。
4. playwright 降级时必须在输出中标注 ⚠️，不得以全通过方式呈现降级结果。
