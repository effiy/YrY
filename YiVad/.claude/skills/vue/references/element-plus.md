# Element Plus — UI Patterns

> Element Plus 2.7 conventions for YiVad. Covers table, form, dialog,
> icon registration, theme override, and the notification APIs.

## Component registration

Element Plus components should be on-demand registered (tree-shakeable):

```ts
// ✅ On-demand: vite.config.ts with unplugin-element-plus
import ElementPlus from 'unplugin-element-plus/vite'
// Or manual import per-component: import { ElButton } from 'element-plus'
```

## Table patterns (`ElTable`)

### Basic table

```vue
<el-table :data="tableData" stripe border style="width: 100%">
  <el-table-column prop="id" label="ID" width="80" />
  <el-table-column prop="name" label="Name" />
  <el-table-column label="Actions" width="200" fixed="right">
    <template #default="{ row }">
      <el-button link type="primary" @click="handleEdit(row)">Edit</el-button>
      <el-button link type="danger" @click="handleDelete(row.id)">Delete</el-button>
    </template>
  </el-table-column>
</el-table>
```

### YiVad ProTable pattern

ProTable (`src/components/ProTable/`) is YiVad's canonical table component.
It wraps `ElTable` with pagination, column settings, search form, and
selection. New table pages **must** use ProTable.

```vue
<ProTable
  ref="proTableRef"
  :columns="columns"
  :request-api="getTableList"
  :data-callback="dataCallback"
  :pagination="true"
  :search-col="{ xs: 1, sm: 2, md: 3, lg: 4 }"
>
  <template #tableHeader>
    <el-button type="primary" @click="handleAdd">Add</el-button>
  </template>
  <template #operation="{ row }">
    <el-button link type="primary" @click="handleEdit(row)">Edit</el-button>
  </template>
</ProTable>
```

## Form patterns (`ElForm`)

```vue
<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
  <el-form-item label="Name" prop="name">
    <el-input v-model="form.name" placeholder="Enter name" />
  </el-form-item>
  <el-form-item label="Type" prop="type">
    <el-select v-model="form.type" placeholder="Select type">
      <el-option
        v-for="item in typeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </el-form-item>
</el-form>
```

### Form validation pattern

```ts
const formRef = ref<FormInstance>()

const submit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    // valid — proceed
  } catch {
    // invalid — ElForm scrolls to first error automatically
  }
}
```

## Dialog patterns (`ElDialog`)

```vue
<el-dialog
  v-model="dialogVisible"
  :title="isEdit ? 'Edit' : 'Add'"
  width="600px"
  :close-on-click-modal="false"
  @opened="handleOpened"
  @close="handleClose"
>
  <!-- form content -->
  <template #footer>
    <el-button @click="dialogVisible = false">Cancel</el-button>
    <el-button type="primary" :loading="submitting" @click="submit">Confirm</el-button>
  </template>
</el-dialog>
```

## Icon registration

```ts
// ✅ Global registration (main.ts)
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Usage: <el-icon><Edit /></el-icon>
```

## Theme override

YiVad overrides Element Plus CSS variables in `src/styles/`. Key variables:

```scss
// Element Plus SCSS variables (before importing element-plus)
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': ('base': #409eff),
  ),
);
```

Or via CSS variables at runtime:

```scss
:root {
  --el-color-primary: #409eff;
  --el-color-primary-light-3: #79bbff;
  // ...
}
```

## Message / Notification API

```ts
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

// Toast
ElMessage.success('Operation succeeded')
ElMessage.error('Operation failed')

// Confirm dialog
await ElMessageBox.confirm('Are you sure?', 'Warning', {
  type: 'warning',
})

// Notification (top-right by default)
ElNotification({
  title: 'Success',
  message: 'Data saved successfully',
  type: 'success',
})
```

**Note**: In route guards, call `ElMessage` etc. directly (outside component
setup). They work without an active component instance.
