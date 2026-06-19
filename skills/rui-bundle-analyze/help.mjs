#!/usr/bin/env node
import { bold, dim, yellow, cyan, green, red } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-bundle-analyze — 项目体积与依赖结构分析')}
${dim('v2.0 · 类 webpack-bundle-analyzer · 源码级 treemap + 依赖图谱 + 趋势对比')}

${hdr('用法')}
${item('/rui-bundle-analyze', '全量分析，生成 HTML 报告并在浏览器打开', cyan)}
${item('/rui-bundle-analyze --dir <path>', '分析指定目录（默认项目根目录）', yellow)}
${item('/rui-bundle-analyze --scope <glob>', '限定文件范围（如 "skills/**/*.mjs"）', yellow)}
${item('/rui-bundle-analyze --max-depth <n>', '限制依赖图节点深度（0 = 不限制）', yellow)}

${hdr('输出控制')}
${item('/rui-bundle-analyze --no-open', '仅生成报告，不自动打开浏览器', yellow)}
${item('/rui-bundle-analyze --json', 'JSON 输出到 stdout（供管线消费）', yellow)}
${item('/rui-bundle-analyze --json --no-open', '管线模式：仅 JSON，不生成 HTML', yellow)}

${hdr('基线 & 趋势')}
${item('/rui-bundle-analyze --save-baseline', '保存当前分析为基线（.memory/bundle-baseline.json）', green)}
${item('/rui-bundle-analyze --diff', '与基线对比，在报告和 CLI 中展示变化', green)}
${item('/rui-bundle-analyze --diff --json', 'JSON 输出含 diff 字段', cyan)}

${hdr('6 大分析维度')}
${subhdr('① 文件体积分析')}
${item('Treemap 算法', 'squarified treemap（Bruls-Huizing-van Wijk），矩形面积=文件体积')}
${item('颜色编码', 'Tableau10 色板按扩展名分配，同类文件颜色全局一致')}
${item('缩放导航', '滚轮缩放、点击深入目录、面包屑层级返回')}
${item('排除规则', '自动跳过 node_modules/ .git/ dist/ build/ .next/ 等')}

${subhdr('② 依赖图谱')}
${item('解析模式', '9 种：static/dynamic/require/re-export/wildcard re-export/type import/CSS @import')}
${item('布局算法', 'D3 force simulation（link distance 80, charge -200, collision radius）')}
${item('可视化', '节点面积=文件体积, 实线=import, 虚线=dynamic, 黄虚线=require, 点线=re-export')}
${item('性能上限', 'Top-500 最大文件入图，超限自动裁剪')}

${subhdr('③ 体积统计')}
${item('Top-20 文件', '按绝对字节数排名，含完整路径和扩展名')}
${item('扩展名分布', '各扩展名总体积，横向比例条可视化')}
${item('目录分布', '一级子目录体积排名，含占比')}
${item('体积直方图', '6 桶分桶：0-1KB / 1-10KB / 10-100KB / 100-500KB / 500KB-1MB / >1MB')}

${subhdr('④ 依赖热点')}
${item('fan-in Top-10', '被依赖最多模块 — 核心基础设施，修改风险大')}
${item('fan-out Top-10', '依赖最多模块 — 可能是 God Module 反模式')}
${item('循环依赖', 'DFS 闭环检测，Top-20 环路路径，含告警')}
${item('依赖深度', '最长依赖链 hops 数')}

${subhdr('⑤ 代码质量')}
${item('孤儿文件', '既不被 import 也不 import 其他文件的孤立模块，可能是死代码')}
${item('Barrel 文件', '仅含 re-export 的聚合模块，过多会增加构建复杂度')}
${item('超大文件告警', '>500KB 标红，>100KB 标黄')}
${item('目录深度', '按嵌套层级统计文件分布')}

${subhdr('⑥ 趋势对比（--diff）')}
${item('体积变化', '总体积增长/缩减、新增/删除文件数、变化百分比')}
${item('变更排行', '体积变化最大的 Top-20 文件')}
${item('依赖变化', '新增/删除的依赖边')}

${subhdr('⑦ 软件工程度量')}
${item('I/A/D 度量', 'Robert Martin 包级稳定性/抽象度/主序列距离')}
${item('Zone 分类', 'Zone-of-Pain（痛苦区）/ Zone-of-Uselessness（无用区）/ Main Sequence')}
${item('重复检测', 'MD5 内容哈希 → 重复文件组 + 浪费字节数统计')}
${item('内聚度', '包内依赖占该包相关所有依赖的比例')}

${subhdr('⑧ 传递依赖分析')}
${item('传递闭包', 'BFS 计算每个文件的传递 fan-out/fan-in')}
${item('爆炸半径', '修改一个文件可能影响的最大文件数')}
${item('桥接模块', '连接多个子图的关键架构节点')}
${item('子图检测', '依赖图连通分量分析 → 架构碎片化度量')}

