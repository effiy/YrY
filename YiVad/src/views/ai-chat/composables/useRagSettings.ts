import { ref, watch } from "vue";
import { loadBool, saveBool } from "@/utils/storage";

export function useRagSettings() {
  const ragEnabled = ref(loadBool("aiChat.ragEnabled", true));
  const ragHybrid = ref(loadBool("aiChat.ragHybrid", true));
  const ragRerank = ref(loadBool("aiChat.ragRerank", true));
  const ragCitations = ref(loadBool("aiChat.ragCitations", true));
  const ragHyde = ref(loadBool("aiChat.ragHyde", true));
  const ragScope = ref(localStorage.getItem("aiChat.ragScope") || "");
  const ragNumQueries = ref(Number(localStorage.getItem("aiChat.ragNumQueries") || "0"));
  const ragChatMode = ref(localStorage.getItem("aiChat.ragChatMode") || "condense_plus_context");

  watch([ragEnabled, ragHybrid, ragRerank, ragCitations, ragHyde, ragScope, ragNumQueries, ragChatMode], () => {
    saveBool("aiChat.ragEnabled", ragEnabled.value);
    saveBool("aiChat.ragHybrid", ragHybrid.value);
    saveBool("aiChat.ragRerank", ragRerank.value);
    saveBool("aiChat.ragCitations", ragCitations.value);
    saveBool("aiChat.ragHyde", ragHyde.value);
    try { localStorage.setItem("aiChat.ragScope", ragScope.value); } catch { /* ignore */ }
    try { localStorage.setItem("aiChat.ragNumQueries", String(ragNumQueries.value)); } catch { /* ignore */ }
    try { localStorage.setItem("aiChat.ragChatMode", ragChatMode.value); } catch { /* ignore */ }
  });

  return {
    ragEnabled,
    ragHybrid,
    ragRerank,
    ragCitations,
    ragHyde,
    ragScope,
    ragNumQueries,
    ragChatMode
  };
}
