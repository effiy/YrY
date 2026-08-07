// SSOT for BRD topic leaf labels. Append a new entry here when adding a BRD topic.

import i18n from "@/languages";

export const brdTopicLabels: Record<string, { zh: string; en: string }> = {
  "brd-engineer": { zh: "As an Engineer", en: "As an Engineer" },
  "brd-tech-lead": { zh: "As a Tech Lead", en: "As a Tech Lead" },
  "brd-product-manager": { zh: "As a Product Manager", en: "As a Product Manager" },
  "brd-ai-engineer": { zh: "As an AI Engineer", en: "As an AI Engineer" },
  "brd-new-hire": { zh: "As a New Hire", en: "As a New Hire" },
  "brd-knowledge-curator": { zh: "As a Knowledge Curator", en: "As a Knowledge Curator" },
  "brd-executive": { zh: "As an Executive", en: "As an Executive" },
  "brd-oncall-sre": { zh: "As an Oncall SRE", en: "As an Oncall SRE" }
};

export function topicLabel(topic: string): string {
  const entry = brdTopicLabels[topic];
  const lang = i18n.global.locale.value === "zh" ? "zh" : "en";
  return entry?.[lang] ?? topic;
}
