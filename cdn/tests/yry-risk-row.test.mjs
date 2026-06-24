/**
 * YryRiskRow — 风险行组件测试
 * 重点验证:parsedDetails/parsedPlan/parsedTimeline 三个 computed JSON 解析
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-risk-row', 'yry-risk-row-tpl');

const YryRiskRow = defineComponent({
  name: 'YryRiskRow',
  props: {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    sub: { type: String, default: '' },
    category: { type: String, default: '' },
    score: { type: [String, Number], default: 0 },
    scoreLevel: { type: String, default: 'low' },
    scoreInfo: { type: String, default: '' },
    deadline: { type: String, default: '' },
    owner: { type: String, default: '' },
    status: { type: String, default: 'pass' },
    statusText: { type: String, default: '' },
    details: { type: String, default: '[]' },
    plan: { type: String, default: '[]' },
    timeline: { type: String, default: '[]' }
  },
  computed: {
    parsedDetails() {
      try {
        return JSON.parse(this.details);
      } catch (e) {
        return [];
      }
    },
    parsedPlan() {
      try {
        return JSON.parse(this.plan);
      } catch (e) {
        return [];
      }
    },
    parsedTimeline() {
      try {
        return JSON.parse(this.timeline);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryRiskRow — 基础渲染', () => {
  it('render name + owner', () => {
    const w = mount(YryRiskRow, {
      props: { name: '认证绕过风险', owner: 'dev' }
    });
    expect(w.html()).toContain('认证绕过风险');
    expect(w.html()).toContain('dev');
  });

  it('默认 status=pass', () => {
    const w = mount(YryRiskRow, { props: {} });
    expect(w.vm.status).toBe('pass');
  });

  it('scoreLevel 默认 low', () => {
    const w = mount(YryRiskRow, { props: {} });
    expect(w.vm.scoreLevel).toBe('low');
  });
});

describe('YryRiskRow — computed JSON 解析', () => {
  it('parsedDetails 解析详情数组', () => {
    const details = JSON.stringify([
      { text: '问题 1', status: 'warn' },
      { text: '问题 2', status: 'fail' }
    ]);
    const w = mount(YryRiskRow, { props: { details } });
    expect(w.vm.parsedDetails).toHaveLength(2);
    expect(w.vm.parsedDetails[0]).toEqual({ text: '问题 1', status: 'warn' });
  });

  it('parsedPlan 解析步骤数组', () => {
    const plan = JSON.stringify([
      { text: '步骤 1', state: 'done' },
      { text: '步骤 2', state: 'todo' }
    ]);
    const w = mount(YryRiskRow, { props: { plan } });
    expect(w.vm.parsedPlan).toHaveLength(2);
  });

  it('parsedTimeline 解析时间线', () => {
    const timeline = JSON.stringify([
      { time: '06-01', text: '发现' },
      { time: '06-15', text: '修复' }
    ]);
    const w = mount(YryRiskRow, { props: { timeline } });
    expect(w.vm.parsedTimeline).toHaveLength(2);
  });

  it('非法 JSON 各 computed 返回空数组', () => {
    const w = mount(YryRiskRow, {
      props: { details: 'x', plan: 'x', timeline: 'x' }
    });
    expect(w.vm.parsedDetails).toEqual([]);
    expect(w.vm.parsedPlan).toEqual([]);
    expect(w.vm.parsedTimeline).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryRiskRow, {
      props: { details: '', plan: '', timeline: '' }
    });
    expect(w.vm.parsedDetails).toEqual([]);
    expect(w.vm.parsedPlan).toEqual([]);
    expect(w.vm.parsedTimeline).toEqual([]);
  });
});
