/**
 * YryFooterNote — 页脚组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-footer-note', 'yry-footer-note-tpl');

const YryFooterNote = defineComponent({
  name: 'YryFooterNote',
  props: {
    version: { type: String, default: '5.4.0' }
  },
  template: TEMPLATE
});

describe('YryFooterNote — 渲染', () => {
  it('默认 version 为 "5.4.0"', () => {
    const w = mount(YryFooterNote, { props: {} });
    expect(w.vm.version).toBe('5.4.0');
    expect(w.html()).toContain('5.4.0');
  });

  it('自定义 version', () => {
    const w = mount(YryFooterNote, { props: { version: '6.0.0' } });
    expect(w.html()).toContain('6.0.0');
  });

  it('空 version 也能渲染', () => {
    const w = mount(YryFooterNote, { props: { version: '' } });
    expect(w.html()).toBeDefined();
  });
});
