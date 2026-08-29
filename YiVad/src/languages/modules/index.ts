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

export const messages = {
  zh: {
    ...zhCommon,
    ...zhAichat,
    ...zhStory,
    ...zhTopicDetail,
    ...zhRss,
    ...zhHome,
    ...zhKanban,
    ...zhRoadmap
  },
  en: {
    ...enCommon,
    ...enAichat,
    ...enStory,
    ...enTopicDetail,
    ...enRss,
    ...enHome,
    ...enKanban,
    ...enRoadmap
  }
};
