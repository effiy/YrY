<template>
  <div class="login">
    <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form" size="large" @keyup.enter="login">
      <h2 class="login-form__title">{{ $t("login.title") }}</h2>
      <p class="login-form__subtitle">{{ $t("login.subtitle") }}</p>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" :placeholder="$t('login.usernamePlaceholder')" :prefix-icon="User" autocomplete="username" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" :placeholder="$t('login.passwordPlaceholder')" show-password :prefix-icon="Lock" autocomplete="current-password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="login-form__btn" :loading="loading" @click="login">
          {{ loading ? $t("login.loggingIn") : $t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="login">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { loginApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { HOME_URL } from "@/config";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: ""
});

const rules: FormRules = {
  username: [{ required: true, message: () => t("login.usernameRequired"), trigger: "blur" }],
  password: [{ required: true, message: () => t("login.passwordRequired"), trigger: "blur" }]
};

async function login() {
  const valid = await loginFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const { data } = await loginApi(loginForm);
    userStore.setToken(data.access_token);
    userStore.setUserInfo({ name: data.username });
    ElMessage.success(t("login.loginSuccess"));
    router.push(HOME_URL);
  } catch {
    ElMessage.error(t("login.loginFailed"));
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
    padding: 40px 32px;
    background: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
    &__title {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--el-color-primary);
      text-align: center;
      letter-spacing: 2px;
    }
    &__subtitle {
      margin: 8px 0 32px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }
    &__btn {
      width: 100%;
    }
  }
}
</style>
