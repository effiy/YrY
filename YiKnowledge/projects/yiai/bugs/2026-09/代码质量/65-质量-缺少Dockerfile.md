---
title: 缺少 .dockerignore 和 Dockerfile
tags: [yiai, code-quality, deployment]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# 缺少 .dockerignore 和 Dockerfile

## 现象

CLAUDE.md 部署架构提到了生产环境，但仓库中没有 `.dockerignore` 或 `Dockerfile`：

```bash
$ ls YiAi/Dockerfile* YiAi/.dockerignore 2>/dev/null
# 无输出
```

当前部署依赖 `python main.py` 手动启动。没有容器化支持使得生产部署、水平扩展、CI/CD 集成变得困难。

## 根因分析

- 开发阶段优先本地 `python main.py` 启动
- 容器化需求在计划中但未实现

## 涉及文件

- 缺少 `YiAi/Dockerfile`
- 缺少 `YiAi/.dockerignore`

## 修复方案

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
COPY config.yaml .
CMD ["python", "-m", "uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "10086"]
```

## 预防措施

- 所有服务应有对应的 Dockerfile 和 docker-compose 配置

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
