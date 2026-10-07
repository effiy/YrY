/**
 * windowManager — Drag/resize state and handlers for the floating chat window.
 * Extracted from chat.ts to keep the main store focused on chat logic.
 */

import type { ChatState } from '../types';

const DEFAULT_WIDTH = 760;
const MIN_WIDTH = 480;
const MIN_HEIGHT = 400;

export interface WindowManagerState {
  ws: { x: number; y: number; width: number; height: number; isFullscreen: boolean };
  isDragging: boolean;
  isResizing: boolean;
  visible: boolean;
}

export function useWindowManager(state: ChatState) {
  const _dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  const _resizeStart = { x: 0, y: 0, wx: 0, wy: 0, w: 0, h: 0, dir: '' };

  function onDragMouseDown(e: MouseEvent): void {
    if (state.ws.isFullscreen) return;
    state.isDragging = true;
    _dragStart.x = e.clientX;
    _dragStart.y = e.clientY;
    _dragStart.wx = state.ws.x;
    _dragStart.wy = state.ws.y;

    const onMove = (ev: MouseEvent) => {
      if (!state.isDragging) return;
      const dx = ev.clientX - _dragStart.x;
      const dy = ev.clientY - _dragStart.y;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      state.ws.x = Math.max(0, Math.min(vw - state.ws.width, _dragStart.wx + dx));
      state.ws.y = Math.max(0, Math.min(vh - state.ws.height, _dragStart.wy + dy));
    };
    const onUp = () => {
      state.isDragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function onResizeMouseDown(dir: string, e: MouseEvent): void {
    if (state.ws.isFullscreen) return;
    state.isResizing = true;
    _resizeStart.x = e.clientX;
    _resizeStart.y = e.clientY;
    _resizeStart.wx = state.ws.x;
    _resizeStart.wy = state.ws.y;
    _resizeStart.w = state.ws.width;
    _resizeStart.h = state.ws.height;
    _resizeStart.dir = dir;

    const onMove = (ev: MouseEvent) => {
      if (!state.isResizing) return;
      const dx = ev.clientX - _resizeStart.x;
      const dy = ev.clientY - _resizeStart.y;
      const vw = window.innerWidth;

      if (_resizeStart.dir === 'n') {
        const nh = _resizeStart.h - dy;
        const ny = _resizeStart.wy + dy;
        if (nh >= MIN_HEIGHT) { state.ws.height = nh; state.ws.y = Math.max(0, ny); }
      } else {
        let nw = _resizeStart.w;
        if (_resizeStart.dir.includes('e')) nw = Math.max(MIN_WIDTH, Math.min(vw - state.ws.x, _resizeStart.w + dx));
        if (_resizeStart.dir.includes('w')) {
          const proposed = _resizeStart.w - dx;
          if (proposed >= MIN_WIDTH) {
            state.ws.width = proposed;
            state.ws.x = Math.max(0, _resizeStart.wx + dx);
          }
        } else {
          state.ws.width = nw;
        }
        if (_resizeStart.dir.includes('s')) {
          state.ws.height = Math.max(MIN_HEIGHT, _resizeStart.h + dy);
        }
      }
    };
    const onUp = () => {
      state.isResizing = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function toggleFullscreen(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (state.ws.isFullscreen) {
      state.ws.width = DEFAULT_WIDTH;
      state.ws.height = vh;
      state.ws.x = Math.max(0, vw - DEFAULT_WIDTH);
      state.ws.y = 0;
      state.ws.isFullscreen = false;
    } else {
      state.ws.x = 0;
      state.ws.y = 0;
      state.ws.width = vw;
      state.ws.height = vh;
      state.ws.isFullscreen = true;
    }
  }

  return { onDragMouseDown, onResizeMouseDown, toggleFullscreen };
}