#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

function main() {
  console.log(bold('# rui-html — 故事场景 HTML 文档生成器'));
  console.log(dim('读取故事 markdown 文档 → 按参考模板生成 7 类标准 HTML，确保跨文档一致性'));
  console.log();

  console.log(hdr('快速入门'));
  console.log(item('/rui-html <story>',                  '为故事的所有场景生成全部 7 类 HTML', cyan));
  console.log(item('/rui-html <story> --scene N',        '仅为第 N 个场景生成', cyan));
  console.log(item('/rui-html <story> --type <doctype>', '仅为所有场景生成指定文档类型', cyan));
  console.log(item('/rui-html --help',                    '显示此帮助', yellow));
  console.log();

  console.log(hdr('子命令'));

  console.log(subhdr('生成命令'));
  console.log(item('/rui-html <story>', '全量生成：所有场景 × 7 类文档', cyan));
  console.log(flag('  --scene N',       '仅处理第 N 个场景（1-based）', dim));
  console.log(flag('  --type <doctype>', '仅生成指定文档类型', dim));
  console.log(flag('  --force',         '强制覆盖已有 HTML（默认跳过）', dim));
  console.log();

  console.log(hdr('7 类文档'));
  const docs = [
    ['计划清单',  'B', '步骤+进度+可勾选清单'],
    ['架构图',    'A', 'SVG 架构图+导出工具栏'],
    ['知识图谱',  'A', 'Cytoscape.js 交互图谱'],
    ['源码',      'B', '文件树+搜索+模块拓扑'],
    ['测试面板',  'B', '套件+断言+结果筛选'],
    ['演示',      'B', '步骤演示+可复制命令'],
    ['审查',      'B', '发现+案例+改进建议'],
  ];
  for (const [name, cat, desc] of docs) {
    const catLabel = cat === 'A' ? 'Mono' : 'System';
    console.log(item(`  ${name}`, `${desc}  [${catLabel}]`, dim));
  }
  console.log();

  console.log(hdr('使用场景'));

  console.log(scene('新建故事文档基线后'));
  console.log(item('1. /rui doc <需求>', '生成 markdown 基线', dim));
  console.log(item('2. /rui-html <story>', '补全 7 份 HTML 可视化文档', cyan));
  console.log(item('3. /rui code <story>', '进入实现阶段', dim));
  console.log();

  console.log(scene('只更新架构图'));
  console.log(item('/rui-html <story> --type 架构图 --force', '覆盖更新所有场景的架构图', cyan));
  console.log();

  console.log(scene('新增一个场景后'));
  console.log(item('/rui-html <story> --scene 3', '仅为新场景生成 7 份 HTML', cyan));
  console.log();

  console.log(hdr('模板参考源'));
  console.log(dim('docs/故事任务面板/yry-self-test/场景-1-init后全量自检/'));
  console.log(dim('  计划清单.html · 架构图.html · 知识图谱.html · 源码.html'));
  console.log(dim('  测试面板.html · 演示.html · 审查.html'));
  console.log();

  console.log(hdr('安全策略'));
  console.log(item('默认跳过已有', '不覆盖已存在的 HTML 文件', dim));
  console.log(item('--force 备份',  '覆盖前将旧文件备份为 .bak', dim));
  console.log(item('只读 markdown', '不修改 index.md 或 故事任务.md', dim));
}

main();
