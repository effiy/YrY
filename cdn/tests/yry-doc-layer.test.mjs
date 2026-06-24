/**
 * YryDocLayer — 文档中心 Layer 组件测试
 * 模板使用 <yry-layer> 自定义元素,完整渲染需依赖外部组件
 * 本测试只验证模板存在 + 组件定义
 */

import { describe, it, expect } from 'vitest';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-doc-layer', 'yry-doc-layer-tpl');

describe('YryDocLayer — 模板', () => {
  it('模板存在', () => {
    expect(TEMPLATE).toBeDefined();
    expect(TEMPLATE.length).toBeGreaterThan(0);
  });

  it('模板含 doc-layer 标识', () => {
    expect(TEMPLATE).toContain('doc-layer');
  });

  it('模板使用 yry-layer 自定义元素', () => {
    expect(TEMPLATE).toContain('yry-layer');
  });
});
