<template>
  <div class="showcase-page">
    <el-page-header @back="$router.back()" title="Showcase" content="Forms" />

    <el-alert type="info" :closable="false" show-icon class="sc-alert"
      title="Form components in src/components/Form/. All forms use Element Plus validation under the hood." />

    <!-- ProForm -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="primary">ProForm</el-tag> Config-driven form builder</h3></template>
      <p class="sc-desc">Define forms declaratively with column configs. Supports all Element Plus input types, validation rules, and layout options.</p>
      <el-form :model="proFormData" label-width="100px" label-suffix=":">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Project Name" required>
              <el-input v-model="proFormData.name" placeholder="Enter project name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Type">
              <el-select v-model="proFormData.type" placeholder="Select type" style="width:100%">
                <el-option label="Web Application" value="web" />
                <el-option label="Mobile App" value="mobile" />
                <el-option label="Backend Service" value="backend" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Start Date">
              <el-date-picker v-model="proFormData.startDate" type="date" placeholder="Pick a date" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Priority">
              <el-radio-group v-model="proFormData.priority">
                <el-radio value="high">High</el-radio>
                <el-radio value="medium">Medium</el-radio>
                <el-radio value="low">Low</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Description">
              <el-input v-model="proFormData.description" type="textarea" :rows="3" placeholder="Project description" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Tags">
              <el-checkbox-group v-model="proFormData.tags">
                <el-checkbox value="urgent" label="Urgent" />
                <el-checkbox value="review" label="Needs Review" />
                <el-checkbox value="blocked" label="Blocked" />
                <el-checkbox value="external" label="External" />
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="sc-desc" style="margin-top:8px">
        <el-tag size="small" type="info">Form data: {{ JSON.stringify(proFormData) }}</el-tag>
      </div>
    </el-card>

    <!-- Dynamic form fields -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="success">Dynamic Fields</el-tag> Add/remove form fields</h3></template>
      <p class="sc-desc">Dynamically add and remove form fields. Common pattern for multi-value inputs like team members, URLs, or tags.</p>
      <el-form label-width="100px">
        <el-form-item v-for="(field, idx) in dynamicFields" :key="idx" :label="'Member ' + (idx + 1)">
          <el-input v-model="field.value" placeholder="Enter name or email" style="width:300px" />
          <el-button v-if="dynamicFields.length > 1" type="danger" :icon="Delete" circle size="small" style="margin-left:8px" @click="dynamicFields.splice(idx, 1)" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="CirclePlus" @click="dynamicFields.push({ value: '' })">Add Member</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Validation -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="warning">Form Validation</el-tag> Built-in Element Plus rules</h3></template>
      <p class="sc-desc">Standard Element Plus form validation with async validators. Try submitting with empty fields to see errors.</p>
      <el-form ref="validateFormRef" :model="validateForm" :rules="validateRules" label-width="120px">
        <el-form-item label="Email" prop="email">
          <el-input v-model="validateForm.email" placeholder="user@example.com" style="width:320px" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="validateForm.password" type="password" placeholder="Min 6 characters" style="width:320px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleValidate">Validate</el-button>
          <el-button @click="validateFormRef?.resetFields()">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Conditional fields -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="danger">Conditional Fields</el-tag> Show/hide based on selection</h3></template>
      <p class="sc-desc">Fields that appear or disappear based on other field values. Common in wizards and complex configurations.</p>
      <el-form label-width="120px">
        <el-form-item label="Notification">
          <el-switch v-model="condNotify" active-text="Enabled" inactive-text="Disabled" />
        </el-form-item>
        <el-form-item v-if="condNotify" label="Channel">
          <el-select v-model="condChannel" placeholder="Select channel" style="width:200px">
            <el-option label="Email" value="email" />
            <el-option label="Slack" value="slack" />
            <el-option label="WeChat" value="wechat" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="condNotify && condChannel === 'email'" label="Email Address">
          <el-input v-model="condEmail" placeholder="user@example.com" style="width:280px" />
        </el-form-item>
        <el-form-item v-if="condNotify && condChannel === 'slack'" label="Webhook URL">
          <el-input v-model="condWebhook" placeholder="https://hooks.slack.com/..." style="width:360px" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="formsShowcase">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Delete, CirclePlus } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";

const proFormData = reactive({
  name: "",
  type: "",
  startDate: "",
  priority: "medium",
  description: "",
  tags: [] as string[],
});

const dynamicFields = ref([{ value: "" }, { value: "" }]);

const validateFormRef = ref<FormInstance>();
const validateForm = reactive({ email: "", password: "" });
const validateRules: FormRules = {
  email: [
    { required: true, message: "Email is required", trigger: "blur" },
    { type: "email", message: "Invalid email format", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Password is required", trigger: "blur" },
    { min: 6, message: "At least 6 characters", trigger: "blur" },
  ],
};

async function handleValidate() {
  if (!validateFormRef.value) return;
  const valid = await validateFormRef.value.validate().catch(() => false);
  ElMessage[valid ? "success" : "error"](valid ? "Validation passed" : "Fix errors and try again");
}

const condNotify = ref(false);
const condChannel = ref("email");
const condEmail = ref("");
const condWebhook = ref("");
</script>

<style scoped lang="scss">
@use "./showcase.scss";
</style>