/**
 * Page Context & Description — manage pageContent/pageDescription read/write/optimize/translate.
 * Extracted from home/index.js per refactor-home-controller Story 4.
 *
 * Factory pattern: accepts dependencies from the app controller.
 */
import { state } from "./state.js";

export function createPageContext({
  callPromptApi,
  fetchSessionPageContentApi,
  saveSessionApi,
  escapeHtml,
  renderMarkdown,
  renderMermaidIn,
  showToast,
  logger,
  findSessionByKey,
  onSaved,
}) {
  const DEFAULT_MODEL = "deepseek-r1:32b";

  const buildPromptPayload = (fromSystem, fromUser, modelId = DEFAULT_MODEL) => {
    const payload = {
      fromSystem: String(fromSystem || "").trim(),
      fromUser: String(fromUser || "").trim(),
      model: modelId || DEFAULT_MODEL,
    };
    const conversationKey = String(state?.activeSessionKey || "").trim();
    if (conversationKey) payload.conversation_id = conversationKey;
    return payload;
  };

  const callPromptOnce = async (systemPrompt, userPrompt) => {
    return await callPromptApi(
      systemPrompt, userPrompt, DEFAULT_MODEL,
      state?.activeSessionKey, state.auth.token,
    );
  };

  const cleanOptimizedText = (rawText) => {
    let text = String(rawText || "").trim();
    if (!text) return text;
    const quotePairs = [
      ['"', '"'], ["'", "'"], ["“", "”"], ["'", "'"],
      ["「", "」"], ["『", "』"], ["《", "》"], ['`', '`'],
    ];
    for (const [s, e] of quotePairs) {
      if (text.startsWith(s) && text.endsWith(e)) {
        text = text.slice(s.length, -e.length).trim();
        break;
      }
    }
    const prefixes = [
      /^优化后的[内容上下文]：?\s*/i,
      /^以下是优化后的[内容上下文]：?\s*/i,
      /^优化结果：?\s*/i,
      /^优化后的文本：?\s*/i,
      /^优化后的[内容上下文]如下：?\s*/i,
      /^[内容上下文]优化如下：?\s*/i,
      /^以下是[优化后的]?[内容上下文]：?\s*/i,
      /^[内容上下文][已]?优化[结果]?：?\s*/i,
      "优化后：", "优化后内容：", "优化后描述：",
      "优化后的内容：", "优化后的描述：",
      "以下是优化后的内容：", "下面是优化后的内容：",
      "以下是优化后的描述：", "下面是优化后的描述：",
    ];
    for (const p of prefixes) {
      if (typeof p === 'string') {
        if (text.startsWith(p)) { text = text.slice(p.length).trim(); break; }
      } else {
        text = text.replace(p, '').trim();
        if (text !== String(rawText || "").trim()) break;
      }
    }
    return text.trim();
  };

  const cleanAndOptimizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    let cleaned = text;
    const codeBlocks = [];
    cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    codeBlocks.forEach((block, i) => { cleaned = cleaned.replace(`__CODE_BLOCK_${i}__`, block); });
    cleaned = cleaned.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&[a-z]+;/gi, '');
    const codePlaceholders = [];
    cleaned = cleaned.replace(/```[\s\S]*?```/g, (m) => {
      const ph = `__CODE_${codePlaceholders.length}__`;
      codePlaceholders.push(m);
      return ph;
    });
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
    codePlaceholders.forEach((b, i) => { cleaned = cleaned.replace(`__CODE_${i}__`, b); });
    const protectedBlocks = [];
    cleaned = cleaned.replace(/(```[\s\S]*?```|^[\s]*[-*+]\s+|^\s*\d+\.\s+)/gm, (m) => {
      const ph = `__PROTECTED_${protectedBlocks.length}__`;
      protectedBlocks.push(m);
      return ph;
    });
    cleaned = cleaned.replace(/[ \t]+/g, (match, offset, string) => {
      const lineStart = string.lastIndexOf('\n', offset - 1) + 1;
      if (offset === lineStart) return match.includes('\t') ? '\t' : ' ';
      return ' ';
    });
    protectedBlocks.forEach((b, i) => { cleaned = cleaned.replace(`__PROTECTED_${i}__`, b); });
    cleaned = cleaned.replace(/\*\*\*\*/g, '').replace(/^#{7,}\s+/gm, '');
    return cleaned.trim();
  };

  const ensureActiveSessionForContext = () => {
    const key = state.activeSessionKey;
    if (!key) { window.alert("请先在会话列表中选择一个会话，再使用页面上下文功能。"); return null; }
    const s = findSessionByKey(key);
    if (!s) { window.alert("找不到当前会话，请返回列表后重试。"); return null; }
    return s;
  };

  const ensureActiveSessionForPageDesc = () => {
    const key = state.activeSessionKey;
    if (!key) { window.alert("请先在会话列表中选择一个会话，再使用页面描述功能。"); return null; }
    const s = findSessionByKey(key);
    if (!s) { window.alert("找不到当前会话，请返回列表后重试。"); return null; }
    return s;
  };

  const withButtonLoading = async (btn, loadingText, fn) => {
    if (!btn) return fn();
    const origText = btn.textContent, origDisabled = btn.disabled;
    btn.disabled = true;
    if (loadingText) btn.textContent = loadingText;
    btn.classList.add("btn--loading");
    try { return await fn(); } finally {
      btn.disabled = origDisabled;
      btn.textContent = origText;
      btn.classList.remove("btn--loading");
    }
  };

  const normalizeGeneratedDescription = (rawText, maxChars = null) => {
    let text = cleanOptimizedText(rawText);
    if (!text) return "";
    text = String(text).replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (maxChars === null || text.length <= maxChars) return text;
    return text;
  };

  // ---- context sheet rendering (needs dom refs) ----

  let dom = {}; // set via init()
  let contextPreviewMode = true;
  let pageDescPreviewMode = true;

  const renderContextSheet = () => {
    if (!dom.contextContent) return;
    const s = findSessionByKey(state.activeSessionKey);
    if (!s) {
      dom.contextContent.innerHTML = '<div class="contextSection"><div class="contextValue">请返回会话列表重新选择一个会话后再试。</div></div>';
      return;
    }
    const content = String(s.pageContent || "").trim();
    if (!content) {
      dom.contextContent.innerHTML = '<div class="contextSection"><div class="contextValue context-empty">暂无页面上下文内容。点击下方按钮可通过 AI 智能优化生成。</div></div>';
      return;
    }
    const toggleLabel = contextPreviewMode ? '编辑' : '预览';
    const toggleAction = contextPreviewMode ? 'toggleContextMode' : 'toggleContextMode';
    if (contextPreviewMode) {
      dom.contextContent.innerHTML = `<div class="contextSection">
        <div class="contextLabel">当前页面上下文（pageContent）<button type="button" class="modeToggleBtn" data-action="${toggleAction}">${toggleLabel}</button></div>
        <div class="contextValue chatBubble--md">${renderMarkdown(content)}</div>
      </div>`;
      renderMermaidIn(dom.contextContent);
    } else {
      dom.contextContent.innerHTML = `<div class="contextSection">
        <div class="contextLabel">当前页面上下文（pageContent）<button type="button" class="modeToggleBtn" data-action="${toggleAction}">${toggleLabel}</button></div>
        <div class="contextValue" contenteditable="true" id="contextEditable">${escapeHtml(content)}</div>
      </div>`;
    }
  };

  const renderPageDescSheet = () => {
    if (!dom.pageDescContent) return;
    const s = findSessionByKey(state.activeSessionKey);
    if (!s) {
      dom.pageDescContent.innerHTML = '<div class="contextSection"><div class="contextValue">请返回会话列表重新选择一个会话后再试。</div></div>';
      return;
    }
    const desc = String(s.pageDescription || "").trim();
    if (!desc) {
      dom.pageDescContent.innerHTML = '<div class="contextSection"><div class="contextValue pagedesc-empty">暂无页面描述。点击下方按钮可通过 AI 智能生成。</div></div>';
      return;
    }
    const toggleLabel = pageDescPreviewMode ? '编辑' : '预览';
    const toggleAction = 'togglePageDescMode';
    if (pageDescPreviewMode) {
      dom.pageDescContent.innerHTML = `<div class="contextSection">
        <div class="contextLabel">当前页面描述（pageDescription）<button type="button" class="modeToggleBtn" data-action="${toggleAction}">${toggleLabel}</button></div>
        <div class="contextValue chatBubble--md">${renderMarkdown(desc)}</div>
      </div>`;
      renderMermaidIn(dom.pageDescContent);
    } else {
      dom.pageDescContent.innerHTML = `<div class="contextSection">
        <div class="contextLabel">当前页面描述（pageDescription）<button type="button" class="modeToggleBtn" data-action="${toggleAction}">${toggleLabel}</button></div>
        <div class="contextValue" contenteditable="true" id="pageDescEditable">${escapeHtml(desc)}</div>
      </div>`;
    }
  };

  function toggleContextMode() {
    if (!contextPreviewMode) {
      const editable = document.getElementById("contextEditable");
      if (editable) {
        const s = findSessionByKey(state.activeSessionKey);
        if (s) s.pageContent = String(editable.innerText || editable.textContent || "").trim();
      }
    }
    contextPreviewMode = !contextPreviewMode;
    renderContextSheet();
  }

  function togglePageDescMode() {
    if (!pageDescPreviewMode) {
      const editable = document.getElementById("pageDescEditable");
      if (editable) {
        const s = findSessionByKey(state.activeSessionKey);
        if (s) s.pageDescription = String(editable.innerText || editable.textContent || "").trim();
      }
    }
    pageDescPreviewMode = !pageDescPreviewMode;
    renderPageDescSheet();
  }

  // ---- public API ----

  async function openContext() {
    if (!dom.contextSheet || !dom.contextSheetMask) return;
    const s = ensureActiveSessionForContext();
    if (!s) return;
    dom.contextSheetMask.hidden = false;
    dom.contextSheet.classList.add("is-open");
    dom.contextSheet.setAttribute("aria-hidden", "false");
    if (!s.pageContent || !String(s.pageContent).trim()) {
      dom.contextContent.innerHTML = '<div class="contextSection"><div class="contextValue">正在加载页面上下文...</div></div>';
      try {
        const loaded = await fetchSessionPageContentApi(s, state.auth.token);
        if (loaded) { s.pageContent = loaded; try { await saveSessionApi(s, state.auth.token); } catch {} }
      } catch (e) { logger.warn("fetchSessionPageContent failed", e); }
    }
    renderContextSheet();
  }

  function closeContext() {
    if (!dom.contextSheet || !dom.contextSheetMask) return;
    dom.contextSheet.classList.remove("is-open");
    dom.contextSheet.setAttribute("aria-hidden", "true");
    setTimeout(() => { if (!dom.contextSheet.classList.contains("is-open")) dom.contextSheetMask.hidden = true; }, 300);
  }

  function openPageDescription() {
    if (!dom.pageDescSheet || !dom.pageDescSheetMask) return;
    const s = ensureActiveSessionForPageDesc();
    if (!s) return;
    dom.pageDescSheetMask.hidden = false;
    dom.pageDescSheet.classList.add("is-open");
    dom.pageDescSheet.setAttribute("aria-hidden", "false");
    renderPageDescSheet();
  }

  function closePageDescription() {
    if (!dom.pageDescSheet || !dom.pageDescSheetMask) return;
    dom.pageDescSheet.classList.remove("is-open");
    dom.pageDescSheet.setAttribute("aria-hidden", "true");
    setTimeout(() => { if (!dom.pageDescSheet.classList.contains("is-open")) dom.pageDescSheetMask.hidden = true; }, 300);
  }

  async function optimizePageContext() {
    const s = ensureActiveSessionForContext();
    if (!s) return;
    const current = String(s.pageContent || "").trim();
    if (!current) { window.alert("当前会话没有可优化的页面上下文内容（pageContent）。"); return; }
    const btn = document.querySelector('button[data-action="optimizePageContext"]');
    await withButtonLoading(btn, "优化中...", async () => {
      const systemPrompt = `你是一个专业的文档内容优化专家。请优化页面上下文内容，重点保留原文信息，去除无意义内容，优化HTML标签。`;
      const userPrompt = `请优化以下页面上下文内容：\n\n原始内容：\n${current}\n\n请直接返回优化后的Markdown内容，不要包含任何说明文字。`;
      const result = await callPromptOnce(systemPrompt, userPrompt);
      let cleaned = cleanAndOptimizeText(cleanOptimizedText(result));
      if (!cleaned || cleaned.length < 10) throw new Error('优化后的文本过短，可能优化失败，请重试');
      if (cleaned === current) { window.alert(`优化后的内容与原文相同，已保持原内容。`); return; }
      s.pageContent = cleaned;
      s.updatedAt = Date.now();
      renderContextSheet();
      try { await saveSessionApi(s, state.auth.token); showToast("页面上下文已优化并保存"); }
      catch (e) { logger.warn("save pageContent failed", e); showToast("已优化但保存失败，请重试"); }
    });
  }

  async function translatePageContext(targetLanguage) {
    const s = ensureActiveSessionForContext();
    if (!s) return;
    const current = String(s.pageContent || "").trim();
    if (!current) { window.alert("当前会话没有可翻译的页面上下文内容。"); return; }
    const langName = targetLanguage === 'zh' ? '中文' : 'English';
    const btn = document.querySelector(`button[data-action="translatePageContext${targetLanguage === 'zh' ? 'Zh' : 'En'}"]`);
    await withButtonLoading(btn, "翻译中...", async () => {
      const systemPrompt = `你是一个专业的翻译专家，请将内容翻译为${langName}。`;
      const userPrompt = `请将以下内容翻译为${langName}：\n\n${current}\n\n请直接返回翻译后的内容，不要包含任何说明文字。`;
      const result = await callPromptOnce(systemPrompt, userPrompt);
      let cleaned = cleanAndOptimizeText(cleanOptimizedText(result));
      if (!cleaned || cleaned.length < 5) throw new Error('翻译后的文本过短，可能翻译失败');
      s.pageContent = cleaned;
      s.updatedAt = Date.now();
      renderContextSheet();
      try { await saveSessionApi(s, state.auth.token); showToast(`已翻译为${langName}并保存`); }
      catch (e) { logger.warn("save translated pageContent failed", e); showToast("已翻译但保存失败"); }
    });
  }

  async function savePageContext() {
    const s = ensureActiveSessionForContext();
    if (!s) return;
    const editable = document.getElementById("contextEditable");
    const newContent = editable ? String(editable.innerText || editable.textContent || "").trim() : String(s.pageContent || "").trim();
    s.pageContent = newContent;
    s.updatedAt = Date.now();
    try {
      await saveSessionApi(s, state.auth.token);
      showToast("页面上下文已保存");
      closeContext();
      if (typeof onSaved === "function") onSaved(s);
    }
    catch (e) { logger.warn("save pageContent failed", e); showToast("保存失败，请重试"); }
  }

  async function generatePageDescription() {
    const s = ensureActiveSessionForPageDesc();
    if (!s) return;
    const pageContent = String(s.pageContent || "").trim();
    const btn = document.querySelector('button[data-action="generatePageDescription"]');
    await withButtonLoading(btn, "生成中...", async () => {
      let input = pageContent || String(s.title || "").trim();
      if (!input) { window.alert("当前会话没有页面上下文或标题，无法生成描述。"); return; }
      const systemPrompt = "你是一个专业的内容摘要专家，擅长从页面内容中提取关键信息并生成简洁的描述。";
      const userPrompt = `请从以下内容生成一段简洁的页面描述（1-3句话）：\n\n${input}\n\n请直接返回描述文本。`;
      const result = await callPromptOnce(systemPrompt, userPrompt);
      let desc = normalizeGeneratedDescription(result);
      if (!desc) throw new Error("生成的描述为空");
      s.pageDescription = desc;
      s.updatedAt = Date.now();
      renderPageDescSheet();
      try { await saveSessionApi(s, state.auth.token); showToast("页面描述已生成并保存"); }
      catch (e) { logger.warn("save pageDescription failed", e); showToast("已生成但保存失败"); }
    });
  }

  async function translatePageDescription(targetLanguage) {
    const s = ensureActiveSessionForPageDesc();
    if (!s) return;
    const current = String(s.pageDescription || "").trim();
    if (!current) { window.alert("当前会话没有可翻译的页面描述。"); return; }
    const langName = targetLanguage === 'zh' ? '中文' : 'English';
    const btn = document.querySelector(`button[data-action="translatePageDescription${targetLanguage === 'zh' ? 'Zh' : 'En'}"]`);
    await withButtonLoading(btn, "翻译中...", async () => {
      const systemPrompt = `你是一个专业的翻译专家，请将内容翻译为${langName}。`;
      const userPrompt = `请将以下内容翻译为${langName}：\n\n${current}\n\n请直接返回翻译后的内容。`;
      const result = await callPromptOnce(systemPrompt, userPrompt);
      let desc = normalizeGeneratedDescription(result);
      if (!desc) throw new Error("翻译后的描述为空");
      s.pageDescription = desc;
      s.updatedAt = Date.now();
      renderPageDescSheet();
      try { await saveSessionApi(s, state.auth.token); showToast(`已翻译为${langName}并保存`); }
      catch (e) { logger.warn("save translated description failed", e); showToast("已翻译但保存失败"); }
    });
  }

  async function savePageDescription() {
    const s = ensureActiveSessionForPageDesc();
    if (!s) return;
    const editable = document.getElementById("pageDescEditable");
    const newDesc = editable ? String(editable.innerText || editable.textContent || "").trim() : String(s.pageDescription || "").trim();
    s.pageDescription = newDesc;
    s.updatedAt = Date.now();
    try {
      await saveSessionApi(s, state.auth.token);
      showToast("页面描述已保存");
      closePageDescription();
      if (typeof onSaved === "function") onSaved(s);
    }
    catch (e) { logger.warn("save pageDescription failed", e); showToast("保存失败，请重试"); }
  }

  /** Set DOM references (called once after init). */
  function init(deps) {
    Object.assign(dom, deps);
  }

  return {
    init,
    openContext,
    closeContext,
    openPageDescription,
    closePageDescription,
    optimizePageContext,
    translatePageContext,
    savePageContext,
    generatePageDescription,
    translatePageDescription,
    savePageDescription,
    renderContextSheet,
    renderPageDescSheet,
    toggleContextMode,
    togglePageDescMode,
  };
}
