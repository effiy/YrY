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

export const messages = {
  zh: {
    ...zhCommon,
    ...zhAichat,
    ...zhStory,
    ...zhTopicDetail,
    ...zhRss
  },
  en: {
    ...enCommon,
    ...enAichat,
    ...enStory,
    ...enTopicDetail,
    ...enRss
  }
};
