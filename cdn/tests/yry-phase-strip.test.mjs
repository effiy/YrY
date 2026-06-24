/**
 * YryPhaseStrip — 阶段条组件测试
 * 重点验证:parsedPhases computed + cols 默认
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-phase-strip', 'yry-phase-strip-tpl');

const YryPhaseStrip = defineComponent({
  name: 'YryPhaseStrip',
  props: {
    phases: { type: String, default: '[]' },
    cols: { type: [String, Number], default: 6 }
  },
  computed: {
    parsedPhases() {
      try {
        return JSON.parse(this.phases);
      } catch (e) {
        return [];
      }
    }
  },
  methods: {
    dotChar(state) {
      if (state === 'done') return '✓';
      if (state === 'active') return '●';
      return '';
    }
  },
  template: TEMPLATE
});

describe('YryPhaseStrip — props', () => {
  it('默认 cols=6', () => {
    const w = mount(YryPhaseStrip, { props: {} });
    expect(w.vm.cols).toBe(6);
  });

  it('cols 可设为字符串', () => {
    const w = mount(YryPhaseStrip, { props: { cols: '4' } });
    expect(w.vm.cols).toBe('4');
  });
});

describe('YryPhaseStrip — computed.parsedPhases', () => {
  it('合法 JSON 解析', () => {
    const phases = JSON.stringify([
      { name: '需求', status: 'done' },
      { name: '设计', status: 'active' },
      { name: '实现', status: 'pending' }
    ]);
    const w = mount(YryPhaseStrip, { props: { phases } });
    expect(w.vm.parsedPhases).toHaveLength(3);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryPhaseStrip, { props: { phases: 'x' } });
    expect(w.vm.parsedPhases).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryPhaseStrip, { props: { phases: '' } });
    expect(w.vm.parsedPhases).toEqual([]);
  });

  it('默认值 "[]" 返回空数组', () => {
    const w = mount(YryPhaseStrip, { props: {} });
    expect(w.vm.parsedPhases).toEqual([]);
  });

  it('render phases 名称', () => {
    const phases = JSON.stringify([{ name: '阶段一' }, { name: '阶段二' }]);
    const w = mount(YryPhaseStrip, { props: { phases } });
    expect(w.html()).toContain('阶段一');
    expect(w.html()).toContain('阶段二');
  });
});
