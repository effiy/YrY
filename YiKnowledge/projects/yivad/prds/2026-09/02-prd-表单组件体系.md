---
title: 表单组件体系
tags:
- 表单
- 验证
- 文件上传
- 自动保存
- 草稿
- 条件逻辑
- 签名
- 地图
- 富文本
- 导入
- 实时协作
- 离线
- 加密
- 向导
- 字段依赖
- 批量输入
- 访问控制
- 提交
- 数据持久化
category: 项目/管理后台/需求
created: '2026-09-09'
updated: '2026-09-10'
source: 内部
type: 需求
status: 待开始
priority: 中
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: '202609'
prd_task_id: YV-09-M09
estimate_frontend: 6.5
review_status: 已实现
issue_type: 功能
roles:
- engineer
- qa
- pm
- designer
source_okr: [yivad-003]
---

# 表单组件体系

> 需求编号：YV-09-M09 · 优先级：P1 · 人天：6.5d（汇总所有子需求）
> 依赖：RPC 协议层、data_service、文件存储服务

## 改动总览

本文档整合了以下 19 个子需求，覆盖 YiVad 表单视图的全部功能体系：

| 序号 | 需求编号 | 子需求 | 人天 | 优先级 |
|------|---------|--------|------|--------|
| 1 | YV-09-25 | 表单验证框架 | 0.5 | P1 |
| 2 | YV-09-28 | 文件上传与管理 | 0.5 | P2 |
| 3 | YV-09-38 | 自动保存与草稿恢复 | 0.5 | P2 |
| 4 | YV-09-162 | 表单自动保存草稿 | 0.3 | P2 |
| 5 | YV-09-163 | 表单向导分步 | 0.3 | P2 |
| 6 | YV-09-164 | 表单字段依赖 | 0.3 | P2 |
| 7 | YV-09-165 | 表单批量输入 | 0.3 | P2 |
| 8 | YV-09-166 | 表单字段加密 | 0.3 | P2 |
| 9 | YV-09-167 | 表单数据导入 | 0.3 | P2 |
| 10 | YV-09-168 | 表单实时协作 | 0.3 | P2 |
| 11 | YV-09-169 | 表单离线支持 | 0.3 | P2 |
| 12 | YV-09-170 | 表单条件逻辑 | 0.3 | P2 |
| 13 | YV-09-171 | 表单签名板 | 0.3 | P2 |
| 14 | YV-09-172 | 表单位置地图 | 0.3 | P2 |
| 15 | YV-09-173 | 表单富文本编辑 | 0.3 | P2 |
| 16 | YV-09-174 | 表单数据持久化 | 0.3 | P2 |
| 17 | YV-09-175 | 表单提交进度 | 0.3 | P2 |
| 18 | YV-09-176 | 表单访问控制 | 0.3 | P2 |
| 19 | YV-09-177 | 表单数据导出 | 0.3 | P2 |

## 涉及文件

```
YiVad/
├── src/
│   ├── hooks/
│   │   ├── useFormValidation.ts           # 表单验证核心
│   │   ├── useAutoSave.ts                 # 自动保存与草稿
│   │   ├── useFormWizard.ts               # 表单向导步骤管理
│   │   ├── useFieldDependency.ts          # 字段依赖关系
│   │   ├── useConditionalLogic.ts         # 条件逻辑引擎
│   │   ├── useFormEncryption.ts           # 字段级加密
│   │   ├── useRichText.ts                 # 富文本编辑器控制
│   │   ├── useFormPersistence.ts          # 表单数据持久化
│   │   ├── useFormSubmission.ts           # 提交进度与重试
│   │   ├── useFormCollaboration.ts        # 实时协作
│   │   ├── useFormOffline.ts              # 离线支持
│   │   ├── useFormAccess.ts               # 访问控制
│   │   └── useFormExport.ts               # 表单数据导出
│   ├── components/
│   │   ├── Form/
│   │   │   ├── FormValidationMessage.vue  # 验证消息展示
│   │   │   ├── FormWizard.vue             # 表单向导容器
│   │   │   ├── FormWizardSteps.vue        # 步骤导航
│   │   │   ├── FormFieldDependency.vue    # 字段依附属性的条件容器
│   │   │   ├── FormConditionalLogic.vue   # 条件逻辑规则编辑器
│   │   │   ├── FormBatchInput.vue         # 批量输入组件
│   │   │   └── FormSubmissionProgress.vue # 提交进度组件
│   │   ├── upload/
│   │   │   ├── FileUpload.vue            # 文件上传组件
│   │   │   ├── UploadProgress.vue         # 上传进度条
│   │   │   ├── FilePreview.vue            # 文件预览
│   │   │   └── FileManager.vue            # 文件管理器
│   │   ├── editor/
│   │   │   ├── RichTextEditor.vue         # 富文本编辑器
│   │   │   └── MarkdownEditor.vue         # Markdown 编辑器
│   │   ├── signature/
│   │   │   └── SignaturePad.vue           # Canvas 签名板
│   │   ├── map/
│   │   │   └── LocationPicker.vue         # 地图选点组件
│   │   ├── collaboration/
│   │   │   ├── CollaborationCursors.vue   # 协作光标显示
│   │   │   └── FieldLockIndicator.vue     # 字段锁定指示
│   │   └── wizard/
│   │       └── FormWizardSummary.vue      # 向导步骤摘要
│   ├── stores/modules/
│   │   ├── formDraft.ts                   # 草稿状态管理
│   │   └── formCollaboration.ts           # 协作状态管理
│   ├── utils/
│   │   ├── validation/
│   │   │   ├── rules.ts                   # 验证规则库
│   │   │   ├── validators.ts              # 自定义验证器
│   │   │   └── asyncValidators.ts         # 异步验证器
│   │   ├── encryption/
│   │   │   ├── clientEncrypt.ts           # 客户端加密工具
│   │   │   └── keyManager.ts              # 密钥管理
│   │   ├── offline/
│   │   │   ├── indexedDB.ts               # IndexedDB 封装
│   │   │   └── syncQueue.ts               # 同步队列
│   │   ├── formExport/
│   │   │   ├── csv.ts                     # CSV 导出
│   │   │   ├── xlsx.ts                    # Excel 导出
│   │   │   ├── json.ts                    # JSON 导出
│   │   │   └── pdf.ts                     # PDF 导出
│   │   └── import/
│   │       ├── fileParser.ts              # 文件解析器
│   │       └── fieldMapper.ts             # 字段映射器
│   └── styles/
│       ├── form.scss                      # 表单全局样式
│       └── signature.scss                 # 签名板样式
```

---

## 目录

