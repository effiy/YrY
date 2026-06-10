#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-yry — 自改进闭环')}
${dim('全自主扫描 → 诊断 → 实现 → 验证 → 版本升级，循环至无改进空间')}

${hdr('用法')}
${item('/rui-yry', '默认深度 3 的自改进循环', cyan)}
${item('/rui-yry --depth N', '指定最大闭环次数', yellow)}

${hdr('循环步骤')}
${item('§1 全量扫描', '扫描所有故事 + 自动合并/拆分检测')}
${item('§2 诊断排序', 'D0-D7 模式匹配，按优先级排序')}
${item('§3 选取最优', '选最高优先级改进项')}
${item('§4 自主实现', '通过 rui-update 或 rui-code 自动实现')}
${item('§5 验证', 'Gate B 门禁 + 回归检查')}
${item('§6 版本升级', '按变更类型自动 bump 版本号')}
${item('§7 交付', 'rui-import → rui-bot')}

${hdr('终止条件')}
${item('达到深度上限', 'round >= --depth（默认 3）')}
${item('无改进空间', '所有 D0-D7 诊断通过')}
${item('连续 3 轮无效', '无实质性变更')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-yry/SKILL.md — 完整规约', dim)}
${item('self-improve.md', 'rules/self-improve.md — 自改进规则', dim)}
`;

console.log(help);
