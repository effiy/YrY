/**
 * YryStepCard — 步骤卡片组件测试
 * 重点验证:多个 parsedXxx computed · onCheck method · data open 状态
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-step-card', 'yry-step-card-tpl');

const YryStepCard = defineComponent({
  name: 'YryStepCard',
  props: {
    num: { type: [String, Number], default: '' },
    title: { type: String, default: '' },
    status: { type: String, default: 'pending' },
    statusText: { type: String, default: '' },
    checked: { type: Boolean, default: false },
    summary: { type: String, default: '' },
    meta: { type: String, default: '[]' },
    criteria: { type: String, default: '[]' },
    deps: { type: String, default: '[]' },
    log: { type: String, default: '[]' }
  },
  data() {
    return { open: false };
  },
  computed: {
    parsedMeta() {
      try {
        return JSON.parse(this.meta);
      } catch (e) {
        return [];
      }
    },
    parsedCriteria() {
      try {
        return JSON.parse(this.criteria);
      } catch (e) {
        return [];
      }
    },
    parsedDeps() {
      try {
        return JSON.parse(this.deps);
      } catch (e) {
        return [];
      }
    },
    parsedLog() {
      try {
        return JSON.parse(this.log);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryStepCard — 基础渲染', () => {
  it('render num + title', () => {
    const w = mount(YryStepCard, {
      props: { num: '1', title: '需求分析' }
    });
    expect(w.html()).toContain('1');
    expect(w.html()).toContain('需求分析');
  });

  it('默认 status=pending', () => {
    const w = mount(YryStepCard, { props: {} });
    expect(w.vm.status).toBe('pending');
  });

  it('summary 通过 v-html 渲染', () => {
    const w = mount(YryStepCard, {
      props: { summary: '<em>步骤摘要</em>' }
    });
    expect(w.html()).toContain('<em>步骤摘要</em>');
  });
});

describe('YryStepCard — computed JSON 解析', () => {
  it('parsedMeta 解析数组', () => {
    const w = mount(YryStepCard, {
      props: { meta: '[{"icon":"🎯","label":"目标"}]' }
    });
    expect(w.vm.parsedMeta).toHaveLength(1);
    expect(w.vm.parsedMeta[0]).toEqual({ icon: '🎯', label: '目标' });
  });

  it('parsedCriteria 解析字符串数组', () => {
    const w = mount(YryStepCard, {
      props: { criteria: '["条件一","条件二"]' }
    });
    expect(w.vm.parsedCriteria).toEqual(['条件一', '条件二']);
  });

  it('parsedDeps 解析对象数组', () => {
    const w = mount(YryStepCard, {
      props: { deps: '[{"name":"dep1"},{"name":"dep2"}]' }
    });
    expect(w.vm.parsedDeps).toHaveLength(2);
  });

  it('parsedLog 解析日志', () => {
    const w = mount(YryStepCard, {
      props: { log: '[{"time":"10:00","text":"启动"}]' }
    });
    expect(w.vm.parsedLog[0]).toEqual({ time: '10:00', text: '启动' });
  });

  it('非法 JSON 各 computed 返回空数组', () => {
    const w = mount(YryStepCard, {
      props: {
        meta: 'x',
        criteria: 'x',
        deps: 'x',
        log: 'x'
      }
    });
    expect(w.vm.parsedMeta).toEqual([]);
    expect(w.vm.parsedCriteria).toEqual([]);
    expect(w.vm.parsedDeps).toEqual([]);
    expect(w.vm.parsedLog).toEqual([]);
  });
});

describe('YryStepCard — data 初始状态', () => {
  it('初始 open 为 false', () => {
    const w = mount(YryStepCard, { props: {} });
    expect(w.vm.open).toBe(false);
  });

  it('checked 默认 false', () => {
    const w = mount(YryStepCard, { props: {} });
    expect(w.vm.checked).toBe(false);
  });

  it('checked 可通过 props 设置', () => {
    const w = mount(YryStepCard, { props: { checked: true } });
    expect(w.vm.checked).toBe(true);
  });
});
