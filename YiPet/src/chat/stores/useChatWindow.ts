import type { Reactive } from 'vue';
import type { ChatState } from '../types';

interface DragStart { x: number; y: number; wx: number; wy: number }
interface ResizeStart { x: number; y: number; wx: number; wy: number; w: number; h: number; dir: string }
interface SidebarResizeStart { x: number; startWidth: number }

const MIN_WIDTH = 480;
const MIN_HEIGHT = 400;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 600;

export function useChatWindow(
  state: Reactive<ChatState>,
  vw: number,
  vh: number,
  _dragStart: DragStart,
  _resizeStart: ResizeStart,
  _sidebarResizeStart: SidebarResizeStart,
  loadSessionsAndCreate: () => void,
  persistWindowState: () => void,
  persistSetting: (key: string, value: unknown) => void,
) {
  // ── Window management ───────────────────────────────────────────────

  function open() {
    state.visible = true;
    if (!state.currentSessionId) {
      loadSessionsAndCreate();
    }
  }

  function close() {
    state.visible = false;
  }

  function toggle() {
    state.visible ? close() : open();
  }

  function startDrag(x: number, y: number) {
    state.isDragging = true;
    _dragStart.x = x;
    _dragStart.y = y;
    _dragStart.wx = state.ws.x;
    _dragStart.wy = state.ws.y;
  }

  function onDragMove(x: number, y: number) {
    if (!state.isDragging) return;
    state.ws.x = _dragStart.wx + (x - _dragStart.x);
    state.ws.y = _dragStart.wy + (y - _dragStart.y);
  }

  function endDrag() {
    state.isDragging = false;
    persistWindowState();
  }

  function startResize(dir: string, x: number, y: number) {
    state.isResizing = true;
    _resizeStart.x = x;
    _resizeStart.y = y;
    _resizeStart.w = state.ws.width;
    _resizeStart.h = state.ws.height;
    _resizeStart.wx = state.ws.x;
    _resizeStart.wy = state.ws.y;
    _resizeStart.dir = dir;
  }

  function onResizeMove(x: number, y: number) {
    if (!state.isResizing) return;
    const dx = x - _resizeStart.x;
    const dy = y - _resizeStart.y;
    const dir = _resizeStart.dir;

    if (dir === 'n') {
      const newH = Math.max(MIN_HEIGHT, _resizeStart.h - dy);
      const hDiff = _resizeStart.h - newH;
      state.ws.y = _resizeStart.wy + hDiff;
      state.ws.height = newH;
    } else if (dir === 'w') {
      const newW = Math.max(MIN_WIDTH, _resizeStart.w - dx);
      const wDiff = _resizeStart.w - newW;
      state.ws.x = _resizeStart.wx + wDiff;
      state.ws.width = newW;
    } else {
      state.ws.width = Math.max(MIN_WIDTH, _resizeStart.w + dx);
      state.ws.height = Math.max(MIN_HEIGHT, _resizeStart.h + dy);
    }
  }

  function endResize() {
    state.isResizing = false;
    persistWindowState();
  }

  function toggleFullscreen() {
    state.ws.isFullscreen = !state.ws.isFullscreen;
    persistWindowState();
  }

  function startSidebarResize(x: number) {
    _sidebarResizeStart.x = x;
    _sidebarResizeStart.startWidth = state.sidebarWidth;
  }

  function onSidebarResizeMove(x: number) {
    const w = _sidebarResizeStart.startWidth + (x - _sidebarResizeStart.x);
    state.sidebarWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, w));
  }

  function endSidebarResize() {
    persistSetting('sidebarWidth', state.sidebarWidth);
  }

  /** Extract web search results from web_search / web_fetch tool call events. */

  // ── Message sending ──────────────────────────────────────────────────

  return {
    open, close, toggle,
    startDrag, onDragMove, endDrag,
    startResize, onResizeMove, endResize,
    toggleFullscreen,
    startSidebarResize, onSidebarResizeMove, endSidebarResize,
  };
}