1. [背景与问题陈述](#一背景与问题陈述)
2. [表单验证框架](#二表单验证框架)
3. [文件上传与管理](#三文件上传与管理)
4. [自动保存与草稿恢复](#四自动保存与草稿恢复)
5. [表单向导分步](#五表单向导分步)
6. [字段依赖与条件逻辑](#六字段依赖与条件逻辑)
7. [批量输入](#七批量输入)
8. [字段加密](#八字段加密)
9. [富文本编辑](#九富文本编辑)
10. [签名板](#十签名板)
11. [位置地图](#十一位置地图)
12. [实时协作](#十二实时协作)
13. [离线支持](#十三离线支持)
14. [数据持久化](#十四数据持久化)
15. [提交进度与重试](#十五提交进度与重试)
16. [访问控制](#十六访问控制)
17. [表单数据导入导出](#十七表单数据导入导出)
18. [风险与缓解](#十八风险与缓解)
19. [实施路线图](#十九实施路线图)

---

## 一、背景与问题陈述

### 1.1 核心问题

YiVad 当前的表单系统基于 Element Plus 基础表单组件，缺少系统化的验证框架、数据持久化机制和高级交互能力：

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **验证分散重复** -- 每个表单独立实现验证逻辑，无统一框架 | 高 | 代码重复、验证规则不一致、维护困难 |
| 2 | **无自动保存** -- 意外关闭页面数据丢失 | 高 | 用户花费数十分钟填写的数据瞬间丢失 |
| 3 | **复杂表单体验差** -- 无向导分步、无字段依赖、无条件逻辑 | 中 | 20+ 字段表单杂乱，用户填写意愿低 |
| 4 | **文件上传简陋** -- 无进度显示、无预览、无断点续传 | 中 | 大文件上传体验差 |
| 5 | **缺少高级字段类型** -- 无富文本、签名、地图选点、加密字段 | 中 | 特定场景（合同签署、位置选择、敏感信息）无法满足 |
| 6 | **无协作能力** -- 无多人编辑、无字段锁定 | 低 | 团队共同填写表单时冲突频繁 |
| 7 | **无离线支持** -- 网络不稳定时无法继续工作 | 中 | 移动办公场景体验差 |
| 8 | **无访问控制** -- 所有用户看到的表单字段相同 | 低 | 不同角色需要不同字段的场景无法满足 |

### 1.2 设计原则

1. **验证统一** -- 声明式验证框架，一处定义、全局复用
2. **数据不丢失** -- 自动保存 + 草稿恢复 + 崩溃恢复三重保障
3. **渐进复杂** -- 简单表单快速填写；复杂表单通过向导、依赖、条件逻辑降低认知负担
4. **安全可控** -- 敏感字段客户端加密；字段级访问控制
5. **协作与离线** -- 实时协作光标 + IndexedDB 离线存储 + 在线同步
6. **特殊场景覆盖** -- 签名、地图、富文本、批量输入等专业需求

---

## 二、表单验证框架

### 2.1 验证架构

**声明式验证规则定义：**

```typescript
interface ValidationRule {
  /** 规则名称 */
  name: string;
  /** 验证函数 */
  validator: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>;
  /** 错误消息 */
  message: string;
  /** 触发时机 */
  trigger: 'change' | 'blur' | 'submit';
}

interface FieldValidation {
  field: string;
  label: string;
  rules: ValidationRule[];
  /** 条件验证：仅当条件满足时才验证 */
  when?: (formData: Record<string, any>) => boolean;
}
```

### 2.2 内置验证规则

| 规则 | 说明 | 示例 |
|------|------|------|
| `required` | 必填 | `{ required: true, message: '名称不能为空' }` |
| `minLength` | 最小长度 | `{ minLength: 3, message: '至少 3 个字符' }` |
| `maxLength` | 最大长度 | `{ maxLength: 100, message: '不超过 100 个字符' }` |
| `pattern` | 正则匹配 | `{ pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母数字下划线' }` |
| `email` | 邮箱格式 | `{ email: true, message: '邮箱格式错误' }` |
| `url` | URL 格式 | `{ url: true, message: 'URL 格式错误' }` |
| `numeric` | 数字类型 | `{ numeric: true, message: '请输入数字' }` |
| `min` | 最小值 | `{ min: 0, message: '不能小于 0' }` |
| `max` | 最大值 | `{ max: 100, message: '不能大于 100' }` |
| `integer` | 整数 | `{ integer: true, message: '请输入整数' }` |
| `dateFormat` | 日期格式 | `{ dateFormat: 'YYYY-MM-DD', message: '日期格式错误' }` |
| `custom` | 自定义函数 | `{ custom: (v) => v !== 'admin', message: '用户名已被占用' }` |

### 2.3 异步验证

支持异步验证（如检查用户名唯一性）：

```typescript
const usernameRules = [
  { required: true, message: '用户名不能为空' },
  { minLength: 3, message: '至少 3 个字符' },
  {
    async: true,
    validator: async (value) => {
      const res = await rpcCall('services.data.user_service', 'check_username', { username: value });
      return res.data.available;
    },
    message: '用户名已被占用',
    trigger: 'blur',
    debounce: 500  // 防抖 500ms
  }
];
```

### 2.4 验证触发时机

- **change** -- 字段值变化时实时验证（适合下拉、单选等）
- **blur** -- 字段失去焦点时验证（默认，适合文本输入）
- **submit** -- 表单提交时验证（适合跨字段验证）

### 2.5 跨字段验证

支持依赖其他字段值的验证：

```typescript
const confirmPasswordRule = {
  validator: (value, formData) => value === formData.password,
  message: '两次密码输入不一致',
  trigger: 'blur',
  // 仅当 password 字段有值时启用
  when: (formData) => !!formData.password
};
```

### 2.6 验证错误展示

- **行内错误消息** -- 字段下方红色文字
- **字段边框高亮** -- 错误字段红色边框
- **表单顶部摘要** -- 提交时汇总所有错误（"请修正以下 X 个错误"）
- **滚动到第一个错误** -- 提交失败自动滚动

---

## 三、文件上传与管理

### 3.1 上传组件

**核心功能：**
- 拖拽上传区域
- 文件选择器
- 多文件上传
- 文件类型限制（MIME 类型 + 扩展名）
- 文件大小限制（单文件 + 总量）
- 上传进度条（单文件 + 总量）
- 取消上传
- 断点续传（分片上传）

**分片上传流程：**
1. 文件切分（每个分片 5MB）
2. 顺序上传分片
3. 每片上传成功返回分片 ID
4. 所有分片完成后调用合并接口
5. 断网/取消后可从已上传分片恢复

### 3.2 文件预览

| 文件类型 | 预览方式 |
|----------|---------|
| 图片（jpg/png/gif/webp/svg） | 缩略图 + 点击大图预览 |
| PDF | 内嵌 PDF 查看器（第一页预览） |
| 文本（txt/md/log） | 文本内容预览 |
| 代码（js/ts/py/java 等） | 语法高亮预览 |
| 视频/音频 | 播放器预览 |
| 其他 | 文件图标 + 文件名 + 大小 |

### 3.3 文件管理

- 文件列表（卡片视图/列表视图）
- 文件重命名
- 文件删除（软删除 + 确认）
- 文件下载
- 文件移动/复制
- 文件标签
- 文件搜索/筛选

---

## 四、自动保存与草稿恢复

### 4.1 自动保存策略

**防抖持久化：**
- 用户停止输入后 2 秒触发保存
- 保存到 IndexedDB（容量大、异步、不阻塞 UI）
- 保存状态指示器（"已保存" / "保存中..." / "未保存"）

**持久化内容：**
- 所有表单字段值
- 表单验证状态
- 当前步骤（向导表单）
- 文件上传队列（仅记录文件引用，不存储文件本身）

### 4.2 草稿恢复

**恢复场景：**
- 页面崩溃后重新打开
- 浏览器意外关闭
- 手动清空后想恢复
- 从其他标签页切回

**恢复流程：**
1. 页面加载时检测 IndexedDB 中是否有草稿
2. 弹出草稿恢复对话框：显示草稿摘要（字段数、保存时间、步骤进度）
3. 用户选择：恢复 / 放弃 / 稍后决定
4. 恢复后自动触发验证，标记所有字段为 dirty

### 4.3 多草稿管理

- 同一表单支持多个草稿（如"版本 1"、"版本 2"）
- 草稿命名和描述
- 草稿差异对比
- 过期清理（默认保留 30 天，可配置）

---

## 五、表单向导分步

### 5.1 向导架构

**组件结构：**
```
FormWizard (容器)
├── FormWizardSteps (步骤导航)
├── Step 1 Content (步骤内容)
├── Step 2 Content
├── Step N Content
└── FormWizardSummary (提交前摘要)
```

### 5.2 步骤导航

- 步骤编号和标题
- 当前步骤高亮
- 已完成步骤标记（勾号 + 绿色）
- 可返回已完成的步骤修改
- 不可跳过未完成的步骤（除非配置允许）
- 进度条显示完成百分比

### 5.3 步骤验证

- 每步独立验证（通过当前步骤才能进入下一步）
- 步骤间数据共享（前一步数据在后一步可用）
- 条件步骤（根据前面选择决定是否显示某步骤）

### 5.4 断点续填

- 退出向导时保存当前进度到草稿
- 重新进入时从上次离开的步骤继续
- 摘要确认（提交前显示所有步骤的关键数据）

---

## 六、字段依赖与条件逻辑

### 6.1 字段依赖

**条件显示/隐藏：**
- 根据其他字段值决定当前字段是否可见
- 隐藏字段的值可选择保留或清空
- 显示/隐藏动画（平滑展开/收起）

**条件必填：**
- 根据其他字段值决定当前字段是否必填
- 字段 label 旁动态显示/隐藏必填星号

**级联选择：**
- 下级选项根据上级选择动态加载
- 典型场景：省 -> 市 -> 区 三级联动
- 异步加载选项（通过 RPC 获取）

**字段计算：**
- 一个字段的值根据其他字段自动计算
- 如：总价 = 单价 × 数量
- 计算字段可选择为只读

**依赖图验证：**
- 检测循环依赖（A 依赖 B，B 依赖 C，C 依赖 A）
- 依赖图可视化（开发调试）

### 6.2 条件逻辑

**if-this-then-that 规则引擎：**

- 条件：字段 + 运算符 + 值（如"状态 = 已完成"）
- 动作：显示/隐藏/启用/禁用/必填/可选
- 多条件组合（AND / OR）
- 规则优先级（多条规则冲突时，优先级高的生效）

**条件构建器 UI：**
- 可视化规则编辑（下拉选择字段、运算符、值）
- 规则测试（指定输入，查看规则效果）
- 规则导入/导出（JSON 格式）

---

## 七、批量输入

### 7.1 批量输入模式

**支持的数据来源：**
- 粘贴表格数据（从 Excel/Google Sheets 复制）
- CSV/TSV 文件上传
- Excel 文件上传
- 手动输入多行

**处理流程：**
1. 粘贴/上传数据
2. 自动检测分隔符（逗号/制表符/竖线）
3. 列映射（数据列 -> 表单字段）
4. 数据预览（表格形式，支持编辑修正）
5. 逐行验证
6. 批量提交（显示进度）

**列映射策略：**
- 自动匹配（根据列标题与字段名相似度）
- 手动映射（拖拽连线或下拉选择）
- 保存映射配置为模板

---

## 八、字段加密

### 8.1 加密架构

**客户端加密（E2EE）：**
- 敏感字段在浏览器端使用公钥加密
- 加密后的数据发送到后端存储
- 后端无法解密（零知识）
- 解密在客户端使用私钥完成

**加密字段类型：**
- 密码/密钥
- 身份证号
- 银行卡号
- 手机号（可选）
- 自定义敏感字段

### 8.2 加密流程

1. **密钥生成** -- 用户首次使用时生成 RSA 密钥对
2. **公钥上传** -- 公钥上传到后端（用于其他用户加密分享给该用户的数据）
3. **私钥存储** -- 私钥存储在浏览器 IndexedDB，可密码保护
4. **字段加密** -- 表单提交前，敏感字段用公钥加密
5. **字段解密** -- 查看时，使用私钥解密后显示

### 8.3 敏感字段遮罩

- 默认以 `***` 显示
- 点击"显示"按钮后解密显示（需验证身份）
- 复制时提示"敏感信息"
- 导出时默认排除加密字段或导出加密值

---

## 九、富文本编辑

### 9.1 编辑器功能

**基础格式：**
- 加粗/斜体/下划线/删除线
- 标题（H1-H6）
- 有序/无序列表
- 引用块
- 代码块（语法高亮）
- 链接
- 图片（本地上传 + URL 插入）
- 表格

**高级功能：**
- Markdown 模式切换（Markdown 编辑 / 所见即所得）
- 字数统计
- 自动保存（防抖持久化到 IndexedDB）
- 撤销/重做
- 查找替换
- 全屏编辑模式

### 9.2 编辑器选型

| 编辑器 | 包大小 | 功能完整度 | 定制化 | 决策 |
|--------|--------|----------|--------|------|
| TipTap (ProseMirror) | ~200KB | 高 | 极高 | **推荐** |
| Quill | ~100KB | 中 | 中 | 备选 |
| TinyMCE | ~500KB | 极高 | 高 | 太重 |

**决策：** 使用 TipTap（基于 ProseMirror），核心优势：组件化架构、TypeScript 原生支持、Vue 3 完美集成、插件生态丰富。

---

## 十、签名板

### 10.1 Canvas 签名板

**核心功能：**
- 手写绘制（支持触控笔和手指）
- 压感支持（笔触粗细随压力变化）
- 清除/重置
- 撤销最后一笔
- 导出格式：PNG（透明背景）/ SVG（矢量）
- 时间戳嵌入
- 签名验证状态（已签名/未签名）

**Canvas 实现要点：**
- 监听 `mousedown`/`touchstart` 开始绘制
- `mousemove`/`touchmove` 跟踪轨迹
- `lineTo` 平滑连接（可选贝塞尔曲线平滑）
- 笔触颜色和粗细可配置
- Canvas 大小响应式适配

### 10.2 签名数据

签名保存为 Base64 字符串（PNG Data URL），与其他表单数据一起提交。

---

## 十一、位置地图

### 11.1 地图选点

**功能：**
- 地图点击选点
- 标记放置（可拖拽调整位置）
- 地理编码搜索（输入地址 -> 定位到坐标）
- 当前 GPS 位置获取（浏览器 Geolocation API）
- 坐标显示（经纬度）
- 半径选择（圆形区域）

**地图库选择：**
- 优先使用 Leaflet（开源、轻量、无 API Key 限制）
- 瓦片源：OpenStreetMap（免费）
- 备选：高德地图/百度地图（中国地区更精准）

### 11.2 位置数据

保存格式：
```json
{
  "lat": 39.9042,
  "lng": 116.4074,
  "address": "北京市东城区...",
  "radius": 500
}
```

---

## 十二、实时协作

### 12.1 协作架构

基于 WebSocket 的实时协作：
- yiAi 后端提供 WebSocket 端点
- 同一表单的多个编辑者建立连接
- 字段变更实时广播给其他用户

### 12.2 字段级锁定

- 用户聚焦某个字段时自动获取锁定
- 锁定状态广播给其他用户（该字段显示灰色 + 编辑者头像）
- 用户失焦或 30 秒无操作后自动释放锁定
- 手动锁定/解锁（右键菜单）

### 12.3 协作光标

- 显示其他编辑者的光标位置（不同颜色）
- 光标旁显示用户名
- 仅当用户正在活跃编辑时显示

### 12.4 冲突解决

- **最后写入胜出（LWW）** -- 默认策略，时间戳最新者覆盖
- **锁定优先** -- 有锁定的字段不可被其他人修改
- **变更合并** -- 对于列表类字段，自动合并增量变更

---

## 十三、离线支持

### 13.1 离线架构

**Service Worker 缓存：**
- 缓存应用 shell（HTML/CSS/JS）
- 缓存表单页面模板
- 拦截网络请求，离线时返回缓存

**IndexedDB 存储：**
- 离线填写的表单数据存储在本机
- 表单草稿
- 待同步的操作队列

**在线同步：**
- 网络恢复时自动同步
- 同步队列按时间顺序提交
- 冲突检测（服务端版本 vs 本地版本）
- 同步状态指示器（在线/离线/同步中）

### 13.2 离线指示器

- 顶部横幅显示"当前离线"
- 网络恢复时显示"已恢复在线，正在同步..."
- 同步完成后显示"同步完成"（3 秒后自动消失）
- 同步失败时显示"同步失败，X 条待同步" + 重试按钮

### 13.3 提交队列

- 离线时表单提交加入队列
- 队列存储在 IndexedDB
- 在线时按 FIFO 顺序处理
- 每条队列项包含：表单数据、提交时间、重试次数
- 最大重试次数 3 次，超过后标记失败

---

## 十四、数据持久化

### 14.1 持久化策略

**多层持久化：**

| 层级 | 存储介质 | 触发时机 | 内容 |
|------|---------|---------|------|
| 自动保存 | IndexedDB | 防抖 2 秒 | 全部表单数据 |
| 草稿保存 | IndexedDB | 手动点击"保存草稿" | 全部表单数据 + 元数据 |
| 崩溃恢复 | IndexedDB | 每次值变更（节流） | 关键字段 |
| 多标签同步 | BroadcastChannel API | 值变更时广播 | 变更数据 |

### 14.2 崩溃恢复

- 每次字段值变更时写入 IndexedDB（节流 1 秒）
- 页面加载时检测崩溃恢复数据
- 自动恢复无需用户确认（非脏数据时）
- 脏数据时弹出确认对话框

### 14.3 草稿管理

- 草稿列表（名称、表单类型、最后修改时间、步骤进度）
- 打开草稿 -> 恢复表单状态
- 删除草稿
- 草稿清理策略（30 天过期自动清理）
- 手动导出/导入草稿（JSON 文件）

---

## 十五、提交进度与重试

### 15.1 提交进度

**多步骤提交进度显示：**
1. 验证中（"正在验证表单数据..."）
2. 上传中（"正在上传文件... (3/5)"）
3. 提交中（"正在保存数据..."）
4. 处理中（"正在处理..."）
5. 完成（"提交成功" + 勾号动画）

**进度组件特性：**
- 步骤指示器（当前/完成/待处理）
- 预计剩余时间
- 后台提交（提交时允许用户继续浏览其他页面）
- 提交重试（失败时自动重试，最多 3 次）
- 成功/失败动画

### 15.2 提交重试策略

- 网络错误：指数退避（1s, 2s, 4s）
- 服务器错误（5xx）：间隔 5 秒重试
- 业务错误（4xx）：不重试，显示错误消息
- 最大重试次数 3 次
- 全部失败后显示错误信息 + 手动重试按钮

---

## 十六、访问控制

### 16.1 表单级权限

| 权限 | 说明 |
|------|------|
| 查看 | 可以查看表单内容 |
| 编辑 | 可以修改表单字段 |
| 提交 | 可以提交表单 |
| 审批 | 可以审批表单 |
| 管理 | 可以修改表单结构/权限设置 |

### 16.2 字段级权限

- 每个字段可配置谁可以查看/编辑
- 无查看权限的字段完全不显示
- 无编辑权限的字段显示为只读（灰色背景）
- 权限基于角色（admin/manager/member/viewer）

### 16.3 只读模式

- 全局只读模式（审批查看场景）
- 字段级只读模式（特定角色的部分字段不可编辑）
- 只读视觉区分（灰色背景、不可点击、无边框）

### 16.4 权限变更审计

- 记录每次权限变更：谁、何时、将什么权限从 A 改为 B
- 审计日志可查看

---

## 十七、表单数据导入导出

### 17.1 表单数据导入

**导入来源：**
- CSV 文件上传
- JSON 文件上传
- Excel 文件上传
- 剪贴板粘贴（CSV/TSV）
- URL 获取（从远程 JSON API 拉取）

**导入流程：**
1. 文件上传/粘贴/URL 指定
2. 自动检测格式和编码
3. 字段映射（源字段 -> 目标表单字段）
4. 数据预览（前 10 行）
5. 验证预览（标记问题行）
6. 重复处理策略（跳过/更新/合并）
7. 执行导入

### 17.2 表单数据导出

**导出格式：**
- CSV -- 数据交换
- Excel -- 汇报、分析
- JSON -- 程序化处理
- PDF -- 正式文档归档

**导出选项：**
- 字段选择（仅导出指定字段）
- 日期筛选（按时间范围导出）
- 匿名化（脱敏处理，替换敏感字段为 `***`）
- 定时导出配置

---

## 十八、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| IndexedDB 容量超限 | 中 | 中 | 中 | 监控使用量；LRU 清理旧草稿；提示用户清理 | 降级为 localStorage（5MB 限制） |
| WebSocket 连接不稳定 | 中 | 中 | 中 | 自动重连（指数退避）；心跳检测 | 降级为"刷新获取最新" |
| Service Worker 缓存过旧 | 低 | 高 | 中 | 版本号控制；每次加载检查更新 | 强制刷新绕过缓存 |
| 离线数据同步冲突 | 中 | 中 | 中 | 服务端版本号；三路合并 | 用户手动选择保留哪个版本 |
| 客户端密钥丢失 | 低 | 高 | 高 | 密钥导出备份提示；密码保护的密钥恢复 | 数据永久无法解密（需明确告知用户风险） |
| 实时协作并发写入冲突 | 中 | 低 | 低 | 字段级锁定 + LWW 策略 | 版本历史恢复 |
| 富文本编辑器 XSS | 低 | 高 | 高 | 输出时 HTML 净化（DOMPurify）；服务端二次净化 | 降级为纯文本显示 |
| 签名数据被篡改 | 低 | 高 | 高 | 签名 + 时间戳哈希存证 | 签名验证失败标记 |
| Service Worker 注册失败 | 低 | 中 | 低 | 渐进增强：SW 失败不影响基本功能 | 离线功能不可用，在线功能正常 |
| 文件上传分片服务器异常 | 中 | 中 | 中 | 分片上传幂等性设计；已上传分片可复用 | 告知用户重新上传 |

---

## 十九、实施路线图

### 阶段一：核心验证与持久化（P1，约 1.5d）

| 步骤 | 任务 | 产出 | 人天 |
|------|------|------|------|
| 1 | 表单验证框架 | `useFormValidation.ts` + 验证规则库 | 0.50 |
| 2 | 自动保存与草稿恢复 | `useAutoSave.ts` + IndexedDB 集成 | 0.50 |
| 3 | 表单数据持久化 | `useFormPersistence.ts` + 崩溃恢复 | 0.30 |
| 4 | 表单提交进度 | `useFormSubmission.ts` + 重试逻辑 | 0.20 |

### 阶段二：高级表单能力（P2，约 2.5d）

| 步骤 | 任务 | 产出 | 人天 |
|------|------|------|------|
| 1 | 文件上传与管理 | `FileUpload.vue` + 断点续传 + 预览 | 0.50 |
| 2 | 表单向导分步 | `FormWizard.vue` + 步骤导航 + 摘要 | 0.30 |
| 3 | 字段依赖 | `useFieldDependency.ts` + 级联选择 | 0.30 |
| 4 | 条件逻辑引擎 | `useConditionalLogic.ts` + 构建器 UI | 0.30 |
| 5 | 批量输入 | `FormBatchInput.vue` + 列映射 | 0.30 |
| 6 | 表单数据导入 | 文件解析器 + 字段映射器 | 0.30 |
| 7 | 表单数据导出 | CSV/Excel/JSON/PDF 渲染器 | 0.30 |

### 阶段三：特殊场景与协作（P2，约 2.5d）

| 步骤 | 任务 | 产出 | 人天 |
|------|------|------|------|
| 1 | 富文本编辑器 | `RichTextEditor.vue` (TipTap) + Markdown 模式 | 0.30 |
| 2 | 签名板 | `SignaturePad.vue` (Canvas) | 0.30 |
| 3 | 位置地图 | `LocationPicker.vue` (Leaflet) | 0.30 |
| 4 | 字段加密 | `clientEncrypt.ts` + `keyManager.ts` | 0.30 |
| 5 | 实时协作 | `useFormCollaboration.ts` + WebSocket + 字段锁定 | 0.30 |
| 6 | 离线支持 | Service Worker + IndexedDB + 同步队列 | 0.30 |
| 7 | 访问控制 | `useFormAccess.ts` + 字段级权限 | 0.30 |

**总计：6.5d**

---

## 代码审查检查清单

### 表单验证
- [ ] 必填/格式/长度/正则/自定义规则全部覆盖
- [ ] 异步验证防抖处理
- [ ] 跨字段验证（如密码确认）正确
- [ ] 条件验证（when 回调）正确
- [ ] 验证错误消息清晰且国际化
- [ ] 提交时汇总所有错误

### 文件上传
- [ ] 拖拽区域响应正确
- [ ] 文件类型和大小校验
- [ ] 分片上传和断点续传
- [ ] 上传进度实时更新
- [ ] 取消上传正常
- [ ] 文件预览渲染正确

### 自动保存与草稿
- [ ] 防抖 2 秒触发保存
- [ ] IndexedDB 读写正常
- [ ] 草稿恢复对话框弹出正确
- [ ] 多草稿管理（新增/删除/切换）
- [ ] 过期清理（30 天）逻辑正确

### 表单向导
- [ ] 步骤导航正确
- [ ] 每步独立验证
- [ ] 条件步骤显示/隐藏正确
- [ ] 断点续填恢复正确步骤
- [ ] 提交前摘要数据正确

### 字段依赖与条件逻辑
- [ ] 条件显示/隐藏无闪烁
- [ ] 条件必填动态切换正确
- [ ] 级联选择异步加载正确
- [ ] 循环依赖检测
- [ ] if-this-then-that 规则执行正确

### 富文本编辑器
- [ ] 基础格式工具栏功能正常
- [ ] Markdown 模式切换正常
- [ ] 图片上传集成
- [ ] 字数统计准确
- [ ] HTML 输出经过 XSS 净化

### 签名板
- [ ] Canvas 绘制流畅
- [ ] 触控笔和手指都支持
- [ ] 清除/撤销正常
- [ ] PNG/SVG 导出格式正确

### 位置地图
- [ ] 地图加载正常
- [ ] 点击选点精度
- [ ] 地理编码搜索
- [ ] 坐标显示正确

### 实时协作
- [ ] WebSocket 连接/重连
- [ ] 字段锁定机制
- [ ] 协作光标显示
- [ ] 冲突解决策略

### 离线支持
- [ ] Service Worker 注册
- [ ] 离线时表单可填写
- [ ] 在线后自动同步
- [ ] 同步冲突处理

### 字段加密
- [ ] 密钥对生成和存储
- [ ] 加密/解密正确
- [ ] 敏感字段遮罩
- [ ] 导出时脱敏处理

### 访问控制
- [ ] 表单级权限生效
- [ ] 字段级权限生效
- [ ] 只读模式视觉区分
- [ ] 权限变更审计日志

### 提交
- [ ] 多步骤提交进度正确
- [ ] 重试策略（指数退避）
- [ ] 后台提交不阻塞页面
- [ ] 成功/失败动画

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | 自动保存过于频繁导致 IndexedDB 性能问题 | 大表单（50+ 字段）频繁触发保存 | 每次值变更都触发序列化和写入 | 防抖 2 秒 + 脏数据标记（仅保存变更字段） |
| 2 | WebSocket 重连时丢失期间的消息 | 网络中断 30 秒后恢复 | WebSocket 无消息队列 | 重连后拉取全量数据快照同步 |
| 3 | Service Worker 缓存导致用户看不到最新版本 | 发布新版本后用户仍使用旧缓存 | SW 缓存策略未正确配置版本控制 | SW 使用 `skipWaiting` + `clients.claim`；显示"新版本可用"提示 |
| 4 | 离线表单提交顺序错乱 | 离线时用户多次修改同一表单 | 同步队列仅提交最终状态而非变更序列 | 同步前做最终状态 diff，仅提交变更 |
| 5 | 客户端加密密钥在不同设备间不同步 | 用户在设备 A 加密的数据在设备 B 无法解密 | 密钥对存储在 IndexedDB，无法跨设备 | 支持密钥导出/导入（加密的 JSON 文件） |
| 6 | 富文本编辑器粘贴外部内容时引入恶意脚本 | 从网页复制内容粘贴到编辑器 | 粘贴的内容可能包含 `<script>` 标签 | 粘贴时强制纯文本粘贴；输出时 DOMPurify 净化 |
| 7 | 批量输入列映射错误导致数据混乱 | 用户未正确映射列，提交后才发现问题 | 无强制性预览步骤 | 强制用户在预览阶段确认映射，提供行级验证高亮 |
| 8 | 表单向导条件步骤在返回修改时状态丢失 | 用户在步骤 3 返回修改步骤 1，导致步骤 2 的条件不满足 | 步骤间依赖未正确追踪 | 使用依赖图追踪步骤间数据流，返回时重新计算条件 |

---

## 补充：核心实现细节

### B.1 表单验证引擎核心实现

**验证管线（Pipeline）：**

```
字段值变更
  → 收集该字段的验证规则
  → 检查 when 条件（条件验证）
  → 按优先级排序规则
  → 顺序执行验证：
       同步规则 → 立即返回结果
       异步规则 → 防抖延迟后执行 → 返回 Promise
  → 收集所有错误消息
  → 更新字段验证状态（valid / invalid / validating）
  → 渲染验证消息
```

**验证状态管理数据结构：**

```typescript
interface ValidationState {
  /** 字段验证状态映射 */
  fields: Record<string, {
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    errors: string[];
    dirty: boolean;      // 用户是否已交互过
    touched: boolean;    // 用户是否已失焦过
  }>;
  /** 表单整体验证状态 */
  formStatus: 'idle' | 'validating' | 'valid' | 'invalid';
  /** 是否正在执行异步验证 */
  isValidating: boolean;
  /** 表单提交次数（用于触发 submit 时机的规则） */
  submitCount: number;
}
```

**验证触发策略：**

| 触发时机 | 适用规则类型 | 实现 |
|----------|------------|------|
| `change` | 下拉、单选、开关等选择类 | `@change` 事件直接触发 |
| `blur` | 文本输入、数字输入 | `@blur` 事件触发，首次 blur 标记 touched |
| `submit` | 跨字段验证、异步验证 | 仅 `submitCount > 0` 时生效 |

**自定义验证器注册：**

```typescript
// 注册全局自定义验证器
useFormValidation().registerValidator('unique-username', {
  async: true,
  validator: async (value, { rpcClient }) => {
    const res = await rpcClient.call('services.data.user_service', 'check_username', {
      username: value,
    });
    return res.data.available;
  },
  message: '用户名已被占用',
  debounce: 500,
});

// 在表单中使用
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { custom: 'unique-username' },  // 引用全局验证器
  ],
};
```

### B.2 文件上传分片实现

**分片上传数据流：**

```
用户选择文件
  → 计算文件 MD5（Web Worker 异步计算）
  → 文件切分为 5MB 分片
  → 并发上传（最大并发 3）
  → 每个分片：
       POST / RPC: services.data.file_service.upload_chunk
       parameters: { file_hash, chunk_index, chunk_data (base64), total_chunks }
       → 返回 chunk_id
  → 所有分片上传完成：
       POST / RPC: services.data.file_service.merge_chunks
       parameters: { file_hash, file_name, chunk_ids[], mime_type }
       → 返回 file_id + download_url
```

**断点续传实现：**
- 上传前查询已上传分片列表：`get_uploaded_chunks(file_hash)`
- 仅上传缺失的分片
- 分片上传具有幂等性（同一 file_hash + chunk_index 重复上传不产生副作用）

**上传进度计算：**
```typescript
progress = (uploadedChunks.length / totalChunks) * 100;
// 考虑已存在的分片
progress = ((existingChunks.length + newlyUploadedCount) / totalChunks) * 100;
```

### B.3 自动保存实现细节

**IndexedDB Schema：**

```typescript
// 草稿存储结构
interface FormDraft {
  id: string;                    // 唯一标识
  formId: string;                // 表单类型标识（如 'bug-create'）
  formName: string;              // 表单显示名称
  data: Record<string, any>;     // 表单数据
  validationState?: ValidationState; // 验证状态
  currentStep?: number;          // 向导当前步骤（可选）
  metadata: {
    createdAt: number;           // 创建时间戳
    updatedAt: number;           // 最后更新时间戳
    expiresAt: number;           // 过期时间戳（创建时间 + 30 天）
    fieldCount: number;          // 已填写字段数
    totalFields: number;         // 总字段数
  };
  version: number;               // 草稿版本号（乐观锁）
}
```

**防抖持久化流程：**

```
字段值变更
  → 标记 isDirty = true
  → 清除上一次的防抖计时器
  → 设置新的防抖计时器（2 秒）
  → 2 秒后：
       ├── isDirty === false → 跳过保存
       └── isDirty === true → 序列化表单数据 → IndexedDB.put()
            → 更新保存状态指示器（"已保存 14:30:25"）
            → isDirty = false
```

**草稿恢复对话框逻辑：**

```
页面加载
  → 查询 IndexedDB 中该表单的草稿
  → 无草稿 → 正常初始化
  → 有草稿 → 弹出恢复对话框：
       草稿摘要：字段数 (12/20)、最后保存时间（3 分钟前）、步骤 (2/4)
       选项：
         [恢复草稿] → 填充表单数据 + 恢复验证状态 + 标记所有字段为 dirty
         [放弃草稿] → 删除草稿 → 正常初始化
         [稍后决定] → 关闭对话框，草稿保留
```

### B.4 表单向导实现细节

**步骤定义：**

```typescript
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];              // 该步骤包含的字段
  validationSchema: Record<string, ValidationRule[]>; // 步骤验证规则
  condition?: (formData: Record<string, any>) => boolean; // 条件步骤
  component?: Component;         // 自定义步骤内容组件（可选）
}

interface WizardConfig {
  steps: WizardStep[];
  /** 是否允许跳过可选步骤 */
  allowSkipOptional?: boolean;
  /** 是否在步骤间自动保存 */
  autoSave?: boolean;
  /** 提交前是否显示摘要 */
  showSummary?: boolean;
}
```

**步骤导航状态机：**

```
Step 1 (当前)
  ↓ 验证通过 → Next
Step 2 (当前)
  ↓ 验证通过 → Next
Step 3 [条件步骤: formData.type === 'advanced']
  ├── 条件满足 → 显示步骤 3
  │   ↓ 验证通过 → Next
  └── 条件不满足 → 跳过步骤 3
Step 4 (当前) → Submit
  ↓ 显示摘要确认
  ↓ 用户确认
提交
```

**断点续填流程：**

```
用户关闭向导（浏览器关闭/页面跳转）
  → beforeunload 事件触发
  → 自动保存当前步骤和数据到 IndexedDB
  → 保存 key: wizard-{formId}

用户重新进入向导
  → 检测 IndexedDB 中是否有保存
  → 恢复：跳转到上次所在步骤 + 恢复已填写数据
```

### B.5 条件逻辑引擎实现

**规则数据结构：**

```typescript
interface ConditionalRule {
  id: string;
  name: string;
  priority: number;             // 优先级（越大越优先）
  conditions: ConditionGroup;   // 条件组
  actions: RuleAction[];        // 动作列表
}

interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: Condition[];
  groups?: ConditionGroup[];    // 嵌套条件组
}

interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' 
           | 'greater_than' | 'less_than' | 'between' | 'is_empty' 
           | 'is_not_empty' | 'starts_with' | 'ends_with';
  value: any;
}

interface RuleAction {
  target: string;               // 目标字段
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional' | 'set_value';
  value?: any;                  // set_value 时的值
}
```

**规则引擎执行流程：**

```
表单数据变更
  → 获取所有激活的规则（规则可能依赖的条件改变了）
  → 按优先级降序排序规则
  → 逐规则执行：
       评估条件组（递归评估 AND/OR 嵌套）
       → 条件满足 → 执行 actions
            ├── show → field.visible = true
            ├── hide → field.visible = false（同时可选清除值）
            ├── enable → field.disabled = false
            ├── disable → field.disabled = true
            ├── require → field.required = true
            ├── optional → field.required = false
            └── set_value → field.value = value
  → 高优先级规则优先执行，低优先级规则遇到冲突时被高优先级覆盖
  → 更新字段渲染状态
```

**冲突解决策略：**
- 同一字段的多条规则冲突时，优先级高的生效
- 同一优先级的规则冲突时，最后执行的生效
- 规则执行顺序：按优先级降序排列

### B.6 离线同步实现

**同步队列数据结构：**

```typescript
interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;             // RPC 模块和方法
  parameters: Record<string, any>;
  timestamp: number;            // 操作时间戳
  retryCount: number;
  maxRetries: number;           // 默认 3
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}
```

**同步策略：**

```
网络恢复（online 事件触发）
  → syncQueue.getAll() // 从 IndexedDB 读取所有待同步项
  → 按 timestamp 排序（FIFO）
  → 逐项处理：
       syncItem.status = 'syncing'
       → RPC 调用
       ├── 成功 → 从队列中移除
       ├── 业务错误（4xx）→ status = 'failed'（不重试）
       └── 网络/服务器错误（5xx/超时）
            → retryCount++
            ├── retryCount <= maxRetries → 等待后重试
            └── retryCount > maxRetries → status = 'failed'
  → 所有项处理完毕
  → 更新同步指示器（"同步完成" 或 "X 条同步失败"）
```

**冲突检测与解决：**

```
同步时检测冲突：
  → 发送请求附带本地版本号（localVersion）
  → 服务端检测：
       ├── localVersion === serverVersion → 无冲突，直接更新
       ├── localVersion < serverVersion → 冲突（其他人已更新）
       └── localVersion > serverVersion → 异常（应该不可能）
  → 冲突解决策略（由用户选择）：
       ├── 强制覆盖（使用本地版本）
       ├── 放弃本地（使用服务端版本）
       └── 合并（仅对列表/多值字段可行）
```

### B.7 富文本编辑器安全处理

**XSS 防护管线：**

```
用户输入（富文本）
  → TipTap 编辑器内部处理
  → 提交前客户端净化：
       DOMPurify.sanitize(html, {
         ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3',
                        'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote',
                        'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                        'img', 'span'],
         ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target'],
         ALLOW_DATA_ATTR: false,
       })
  → 发送到后端
  → 服务端二次净化（Python bleach 库）
  → 存储到 MongoDB
  → 渲染时再次净化（防御深度）
```

**Markdown 模式安全：**
- Markdown 输入使用 `marked` 库渲染为 HTML
- 渲染后的 HTML 同样经过 DOMPurify 净化
- 禁止原始 HTML 标签（`marked` 配置 `sanitize: true`）

### B.8 表单字段加密实现细节

**密钥管理：**

```
首次使用加密功能
  → 生成 RSA 密钥对（2048 位）
  → 私钥：使用 AES 加密（密码派生密钥），存储到 IndexedDB
  → 公钥：上传到后端（/user/public-key）
  → 提供私钥导出功能（加密的 JSON 文件，用户保存）

后续使用：
  → 加密：从 IndexedDB 读取公钥 → 用公钥加密字段值 → 发送密文
  → 解密：输入私钥密码 → 解密 IndexedDB 中的私钥 → 用私钥解密密文
```

**字段加密流程：**

```
用户填写敏感字段（如身份证号：110101199001011234）
  → blur 时触发加密
  → 使用公钥加密：RSA-OAEP(publicKey, fieldValue)
  → 显示遮罩：110101********1234
  → 存储加密值到 formData：[ENCRYPTED]base64EncodedCiphertext

用户点击"显示"
  → 弹出密码输入对话框
  → 验证密码 → 解密 IndexedDB 私钥
  → 用私钥解密字段值
  → 显示明文（10 秒后自动遮罩）

提交表单：
  → 加密字段以密文形式提交
  → 后端存储密文（无法解密）
```

---

## 补充：端到端测试场景

### E2E-F1: 复杂表单提交流程

- **GIVEN** 一个包含 20 个字段的表单（含必填、格式验证、异步验证）
- **WHEN** 用户填写所有字段并提交
- **THEN** 提交前所有验证通过，提交后显示成功消息

### E2E-F2: 自动保存与崩溃恢复

- **GIVEN** 用户正在填写表单，已输入 5 个字段
- **WHEN** 浏览器崩溃后重新打开页面
- **THEN** 弹出草稿恢复对话框，显示 5 个已填字段的摘要

### E2E-F3: 文件分片上传

- **GIVEN** 一个 50MB 的文件
- **WHEN** 用户拖拽上传，上传到 40% 时网络中断，恢复后继续
- **THEN** 从断点继续上传，最终上传成功

### E2E-F4: 表单向导条件步骤

- **GIVEN** 一个 4 步向导，其中步骤 3 为条件步骤
- **WHEN** 用户在步骤 2 选择了触发条件步骤的值
- **THEN** 步骤 3 显示；若用户返回修改步骤 2 取消条件，步骤 3 隐藏

### E2E-F5: 离线表单提交

- **GIVEN** 用户在离线状态下填写并提交表单
- **WHEN** 网络恢复
- **THEN** 表单自动同步到服务器，显示"同步完成"

### E2E-F6: 字段级权限控制

- **GIVEN** 表单有 10 个字段，当前用户仅有 7 个字段的编辑权限
- **WHEN** 用户打开表单
- **THEN** 3 个无权限字段显示为灰色只读状态

### E2E-F7: 条件逻辑

- **GIVEN** 表单配置了规则："当状态=已完成时，完成日期变为必填"
- **WHEN** 用户将状态改为"已完成"
- **THEN** 完成日期字段显示必填星号，提交时验证生效

### E2E-F8: 批量输入

- **GIVEN** 用户从 Excel 复制了 10 行数据
- **WHEN** 用户粘贴到批量输入区域，完成列映射
- **THEN** 预览显示 10 行数据，验证通过的行可批量提交

---

## 补充：表单性能优化

### 大表单（50+ 字段）性能策略

| 策略 | 说明 | 效果 |
|------|------|------|
| 字段级懒验证 | 仅验证用户已交互的字段（touched） | 减少提交前不必要的验证计算 |
| 虚拟化字段列表 | 仅渲染可视区域内的字段（表单向导自动解决） | 减少初始 DOM 节点 |
| 异步验证防抖 | 至少 500ms 防抖 | 减少服务器请求 |
| 条件字段延迟渲染 | 条件不满足的字段不渲染 DOM | 减少初始渲染时间 |
| 大文件 Web Worker 处理 | MD5 计算、压缩在 Worker 中执行 | 不阻塞主线程 |
| TipTap 延迟初始化 | 仅当用户切到富文本字段时才初始化编辑器 | 减少初始 JS 执行时间 |

### 表单内存管理

- IndexedDB 草稿最大存储 50MB（监控 `navigator.storage.estimate()`）
- 超过限制时提示用户清理旧草稿
- 草稿自动过期（30 天）
- 页面卸载时清理临时数据

---

## 补充：无障碍（Accessibility）要求

| 组件 | WCAG 要求 | 实现方式 |
|------|----------|---------|
| 表单字段 | `<label>` 关联 `<input>` | `for` + `id` 属性绑定 |
| 必填字段 | 视觉标识 + `aria-required="true"` | 星号 + aria 属性 |
| 验证错误 | `aria-describedby` 关联错误消息 | 动态设置 `aria-describedby` |
| 验证错误汇总 | `role="alert"` 实时播报 | 提交时设置 |
| 表单向导 | `aria-current="step"` | 动态设置当前步骤 |
| 文件上传 | 支持键盘操作（Space/Enter） | 拖拽区域可聚焦 |
| 签名板 | 提供替代输入方式 | 支持键盘绘制或文本替代 |
| 加载状态 | `aria-busy="true"` | 动态切换 |
| 离线指示器 | `role="status"` 播报状态变化 | 网络状态变化时更新 |
| 富文本编辑器 | 工具栏支持键盘导航 | TipTap 默认支持 |

---

## 补充：表单数据流与状态管理

### 表单整体数据流

```
表单初始化
  → 加载表单定义（字段列表、验证规则、条件逻辑、权限配置）
  → 检测草稿（IndexedDB）
  ├── 有草稿 → 弹出恢复对话框 → 恢复/放弃
  └── 无草稿 → 设置默认值

表单编辑
  → 字段值变更
      ├── 更新 formData
      ├── 触发自动保存（防抖 2s → IndexedDB）
      ├── 判断字段依赖（级联更新）
      ├── 判断条件逻辑（显示/隐藏/禁用/必填）
      ├── 触发字段验证（按 trigger 时机）
      ├── 更新字段计算（依赖字段的自动计算）
      ├── 同步协作状态（WebSocket 广播变更）
      └── 多标签同步（BroadcastChannel 广播）

表单提交
  → 触发全量验证
  ├── 验证失败 → 滚动到第一个错误
  └── 验证通过 → 提交管线：
        ├── 加密敏感字段（客户端加密）
        ├── 上传待上传文件
        ├── 调用后端 RPC
        ├── 监听提交进度
        ├── 处理提交结果
        │   ├── 成功 → 清除草稿 → 成功消息 → 导航/重置
        │   └── 失败 → 重试/显示错误 → 保留草稿
        └── 加入离线队列（离线时）
```

### 跨标签同步（BroadcastChannel）

```typescript
// 同一表单在多个浏览器标签页中打开时的数据同步
const channel = new BroadcastChannel(`form-${formId}`);

// 监听其他标签页的变更
channel.onmessage = (event) => {
  const { type, field, value, tabId } = event.data;
  if (tabId === currentTabId) return; // 忽略自己发出的消息
  
  switch (type) {
    case 'FIELD_CHANGE':
      // 同步字段值到当前标签页
      formData.value[field] = value;
      break;
    case 'DRAFT_SAVED':
      // 其他标签页保存了草稿，更新草稿元数据
      refreshDraftMetadata();
      break;
    case 'FORM_SUBMITTED':
      // 其他标签页提交了表单
      showNotification('表单已在另一个标签页中提交');
      break;
    case 'TAB_CLOSED':
      // 协作编辑者离开了
      removeCollaborator(tabId);
      break;
  }
};

// 广播字段变更
function broadcastFieldChange(field: string, value: any) {
  channel.postMessage({
    type: 'FIELD_CHANGE',
    field,
    value,
    tabId: currentTabId,
    timestamp: Date.now(),
  });
}
```

### 表单状态机

```
表单生命周期状态：
  IDLE → EDITING → VALIDATING → SUBMITTING → SUCCESS / ERROR
  
  状态转换：
  IDLE → EDITING         : 用户开始输入
  EDITING → VALIDATING    : 字段失焦 / 表单提交
  VALIDATING → EDITING    : 验证完成，有错误
  VALIDATING → SUBMITTING : 验证通过，提交
  SUBMITTING → SUCCESS    : 提交成功
  SUBMITTING → ERROR      : 提交失败（网络/业务错误）
  ERROR → EDITING         : 用户修改后重新编辑
  SUCCESS → IDLE          : 重置表单 / 创建新表单
  
  草稿状态（独立于编辑状态）：
  CLEAN → DIRTY → SAVING → SAVED
  SAVED → DIRTY（用户继续编辑导致再次变脏）
```

---

## 补充：表单安全性

### 输入安全防护

| 防护层 | 措施 | 位置 |
|--------|------|------|
| 前端验证 | 字段类型、格式、长度验证 | `useFormValidation` |
| 前端净化 | 富文本 DOMPurify 净化 | `RichTextEditor` 提交前 |
| 传输安全 | HTTPS + RPC 信封 | `RequestHttp` 拦截器 |
| 后端验证 | 二次校验所有字段 | yiAi FastAPI 路由 |
| 后端净化 | Python bleach 库 HTML 净化 | 存储前 |
| 输出编码 | 模板引擎自动转义 | 前端 Vue 默认转义 |

### CSRF 防护

- YiVad SPA 使用 Token 认证（`X-Token` 头部）
- 浏览器自动携带的 Cookie 不用于认证
- API 请求需要显式设置 `X-Token` 头部

### 敏感数据处理

| 数据分级 | 处理方式 | 示例 |
|----------|---------|------|
| 公开 | 正常存储和传输 | 用户昵称 |
| 内部 | 需登录查看 | 项目名称、任务详情 |
| 敏感 | 加密存储 + 传输加密 + 遮罩显示 | 身份证号、银行卡号 |
| 机密 | 客户端加密（E2EE）+ 不存储到服务端日志 | 密码、API 密钥 |

### 文件上传安全

- 文件类型白名单（MIME + 扩展名双重校验）
- 文件大小限制（前端 + 后端）
- 文件内容扫描（后端 ClamAV 病毒扫描，可选）
- 文件名净化（去除特殊字符、路径遍历字符）
- 上传频率限制（防止 DoS）

---

## 补充：单元测试用例

### UT-F01: useFormValidation

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 必填验证 | `rules={name:'required'}`, 值为空 | 错误信息"必填" |
| 2 | 最小长度 | `rules={name:'minLength:3'}`, 值='ab' | 错误信息含"至少3个字符" |
| 3 | 正则验证 | `rules={email:'regex:/@/'}`, 值='abc' | 错误信息含"格式不正确" |
| 4 | 多规则链式 | `rules={pwd:'required|minLength:6|maxLength:20'}` | 依次验证，返回首个失败规则 |
| 5 | 异步验证 | `rules={user:'unique'}`, 调用 API 检查 | loading 状态为 true，API 返回后更新 |
| 6 | 跨字段验证 | 密码确认 `rules={confirm:'same:password'}` | 与 password 字段值不匹配时报错 |
| 7 | 动态规则 | 条件切换后规则变更 | 重新验证，旧错误清除 |
| 8 | 自定义验证器 | `validator: (v) => v > 0 || '需大于0'` | 返回自定义错误信息 |

### UT-F02: useAutoSave

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 定时自动保存 | 表单值变化，等待 debounce 时间 | localStorage 存储草稿 |
| 2 | 防抖合并 | 连续修改 5 次 | 只触发 1 次保存（debounce） |
| 3 | 草稿恢复提示 | 存在草稿，重新进入表单 | 提示"检测到未保存的草稿" |
| 4 | 放弃草稿 | 用户选择放弃 | localStorage 清除草稿 |
| 5 | 提交成功后清除 | 表单提交成功 | 自动清除对应草稿 |
| 6 | 多表单草稿隔离 | 表单 A 和表单 B 独立 | 各自的草稿互不影响 |

### UT-F03: useFormWizard

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 步骤切换 | 步骤1验证通过 → 点击下一步 | currentStep 变为 2 |
| 2 | 步骤验证阻断 | 步骤1验证失败 → 点击下一步 | 停留在步骤1，显示错误 |
| 3 | 条件步骤 | 字段值=A → 跳至步骤3（跳过步骤2） | 步骤2被跳过不可见 |
| 4 | 步骤摘要 | 完成所有步骤 | 摘要显示每步填写的数据 |
| 5 | 断点续填 | 在第2步刷新页面 | 恢复到第2步，之前数据已保存 |

### UT-F04: useConditionalLogic

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 显示/隐藏 | 类型='个人' → 显示身份证字段 | 身份证字段 visible=true |
| 2 | 必填切换 | 类型='企业' → 税号字段必填 | 税号字段 required=true |
| 3 | 选项联动 | 省份=浙江 → 城市选项过滤 | 城市下拉仅显示浙江省城市 |
| 4 | 多条件 AND | A=1 AND B=2 → 显示字段 C | C 字段仅在同时满足时显示 |
| 5 | 多条件 OR | A=1 OR B=2 → 显示字段 C | C 字段在任一条件满足时显示 |

### UT-F05: useFormPersistence

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | localStorage 持久化 | 表单输入 → 失焦 | 数据保存到 localStorage |
| 2 | sessionStorage 持久化 | 配置使用 sessionStorage | 关闭标签后数据清除 |
| 3 | IndexedDB 持久化 | 大数据量（>5MB） | 自动切换到 IndexedDB |
| 4 | 存储配额检测 | localStorage 写入失败 | 降级到内存存储 |
| 5 | 崩溃恢复 | 页面崩溃后重新打开 | 恢复到最后一次持久化的数据 |

---

## 补充：集成测试场景

### IT-F01: 表单向导 + 条件逻辑 + 自动保存

- **GIVEN** 3 步向导表单，步骤2根据步骤1的选择条件显示
- **WHEN** 用户在第1步选择"企业用户" → 第2步显示税号和营业执照字段 → 填写一半 → 关闭浏览器
- **THEN** 重新打开后恢复草稿，停留在第2步，已填写字段数据保留，条件逻辑正确执行

### IT-F02: 文件上传 + 表单提交 + 进度追踪

- **GIVEN** 表单包含文件上传和普通字段
- **WHEN** 用户选择 50MB 文件 → 填写表单 → 提交
- **THEN** 文件分片上传显示进度 → 表单验证 → 全部通过后一起提交 → 失败重试

---

## 补充：实例演示页面

### Demo-F01: 表单验证规则展示

**目的**：集中展示所有验证规则和验证消息样式。

**布局**：左侧规则分类导航，右侧对应表单区域。

**展示内容**：
- 必填/选填字段标识差异
- 同步验证（输入即校验，红色边框+错误文案）
- 异步验证（loading 状态 → 成功/失败图标）
- 跨字段验证（密码确认、日期范围）
- 条件必填（根据其他字段值切换是否必填）

### Demo-F02: 表单向导 + 条件逻辑演示

**目的**：展示复杂动态表单的构建能力。

**场景**：用户注册向导（3 步）。
- 步骤1：账号类型（个人/企业）→ 影响步骤2的字段
- 步骤2：详细信息（个人：身份证；企业：营业执照+税号）
- 步骤3：确认摘要（只读展示所有填写内容，支持返回修改）

