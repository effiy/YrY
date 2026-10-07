---

doc_type: test
title: "YP-09-237: RAG 按钮样式功能对齐 — 测试方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer, qa]
created: "2026-09-23"
updated: "2026-09-23"
project: YiPet
prd_month: "202609"
source_prds: ["237-体验优化-rag按钮样式功能对齐.md"]
source_modules: ["237-prd-task-rag按钮样式功能对齐.md"]

type: test
---

# YP-09-237: RAG 按钮样式功能对齐 — 测试方案

> 来源 PRD：[237-体验优化-rag按钮样式功能对齐.md](../../prds/2026-09/237-体验优化-rag按钮样式功能对齐.md)

## 一、弹出框样式对齐测试

| 编号 | 测试项 | 对比标准 (YiVad) | 验证方法 |
|------|--------|-----------------|---------|
| TC-RS-01 | 弹出框内边距 | `padding: 14px 16px` | DevTools 检查 `.ct-rag-console-pop` |
| TC-RS-02 | 弹出框圆角 | `border-radius: 8px` | DevTools 检查 |
| TC-RS-03 | 弹出框图阴影 | `box-shadow: 0 4px 16px rgba(0,0,0,0.12)` | 目视对比 |
| TC-RS-04 | 头部内边距 | `padding: 4px 0 12px; margin-bottom: 4px` | DevTools 检查 `.ct-rag-pop-head` |
| TC-RS-05 | 标题间距 | `gap: 7px` | DevTools 检查 `.ct-rag-pop-title` |
| TC-RS-06 | 分区标题 `::after` 分隔线 | 灰色横线，flex: 1 | 目视检查 4 个分区标题 |
| TC-RS-07 | 文档计数徽章 | 胶囊形状 `border-radius: 999px`，`padding: 2px 8px` | 目视检查弹出框头部 |
| TC-RS-08 | 分区容器 | `display: flex; flex-direction: column; gap: 2px; padding: 10px 0` | DevTools 检查 `.ct-rag-pop-section` |
| TC-RS-09 | 行间距 | `padding: 2px 6px; margin: 0 -6px; border-radius: 5px` | DevTools 检查 `.ct-rag-row` |
| TC-RS-10 | 行 hover 效果 | 背景变 `var(--el-fill-color-lighter)` | 鼠标悬停验证 |

## 二、信息提示圆圈测试

| 编号 | 测试项 | 操作 | 预期 |
|------|--------|------|------|
| TC-TT-01 | Chat Mode `?` 圆圈显示 | 查看 Chat Mode 标签旁 | `14×14px` 灰色圆形 `?` |
| TC-TT-02 | Chat Mode tooltip | hover `?` | 显示 "How conversation history is used for retrieval" |
| TC-TT-03 | Fast Mode tooltip | hover `?` | 显示 "Skip retrieval entirely..." |
| TC-TT-04 | Query Variants tooltip | hover `?` | 显示 "Number of query variations..." |
| TC-TT-05 | Hybrid tooltip | hover `?` | 显示 "Combine keyword matching..." |
| TC-TT-06 | Rerank tooltip | hover `?` | 显示 "Cross-encoder re-ranks..." |
| TC-TT-07 | HyDE tooltip | hover `?` | 显示 "Generate hypothetical answer..." |
| TC-TT-08 | Citations tooltip | hover `?` | 显示 "Prefix chunks with [Source N]..." |
| TC-TT-09 | `?` hover 样式 | hover 任意 `?` 圆圈 | 边框+背景变为主色 |

## 三、派生范围栏测试

| 编号 | 测试项 | 前置条件 | 预期 |
|------|--------|---------|------|
| TC-DS-01 | 无上下文文件 | `contextFiles = []` | 不显示范围栏 |
| TC-DS-02 | 单个上下文文件 | 添加 1 个文件到上下文 | 绿色栏：`ctx \| path/to/file \| 1 file` |
| TC-DS-03 | 多个同目录文件 | 添加 3 个同目录文件 | 公共前缀路径 + `3 files` |
| TC-DS-04 | 不同目录文件 | 添加来自不同角色目录的文件 | `mixed roles` + `N files` |

## 四、空状态消息测试

| 编号 | 测试项 | 前置条件 | 预期 |
|------|--------|---------|------|
| TC-EM-01 | 消息内容 | 索引未构建，打开 RAG 设置 | 文本含 `python -m scripts.build_index` |
| TC-EM-02 | 代码样式 | 查看 `<code>` 标签 | 灰色背景等宽字体 |

## 五、功能回归测试

| 编号 | 回归用例 | 操作 | 预期 |
|------|---------|------|------|
| REG-01 | RAG 开启发送消息 | RAG ON → 发送问题 | 知识库检索，流式回复含来源 |
| REG-02 | RAG 关闭发送消息 | RAG OFF → 发送问题 | 普通 LLM 对话 |
| REG-03 | RAG + Web 组合按钮 | 同时开启 RAG 和 Web | 组合样式正确（连体药丸） |
| REG-04 | RAG 设置持久化 | 修改设置 → 关闭弹框 → 重新打开 | 设置保持 |
| REG-05 | Reset to Defaults | 修改多项设置 → 点击 Reset | 所有设置恢复默认值 |
| REG-06 | 不可用状态齿轮可点击 | 索引未构建 → 点击齿轮 | 弹出框正常打开，显示空状态 |
| REG-07 | Ctrl+Shift+R 快捷键 | 按快捷键 | RAG 开关切换 |
| REG-08 | 切换会话状态保持 | 选择不同会话 | RAG 开关状态保持 |
| REG-09 | 类型检查 | `vue-tsc --noEmit --skipLibCheck` | 通过 |
| REG-10 | 构建 | `npm run build` | 无错误 |

## 六、跨项目对齐验证

| 编号 | 测试项 | YiVad 参考 | 验证 |
|------|--------|-----------|------|
| TC-XP-01 | 弹出框视觉 | `localhost:8848/#/ai-chat` RAG 弹出框 | 目视对比，样式一致 |
| TC-XP-02 | RAG 按钮外观 | 健康点 + Cpu 图标 + "RAG" + 徽章 | 外观一致 |
| TC-XP-03 | 设置选项内容 | Chat Mode / Fast Mode / Query Variants / Hybrid / Rerank / HyDE / Citations | 选项完全一致 |