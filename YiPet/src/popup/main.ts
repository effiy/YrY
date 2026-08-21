/**
 * YiPet Popup — Vue entry point.
 * Initializes locale/timezone, then mounts the Vue app.
 */
import '@/shared/globals';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import { applyLocale, resolveLocale } from '@/shared/i18n/locale';
import App from './App.vue';
import './index.css';

async function bootstrap() {
  const app = createApp(App);
  app.use(createPinia());
  app.use(ElementPlus);

  const rootEl = document.getElementById('app');
  if (!rootEl) {
    console.error('[YiPet Popup] #app mount point not found');
    return;
  }

  try {
    const { locale } = await resolveLocale();
    await applyLocale(locale);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[YiPet Popup] applyLocale failed:', msg);
  }

  app.mount(rootEl);
}

bootstrap();