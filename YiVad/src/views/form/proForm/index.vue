<template>
  <div class="card content-box">
    <el-alert
      title="Using component :is and v-bind prop forwarding, all template HTML can be converted into columns configuration. See code for details."
      type="warning"
      :closable="false"
    />
    <el-form v-bind="(options.form as any)" ref="proFormRef" :model="model">
      <template v-for="item in options.columns" :key="item.formItem.prop">
        <el-form-item v-bind="item.formItem">
          <component :is="componentMap[item.attrs.typeName] ?? ElInput" v-bind="item.attrs" v-model="model[item.formItem.prop]" />
        </el-form-item>
      </template>
      <el-form-item>
        <slot name="operation"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="proForm">
import { ref } from "vue";
import { ElForm, ElFormItem, ElInput, ElSelect, ElDatePicker, ElCascader, ElInputNumber, ElSwitch, ElRadio, ElCheckbox } from "element-plus";

// Map `attrs.typeName` (string from column config) to the actual EP component.
// unplugin-vue-components only auto-imports statically-detectable tags, so a
// dynamic `<component :is="`el-${typeName}`">` evades its scan.
const componentMap: Record<string, any> = {
  input: ElInput,
  select: ElSelect,
  "date-picker": ElDatePicker,
  cascader: ElCascader,
  "input-number": ElInputNumber,
  switch: ElSwitch,
  radio: ElRadio,
  checkbox: ElCheckbox
};

let model = ref<any>({});

const options = ref({
  // Form-level config
  form: {
    inline: false,
    labelPosition: "right",
    labelWidth: "80px",
    size: "default",
    disabled: false,
    labelSuffix: " :"
  },
  // Form column config (formItem for item config, attrs for input/select config)
  columns: [
    {
      formItem: {
        label: "Username",
        prop: "username",
        labelWidth: "80px",
        required: true
      },
      attrs: {
        typeName: "input",
        clearable: true,
        placeholder: "Please enter username",
        disabled: true
      }
    },
    {
      formItem: {
        label: "Password",
        prop: "password",
        class: "data"
      },
      attrs: {
        typeName: "input",
        clearable: true,
        autofocus: true,
        placeholder: "Please enter password",
        type: "password"
      }
    },
    {
      formItem: {
        label: "Email",
        prop: "email"
      },
      attrs: {
        typeName: "input",
        placeholder: "Please enter email",
        clearable: true,
        style: "width:500px"
      }
    }
  ]
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
