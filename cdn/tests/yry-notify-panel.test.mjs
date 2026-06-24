/**
 * YryNotifyPanel — 通知中心面板组件测试
 * 模板依赖多个 computed/method,本测试只验证 data + filteredItems 逻辑
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-notify-panel', 'yry-notify-panel-tpl');

const YryNotifyPanel = defineComponent({
  name: 'YryNotifyPanel',
  data() {
    return {
      allItems: [],
      activeFilter: 'all',
      loading: false,
      error: null,
      _lastUpdate: 0
    };
  },
  computed: {
    filteredItems() {
      const list =
        this.activeFilter === 'all'
          ? this.allItems
          : this.allItems.filter((it) => it.type === this.activeFilter);
      return list.map((item, i) => {
        item._idx = i;
        return item;
      });
    }
  },
  render() {
    return h('div');
  }
});

describe('YryNotifyPanel — 模板提取', () => {
  it('模板存在且含 notify 标识', () => {
    expect(TEMPLATE).toContain('notify');
  });
});

describe('YryNotifyPanel — data 初始状态', () => {
  it('初始 allItems 为空数组', () => {
    const w = mount(YryNotifyPanel);
    expect(w.vm.allItems).toEqual([]);
  });

  it('初始 activeFilter="all"', () => {
    const w = mount(YryNotifyPanel);
    expect(w.vm.activeFilter).toBe('all');
  });

  it('初始 loading=false', () => {
    const w = mount(YryNotifyPanel);
    expect(w.vm.loading).toBe(false);
  });

  it('初始 error=null', () => {
    const w = mount(YryNotifyPanel);
    expect(w.vm.error).toBeNull();
  });

  it('初始 _lastUpdate=0', () => {
    const w = mount(YryNotifyPanel);
    expect(w.vm._lastUpdate).toBe(0);
  });
});

describe('YryNotifyPanel — computed.filteredItems', () => {
  it('activeFilter=all 返回所有 items', async () => {
    const w = mount(YryNotifyPanel);
    w.vm.allItems = [
      { type: 'health', id: '1' },
      { type: 'loop', id: '2' },
      { type: 'trend', id: '3' }
    ];
    await w.vm.$nextTick();
    expect(w.vm.filteredItems).toHaveLength(3);
  });

  it('activeFilter=health 过滤非 health 类型', async () => {
    const w = mount(YryNotifyPanel);
    w.vm.allItems = [
      { type: 'health', id: '1' },
      { type: 'loop', id: '2' }
    ];
    w.vm.activeFilter = 'health';
    await w.vm.$nextTick();
    expect(w.vm.filteredItems).toHaveLength(1);
    expect(w.vm.filteredItems[0].type).toBe('health');
  });

  it('activeFilter=loop 过滤非 loop 类型', async () => {
    const w = mount(YryNotifyPanel);
    w.vm.allItems = [
      { type: 'health', id: '1' },
      { type: 'loop', id: '2' }
    ];
    w.vm.activeFilter = 'loop';
    await w.vm.$nextTick();
    expect(w.vm.filteredItems).toHaveLength(1);
  });

  it('空 allItems 返回空数组', () => {
    const w = mount(YryNotifyPanel);
    expect(w.vm.filteredItems).toEqual([]);
  });

  it('filteredItems 给每项加 _idx', async () => {
    const w = mount(YryNotifyPanel);
    w.vm.allItems = [{ type: 'health' }, { type: 'health' }];
    await w.vm.$nextTick();
    expect(w.vm.filteredItems[0]._idx).toBe(0);
    expect(w.vm.filteredItems[1]._idx).toBe(1);
  });
});
