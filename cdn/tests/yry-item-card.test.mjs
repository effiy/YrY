/**
 * YryItemCard — 项目卡片组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-item-card', 'yry-item-card-tpl');

const YryItemCard = defineComponent({
  name: 'YryItemCard',
  props: {
    icon: { type: String, required: true },
    iconModifier: { type: String, default: '' },
    name: { type: String, required: true },
    nameHref: { type: String, default: '' },
    nameTarget: { type: String, default: '' },
    badge: { type: String, default: '' },
    desc: { type: String, default: '' },
    tags: { type: Array, default: () => [] }
  },
  template: TEMPLATE
});

describe('YryItemCard — 渲染', () => {
  it('render 必填 icon + name', () => {
    const w = mount(YryItemCard, {
      props: { icon: '🎯', name: '项目名' }
    });
    expect(w.html()).toContain('🎯');
    expect(w.html()).toContain('项目名');
  });

  it('render badge', () => {
    const w = mount(YryItemCard, {
      props: { icon: 'x', name: 'n', badge: 'v1.0' }
    });
    expect(w.html()).toContain('v1.0');
  });

  it('desc 通过 v-html 渲染', () => {
    const w = mount(YryItemCard, {
      props: { icon: 'x', name: 'n', desc: '<strong>描述</strong>' }
    });
    expect(w.html()).toContain('<strong>描述</strong>');
  });

  it('render tags 列表(对象数组)', () => {
    const w = mount(YryItemCard, {
      props: {
        icon: 'x',
        name: 'n',
        tags: [
          { text: 'tag1', modifier: 'info' },
          { text: 'tag2', modifier: 'accent' }
        ]
      }
    });
    expect(w.html()).toContain('tag1');
    expect(w.html()).toContain('tag2');
  });

  it('nameHref 渲染为 <a>', () => {
    const w = mount(YryItemCard, {
      props: { icon: 'x', name: 'n', nameHref: '/detail' }
    });
    expect(w.html()).toContain('href="/detail"');
  });

  it('iconModifier 应用样式', () => {
    const w = mount(YryItemCard, {
      props: { icon: '🎯', name: 'n', iconModifier: 'accent' }
    });
    expect(w.html()).toContain('accent');
  });
});
