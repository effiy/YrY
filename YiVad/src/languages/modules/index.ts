// 所有 locale 模块的注册入口。
//
// 「新增一个模块」的标准 4 步：
//   1) 新建 modules/<name>/{zh.ts,en.ts}，两个文件都必须：
//        export default { <name>: { ... 完全相同的对象结构 ... } }
//   2) 在本文件顶部 import 两个文件：
//        import zhXxx from "./<name>/zh"; import enXxx from "./<name>/en";
//   3) 在下方 messages.zh 中展开 ...zhXxx
//   4) 在下方 messages.en 中同步展开 ...enXxx
//
// 完整规范与常见陷阱：YiKnowledge/projects/yivad/workflows/开发规范/08-规范-国际化规范.md
// PRD：YiKnowledge/projects/yivad/prds/2026-09/85-prd-多语言专项优化与补充.md
// 校验脚本：YiVad/scripts/check-i18n-locales.mjs 或 pnpm i18n:check
import zhCommon from "./common/zh";
import enCommon from "./common/en";
import zhAichat from "./aichat/zh";
import enAichat from "./aichat/en";
import zhStory from "./story/zh";
import enStory from "./story/en";
import zhTopicDetail from "./topicdetail/zh";
import enTopicDetail from "./topicdetail/en";
import zhRss from "./rss/zh";
import enRss from "./rss/en";
import zhHome from "./home/zh";
import enHome from "./home/en";
import zhKanban from "./kanban/zh";
import enKanban from "./kanban/en";
import zhRoadmap from "./roadmap/zh";
import enRoadmap from "./roadmap/en";
import zhProject from "./project/zh";
import enProject from "./project/en";
import zhIssue from "./issue/zh";
import enIssue from "./issue/en";
import zhKnowledge from "./knowledge/zh";
import enKnowledge from "./knowledge/en";
import zhBug from "./bug/zh";
import enBug from "./bug/en";
import zhSystem from "./system/zh";
import enSystem from "./system/en";
import zhDashboard from "./dashboard/zh";
import enDashboard from "./dashboard/en";
import zhModule from "./module/zh";
import enModule from "./module/en";
import zhSettings from "./settings/zh";
import enSettings from "./settings/en";
import zhRag from "./rag/zh";
import enRag from "./rag/en";
import zhAnalytics from "./analytics/zh";
import enAnalytics from "./analytics/en";
import zhGantt from "./gantt/zh";
import enGantt from "./gantt/en";
import zhReports from "./reports/zh";
import enReports from "./reports/en";
import zhLogin from "./login/zh";
import enLogin from "./login/en";
import zhSearch from "./search/zh";
import enSearch from "./search/en";
import zhNotification from "./notification/zh";
import enNotification from "./notification/en";

export const messages = {
  zh: {
    ...zhCommon,
    ...zhAichat,
    ...zhStory,
    ...zhTopicDetail,
    ...zhRss,
    ...zhHome,
    ...zhKanban,
    ...zhRoadmap,
    ...zhProject,
    ...zhIssue,
    ...zhKnowledge,
    ...zhBug,
    ...zhSystem,
    ...zhDashboard,
    ...zhModule,
    ...zhSettings,
    ...zhRag,
    ...zhAnalytics,
    ...zhGantt,
    ...zhReports,
    ...zhLogin,
    ...zhSearch,
    ...zhNotification
  },
  en: {
    ...enCommon,
    ...enAichat,
    ...enStory,
    ...enTopicDetail,
    ...enRss,
    ...enHome,
    ...enKanban,
    ...enRoadmap,
    ...enProject,
    ...enIssue,
    ...enKnowledge,
    ...enBug,
    ...enSystem,
    ...enDashboard,
    ...enModule,
    ...enSettings,
    ...enRag,
    ...enAnalytics,
    ...enGantt,
    ...enReports,
    ...enLogin,
    ...enSearch,
    ...enNotification
  }
};