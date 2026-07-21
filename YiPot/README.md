# YiPot · Tauri Desktop Translation Tool

## System view

YiPot is a cross-platform desktop translation and OCR application built on Tauri. It combines
a Rust backend (system interactions, clipboard monitoring, screenshot capture, HTTP server bridge)
with a React frontend (NextUI-powered windows for Translate, Recognize, Screenshot, Config, and
Updater). The application exposes 21 translation engines (DeepL, Google, OpenAI, Ollama, Bing,
Yandex, and 16 more), 15 OCR/recognition backends (Tesseract, Baidu, iFlytek, Tencent, etc.),
1 TTS service (Lingva), and 2 collection backends (Anki, Eudic). A local HTTP server on
port 60828 bridges external tools like PopClip and SnipDo with the Tauri app.

## Command flow

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server (port 1420) |
| `pnpm build` | Build frontend for production |
| `pnpm tauri` | Run Tauri CLI commands |
| `pnpm tauri dev` | Start Tauri in development mode |
| `pnpm tauri build` | Build Tauri desktop bundle |
| `pnpm updater` | Run updater script (node updater/updater.mjs) |

## Quick start

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm tauri dev`
3. On first run, the Config window opens automatically — configure your preferred translation
   and OCR engines.
4. Use the system tray menu or global shortcuts to trigger translation/OCR.
5. External tools can integrate via `http://127.0.0.1:60828/` endpoints.

## Project structure

```
YiPot/
├── src/                          # React frontend source
│   ├── components/               # Shared UI components (WindowControl)
│   ├── hooks/                    # React hooks (useConfig, useVoice, useSyncAtom…)
│   ├── i18n/                     # Internationalization (en_US, es_ES)
│   ├── services/                 # Service engine implementations
│   │   ├── translate/            # 21 translation engines
│   │   ├── recognize/            # 15 OCR/recognition backends
│   │   ├── tts/                  # 1 TTS service (Lingva)
│   │   └── collection/           # 2 collection backends (Anki, Eudic)
│   ├── utils/                    # Utility modules (store, env, language, invoke_plugin)
│   ├── window/                   # Window panel components
│   │   ├── Translate/            # Main translate panel
│   │   ├── Recognize/            # OCR recognize panel
│   │   ├── Screenshot/           # Screenshot overlay
│   │   ├── Config/               # Settings panel (General, Service, Hotkey, Backup…)
│   │   └── Updater/              # Version update panel
│   ├── App.jsx                   # Root component with windowMap routing
│   └── main.jsx                  # Entry point (NextUI + Theme bootstrap)
├── src-tauri/                    # Rust (Tauri) backend
│   ├── src/
│   │   ├── main.rs               # Tauri builder, plugin wiring, invoke handler
│   │   ├── config.rs             # Config store (tauri-plugin-store)
│   │   ├── server.rs             # Local HTTP server (tiny_http)
│   │   ├── clipboard.rs          # Clipboard monitor
│   │   ├── hotkey.rs             # Global shortcut registration
│   │   ├── screenshot.rs         # Screen capture
│   │   ├── system_ocr.rs         # System-level OCR
│   │   ├── lang_detect.rs        # Language detection (lingua)
│   │   ├── backup.rs             # Config backup/restore
│   │   ├── updater.rs            # Update polling
│   │   ├── tray.rs               # System tray menu
│   │   ├── window.rs             # Window management
│   │   ├── cmd.rs                # Command-line invocations
│   │   └── error.rs              # Error types
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── package.json                  # Node dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.cjs           # Tailwind CSS configuration
└── pnpm-lock.yaml                # Lock file
```

## Domain Language

YiPot's domain is **desktop translation**: capturing text (via clipboard or screenshot),
routing it through pluggable translation/OCR/TTS/collection service engines, and presenting
results in floating Tauri windows.

### Term definitions

- **Engine** — A pluggable service backend implementing translate, recognize, TTS, or collection.
  Each engine is a self-contained directory (`src/services/<category>/<engine>/`) with three files:
  `Config.jsx` (settings UI), `index.jsx` (invocation logic), and `info.ts` (metadata descriptor).
- **Window label** — A Tauri window identifier (`translate`, `recognize`, `screenshot`, `config`,
  `updater`, `daemon`). The React `App` component reads `appWindow.label` to dispatch the correct
  window panel via `windowMap`.
- **Service list** — A user-ordered list of engine identifiers (e.g. `["deepl", "google", "openai"]`)
  persisted in `config.json`. The frontend iterates this list to present available engines; the
  Rust `check_service_available()` prunes unavailable entries on startup.
- **Config store** — The single source of truth for all user settings, persisted as JSON via
  `tauri-plugin-store` at `{config_dir}/com.pot-app.desktop/config.json`. Both Rust (`get`/`set`)
  and JS (`store.load`/`store.get`) read/write through the same file.
- **Server bridge** — A local `tiny_http` server on `127.0.0.1:{port}` (default 60828) that
  allows external tools (PopClip, SnipDo, shell scripts) to trigger translate/OCR/config actions
  via HTTP GET/POST without a Tauri IPC dependency.

### Relationships

- **Engine → Service list → Config store**: Engines are instantiated from the service list stored
  in the config store. The engine's `info.ts` describes what it supports (language pairs, features),
  `Config.jsx` renders its settings, and `index.jsx` exports the `translate`/`recognize`/`tts`/`collect`
  function.
- **Window label → Window panel → Engine invocation**: A window label maps to a React panel
  component. The Translate panel iterates the translate service list, invokes the selected engine,
  and renders the result.
- **Clipboard monitor → Translate window**: The Rust clipboard monitor detects copied text and
  triggers the translate window to open with the detected text pre-loaded.
- **Server bridge → Window dispatch**: External HTTP requests to `/translate`, `/ocr_recognize`,
  `/ocr_translate`, `/selection_translate`, `/input_translate`, `/config` are routed by the Rust
  `server.rs` to the corresponding Tauri window function.

### Example dialogue

> **User**: "I copied some Japanese text. Why did the translate window not appear?"
> **System**: "The clipboard monitor must be enabled in Config → General. The monitor watches for
> text changes and invokes the default translate engine from your service list. Check that
> `clipboard_monitor` is `true` in your config store."

> **User**: "How do I use YiPot with PopClip?"
> **System**: "YiPot runs an HTTP server bridge on port 60828. PopClip sends the selected text
> via HTTP POST to `http://127.0.0.1:60828/translate`. The server routes it to
> `text_translate()` which opens the Translate window with the text pre-loaded. Ensure the
> PopClip extension is installed from `.scripts/popclip/`."

### Disambiguation markers

- **Engine** ≠ "browser engine" or "game engine". In YiPot, "engine" always refers to a
  translation/OCR/TTS/collection service backend.
- **Window** ≠ "browser window" or "OS window manager". In YiPot, "window" refers to a Tauri
  webview window identified by its label string.
- **Service** ≠ "web service" or "systemd service". In YiPot, "service" refers to one of the four
  categories (translate / recognize / tts / collection) or an individual engine within a category.
- **Config** ≠ "Vite config" or "Tailwind config". In YiPot context, "config" refers to the
  user-facing Config window panel or the `config.json` store.
