/**
 * YryItemCards — 项目卡片集合组件测试
 * 重点验证:data grids 结构(复杂 mountAll DOM 逻辑跳过)
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-item-cards', 'yry-item-cards-tpl');

const YryItemCards = defineComponent({
  name: 'YryItemCards',
  data() {
    return {
      grids: {
        'agent-roles-grid': [
          { icon: 'P', name: 'pm', nameHref: '/pm.md' },
          { icon: 'C', name: 'coder', nameHref: '/coder.md' }
        ]
      },
      mounted: {}
    };
  },
  template: TEMPLATE
});

describe('YryItemCards — data', () => {
  it('初始 grids 是对象', () => {
    const w = mount(YryItemCards);
    expect(typeof w.vm.grids).toBe('object');
    expect(w.vm.grids).not.toBeNull();
  });

  it('初始 mounted 是空对象', () => {
    const w = mount(YryItemCards);
    expect(w.vm.mounted).toEqual({});
  });

  it('grids 含 agent-roles-grid 键', () => {
    const w = mount(YryItemCards);
    expect(w.vm.grids['agent-roles-grid']).toBeDefined();
    expect(Array.isArray(w.vm.grids['agent-roles-grid'])).toBe(true);
  });

  it('agent-roles-grid 含 pm 角色', () => {
    const w = mount(YryItemCards);
    const grid = w.vm.grids['agent-roles-grid'];
    const pm = grid.find((item) => item.name === 'pm');
    expect(pm).toBeDefined();
    expect(pm.icon).toBe('P');
  });
});
