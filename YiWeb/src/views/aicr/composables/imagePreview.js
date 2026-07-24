const PREVIEW_STYLE_ID = 'aicr-image-preview-style';
const PREVIEW_ROOT_ID = 'aicr-image-preview';

const PREVIEW_STYLE_CSS = `
    #aicr-image-preview{color:var(--yi-text-on-primary);opacity:0;pointer-events:auto;transition:opacity 140ms ease}
    #aicr-image-preview.is-open{opacity:1}
    #aicr-image-preview .aicr-image-preview-frame{position:relative;max-width:min(96vw,1400px);max-height:96vh;transform:translate3d(0,6px,0) scale(.985);opacity:.98;transition:transform 160ms cubic-bezier(.2,.9,.2,1),opacity 160ms ease}
    #aicr-image-preview.is-open .aicr-image-preview-frame{transform:translate3d(0,0,0) scale(1);opacity:1}
    #aicr-image-preview .aicr-image-preview-img{display:block;max-width:96vw;max-height:96vh;border-radius:14px;box-shadow:0 20px 80px rgba(var(--yi-dark-surface-rgb), 0.55);background:rgba(var(--yi-dark-text-secondary-rgb), 0.06);object-fit:contain}
    #aicr-image-preview .aicr-image-preview-toolbar{position:absolute;top:10px;right:10px;display:flex;gap:8px;align-items:center}
    #aicr-image-preview .aicr-image-preview-btn{position:relative;top:auto;right:auto;transform:none;height:34px;padding:0 12px;border-radius:12px;border:1px solid rgba(var(--yi-dark-text-secondary-rgb), 0.22);background:rgba(var(--yi-dark-surface-rgb), 0.38);color:var(--yi-text-on-primary);font-size:13px;cursor:pointer;backdrop-filter:blur(10px)}
    #aicr-image-preview .aicr-image-preview-close{position:relative;top:auto;right:auto;transform:none;width:38px;height:38px;padding:0;font-size:18px;background:rgba(var(--yi-dark-surface-rgb), 0.46)}
    #aicr-image-preview .aicr-image-preview-btn:hover{background:rgba(var(--yi-dark-surface-rgb), 0.6);border-color:rgba(255,255,255,0.3)}
    #aicr-image-preview .aicr-image-preview-btn:active{transform:translateY(1px)}
`.trim();

const PREVIEW_ROOT_HTML = `
    <div class="aicr-image-preview-frame">
        <img class="aicr-image-preview-img" alt="预览图片" />
        <div class="aicr-image-preview-toolbar" aria-label="图片工具栏">
            <button type="button" class="aicr-image-preview-btn aicr-image-preview-download" title="下载" aria-label="下载">下载</button>
            <button type="button" class="aicr-image-preview-btn aicr-image-preview-close" title="关闭（Esc）" aria-label="关闭">✕</button>
        </div>
    </div>
`;

const buildFilenameFromUrl = (url, contentType = '') => {
    try {
        const raw = String(url || '').trim();
        const fromUrl = (() => {
            try {
                if (!raw || raw.startsWith('data:')) return '';
                const u = new URL(raw, window.location.href);
                const parts = String(u.pathname || '').split('/').filter(Boolean);
                const last = parts.length ? parts[parts.length - 1] : '';
                const base = decodeURIComponent(last || '').trim();
                if (!base) return '';
                if (base.includes('.')) return base;
                return '';
            } catch (_) {
                return '';
            }
        })();
        if (fromUrl) return fromUrl;

        const ext = (() => {
            const ct = String(contentType || '').toLowerCase();
            if (ct.includes('png')) return 'png';
            if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
            if (ct.includes('webp')) return 'webp';
            if (ct.includes('gif')) return 'gif';
            if (ct.includes('svg')) return 'svg';
            if (raw.startsWith('data:image/')) {
                const m = raw.match(/^data:image\/([a-zA-Z0-9.+-]+);/);
                const k = String(m?.[1] || '').toLowerCase();
                if (k === 'jpeg') return 'jpg';
                if (k) return k;
            }
            return 'png';
        })();
        return `image_${Date.now()}.${ext}`;
    } catch (_) {
        return `image_${Date.now()}.png`;
    }
};

