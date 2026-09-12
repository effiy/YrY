import { ref, watch } from "vue";
import { loadBool, saveBool, loadNum, saveNum, loadStr, saveStr, loadJson, saveJson } from "@/utils/storage";

export function useRagSettings() {
  const ragEnabled = ref(loadBool("aiChat.ragEnabled", true));
  const ragHybrid = ref(loadBool("aiChat.ragHybrid", true));
  const ragRerank = ref(loadBool("aiChat.ragRerank", false));
  const ragCitations = ref(loadBool("aiChat.ragCitations", true));
  const ragNumQueries = ref(loadNum("aiChat.ragNumQueries", 1));
  const ragChatMode = ref<"condense_plus_context" | "condense_question" | "context" | "simple">(
    loadStr("aiChat.ragChatMode", "condense_plus_context") as any
  );
  const ragCategory = ref<string>(loadStr("aiChat.ragCategory", ""));
  const ragTags = ref<string[]>(loadJson<string[]>("aiChat.ragTags", []));

  watch(
    [ragEnabled, ragHybrid, ragRerank, ragCitations, ragNumQueries, ragChatMode, ragCategory, ragTags],
    () => {
      saveBool("aiChat.ragEnabled", ragEnabled.value);
      saveBool("aiChat.ragHybrid", ragHybrid.value);
      saveBool("aiChat.ragRerank", ragRerank.value);
      saveBool("aiChat.ragCitations", ragCitations.value);
      saveNum("aiChat.ragNumQueries", ragNumQueries.value);
      saveStr("aiChat.ragChatMode", ragChatMode.value);
      saveStr("aiChat.ragCategory", ragCategory.value);
      saveJson("aiChat.ragTags", ragTags.value);
    },
    { deep: true }
  );

  return {
    ragEnabled, ragHybrid, ragRerank, ragCitations, ragNumQueries,
    ragChatMode, ragCategory, ragTags,
  };
}