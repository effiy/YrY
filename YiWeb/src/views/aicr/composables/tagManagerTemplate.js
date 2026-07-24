export const TAG_MANAGER_HTML = `
    <div id="aicr-tag-manager" class="tag-manager-modal">
        <div class="tag-manager-content">
            <div class="tag-manager-header">
                <h3>标签管理</h3>
                <button class="tag-manager-close" title="关闭">×</button>
            </div>
            <div class="tag-manager-body">
                <div class="tag-manager-input-group">
                    <input type="text" class="tag-manager-input" placeholder="输入标签，回车添加..." />
                    <button class="tag-manager-add" title="添加标签">+</button>
                </div>
                <div class="tag-manager-quick-tags">
                    <div class="quick-tags-header">
                        <span>快捷标签</span>
                        <button class="quick-tags-refresh" title="刷新快捷标签">↻</button>
                    </div>
                    <div class="quick-tags-list"></div>
                </div>
                <div class="tag-manager-tags"></div>
            </div>
            <div class="tag-manager-footer">
                <button class="tag-manager-save">保存</button>
                <button class="tag-manager-cancel">取消</button>
            </div>
        </div>
    </div>
`;

export const TAG_MANAGER_CSS = `
    .tag-manager-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(var(--yi-dark-surface-rgb), 0.72);
        z-index: var(--z-overlay);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    }
    .tag-manager-content {
        background: var(--yi-surface-elevated, rgba(30, 41, 59, 0.92));
        border-radius: 16px;
        width: 720px;
        max-width: 92%;
        max-height: 80%;
        display: flex;
        flex-direction: column;
        color-scheme: dark;
        border: 1px solid var(--yi-border-subtle, rgba(255, 255, 255, 0.1));
        box-shadow: var(--yi-shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.6));
        backdrop-filter: blur(14px);
    }
    .tag-manager-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--yi-border, rgba(255, 255, 255, 0.12));
    }
    .tag-manager-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--yi-code-text, #F8FAFC);
    }
    .tag-manager-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--yi-text-muted, #94A3B8);
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    .tag-manager-close:hover {
        background: var(--yi-surface-hover, rgba(51, 65, 85, 0.7));
        color: var(--yi-code-text, #F8FAFC);
    }
    .tag-manager-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }
    .tag-manager-input-group {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
    }
    .tag-manager-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--yi-border, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
        font-size: 14px;
        background: rgba(var(--yi-dark-surface-rgb), 0.55);
        color: var(--yi-code-text, #F8FAFC);
    }
    .tag-manager-input::placeholder {
        color: var(--yi-text-muted, #94A3B8);
    }
    .tag-manager-input:focus {
        outline: none;
        border-color: var(--yi-border-focus, #06b6d4);
        box-shadow: 0 0 0 3px rgba(var(--yi-info-rgb), 0.18);
    }
    .tag-manager-add {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--yi-primary, #2563EB);
        color: white;
        border: none;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(var(--yi-primary-rgb), 0.25);
    }
    .tag-manager-add:hover {
        background: var(--yi-primary-hover, #1D4ED8);
    }
    .tag-manager-quick-tags {
        margin-bottom: 16px;
        padding: 12px;
        background: var(--yi-surface, rgba(30, 41, 59, 0.6));
        border-radius: 14px;
        border: 1px solid var(--yi-border-subtle, rgba(255, 255, 255, 0.1));
    }
    .quick-tags-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;
        color: var(--yi-text-secondary, #E2E8F0);
        font-weight: 500;
    }
    .quick-tags-refresh {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--yi-text-muted, #94A3B8);
        font-size: 14px;
        padding: 2px 6px;
        border-radius: 4px;
    }
    .quick-tags-refresh:hover {
        background: var(--yi-surface-hover, rgba(51, 65, 85, 0.7));
        color: var(--yi-code-text, #F8FAFC);
    }
    .quick-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
    }
    .quick-tag-btn {
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(2, 6, 23, 0.28);
        border: 1px solid rgba(51, 65, 85, 0.75);
        font-size: 11px;
        line-height: 1.2;
        cursor: pointer;
        color: rgba(226, 232, 240, 0.9);
        transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
    }
    .quick-tag-btn:hover {
        background: rgba(51, 65, 85, 0.35);
        border-color: rgba(148, 163, 184, 0.28);
    }
    .quick-tag-btn.active {
        background: rgba(79, 70, 229, 0.25);
        border-color: rgba(79, 70, 229, 0.55);
        color: rgba(226, 232, 240, 0.95);
    }
    .tag-manager-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
    }
    .tag-item {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(2, 6, 23, 0.28);
        border: 1px solid rgba(51, 65, 85, 0.75);
        color: rgba(226, 232, 240, 0.92);
        font-size: 11px;
        line-height: 1.2;
        gap: 6px;
    }
    .tag-item .tag-remove {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: var(--yi-text-muted, #94A3B8);
        padding: 0;
    }
    .tag-item .tag-remove:hover {
        background: rgba(255, 255, 255, 0.18);
        color: var(--yi-code-text, #F8FAFC);
    }
    .tag-manager-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 16px 20px;
        border-top: 1px solid var(--yi-border, rgba(255, 255, 255, 0.12));
    }
    .tag-manager-save {
        padding: 8px 16px;
        background: var(--yi-primary, #2563EB);
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 26px rgba(var(--yi-primary-rgb), 0.25);
    }
    .tag-manager-save:hover {
        background: var(--yi-primary-hover, #1D4ED8);
    }
    .tag-manager-cancel {
        padding: 8px 16px;
        background: rgba(15, 23, 42, 0.35);
        color: rgba(226, 232, 240, 0.92);
        border: 1px solid rgba(51, 65, 85, 0.85);
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
    }
    .tag-manager-cancel:hover {
        background: rgba(30, 41, 59, 0.65);
        border-color: rgba(148, 163, 184, 0.28);
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
