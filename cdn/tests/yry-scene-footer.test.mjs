/**
 * YrySceneFooter — 场景页脚组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-footer', 'yry-scene-footer-tpl');

const YrySceneFooter = defineComponent({
  name: 'YrySceneFooter',
  props: {
    version: { type: String, default: '' },
    date: { type: String, default: '' },
    docsLink: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YrySceneFooter — 渲染', () => {
  it('render version + date', () => {
    const w = mount(YrySceneFooter, {
      props: { version: '5.4.0', date: '2026-06-22' }
    });
    expect(w.html()).toContain('5.4.0');
    expect(w.html()).toContain('2026-06-22');
  });

  it('docsLink 渲染为链接', () => {
    const w = mount(YrySceneFooter, {
      props: { docsLink: 'https://docs.example.com' }
    });
    expect(w.html()).toContain('https://docs.example.com');
  });

  it('所有 prop 默认空字符串', () => {
    const w = mount(YrySceneFooter, { props: {} });
    expect(w.vm.version).toBe('');
    expect(w.vm.date).toBe('');
    expect(w.vm.docsLink).toBe('');
  });
});
