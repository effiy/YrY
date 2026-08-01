---
name: h5
description: >
  H5 mobile web development navigator — viewport configuration, touch
  events, responsive design for mobile, mobile-first CSS, PWA on
  mobile, and mobile debugging. Invoke when the user wants to: configure
  the mobile viewport meta tag, handle touch/gesture events
  (touchstart, touchend, gesturechange), implement responsive layouts
  for mobile screens, optimize for mobile performance (scroll, tap
  delay, font size), debug on mobile Safari/Chrome/WeChat WebView,
  implement mobile-specific interactions (pull-to-refresh, swipe,
  pinch-zoom), or set up a PWA for mobile (manifest, service worker,
  install prompt). Trigger words: "h5", "mobile viewport", "touch events",
  "mobile web", "responsive mobile", "mobile-first", "mobile safari",
  "mobile chrome", "wechat webview", "mobile debug", "mobile pwa",
  "pull to refresh", "swipe gesture", "pinch zoom", "viewport meta",
  "mobile font size", "tap highlight", "300ms delay", "mobile scroll".
  Do NOT trigger for: native iOS/Android app development (Swift, Kotlin,
  React Native, Flutter), desktop web development without mobile focus,
  or WeChat Mini Program development.
lifecycle: default-pipeline
user_invocable: true
---

# h5 — H5 Mobile Web Navigator

> Viewport, touch, responsive mobile patterns — the H5 mobile web toolkit.

## What this skill does

1. **Viewport** — `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` variants, safe area insets (`env(safe-area-inset-*)`), notched device handling, `visualViewport` API for keyboard-aware layouts.
2. **Touch events** — `touchstart`/`touchmove`/`touchend`/`touchcancel`, `TouchEvent.touches`/`changedTouches`, 300ms tap delay elimination (`touch-action: manipulation`, FastClick), click vs tap distinction.
3. **Gesture handling** — swipe detection (threshold + velocity), pinch-zoom via `gesturestart`/`gesturechange` (iOS), `PointerEvent` unification, `Hammer.js` integration patterns.
4. **Responsive mobile** — mobile-first media queries, `min-width` breakpoints, fluid typography (`clamp()`), responsive images (`srcset`, `<picture>`, `object-fit`).
5. **Mobile performance** — scroll performance (`passive` event listeners, `will-change: transform`, `-webkit-overflow-scrolling: touch`), font size minimums (`-webkit-text-size-adjust`), tap highlight (`-webkit-tap-highlight-color`), `content-visibility: auto`.
6. **WeChat WebView** — `WeixinJSBridge`, `wx.config` limitations, `window.__wxjs_environment`, URL scheme restrictions, debugging with vConsole.
7. **Mobile debugging** — Safari Web Inspector (iOS), Chrome Remote Debugging (Android), vConsole/eruda for in-app debugging, Weinre fallback.
8. **Mobile PWA** — `manifest.json` mobile considerations (theme color, icons, display: standalone), service worker cache strategies for mobile, A2HS (Add to Home Screen) prompt, iOS PWA meta tags (`apple-mobile-web-app-capable`).
9. **Mobile interactions** — pull-to-refresh (native + custom), infinite scroll with `IntersectionObserver`, sticky elements with `position: sticky` + safe area, virtual keyboard handling (iOS vs Android differences).

## What this skill does NOT do

- Does NOT cover native mobile development (iOS Swift, Android Kotlin, React Native, Flutter).
- Does NOT cover WeChat Mini Programs (WXML, WXSS, mini program APIs) — that's a separate platform.
- Does NOT cover desktop-first web design.
- Does NOT teach basic HTML/CSS/JavaScript — assume web fundamentals.

## Workflow

1. **Identify the mobile concern** — viewport / touch / responsive / performance / debug / PWA.
2. **Check device compatibility** — iOS Safari vs Android Chrome vs WeChat WebView have different quirks.
3. **Apply the pattern** — mobile-first CSS, passive touch listeners, safe area handling.
4. **Test on real devices** — emulator is not enough; test on actual iOS/Android devices.

## Borders

| Boundary | Permission |
|----------|-----------|
| Project HTML/CSS/JS files | read + write |
| Browser DevTools (mobile mode) | reference |
| Real device testing | required for verification |
| Skill directory | read + write |
| Outside the project | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| User asks about native app development | State the boundary; H5 is web-in-browser on mobile. |
| User asks about WeChat Mini Programs | Out of scope; point to WeChat official mini program docs. |
| User asks about a specific device quirk | Research the quirk; cite WebKit/Blink bug tracker if needed. |
| Feature not available on target platform | State the limitation; suggest alternative or polyfill. |
| User asks in a language other than English | Respond in the user's language; keep CSS/JS keywords in original. |
