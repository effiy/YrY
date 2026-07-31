<template>
  <div class="login">
    <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form" size="large" @keyup.enter="login">
      <h2 class="login-form__title">YiVad</h2>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="Username" :prefix-icon="User" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="Password" show-password :prefix-icon="Lock" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="login-form__btn" :loading="loading" @click="login">
          {{ loading ? "Logging in..." : "Login" }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="login">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { loginApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { HOME_URL } from "@/config";

const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: ""
});

const rules: FormRules = {
  username: [{ required: true, message: "Please enter username", trigger: "blur" }],
  password: [{ required: true, message: "Please enter password", trigger: "blur" }]
};

async function login() {
  const valid = await loginFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const { data } = await loginApi(loginForm);
    userStore.setToken(data.access_token);
    userStore.setUserInfo({ name: data.username });
    ElMessage.success("Welcome back!");
    router.push(HOME_URL);
  } catch {
    ElMessage.error("Login failed. Check your credentials.");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--el-bg-color-page);

  &-form {
    width: 380px;
    padding: 36px 32px;
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 6%);

    &__title {
      margin: 0 0 32px;
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      color: var(--el-color-primary);
      letter-spacing: 2px;
    }

    &__btn {
      width: 100%;
    }
  }
}
</style>
