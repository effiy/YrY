/**
 * Chat orchestration module.
 * Extracted from home/index.js per refactor-home-controller Story 3.
 */
import { state } from "./state.js";

export function createChat({
  dom,
  Chat,
  findSessionByKey,
  findNewsByKey,
  normalizeRole,
  normalizeText,
  logger,
  showToast,
  callPromptApi,
  callPromptOnce,
  saveSessionApi,
  renderList,
  isNearBottom,
  preserveScrollPosition,
  DEFAULT_MODEL,
}) {
  let chatComponent = null;

  const scrollChatToBottom = (smooth = false, force = false) => {
    if (chatComponent) {
      chatComponent.scrollToBottom(smooth, force);
    } else if (dom.chatMessages) {
       if (!force && !isNearBottom(dom.chatMessages, 100)) return;
       dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    }
  };

  const persistSessionMessages = async (session) => {
    if (!session) return;
    const now = Date.now();
    const messagesForBackend = (session.messages || []).map((m) => {
      const role = normalizeRole(m);
      return {
        type: role === "user" ? "user" : "pet",
        content: normalizeText(m),
        timestamp: m.ts || m.timestamp || now,
        imageDataUrl: m.imageDataUrl || m.image || undefined,
      };
    });

    const payload = {
      key: String(session.key || state.activeSessionKey || ""),
      url: session.url || "",
      pageTitle: (session.pageTitle && String(session.pageTitle).trim()) || session.title || "",
      pageDescription: (session.pageDescription && String(session.pageDescription).trim()) || session.preview || "",
      pageContent: session.pageContent || "",
      tags: Array.isArray(session.tags) ? session.tags : [],
      isFavorite: session.isFavorite !== undefined ? session.isFavorite : false,
      createdAt: session.createdAt || now,
      updatedAt: session.updatedAt || now,
      lastAccessTime: session.lastAccessTime || now,
      messages: messagesForBackend,
    };

    await saveSessionApi(payload, state.auth.token);
  };

  const initChatComponent = () => {
    if (chatComponent) return;
    
    chatComponent = new Chat(dom.chatMessages, {
      onMoveUp: (idx) => {
        if (state.view === 'chat') {
           const session = findSessionByKey(state.activeSessionKey);
           if (session && true) moveMessageUp(session, idx, dom.chatMessages);
        }
      },
      onMoveDown: (idx) => {
        if (state.view === 'chat') {
           const session = findSessionByKey(state.activeSessionKey);
           if (session && true) moveMessageDown(session, idx, dom.chatMessages);
        }
      },
       onDelete: async (idx, btn) => {
          if (state.view === 'chat') {
              const session = findSessionByKey(state.activeSessionKey);
              if (!session) return;
               
               if (!confirm('确定要删除这条消息吗？')) return;
               
               if (btn) {
                  btn.disabled = true;
                  btn.dataset.deleting = 'true';
                  const originalHTML = btn.innerHTML;
                  btn.innerHTML = '...';
                  btn.classList.add('is-busy');
                  
                  try {
                     if (true) await deleteMessage(session, idx, dom.chatMessages);
                  } catch (e) {
                     logger.error("render mermaid error", e);
                     showToast('删除失败: ' + (e.message || '未知错误'));
                  } finally {
                     if (btn && btn.isConnected) {
                       btn.disabled = false;
                       btn.dataset.deleting = 'false';
                       btn.innerHTML = originalHTML;
                       btn.classList.remove('is-busy');
                     }
                  }
               }
           } else if (state.view === 'newsChat') {
               const msgs = state.news.chatMessages[state.activeNewsKey];
               if (!msgs || !msgs[idx]) return;
               
               if (!confirm('确定要删除这条消息吗？')) return;

               if (btn) {
                  btn.disabled = true;
                  btn.dataset.deleting = 'true';
                  const originalHTML = btn.innerHTML;
                  btn.innerHTML = '...';
                  btn.classList.add('is-busy');

                  try {
                     msgs.splice(idx, 1);
                     renderNewsChat();
                     showToast('消息已删除');
                  } catch (e) {
                     logger.error("render mermaid error", e);
                     showToast('删除失败');
                  } finally {
                     if (btn && btn.isConnected) {
                       btn.disabled = false;
                       btn.dataset.deleting = 'false';
                       btn.innerHTML = originalHTML;
                       btn.classList.remove('is-busy');
                     }
                  }
               }
           }
       },
      onSendPrompt: (idx, btn) => {
         if (state.view === 'chat') {
             const session = findSessionByKey(state.activeSessionKey);
             if (session && true) handleSendPrompt(session, idx, btn);
         }
      },
      onRegenerate: async (idx, btn) => {
        if (btn) {
          if (btn.disabled || btn.dataset.generating === "true") return;
          btn.disabled = true;
          btn.dataset.generating = "true";
        }

        const restoreBtn = (label) => {
          if (!btn || !btn.isConnected) return;
          btn.disabled = false;
          btn.dataset.generating = "false";
          if (label) btn.textContent = label;
        };

        const originalLabel = btn ? btn.textContent : "";

        try {
          if (btn) btn.textContent = "...";

          if (state.view === "chat") {
            const session = findSessionByKey(state.activeSessionKey);
            if (!session || !Array.isArray(session.messages) || !session.messages[idx]) return;

            let userText = "";
            for (let i = idx - 1; i >= 0; i--) {
              if (normalizeRole(session.messages[i]) === "user") {
                userText = normalizeText(session.messages[i]);
                break;
              }
            }
            if (!userText) {
              showToast("找不到对应的用户消息");
              return;
            }

            let userPrompt = userText.trim();
            if (session.pageContent && String(session.pageContent).trim()) {
              userPrompt += `\n\n## 页面内容：\n\n${String(session.pageContent).trim()}`;
            }

            const systemPrompt = "你是一个专业的AI助手，请根据用户提供的消息内容和上下文进行回复。";
            const aiResponse = await callPromptOnce(systemPrompt, userPrompt);
            if (!aiResponse || !String(aiResponse).trim()) {
              showToast("AI 回复为空");
              return;
            }

            const now = Date.now();
            session.messages[idx] = { ...session.messages[idx], role: "assistant", content: String(aiResponse).trim(), ts: now };
            session.updatedAt = now;
            session.lastAccessTime = now;
            renderChat();

            try {
              await persistSessionMessages(session);
            } catch (e) {
              logger.warn("session/save failed", e);
              showToast("已重新生成，但保存到服务器失败");
              return;
            }

            showToast("已重新生成");
            return;
          }

          if (state.view === "newsChat" && state.activeNewsKey) {
            const msgs = state.news.chatMessages[state.activeNewsKey];
            if (!Array.isArray(msgs) || !msgs[idx]) return;

            const n = findNewsByKey(state.activeNewsKey);
            if (!n) return;

            let userText = "";
            for (let i = idx - 1; i >= 0; i--) {
              if (normalizeRole(msgs[i]) === "user") {
                userText = normalizeText(msgs[i]);
                break;
              }
            }
            if (!userText) {
              showToast("找不到对应的用户消息");
              return;
            }

            const systemPrompt = "你是一个专业的AI助手，请根据用户提供的消息内容和新闻内容进行回复。";
            let userPrompt = `## 新闻标题：\n${n.title || ""}\n\n`;
            if (n.description) userPrompt += `## 新闻描述：\n${n.description}\n\n`;
            userPrompt += `## 用户问题：\n${userText.trim()}`;

            const aiResponse = await callPromptOnce(systemPrompt, userPrompt);
            if (!aiResponse || !String(aiResponse).trim()) {
              showToast("AI 回复为空");
              return;
            }

            msgs[idx] = { ...msgs[idx], role: "assistant", content: String(aiResponse).trim(), ts: Date.now() };
            renderNewsChat();
            showToast("已重新生成");
          }
        } catch (e) {
          logger.error("regenerate failed", e);
          showToast("重新生成失败，请重试");
        } finally {
          restoreBtn(originalLabel);
        }
      },
      getRobots: () => [],
      onSendToRobot: () => {
        showToast("未配置机器人");
      },
    });
  };

  const renderChat = () => {
    const s = findSessionByKey(state.activeSessionKey);
    if (!s) {
      if (dom.chatMessages) {
        dom.chatMessages.innerHTML = `<div class="empty empty--transparent">
          <div class="empty__icon">💬</div>
          <div class="empty__title">找不到该会话</div>
          <div class="empty__desc">请返回会话列表重试</div>
        </div>`;
      }
      if (dom.openUrlBtn) {
        dom.openUrlBtn.hidden = true;
      }
      return;
    }

    const title = (s.pageTitle && s.pageTitle.trim()) || s.title || "会话";
    dom.chatTitle.textContent = title;

    const url = String(s.url || "").trim();
    const shouldShowOpenUrlBtn = url && (url.startsWith("http://") || url.startsWith("https://"));
    if (dom.openUrlBtn) {
      dom.openUrlBtn.hidden = !shouldShowOpenUrlBtn;
    }

    initChatComponent();
    chatComponent.render(s);
  };

  const renderNewsChat = () => {
    const n = findNewsByKey(state.activeNewsKey);
    if (!n) {
      if (dom.chatMessages) {
        dom.chatMessages.innerHTML = `<div class="empty empty--transparent">
          <div class="empty__icon">📰</div>
          <div class="empty__title">找不到该新闻</div>
          <div class="empty__desc">请返回新闻列表重试</div>
        </div>`;
      }
      if (dom.openUrlBtn) {
        dom.openUrlBtn.hidden = true;
      }
      return;
    }

    const title = n.title || "新闻";
    dom.chatTitle.textContent = title;

    const url = String(n.link || "").trim();
    const shouldShowOpenUrlBtn = url && (url.startsWith("http://") || url.startsWith("https://"));
    if (dom.openUrlBtn) {
      dom.openUrlBtn.hidden = !shouldShowOpenUrlBtn;
    }

    // Chat component expects { messages: [...] }
    const msgs = state.news.chatMessages[state.activeNewsKey] || [];
    const pseudoSession = { 
      messages: msgs, 
      id: 'news-' + state.activeNewsKey,
      title: title,
      url: url,
      pageDescription: n.description || '' 
    };

    initChatComponent();
    chatComponent.render(pseudoSession);
  };

 

  // 上移消息
  const moveMessageUp = async (session, currentIndex, container) => {
    if (!session.messages || currentIndex <= 0 || currentIndex >= session.messages.length) return;

    const allMessages = Array.from(container.querySelectorAll('.pet-chat-message[data-message-index]'));
    if (currentIndex >= allMessages.length) return;

    const currentMsgDiv = allMessages[currentIndex];
    const previousMsgDiv = allMessages[currentIndex - 1];
    if (!currentMsgDiv || !previousMsgDiv) return;

    preserveScrollPosition(container, () => {
      const temp = session.messages[currentIndex];
      session.messages[currentIndex] = session.messages[currentIndex - 1];
      session.messages[currentIndex - 1] = temp;

      currentMsgDiv.classList.add('chatMsg--animating');
      previousMsgDiv.classList.add('chatMsg--animating');
      container.insertBefore(currentMsgDiv, previousMsgDiv);

      const updatedMessages = Array.from(container.querySelectorAll('.pet-chat-message[data-message-index]'));
      updatedMessages.forEach((msgDiv, index) => {
        msgDiv.setAttribute('data-message-index', index);
      });

      session.updatedAt = Date.now();
      updateMessageActionButtons(container);
    });

    try {
      await persistSessionMessages(session);
    } catch (error) {
      logger.error("sync message order failed", error);
    }
  };

  // 下移消息
  const moveMessageDown = async (session, currentIndex, container) => {
    if (!session.messages || currentIndex < 0 || currentIndex >= session.messages.length - 1) return;

    const allMessages = Array.from(container.querySelectorAll('.pet-chat-message[data-message-index]'));
    if (currentIndex >= allMessages.length - 1) return;

    const currentMsgDiv = allMessages[currentIndex];
    const nextMsgDiv = allMessages[currentIndex + 1];
    if (!currentMsgDiv || !nextMsgDiv) return;

    preserveScrollPosition(container, () => {
      const temp = session.messages[currentIndex];
      session.messages[currentIndex] = session.messages[currentIndex + 1];
      session.messages[currentIndex + 1] = temp;

      currentMsgDiv.classList.add('chatMsg--animating');
      nextMsgDiv.classList.add('chatMsg--animating');
      currentMsgDiv.remove();
      if (nextMsgDiv.nextSibling) {
        container.insertBefore(currentMsgDiv, nextMsgDiv.nextSibling);
      } else {
        container.appendChild(currentMsgDiv);
      }

      const updatedMessages = Array.from(container.querySelectorAll('.pet-chat-message[data-message-index]'));
      updatedMessages.forEach((msgDiv, index) => {
        msgDiv.setAttribute('data-message-index', index);
      });

      session.updatedAt = Date.now();
      updateMessageActionButtons(container);
    });

    try {
      await persistSessionMessages(session);
    } catch (error) {
      logger.error("sync message order failed", error);
    }
  };

  // 构建会话上下文（参考 YiPet 项目）
  const buildConversationContext = (session, currentMsgIndex) => {
    const context = {
      messages: [],
      pageContent: '',
      hasHistory: false
    };

    if (!session) return context;

    // 获取消息历史（排除当前消息）
    if (session.messages && Array.isArray(session.messages) && session.messages.length > 0) {
      context.messages = session.messages
        .filter((msg, index) => {
          // 只包含当前消息之前的消息，排除当前消息本身
          if (index >= currentMsgIndex) return false;
          const role = normalizeRole(msg);
          return role === 'user' || role === 'assistant';
        });
      context.hasHistory = context.messages.length > 0;
    }

    // 获取页面内容
    if (session.pageContent && String(session.pageContent).trim()) {
      context.pageContent = String(session.pageContent).trim();
    }

    return context;
  };

  // 处理发送 prompt 接口
  const handleSendPrompt = async (session, msgIndex, button) => {
    if (!session || !session.messages || msgIndex < 0 || msgIndex >= session.messages.length) {
      showToast('消息不存在');
      return;
    }

    const message = session.messages[msgIndex];
    const messageContent = normalizeText(message);
    
    if (!messageContent.trim()) {
      showToast('消息内容为空，无法发送');
      return;
    }

    // 禁用按钮，显示加载状态
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '⏳';
    button.classList.add('btn--loading');

    try {
      // 构建 prompt 请求
      const systemPrompt = '你是一个专业的AI助手，请根据用户提供的消息内容和上下文进行回复。';
      
      // 构建用户提示词：只使用当前消息内容和页面上下文，不包含其他消息历史或其他内容
      let userPrompt = messageContent.trim();

      // 只添加页面上下文（pageContent），不包含页面描述、页面标题或其他消息历史
      if (session.pageContent && String(session.pageContent).trim()) {
        const pageContent = String(session.pageContent).trim();
        userPrompt += `\n\n## 页面内容：\n\n${pageContent}`;
      }

      // 调用 prompt 接口（只传递当前消息内容和页面上下文）
      const aiResponse = await callPromptOnce(systemPrompt, userPrompt);

      if (!aiResponse || !aiResponse.trim()) {
        showToast('AI 回复为空');
        return;
      }

      // 添加 AI 回复到会话（在调用接口消息之后追加）
      const now = Date.now();
      const aiMessage = {
        role: 'assistant',
        content: aiResponse.trim(),
        ts: now
      };

      // 找到调用接口消息的位置，在其后追加 AI 回复
      // 总是追加，不替换现有的回复
      const insertIndex = msgIndex + 1;
      session.messages.splice(insertIndex, 0, aiMessage);

      // 更新会话信息
      session.messageCount = session.messages.length;
      session.lastActiveAt = now;
      session.lastAccessTime = now;
      session.updatedAt = now;

      // 重新渲染聊天界面
      renderChat();

      // 保存会话到后端（参考 YiPet 项目，确保 AI 回复被保存）
      try {
        const messagesForBackend = (session.messages || []).map((m) => {
          const role = normalizeRole(m);
          return {
            type: role === "user" ? "user" : "pet",
            content: normalizeText(m),
            timestamp: m.ts || m.timestamp || now,
            imageDataUrl: m.imageDataUrl || m.image || undefined,
          };
        });

        const payload = {
          key: String(session.key || state.activeSessionKey || ""),
          url: session.url || "",
          pageTitle: (session.pageTitle && String(session.pageTitle).trim()) || session.title || "",
          pageDescription: (session.pageDescription && String(session.pageDescription).trim()) || session.preview || "",
          pageContent: session.pageContent || "",
          tags: Array.isArray(session.tags) ? session.tags : [],
          isFavorite: session.isFavorite !== undefined ? session.isFavorite : false,
          createdAt: session.createdAt || now,
          updatedAt: session.updatedAt || now,
          lastAccessTime: session.lastAccessTime || now,
          messages: messagesForBackend,
        };

        const data = await saveSessionApi(payload, state.auth.token);
        logger.info("ai reply saved", data);
      } catch (e) {
        logger.warn("session/save failed", e);
      }

      showToast('AI 回复已添加');
    } catch (error) {
      logger.error("send prompt failed", error);
      showToast('发送失败，请重试');
    } finally {
      // 恢复按钮状态
      button.disabled = false;
      button.innerHTML = originalHTML;
      button.classList.remove('btn--loading');
    }
  };

  // 删除消息
  const deleteMessage = async (session, msgIndex, container) => {
    logger.info("deleteMessage called", { sessionKey: session?.key, msgIndex, messagesLength: session?.messages?.length });
    
    if (!session || !session.messages) {
      logger.warn("deleteMessage failed: session/messages missing", { sessionKey: session?.key });
      throw new Error('会话或消息数组不存在');
    }
    
    if (msgIndex < 0 || msgIndex >= session.messages.length) {
      logger.warn("deleteMessage failed: invalid index", { msgIndex, messagesLength: session.messages.length, sessionKey: session.key });
      throw new Error(`无效的消息索引: ${msgIndex}，消息总数: ${session.messages.length}`);
    }

    // 获取所有消息元素
    const allMessages = Array.from(container.querySelectorAll('.pet-chat-message[data-message-index]'));
    logger.info("DOM message counts", { domMessagesLength: allMessages.length, arrayMessagesLength: session.messages.length });
    
    if (msgIndex >= allMessages.length) {
      logger.warn("deleteMessage mismatch, rerender", { msgIndex, domMessagesLength: allMessages.length, arrayMessagesLength: session.messages.length });
      // 如果 DOM 和数组不匹配，先尝试从数组中删除，然后重新渲染
      session.messages.splice(msgIndex, 1);
      session.messageCount = session.messages.length;
      session.updatedAt = Date.now();
      
      // 确保 state.sessions 中的会话对象也被更新
      const sessionInState = findSessionByKey(session.key);
      if (sessionInState && sessionInState !== session) {
        sessionInState.messages = session.messages;
        sessionInState.messageCount = session.messageCount;
        sessionInState.updatedAt = session.updatedAt;
      }
      
      // 直接重新渲染
      renderChat();
      return;
    }

    const msgDiv = allMessages[msgIndex];
    if (!msgDiv) {
      logger.warn("deleteMessage dom not found, rerender", { msgIndex });
      // 即使找不到DOM元素，也尝试从数组中删除，然后重新渲染
      session.messages.splice(msgIndex, 1);
      session.messageCount = session.messages.length;
      session.updatedAt = Date.now();
      
      // 确保 state.sessions 中的会话对象也被更新
      const sessionInState = findSessionByKey(session.key);
      if (sessionInState && sessionInState !== session) {
        sessionInState.messages = session.messages;
        sessionInState.messageCount = session.messageCount;
        sessionInState.updatedAt = session.updatedAt;
      }
      
      // 直接重新渲染
      renderChat();
      return;
    }

    // 保存当前滚动位置
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const msgHeight = msgDiv.offsetHeight;

    // 从数组中删除消息
    const deletedMessage = session.messages[msgIndex];
    session.messages.splice(msgIndex, 1);
    logger.info("message removed", { msgIndex, deletedMessageContent: deletedMessage?.content?.substring(0, 50), newMessagesLength: session.messages.length });

    // 更新会话信息
    session.messageCount = session.messages.length;
    session.updatedAt = Date.now();
    
    // 确保 state.sessions 中的会话对象也被更新
    const sessionInState = findSessionByKey(session.key);
    if (sessionInState && sessionInState !== session) {
      // 如果 state 中的会话对象和传入的会话对象不同，同步更新
      sessionInState.messages = session.messages;
      sessionInState.messageCount = session.messageCount;
      sessionInState.updatedAt = session.updatedAt;
      logger.info("state.sessions updated after delete");
    }

    // 从DOM中删除消息元素（添加淡出动画）
    msgDiv.classList.add('chatMsg--deleting');
    msgDiv.classList.add('chatMsg--removing');
    
    setTimeout(() => {
      // 完全重新渲染聊天界面，确保 DOM 和数组完全同步
      renderChat();

      // 恢复滚动位置（保持相对位置）
      // 重新渲染后需要重新获取 container，因为 DOM 已经重新创建
      requestAnimationFrame(() => {
        const chatContainer = dom.chatMessages;
        if (chatContainer) {
          const newScrollHeight = chatContainer.scrollHeight;
          const scrollDiff = newScrollHeight - scrollHeight;
          chatContainer.scrollTop = Math.max(0, scrollTop + scrollDiff - msgHeight);
        }
      });
    }, 200);

    // 尝试同步到后端
    try {
      const messagesForBackend = (session.messages || []).map((m) => {
        const role = normalizeRole(m);
        return {
          type: role === "user" ? "user" : "pet",
          content: normalizeText(m),
          timestamp: m.ts || m.timestamp || Date.now(),
          imageDataUrl: m.imageDataUrl || m.image || undefined,
        };
      });

      const payload = {
        key: String(session.key || state.activeSessionKey || ""),
        url: session.url || "",
        pageTitle: (session.pageTitle && String(session.pageTitle).trim()) || session.title || "",
        pageDescription: (session.pageDescription && String(session.pageDescription).trim()) || session.preview || "",
        pageContent: session.pageContent || "",
        tags: Array.isArray(session.tags) ? session.tags : [],
        isFavorite: session.isFavorite !== undefined ? session.isFavorite : false,
        createdAt: session.createdAt || Date.now(),
        updatedAt: session.updatedAt || Date.now(),
        lastAccessTime: session.lastAccessTime || Date.now(),
        messages: messagesForBackend,
      };

      const data = await saveSessionApi(payload, state.auth.token);
      logger.info("delete saved", data);
      showToast('消息已删除');
    } catch (e) {
      logger.warn("session/save failed", e);
      showToast('消息已删除，但保存到服务器失败');
    }

    // 更新会话列表（如果当前在会话列表页面）
    if (state.view === "sessions") {
      renderList();
    }
  };

  // 更新消息操作按钮的禁用状态
  const updateMessageActionButtons = (container) => {
    const allMessages = Array.from(container.querySelectorAll('.pet-chat-message[data-message-index]'));
    allMessages.forEach((msgDiv, index) => {
      const actions = msgDiv.querySelector('.pet-chat-meta-actions');
      if (!actions) return;

      const moveUpBtn = actions.querySelector('[data-action="move-up"]');
      const moveDownBtn = actions.querySelector('[data-action="move-down"]');

      if (moveUpBtn) {
        moveUpBtn.disabled = index <= 0;
      }
      if (moveDownBtn) {
        moveDownBtn.disabled = index >= allMessages.length - 1;
      }
    });
  };


  return {
    scrollChatToBottom,
    persistSessionMessages,
    initChatComponent,
    renderChat,
    renderNewsChat,
    moveMessageUp,
    moveMessageDown,
    buildConversationContext,
    handleSendPrompt,
    deleteMessage,
    updateMessageActionButtons,
    appendMessage(msg, idx, total) {
      if (chatComponent) chatComponent.append(msg, idx, total);
    },
    get chatComponent() { return chatComponent; },
  };
}
