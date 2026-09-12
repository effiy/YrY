---
doc_type: test
title: "系统管理模块 — RBAC 权限管理面板 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-06"
source_prds: ["06-prd-系统管理模块"]
source_modules: []
---
# 系统管理模块 — RBAC 权限管理面板 — 测试规格

> 来源 PRD：[06-prd-系统管理模块.md](../../prds/2026-08/06-prd-系统管理模块.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 6.1 角色管理

**TC-ROLE-01: 新建角色**
- GIVEN 用户具有 `role:manage` 权限
- WHEN 点击"新建角色"按钮，填写角色名称、标识、描述，勾选权限，点击"确定"
- THEN 角色列表刷新，新角色出现在列表中，权限配置正确

**TC-ROLE-02: 编辑角色（标识不可修改）**
- GIVEN 角色 "editor" 存在于列表中
- WHEN 点击"编辑"，尝试修改角色标识字段
- THEN 角色标识输入框为禁用状态，无法修改

**TC-ROLE-03: 角色标识格式校验**
- GIVEN 新建角色弹窗已打开
- WHEN 输入非法标识 "123admin" 或 "Admin" 或 "admin-role"
- THEN 表单校验失败，提示"角色标识需为小写字母、数字、下划线，以字母开头"

**TC-ROLE-04: 删除有用户关联的角色**
- GIVEN 角色 "admin" 有 3 个关联用户
- WHEN 点击"删除"
- THEN 弹出警告"角色「admin」下还有 3 个关联用户，无法删除"，角色未被删除

**TC-ROLE-05: 删除无用户关联的角色**
- GIVEN 角色 "viewer" 无关联用户
- WHEN 点击"删除"，确认删除对话框
- THEN 角色被成功删除，列表刷新

**TC-ROLE-06: 权限矩阵全选/取消全选**
- GIVEN 新建角色弹窗已打开
- WHEN 点击"全选"
- THEN 所有 17 个权限码被勾选
- WHEN 点击"取消全选"
- THEN 所有权限码被取消勾选

### 6.2 用户管理

**TC-USER-01: 启用/禁用用户**
- GIVEN 用户列表中某用户状态为"启用"
- WHEN 点击状态开关
- THEN API 调用 `changeUserStatus({ id, status: 0 })`，列表刷新后状态变为"禁用"

**TC-USER-02: 分配角色**
- GIVEN 用户 "zhangsan" 当前角色为 `["engineer"]`
- WHEN 点击"分配角色"，勾选 "admin" 和 "producter"，点击"确定"
- THEN API 调用 `editUser({ key, roles: ["admin", "producter"] })`，列表刷新后角色标签更新

**TC-USER-03: 删除用户确认**
- GIVEN 用户列表中有用户 "testuser"
- WHEN 点击"删除"，在确认对话框中点击"确定"
- THEN API 调用 `deleteUser({ id: [key] })`，用户从列表中移除

**TC-USER-04: 批量删除**
- GIVEN 用户列表中有 3 个用户被选中
- WHEN 点击"批量删除"，在确认对话框中点击"确定"
- THEN 3 次 `deleteUser` API 调用，列表刷新

### 6.3 菜单管理

**TC-MENU-01: 树形表格渲染**
- GIVEN 用户具有菜单管理权限
- WHEN 进入菜单管理页面
- THEN 菜单以树形结构展示，子菜单缩进显示，顶级菜单标记为 "Top Level"

**TC-MENU-02: 新增菜单**
- GIVEN 菜单管理页面已打开
- WHEN 点击 "Add Menu"，填写必填字段（title/path/name/component），点击 "Save"
- THEN API 调用 `createMenu`，成功后侧边栏菜单刷新

**TC-MENU-03: 编辑菜单**
- GIVEN 菜单树中存在某菜单项
- WHEN 点击编辑按钮，修改 title，点击 "Save"
- THEN API 调用 `updateMenu`，成功后侧边栏菜单刷新

**TC-MENU-04: 删除有子菜单的菜单**
- GIVEN 菜单项有 2 个子菜单
- WHEN 点击删除按钮
- THEN 弹出警告对话框，提示子菜单将成为顶级菜单

**TC-MENU-05: 键盘快捷键**
- GIVEN 菜单管理页面已打开，无弹窗/下拉打开
- WHEN 按 `?` 键
- THEN 显示快捷键帮助
- WHEN 按 `/` 键
- THEN 搜索框获得焦点
- WHEN 按 `n` 键
- THEN 打开新增菜单弹窗

### 6.4 审计日志

**TC-LOG-01: 操作类型筛选**
- GIVEN 审计日志页面已打开
- WHEN 在操作类型下拉中选择 "创建"
- THEN 列表仅显示 `action === "create"` 的日志

**TC-LOG-02: 时间范围筛选**
- GIVEN 审计日志页面已打开
- WHEN 选择时间范围 "2026-08-01 至 2026-08-31"
- THEN API 请求参数包含 `startTime` 和 `endTime`

**TC-LOG-03: 查看变更详情**
- GIVEN 某条日志有变更记录
- WHEN 点击"查看变更"
- THEN 弹窗以 `el-descriptions` 展示变更字段的 JSON 内容

**TC-LOG-04: 操作类型颜色映射**
- GIVEN 审计日志列表包含不同类型的操作
- WHEN 查看列表
- THEN create=绿色, update=蓝色, delete=红色, login/logout=灰色, export=橙色

---

