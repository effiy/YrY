/**
 * YryBreadcrumb — 面包屑导航组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-breadcrumb', 'yry-breadcrumb-tpl');

const YryBreadcrumb = defineComponent({
  name: 'YryBreadcrumb',
  props: {
    items: { type: Array, required: true },
    ariaLabel: { type: String, default: '面包屑导航' },
    separator: { type: String, default: '/' }
  },
  template: TEMPLATE
});

describe('YryBreadcrumb — 渲染', () => {
  it('render 单项面包屑', () => {
    const w = mount(YryBreadcrumb, {
      props: { items: [{ label: '首页' }] }
    });
    expect(w.html()).toContain('首页');
  });

  it('render 多项面包屑', () => {
    const w = mount(YryBreadcrumb, {
      props: {
        items: [{ label: '首页', href: '/' }, { label: '故事', href: '/story' }, { label: '当前' }]
      }
    });
    expect(w.html()).toContain('首页');
    expect(w.html()).toContain('故事');
    expect(w.html()).toContain('当前');
  });

  it('有 href 的项渲染为 <a>', () => {
    const w = mount(YryBreadcrumb, {
      props: { items: [{ label: '首页', href: '/home' }] }
    });
    expect(w.html()).toContain('href="/home"');
  });

  it('无 href 的项渲染为 span(当前页)', () => {
    const w = mount(YryBreadcrumb, {
      props: { items: [{ label: '当前页' }] }
    });
    expect(w.html()).toContain('当前页');
    expect(w.html()).not.toContain('href=');
  });

  it('ariaLabel 默认 "面包屑导航"', () => {
    const w = mount(YryBreadcrumb, { props: { items: [] } });
    expect(w.vm.ariaLabel).toBe('面包屑导航');
  });

  it('separator 默认 "/"', () => {
    const w = mount(YryBreadcrumb, { props: { items: [] } });
    expect(w.vm.separator).toBe('/');
  });

  it('icon 渲染', () => {
    const w = mount(YryBreadcrumb, {
      props: { items: [{ label: '首页', icon: '🏠' }] }
    });
    expect(w.html()).toContain('🏠');
  });
});