const triggerDownload = (href, filename) => {
    try {
        const a = document.createElement('a');
        a.href = String(href || '').trim();
        a.download = String(filename || '').trim() || `image_${Date.now()}.png`;
        a.rel = 'noopener';
        a.target = '_self';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (_) { }
};

export const createAicrImagePreview = () => {
    let root = null;
    let src = '';
    let styleMounted = false;
    let closeTimer = 0;
    let prevActiveEl = null;
    let keydownHandler = null;
    let globalClickHandler = null;

    const downloadCurrent = async () => {
        const url = String(src || '').trim();
        if (!url) return;

        if (url.startsWith('data:')) {
            triggerDownload(url, buildFilenameFromUrl(url));
            return;
        }

        try {
            const res = await fetch(url, { credentials: 'same-origin' });
            if (!res || !res.ok) throw new Error('download_failed');
            const blob = await res.blob();
            const filename = buildFilenameFromUrl(url, blob?.type || res.headers?.get?.('content-type') || '');
            const objectUrl = URL.createObjectURL(blob);
            triggerDownload(objectUrl, filename);
            setTimeout(() => {
                try { URL.revokeObjectURL(objectUrl); } catch (_) { }
            }, 1200);
        } catch (_) {
            try {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (_) { }
        }
    };

    const ensureStyle = () => {
        try {
            if (styleMounted) return;
            if (typeof document === 'undefined') return;
            const existing = document.getElementById(PREVIEW_STYLE_ID);
            if (existing) {
                styleMounted = true;
                return;
            }
            const style = document.createElement('style');
            style.id = PREVIEW_STYLE_ID;
            style.textContent = PREVIEW_STYLE_CSS;
            document.head.appendChild(style);
            styleMounted = true;
        } catch (_) { }
    };

    const close = ({ immediate = false } = {}) => {
        try {
            if (!root) return;
            if (closeTimer) clearTimeout(closeTimer);
            closeTimer = 0;
            if (root.classList) root.classList.remove('is-open');
            if (immediate) {
                root.style.display = 'none';
            } else {
                const r = root;
                closeTimer = setTimeout(() => {
                    try { if (r) r.style.display = 'none'; } catch (_) { }
                }, 170);
            }
            src = '';
            try {
                const prev = prevActiveEl;
                prevActiveEl = null;
                if (prev && typeof prev.focus === 'function') prev.focus({ preventScroll: true });
            } catch (_) { }
        } catch (_) { }
    };

    const isOpen = () => {
        try {
            return !!(root && root.style.display === 'flex');
        } catch (_) {
            return false;
        }
    };

    const open = (incomingSrc) => {
        try {
            const url = String(incomingSrc || '').trim();
            if (!url) return;
            if (!root) {
                ensureStyle();
                const el = document.createElement('div');
                el.id = PREVIEW_ROOT_ID;
                el.className = 'aicr-image-preview';
                el.setAttribute('role', 'dialog');
                el.setAttribute('aria-modal', 'true');
                el.style.cssText = 'position:fixed;inset:0;z-index:var(--z-overlay);display:none;align-items:center;justify-content:center;padding:18px;background:rgba(var(--yi-dark-surface-rgb), 0.72);backdrop-filter:blur(2px)';
                el.innerHTML = PREVIEW_ROOT_HTML;
                el.addEventListener('click', (e) => {
                    try {
                        const t = e && e.target;
                        const closeBtn = t && t.closest ? t.closest('.aicr-image-preview-close') : null;
                        if (closeBtn) {
                            if (e && typeof e.preventDefault === 'function') e.preventDefault();
                            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                            close({ immediate: true });
                            return;
                        }
                        const downloadBtn = t && t.closest ? t.closest('.aicr-image-preview-download') : null;
                        if (downloadBtn) {
                            if (e && typeof e.preventDefault === 'function') e.preventDefault();
                            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                            downloadCurrent();
                            return;
                        }
                        const frame = t && t.closest ? t.closest('.aicr-image-preview-frame') : null;
                        if (!frame) close({ immediate: false });
                    } catch (_) { }
                });
                document.body.appendChild(el);
                root = el;

                if (!keydownHandler) {
                    keydownHandler = (e) => {
                        try {
                            if (!isOpen()) return;
                            if (!e) return;
                            const key = String(e.key || '');
                            if (key !== 'Escape' && key !== 'Esc') return;
                            if (typeof e.preventDefault === 'function') e.preventDefault();
                            if (typeof e.stopPropagation === 'function') e.stopPropagation();
                            close({ immediate: true });
                        } catch (_) { }
                    };
                    document.addEventListener('keydown', keydownHandler, true);
                }
            }
            const img = root.querySelector('.aicr-image-preview-img');
            if (img) img.src = url;
            if (closeTimer) clearTimeout(closeTimer);
            closeTimer = 0;
            root.style.display = 'flex';
            if (root.classList) root.classList.remove('is-open');
            requestAnimationFrame(() => {
                try {
                    if (root && root.classList) root.classList.add('is-open');
                } catch (_) { }
            });
            src = url;
            try {
                prevActiveEl = document.activeElement || null;
                const closeBtn = root.querySelector('.aicr-image-preview-close');
                if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus({ preventScroll: true });
            } catch (_) { }
        } catch (_) { }
    };

    const mountGlobalImageClickTrigger = () => {
        try {
            if (globalClickHandler || typeof document === 'undefined') return;
            globalClickHandler = (e) => {
                try {
                    const t = e && e.target;
                    if (!t || t.nodeType !== 1) return;
                    if (t.closest && t.closest(`#${PREVIEW_ROOT_ID}`)) return;
                    const img = t.closest ? t.closest('img') : null;
                    if (!img) return;
                    const msg = img.closest ? img.closest('.pet-chat-message') : null;
                    if (!msg) return;
                    const bubble = img.closest ? img.closest('.pet-chat-bubble') : null;
                    if (!bubble) return;
                    const container = bubble.closest ? bubble.closest('#pet-chat-messages') : null;
                    if (!container) return;
                    const srcAttr = String(img.currentSrc || img.getAttribute?.('src') || '').trim();
                    if (!srcAttr) return;
                    if (typeof e.preventDefault === 'function') e.preventDefault();
                    if (typeof e.stopPropagation === 'function') e.stopPropagation();
                    open(srcAttr);
                } catch (_) { }
            };
            document.addEventListener('click', globalClickHandler, true);
        } catch (_) { }
    };

    return {
        open,
        close,
        isOpen,
        mountGlobalImageClickTrigger
    };
};
