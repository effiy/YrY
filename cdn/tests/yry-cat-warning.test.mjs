/**
 * YryCatWarning — 分类告警组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-cat-warning', 'yry-cat-warning-tpl');

const YryCatWarning = defineComponent({
  name: 'YryCatWarning',
  props: {
    tone: { type: String, default: 'warn' },
    icon: { type: String, default: '' },
    content: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryCatWarning — 渲染', () => {
  it('默认 tone=warn', () => {
    const w = mount(YryCatWarning, { props: {} });
    expect(w.vm.tone).toBe('warn');
  });

  it('render icon', () => {
    const w = mount(YryCatWarning, { props: { icon: '⚠️' } });
    expect(w.html()).toContain('⚠️');
  });

  it('content 通过 v-html 渲染', () => {
    const w = mount(YryCatWarning, {
      props: { content: '<strong>警告内容</strong>' }
    });
    expect(w.html()).toContain('<strong>警告内容</strong>');
  });

  it('tone=error 渲染错误样式', () => {
    const w = mount(YryCatWarning, {
      props: { tone: 'error', content: 'x' }
    });
    expect(w.vm.tone).toBe('error');
    expect(w.html()).toContain('error');
  });

  it('tone=info 渲染信息样式', () => {
    const w = mount(YryCatWarning, {
      props: { tone: 'info', content: 'x' }
    });
    expect(w.html()).toContain('info');
  });
});
