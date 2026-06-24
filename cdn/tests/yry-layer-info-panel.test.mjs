/**
 * YryLayerInfoPanel — Layer Info Panel 组件测试
 * 重点验证:data 状态 + computed currentTitle/currentContent + methods show/close
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-layer-info-panel', 'yry-layer-info-panel-tpl');

// 模拟 buildLayerData 返回
const DATA = {
  skills: { title: '技能详情', content: '<p>20 个技能</p>' },
  agents: { title: 'Agent 详情', content: '<p>9 个 Agent</p>' }
};

const YryLayerInfoPanel = defineComponent({
  name: 'YryLayerInfoPanel',
  data() {
    return {
      DATA: DATA,
      currentName: null,
      openState: false
    };
  },
  computed: {
    currentTitle() {
      if (!this.currentName || !this.DATA[this.currentName]) return '层级详情';
      return this.DATA[this.currentName].title;
    },
    currentContent() {
      if (!this.currentName || !this.DATA[this.currentName]) return '';
      return this.DATA[this.currentName].content;
    }
  },
  methods: {
    show(name) {
      if (!this.DATA[name]) return false;
      this.currentName = name;
      this.openState = true;
      return true;
    },
    close() {
      this.openState = false;
    },
    onOverlayClick() {
      this.close();
    },
    isOpen() {
      return this.openState;
    }
  },
  template: TEMPLATE
});

describe('YryLayerInfoPanel — data 初始状态', () => {
  it('初始 currentName=null', () => {
    const w = mount(YryLayerInfoPanel);
    expect(w.vm.currentName).toBeNull();
  });

  it('初始 openState=false', () => {
    const w = mount(YryLayerInfoPanel);
    expect(w.vm.openState).toBe(false);
  });

  it('DATA 已加载', () => {
    const w = mount(YryLayerInfoPanel);
    expect(w.vm.DATA).toBeDefined();
    expect(Object.keys(w.vm.DATA).length).toBeGreaterThan(0);
  });
});

describe('YryLayerInfoPanel — computed', () => {
  it('currentName=null 时 currentTitle="层级详情"', () => {
    const w = mount(YryLayerInfoPanel);
    expect(w.vm.currentTitle).toBe('层级详情');
  });

  it('currentName=null 时 currentContent=""', () => {
    const w = mount(YryLayerInfoPanel);
    expect(w.vm.currentContent).toBe('');
  });

  it('设置 currentName 后 currentTitle 返回对应标题', async () => {
    const w = mount(YryLayerInfoPanel);
    w.vm.currentName = 'skills';
    await w.vm.$nextTick();
    expect(w.vm.currentTitle).toBe('技能详情');
  });
});

describe('YryLayerInfoPanel — methods', () => {
  it('show(有效 name) 打开面板', async () => {
    const w = mount(YryLayerInfoPanel);
    const result = w.vm.show('skills');
    expect(result).toBe(true);
    expect(w.vm.openState).toBe(true);
    expect(w.vm.currentName).toBe('skills');
  });

  it('show(无效 name) 返回 false 不改变状态', () => {
    const w = mount(YryLayerInfoPanel);
    const result = w.vm.show('nonexistent');
    expect(result).toBe(false);
    expect(w.vm.openState).toBe(false);
  });

  it('close 关闭面板', async () => {
    const w = mount(YryLayerInfoPanel);
    w.vm.show('skills');
    expect(w.vm.openState).toBe(true);
    w.vm.close();
    expect(w.vm.openState).toBe(false);
  });

  it('isOpen 返回 openState', () => {
    const w = mount(YryLayerInfoPanel);
    expect(w.vm.isOpen()).toBe(false);
    w.vm.show('agents');
    expect(w.vm.isOpen()).toBe(true);
  });

  it('onOverlayClick 等同于 close', async () => {
    const w = mount(YryLayerInfoPanel);
    w.vm.show('skills');
    w.vm.onOverlayClick();
    expect(w.vm.openState).toBe(false);
  });
});
