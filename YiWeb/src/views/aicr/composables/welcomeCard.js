import { getIconClass } from '/cdn/icons/iconMap.js';

const genId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const EMPTY_CARD_HTML = `
    <div class="welcome-card">
        <div class="welcome-card-header">
            <span class="welcome-card-title">当前页面</span>
        </div>
        <div class="welcome-card-section">
            <div class="welcome-card-empty">暂无页面信息</div>
        </div>
    </div>
`;

const ERROR_CARD_HTML = '<div class="welcome-card"><div class="welcome-card-empty">构建欢迎卡片失败</div></div>';

export const createSessionChatContextWelcomeCard = ({
    renderMarkdownHtml,
    formatDate,
    escapeHtml
}) => {
    const buildHeader = (title) => `
        <div class="welcome-card-header">
            <span class="welcome-card-title">${escapeHtml(title)}</span>
        </div>
    `;

    const buildUrlSection = (url) => {
        const urlId = genId('welcome-url');
        return `
            <div class="welcome-card-section">
                <div class="welcome-card-section-header">
                    <div class="welcome-card-section-title">🔗 网址</div>
                    <button type="button" class="welcome-card-action-btn" data-copy-target="${urlId}" title="复制网址" aria-label="复制网址">
                        <yi-icon name="copy"></yi-icon>
                    </button>
                </div>
                <a href="${escapeHtml(url)}" target="_blank" class="welcome-card-url" id="${urlId}">${escapeHtml(url)}</a>
            </div>
        `;
    };

    const buildDescriptionSection = (description) => {
        const descId = genId('welcome-desc');
        return `
            <div class="welcome-card-section welcome-card-description">
                <div class="welcome-card-section-header">
                    <div class="welcome-card-section-title">📝 页面描述</div>
                    <button type="button" class="welcome-card-action-btn" data-copy-text="${escapeHtml(description)}" title="复制描述" aria-label="复制描述">
                        <yi-icon name="copy"></yi-icon>
                    </button>
                </div>
                <div class="markdown-content md-preview-body" id="${descId}">${renderMarkdownHtml(description, { breaks: true, gfm: true })}</div>
            </div>
        `;
    };

    const buildTagsSection = (tags) => `
        <div class="welcome-card-section">
            <div class="welcome-card-section-title">🏷️ 标签</div>
            <div class="welcome-card-tags">
                ${tags.map(tag => `<span class="welcome-card-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
        </div>
    `;

    const buildMessagesSection = (messages) => {
        const userMessages = messages.filter(m => m.type === 'user' || m.role === 'user').length;
        return `
            <div class="welcome-card-section">
                <div class="welcome-card-section-title">💬 对话记录</div>
                <div class="welcome-card-meta">
                    <span>共 ${messages.length} 条消息</span>
                    ${userMessages > 0 ? `<span>（用户: ${userMessages} 条）</span>` : ''}
                </div>
            </div>
        `;
    };

    const buildTimeSection = (createdAt, updatedAt) => {
        const createdDate = createdAt ? new Date(createdAt) : null;
        const updatedDate = updatedAt ? new Date(updatedAt) : null;
        const hasValidCreated = createdDate && !isNaN(createdDate.getTime());
        const hasValidUpdated = updatedDate && !isNaN(updatedDate.getTime());
        const isSameTime = hasValidCreated && hasValidUpdated &&
            Math.abs(createdDate.getTime() - updatedDate.getTime()) < 60000;

        return `
            <div class="welcome-card-section">
                <div class="welcome-card-section-title">⏰ 时间信息</div>
                <div class="welcome-card-meta">
                    ${hasValidCreated ? `<span>创建: ${escapeHtml(formatDate(createdDate))}</span>` : ''}
                    ${hasValidUpdated && !isSameTime ? `<span>更新: ${escapeHtml(formatDate(updatedDate))}</span>` : ''}
                </div>
            </div>
        `;
    };

    const buildWelcomeCardHtml = (pageInfo, session = null) => {
        try {
            const sessionTags = session && Array.isArray(session.tags) ? session.tags.filter(t => t && t.trim()) : [];
            const sessionMessages = session && Array.isArray(session.messages) ? session.messages : [];
            const sessionCreatedAt = session && session.createdAt ? session.createdAt : null;
            const sessionUpdatedAt = session && session.updatedAt ? session.updatedAt : null;

            const hasSessionUrl = session && session.url && session.url.trim();
            const shouldShowUrl = !session || hasSessionUrl;

            const hasTitle = pageInfo && pageInfo.title && pageInfo.title.trim();
            const hasUrl = shouldShowUrl && pageInfo && pageInfo.url && pageInfo.url.trim();
            const hasDescription = pageInfo && pageInfo.description && pageInfo.description.trim();
            const hasAnyContent = hasTitle || hasUrl || hasDescription || sessionTags.length > 0 ||
                sessionMessages.length > 0 || sessionCreatedAt || sessionUpdatedAt;

            if (!hasAnyContent) return EMPTY_CARD_HTML;

            const sections = [
                hasTitle ? buildHeader(pageInfo.title) : '',
                hasUrl ? buildUrlSection(pageInfo.url) : '',
                hasDescription ? buildDescriptionSection(pageInfo.description) : '',
                sessionTags.length > 0 ? buildTagsSection(sessionTags) : '',
                sessionMessages.length > 0 ? buildMessagesSection(sessionMessages) : '',
                (sessionCreatedAt || sessionUpdatedAt) ? buildTimeSection(sessionCreatedAt, sessionUpdatedAt) : ''
            ];

            return `<div class="welcome-card">${sections.join('')}</div>`;
        } catch (_) {
            return ERROR_CARD_HTML;
        }
    };

    const buildWelcomeCardHtmlForSession = (session) => {
        if (!session) return '';
        try {
            const pageInfo = {
                title: session.title || '当前页面',
                url: session.url || '',
                description: session.pageDescription || ''
            };
            return buildWelcomeCardHtml(pageInfo, session);
        } catch (_) {
            return '';
        }
    };

    const bindWelcomeCardEvents = (container) => {
        if (!container) return;

        const copyButtons = container.querySelectorAll('[data-copy-target], [data-copy-text]');
        copyButtons.forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                let textToCopy = '';

                const copyTarget = btn.getAttribute('data-copy-target');
                if (copyTarget) {
                    const targetElement = container.querySelector(`#${copyTarget}`);
                    if (targetElement) {
                        textToCopy = targetElement.textContent || targetElement.innerText || '';
                    }
                }

                if (!textToCopy) {
                    const copyText = btn.getAttribute('data-copy-text');
                    if (copyText) {
                        textToCopy = copyText;
                    }
                }

                if (!textToCopy) return;

                const showOk = () => {
                    const icon = btn.querySelector('yi-icon i, .fas.fa-copy, .fas.fa-check');
                    if (!icon) return;
                    const originalClass = icon.className;
                    icon.className = getIconClass('success');
                    btn.style.color = 'rgba(34, 197, 94, 0.9)';
                    setTimeout(() => {
                        icon.className = originalClass;
                        btn.style.color = '';
                    }, 2000);
                };

                try {
                    await navigator.clipboard.writeText(textToCopy);
                    showOk();
                } catch (err) {
                    try {
                        const textArea = document.createElement('textarea');
                        textArea.value = textToCopy;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        showOk();
                    } catch (e2) {
                        try { console.warn('Copy failed:', err, e2); } catch (_) { }
                    }
                }
            });
        });
    };

    return {
        buildWelcomeCardHtml,
        buildWelcomeCardHtmlForSession,
        bindWelcomeCardEvents
    };
};
