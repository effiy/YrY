# YiPet — Gentle Companion

> A gentle, thoughtful browser companion extension. Supports multi-role interaction, chat windows, and rich CDN resource injection for a more enjoyable browsing experience.

## System view

YiPet is a Chrome Manifest V3 extension that injects an interactive pet companion into any web page. It consists of two layers: (1) a **content script bootstrap** responsible for injecting the CDN resource loader into the page's MAIN world; (2) a **React popup control panel** providing settings for visibility, size, role, color theme, and more.

The extension relies on a local backend service (`http://localhost:10086`) for AI chat requests and persists global state via `chrome.storage.local`.

## Command flow

| Command | Description |
|---------|-------------|
| Load extension | Chrome `chrome://extensions` → "Load unpacked" → Select `YiPet/` directory |
| Open control panel | Click the extension icon in the toolbar, or `Cmd+Shift+P` |
| Open chat window | `Cmd+Shift+X` |
| DevTools console | `YiPet.help()` — View CDN resource usage guide; `YiPet.list()` — List all available resources |

## Quick start

1. Ensure the `http://localhost:10086` backend service (YiAi) is running.
2. Open Chrome, go to `chrome://extensions`, enable "Developer mode".
3. Click "Load unpacked" and select the `YiPet/` project root directory.
4. Open any web page, click the YiPet icon in the toolbar to open the control panel.

## Project structure

```
YiPet/
├── manifest.json                 # Chrome MV3 extension manifest
├── assets/
│   ├── icons/                    # Extension icons (16/32/48/128)
│   └── images/                   # Pet character images (doctor/pastry-chef/police/teacher)
├── cdn/
│   ├── styles/
│   │   ├── variables.css         # CSS design variables
│   │   └── reset.css             # Browser default style reset
│   ├── utils/
│   │   ├── url.js                # UrlBuilder — URL construction utility
│   │   └── log.js                # LoggerUtils — Dev-mode silent logging
│   └── vendor/                   # Pre-bundled third-party CDN libraries (Vue/React/Bootstrap/GSAP/...)
└── src/
    ├── bootstrap/
    │   └── bootstrap.js          # Content script entry — CDN resource loader
    ├── config/
    │   ├── pet.defaults.js       # Default config and REST endpoint templates
    │   └── pet.config.js         # Environment-aware config orchestrator
    └── popup/
        ├── index.html            # Popup page entry
        ├── index.css             # Popup layout styles
        ├── index.js              # Popup React root component + mount
        ├── data.js               # Config adapter (PET_CONFIG → YIPET_POPUP)
        ├── services/
        │   ├── chrome.js         # Chrome API wrapper (tabs/storage)
        │   ├── connect.js        # Content script connection manager (exponential backoff retry)
        │   └── notify.js         # Toast notification service
        └── components/
            ├── AppHeader/        # Top status bar (model name/visibility indicator)
            ├── SettingsCard/     # Settings card container
            ├── SwitchRow/        # Toggle row (show/hide pet)
            ├── SliderRow/        # Slider row (pet size)
            ├── SelectRow/        # Dropdown row (role/color theme)
            ├── Notification/     # Toast notification popup
            └── AppFooter/        # Bottom status bar (version/connection hint)
```

## Domain Language

YiPet's domain is **browser companion extension**, with core concepts centered around the visual presentation of pet characters, user interaction controls, and local AI communication.

### Term definitions

- **Pet** — An interactive visual element injected into the page DOM, with a specified character appearance (Teacher/Doctor/Pastry Chef/Police Officer), color theme, and size.
- **Role** — The pet's occupational identity, determining its appearance image (loaded from `assets/images/<role>/icon.png`) and conversation style. Four roles are currently supported.
- **Popup** — The settings interface that appears after clicking the extension icon, built with React 15, providing visibility toggle, size slider, role selector, and color theme selector.
- **Bootstrap** — The content script entry module, responsible for initializing `window.YiPet` API in the page's MAIN world and sequentially injecting all CDN resources.
- **Content Script** — The script injected into web pages by the Chrome MV3 extension, running in the isolated world. It can access `chrome.runtime.*` APIs but cannot directly manipulate the page DOM.
- **MAIN World** — The web page's own JavaScript execution environment. Only after Bootstrap injects itself into the MAIN world can `window.YiPet` be directly accessed from the DevTools console.
- **CDN Catalog** — The resource manifest maintained in `bootstrap.js` (the CATALOG array), mapping short keys to actual file paths in `cdn/vendor/`, supporting on-demand dynamic loading.

### Relationships

- **Popup → Content Script → Bootstrap → MAIN World**: The user sends control commands via the Popup → relayed via `chrome.tabs.sendMessage` to the content script → the content script updates the pet state in the page.
- **Bootstrap → CDN Catalog**: Bootstrap is the sole consumer of the CDN Catalog; on every page load, Bootstrap injects all JS and CSS resources from the Catalog in dependency order.
- **Config → Popup (via data.js)**: `pet.defaults.js` + `pet.config.js` define global defaults → `data.js` adapts them into the `YIPET_POPUP` shape expected by the popup → popup components consume that configuration.
- **Popup Services → Chrome APIs**: `services/chrome.js` wraps `chrome.tabs.*` and `chrome.storage.*`; `services/connect.js` detects whether the content script is ready via `ping` messages; `services/notify.js` manages auto-dismiss timers for toast notifications.

### Example dialogue

**User**: "I want to switch the pet to the Doctor role and make it a bit bigger."

**System**: The user selects "Doctor" in the Popup's Role dropdown and drags the Size slider to 320. The Popup notifies the content script via `sendMessage({ action: 'setRole', role: 'Doctor' })` → the content script updates the pet DOM element's background image and size → the Popup shows "Role Changed" and "Size Updated" toast notifications → the new state is persisted via `chrome.storage.local`.

---

**User**: "Load Vue into the current page from the DevTools console."

**System**: The user switches DevTools to the MAIN world context and enters `await YiPet.vue()` → Bootstrap detects that `window.Vue` is not yet defined → dynamically creates `<script src="chrome-extension://.../cdn/vendor/vue@3.5.13/vue.global.prod.js">` and injects it into `<head>` → the console outputs `✓ Vue 3.5.13` → subsequent calls to `YiPet.vue()` detect it as already loaded and skip.

### Disambiguation markers

- **Pet** — Not a household pet or animal; specifically refers to the interactive visual element injected into web pages.
- **Role** — Not an RBAC permission role; specifically refers to the pet's occupational appearance identity.
- **Bootstrap** — Not the Twitter Bootstrap CSS framework (that framework resides in `cdn/vendor/bootstrap@5.2.3/`); specifically refers to YiPet's `src/bootstrap/bootstrap.js` entry module.
- **Popup** — Not an arbitrary popup or modal; specifically refers to the Chrome extension's `action.default_popup` page.
- **MAIN World** — Not "main thread" or "main process"; specifically refers to the Chrome extension content script's "main world" execution environment (as opposed to the isolated world).
