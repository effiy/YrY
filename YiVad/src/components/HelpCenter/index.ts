/**
 * HelpOS — Composables Entry.
 *
 * 统一对外暴露 HelpOS 的 Vue 3 Composable。
 * ⚠️ 工程约束：
 *   1. 外部组件不得直接 import @/api/** 的 Help 相关 service（项目红线：
 *      "外部工具统一通过 ToolRegistry 调用，严禁在 UI 组件内直接引用 service"）。
 *      全部经由 Composable 中间层暴露。
 *   2. 所有异步方法接受 { timeout, signal }，并使用 AbortSignal.any([...])
 *      与内部去重控制器联合（对齐 YiVad 拦截器红线，禁止盲覆 config.signal）。
 *   3. 面板 open/close 使用 DisposerBag.reset()；禁止调用 dispose() 除非 L5 关停。
 *
 * 文档：YiKnowledge/projects/yivad/prds/2026-09/35-prd-快捷键参考与帮助中心.md
 */
export { useHelp, type HelpOSPublicAPI } from "./useHelp";
export { usePageHelp } from "./usePageHelp";
export { useHelpSearch } from "./useHelpSearch";
export * from "./types";