${subhdr('⑨ Git 变更热点')}
${item('变更频率', 'git log 统计 90 天窗口内每文件修改次数')}
${item('热度指数', 'churnCount × log₂(fileSizeKB + 1) 综合评分')}
${item('变更分布', '6 桶统计 (0 / 1-2 / 3-5 / 6-10 / 11-20 / 20+)')}

${subhdr('⑩ 架构分层')}
${item('拓扑分层', '基于依赖方向的 Entry→Foundation 自动分层')}
${item('层级违规', '底层→高层的反向依赖检测 (向下依赖规则)')}
${item('严重度', '轻微 (gap=1) / 严重 (gap>1) 两级分级')}

${subhdr('⑪ Co-Change 分析')}
${item('协同变更', 'Git log 解析 → 同 commit 文件对 → 隐式耦合发现')}
${item('Jaccard 相似度', '两文件 commit 集合交/并比 → 协同强度')}
${item('变更聚类', '高强对连通分量 → 跨目录逻辑模块识别')}

${subhdr('⑫ 风险评分')}
${item('6 维加权', 'size(25%)+churn(25%)+coupling(15%)+orphan(15%)+circular(20%)')}
${item('5 级风险', 'Low→Medium→High→Critical→Extreme (0-100)')}
${item('分布统计', '风险桶分布 + 平均风险 + Top-25 高风险文件')}

${subhdr('⑬ 重构建议')}
${item('7 类模式', '拆分/解环/抽象/修层/减半径/去死代码/消除重复')}
${item('P0/P1/P2', '立即→近期→改进 三级优先级')}
${item('可执行', '每条建议含受影响文件列表 + 具体操作说明')}

${subhdr('⑭ SCC 强连通分量 (Tarjan)')}
${item('Tarjan 算法', 'O(V+E) 线性时间精确 SCC 检测')}
${item('互达子图', '最大相互可达文件群 → 完全耦合检测')}
${item('SCC 分布', '1 / 2-3 / 4-5 / 6-10 / 11+ 大小分桶')}

${subhdr('⑮ 介数中心性 (Brandes)')}
${item('Brandes 算法', 'O(V×(V+E)) 最短路径介数计算')}
${item('瓶颈识别', '高介数 = 位于大量依赖路径关键位置')}
${item('显著标记', '>3×avg 介数的文件标记为架构瓶颈')}

${subhdr('⑯ 时序趋势')}
${item('JSONL 持久化', '.memory/bundle-trend.jsonl 每次运行追加')}
${item('滑动平均', '最近 5 点 SMA → 平滑短期波动')}
${item('异常检测', '体积突变>20% / 新增循环 / 风险突增>5pt')}

${subhdr('⑰ 模块边界')}
${item('co-locate', '高协同变更但不同目录 → 移到一起')}
${item('split-package', '低内聚大包 → 拆分为更小包')}
${item('extract-interface', '高瓶颈桥接 → 提取抽象接口')}
${item('break-scc', '多节点 SCC → 解环提取共享抽象')}

${hdr('输出路径')}
${item('HTML 报告', 'docs/bundle-reports/bundle-YYYY-MM-DD-HHmmss.html', dim)}
${item('JSON 数据', 'stdout（--json 时）', dim)}
${item('基线文件', '.memory/bundle-baseline.json（--save-baseline 时）', dim)}

${hdr('集成点')}
${item('rui-health', 'file_size + dep_analysis 维度评分输入')}
${item('self-improve', 'D3 复杂度 + D5 依赖退化检测输入')}
${item('planner', '项目结构可视化参考')}
${item('CI pipeline', '体积增长阈值检查（--json --diff）')}
${item('loop-report', '周度体积健康趋势报告')}

${hdr('性能（YrY ~500 文件，典型值）')}
${item('总耗时', '<300ms（瓶颈在 D3 客户端渲染，非 Node 端）', dim)}
${item('文件遍历', '<50ms', dim)}
${item('Import 解析', '<100ms（限 Top-500 文件）', dim)}
${item('依赖图/循环检测/HTML 生成', '<150ms 合计', dim)}

${hdr('边界与限制')}
${item('不支持', '打包产物分析 / 运行时依赖 / 跨包依赖 / AST 级解析 / tree-shaking 效果 / path alias', red)}
${item('边界 case', '模板 import(f(variable)) 跳过 / monorepo 包引用视为外部 / CSS @use/@forward 不解析', dim)}

${hdr('示例')}
${item('基础分析', '/rui-bundle-analyze')}
${item('指定目录', '/rui-bundle-analyze --dir skills/')}
${item('管线消费', '/rui-bundle-analyze --json | jq .stats.largestFiles')}
${item('趋势对比', '/rui-bundle-analyze --diff')}
${item('保存基线', '/rui-bundle-analyze --save-baseline')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-bundle-analyze/SKILL.md — 完整规约（方法论·架构决策·自循环）', dim)}
${item('实现源码', 'skills/rui-bundle-analyze/analyze.mjs', dim)}
${item('集成参考', 'rui-health/health.mjs · agents/self-improve.md · rules/self-improve.md', dim)}
`;

console.log(help);
