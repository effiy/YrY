#!/usr/bin/env node
import { bold, dim, cyan } from '../../lib/tty.mjs';
import { hdr, item } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-init — 项目初始化')}
${dim('六步管线：detect → explore → generate → arch → setup → verify → trigger')}

${hdr('用法')}
${item('/rui-init', '建立项目基线：CLAUDE.md + README.md + 架构故事 + 自测故事', cyan)}

${hdr('流程')}
${item('1. detect', '探测项目类型、依赖、安全面')}
${item('2. explore', '深度探索源码，抽取模块地图')}
${item('3. generate', '生成 CLAUDE.md + README.md')}
${item('4. arch', '补齐架构故事 + 自主测试方案')}
${item('5. setup', '创建目录结构 + config')}
${item('6. verify', '7 项就绪检查，任一失败即终止')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-init/SKILL.md — 完整规约', dim)}
`;

console.log(help);
