/**
 * YrySceneCard — 场景卡片组件测试
 * 重点验证:computed deliveryLinks 的 7 个交付物图标逻辑
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-card', 'yry-scene-card-tpl');

const YrySceneCard = defineComponent({
  name: 'YrySceneCard',
  props: {
    num: { type: String, default: '' },
    name: { type: String, required: true },
    nameHref: { type: String, default: '' },
    nameTarget: { type: String, default: '' },
    desc: { type: String, default: '' },
    meta: { type: Array, default: () => [] }
  },
  computed: {
    deliveryLinks() {
      const DELIVERY_ICONS = [
        { icon: '📋', label: '清单' },
        { icon: '📐', label: '架构' },
        { icon: '🔗', label: '图谱' },
        { icon: '🧪', label: '测试' },
        { icon: '📄', label: '源码' },
        { icon: '💡', label: '演示' },
        { icon: '📝', label: '审查' }
      ];
      if (!this.meta || !this.meta.length) return DELIVERY_ICONS;
      const existing = {};
      this.meta.forEach((m) => {
        existing[m.label] = m;
      });
      return DELIVERY_ICONS.map((d) => existing[d.label] || { icon: d.icon, label: d.label });
    }
  },
  template: TEMPLATE
});

describe('YrySceneCard — 渲染', () => {
  it('render 必填 name', () => {
    const w = mount(YrySceneCard, { props: { name: '场景一' } });
    expect(w.html()).toContain('场景一');
  });

  it('render num + name', () => {
    const w = mount(YrySceneCard, { props: { num: '场景 1', name: '初始化' } });
    expect(w.html()).toContain('场景 1');
    expect(w.html()).toContain('初始化');
  });

  it('desc 通过 v-html 渲染', () => {
    const w = mount(YrySceneCard, {
      props: { name: 'x', desc: '<em>重点</em>描述' }
    });
    expect(w.html()).toContain('<em>重点</em>描述');
  });
});

describe('YrySceneCard — computed.deliveryLinks', () => {
  it('meta 为空时返回默认 7 个交付物图标', () => {
    const w = mount(YrySceneCard, { props: { name: 'x' } });
    expect(w.vm.deliveryLinks).toHaveLength(7);
    expect(w.vm.deliveryLinks[0]).toEqual({ icon: '📋', label: '清单' });
    expect(w.vm.deliveryLinks[6]).toEqual({ icon: '📝', label: '审查' });
  });

  it('meta 提供部分链接时,缺失的用默认图标补齐', () => {
    const w = mount(YrySceneCard, {
      props: {
        name: 'x',
        meta: [{ icon: '🔥', label: '清单', href: '/a' }]
      }
    });
    expect(w.vm.deliveryLinks[0]).toEqual({ icon: '🔥', label: '清单', href: '/a' });
    expect(w.vm.deliveryLinks[1]).toEqual({ icon: '📐', label: '架构' });
  });

  it('meta 提供所有 7 个链接时,全部使用 meta 值', () => {
    const meta = [
      { icon: '1', label: '清单', href: '/1' },
      { icon: '2', label: '架构', href: '/2' },
      { icon: '3', label: '图谱', href: '/3' },
      { icon: '4', label: '测试', href: '/4' },
      { icon: '5', label: '源码', href: '/5' },
      { icon: '6', label: '演示', href: '/6' },
      { icon: '7', label: '审查', href: '/7' }
    ];
    const w = mount(YrySceneCard, { props: { name: 'x', meta } });
    expect(w.vm.deliveryLinks).toHaveLength(7);
    expect(w.vm.deliveryLinks[3]).toEqual({ icon: '4', label: '测试', href: '/4' });
  });
});
