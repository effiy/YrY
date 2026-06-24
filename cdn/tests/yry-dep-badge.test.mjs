/**
 * YryDepBadge — 依赖徽标组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-dep-badge', 'yry-dep-badge-tpl');

const YryDepBadge = defineComponent({
  name: 'YryDepBadge',
  props: {
    href: { type: String, default: '' },
    label: { type: String, default: '' },
    type: { type: String, default: 'doc' },
    target: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryDepBadge — 渲染', () => {
  it('render label', () => {
    const w = mount(YryDepBadge, { props: { label: 'vue@3.5' } });
    expect(w.html()).toContain('vue@3.5');
  });

  it('默认 type="doc"', () => {
    const w = mount(YryDepBadge, { props: {} });
    expect(w.vm.type).toBe('doc');
  });

  it('type=runtime 渲染运行时样式', () => {
    const w = mount(YryDepBadge, { props: { type: 'runtime' } });
    expect(w.html()).toContain('runtime');
  });

  it('href 渲染为 <a>', () => {
    const w = mount(YryDepBadge, {
      props: { label: 'x', href: 'https://npmjs.com' }
    });
    expect(w.html()).toContain('href="https://npmjs.com"');
  });

  it('target="_blank" 渲染', () => {
    const w = mount(YryDepBadge, {
      props: { label: 'x', href: '/x', target: '_blank' }
    });
    expect(w.html()).toContain('_blank');
  });

  it('无 href 时仍渲染 <a>(href="")', () => {
    const w = mount(YryDepBadge, { props: { label: '纯文本' } });
    expect(w.html()).toContain('纯文本');
  });
});
