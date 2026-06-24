/**
 * YrySceneChrome — 场景外壳组件测试
 * 重点验证:computed parsedBc/parsedCn + theme 默认 + toolbar v-html
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-chrome', 'yry-scene-chrome-tpl');

const YrySceneChrome = defineComponent({
  name: 'YrySceneChrome',
  props: {
    theme: { type: String, default: 'a' },
    title: { type: String, default: '' },
    titleAccent: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    toolbar: { type: String, default: '' },
    breadcrumb: { type: String, default: '[]' },
    crossnav: { type: String, default: '[]' }
  },
  computed: {
    parsedBc() {
      try {
        return JSON.parse(this.breadcrumb);
      } catch (e) {
        return [];
      }
    },
    parsedCn() {
      try {
        return JSON.parse(this.crossnav);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YrySceneChrome — 渲染', () => {
  it('默认 theme=a', () => {
    const w = mount(YrySceneChrome, { props: {} });
    expect(w.vm.theme).toBe('a');
  });

  it('render title with {ACCENT} placeholder removed (titleAccent 作为标志)', () => {
    const w = mount(YrySceneChrome, {
      props: { title: '场景标题 {ACCENT}', titleAccent: '✨' }
    });
    expect(w.html()).toContain('场景标题');
    // {ACCENT} 占位符被移除
    expect(w.html()).not.toContain('{ACCENT}');
  });

  it('无 titleAccent 时 render title 原文', () => {
    const w = mount(YrySceneChrome, {
      props: { title: '纯标题' }
    });
    expect(w.html()).toContain('纯标题');
  });

  it('render subtitle', () => {
    const w = mount(YrySceneChrome, {
      props: { subtitle: '子标题描述' }
    });
    expect(w.html()).toContain('子标题描述');
  });

  it('toolbar 通过 v-html 渲染', () => {
    const w = mount(YrySceneChrome, {
      props: { toolbar: '<button>导出</button>' }
    });
    expect(w.html()).toContain('<button>导出</button>');
  });
});

describe('YrySceneChrome — computed', () => {
  it('parsedBc 解析面包屑', () => {
    const bc = JSON.stringify([{ label: '首页', href: '/' }]);
    const w = mount(YrySceneChrome, { props: { breadcrumb: bc } });
    expect(w.vm.parsedBc).toHaveLength(1);
  });

  it('parsedCn 解析横向导航', () => {
    const cn = JSON.stringify([{ id: 'A', href: '/a' }]);
    const w = mount(YrySceneChrome, { props: { crossnav: cn } });
    expect(w.vm.parsedCn[0]).toEqual({ id: 'A', href: '/a' });
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YrySceneChrome, {
      props: { breadcrumb: 'x', crossnav: 'y' }
    });
    expect(w.vm.parsedBc).toEqual([]);
    expect(w.vm.parsedCn).toEqual([]);
  });
});
