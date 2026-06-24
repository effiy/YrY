/**
 * YryPanelHub — 浮动面板工具栏组件测试
 * 重点验证:props label/buttons + data 状态
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-panel-hub', 'yry-panel-hub-tpl');

const YryPanelHub = defineComponent({
  name: 'YryPanelHub',
  props: {
    label: { type: Object, default: null },
    buttons: { type: Array, required: true },
    flow: { type: String, default: '' }
  },
  data() {
    return { openPanel: null };
  },
  methods: {
    selectPanel(name) {
      this.openPanel = name;
      this.$el.dispatchEvent(
        new CustomEvent('panel-hub-select', { detail: { panel: name }, bubbles: true })
      );
    }
  },
  template: TEMPLATE
});

describe('YryPanelHub — props', () => {
  it('默认 label=null', () => {
    const w = mount(YryPanelHub, {
      props: { buttons: [{ icon: 'x', name: 'x' }] }
    });
    expect(w.vm.label).toBeNull();
  });

  it('默认 flow=""', () => {
    const w = mount(YryPanelHub, {
      props: { buttons: [{ icon: 'x', name: 'x' }] }
    });
    expect(w.vm.flow).toBe('');
  });

  it('render buttons', () => {
    const w = mount(YryPanelHub, {
      props: {
        buttons: [
          { icon: '⏰', name: '调度', color: 'var(--yry-cyan)' },
          { icon: '🔔', name: '通知', color: '#ef4444' }
        ]
      }
    });
    expect(w.html()).toContain('调度');
    expect(w.html()).toContain('通知');
  });

  it('render label', () => {
    const w = mount(YryPanelHub, {
      props: {
        label: { text: '🩺 状态', panel: 'selfimprove', title: '查看自改进' },
        buttons: [{ icon: 'x', name: 'x' }]
      }
    });
    expect(w.html()).toContain('状态');
  });

  it('render flow', () => {
    const w = mount(YryPanelHub, {
      props: {
        buttons: [{ icon: 'x', name: 'x' }],
        flow: 'Cron → 健康检查 → 通知'
      }
    });
    expect(w.html()).toContain('Cron → 健康检查 → 通知');
  });
});
