/**
 * YrY · H5 Preview — image preview overlay with navigation and save
 *
 * All HTML rendering is driven by template.html.
 * The overlay DOM structure lives in template.html and is created once at init().
 */

import { loadTemplate } from "../../../../utils/h5/template.js";

/* ── Template loading (sync, at module init) ─────────────────────────────── */
const tpl = loadTemplate("Preview", new URL("./template.html", import.meta.url).href);

// ── State ──
let overlayEl = null;
let imgEl, prevBtn, nextBtn, countEl = null;
let imgStack = [];
let currentIdx = 0;
let longPressTimer = null;

// ── Public API ──

function init(target) {
  if (overlayEl) return;
  overlayEl = _createOverlay();
  (target || document.body).appendChild(overlayEl);

  imgEl = overlayEl.querySelector("#imgPreviewImg");
  prevBtn = overlayEl.querySelector("#imgPreviewPrevBtn");
  nextBtn = overlayEl.querySelector("#imgPreviewNextBtn");
  countEl = overlayEl.querySelector("#imgPreviewCount");

  overlayEl.addEventListener("click", _handleClick);
  overlayEl.addEventListener("mousedown", _startLongPress);
  overlayEl.addEventListener("touchstart", _startLongPress, { passive: true });
  overlayEl.addEventListener("mouseup", _cancelLongPress);
  overlayEl.addEventListener("touchend", _cancelLongPress);
  overlayEl.addEventListener("mouseleave", _cancelLongPress);
  overlayEl.addEventListener("contextmenu", (e) => e.preventDefault());
}

function show(srcs, startIdx = 0) {
  if (!overlayEl) return;
  imgStack = Array.isArray(srcs) ? srcs.filter(Boolean) : [srcs].filter(Boolean);
  currentIdx = Math.max(0, Math.min(startIdx, imgStack.length - 1));
  if (imgStack.length === 0) return;
  _renderCurrent();
  overlayEl.hidden = false;
  overlayEl.setAttribute("aria-hidden", "false");
}

function hide() {
  if (!overlayEl) return;
  _cancelLongPress();
  overlayEl.hidden = true;
  overlayEl.setAttribute("aria-hidden", "true");
}

// ── Internal ──

function _createOverlay() {
  const el = document.createElement("div");
  el.id = "imgPreviewOverlay";
  el.className = "imgPreviewOverlay";
  el.hidden = true;
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = tpl.render('tpl-img-preview-overlay', {});
  return el;
}

function _renderCurrent() {
  if (!imgEl || imgStack.length === 0) return;
  imgEl.src = imgStack[currentIdx] || "";
  const hasMultiple = imgStack.length > 1;
  prevBtn.hidden = !hasMultiple;
  nextBtn.hidden = !hasMultiple;
  if (hasMultiple) {
    countEl.hidden = false;
    countEl.textContent = `${currentIdx + 1} / ${imgStack.length}`;
  } else {
    countEl.hidden = true;
  }
}

function _handleClick(e) {
  const action = e.target.closest("[data-action]");
  if (!action) {
    if (e.target.classList.contains("imgPreviewOverlay__backdrop") || e.target.id === "imgPreviewOverlay") hide();
    return;
  }
  switch (action.dataset.action) {
    case "closeImgPreview": hide(); break;
    case "imgPreviewPrev": _nav(-1); break;
    case "imgPreviewNext": _nav(1); break;
    case "saveImgPreview": _saveImage(); break;
    case "closeImgPreviewActions": _closeActions(); break;
  }
}

function _nav(dir) { currentIdx = (currentIdx + dir + imgStack.length) % imgStack.length; _renderCurrent(); }

function _startLongPress(e) {
  if (e.target.closest("[data-action]")) return;
  _cancelLongPress();
  longPressTimer = setTimeout(_showActions, 500);
}

function _cancelLongPress() { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } }

function _showActions() {
  const el = overlayEl.querySelector("#imgPreviewActions");
  if (el) { el.hidden = false; el.setAttribute("aria-hidden", "false"); }
}

function _closeActions() {
  const el = overlayEl.querySelector("#imgPreviewActions");
  if (el) { el.hidden = true; el.setAttribute("aria-hidden", "true"); }
}

async function _saveImage() {
  _closeActions();
  try {
    const src = imgEl.src;
    if (!src) return;
    const blob = await fetch(src).then(r => r.blob());
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `image_${Date.now()}.${blob.type.split("/")[1] || "png"}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    _showToast("图片已保存");
  } catch { _showToast("保存失败，请重试"); }
}

function _showToast(msg) {
  const toast = overlayEl.querySelector("#imgPreviewToast");
  const text = overlayEl.querySelector("#imgPreviewToastText");
  if (!toast || !text) return;
  text.textContent = msg;
  toast.hidden = false; toast.setAttribute("aria-hidden", "false");
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => { toast.hidden = true; toast.setAttribute("aria-hidden", "true"); }, 2000);
}

export default { init, show, hide };
