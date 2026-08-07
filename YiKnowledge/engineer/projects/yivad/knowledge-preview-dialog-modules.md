---
title: Knowledge preview dialog functional module inventory
aliases: [knowledge-preview-dialog, preview-dialog-modules, kpd-modules]
tags: [yivad, aiChat, knowledge, preview, dialog, modules, markdown, chat, translation]
category: engineer/projects/yivad
created: 2026-08-06
updated: 2026-08-07
last_verified: 2026-08-07
source: YiVad/src/views/aiChat/components/KnowledgePreviewDialog.vue
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: false
roles: [engineer, ai-engineer]
benefit: "Engineers understand every functional module within the KnowledgePreviewDialog, its purpose, state ownership, and interaction flow"
acceptance_criteria:
  - "every toolbar action, body mode, and sub-panel is enumerated with its purpose and trigger"
  - "data flow (state → API → persistence) is traced for each module"
  - "inter-module interactions and constraints are documented"
related:
  - ./functional-modules.md
  - ./architecture.md
  - ./knowledge-preview-local-chat.md
  - ./engineering/claude.md
---

# Knowledge preview dialog functional module inventory

> **As an** engineer, **I want to** understand every functional module within the aiChat knowledge preview dialog, **so that** I can extend or debug it without reading the full component source.

## Summary

The `KnowledgePreviewDialog` (`src/views/aiChat/components/KnowledgePreviewDialog.vue`) is the central knowledge-file viewer in aiChat. It is instantiated once in `aiChat/index.vue` and exposed via `provide("openKnowledgePreview", openKnowledgePreview)`. Any descendant component can call `openKnowledgePreview(path)` to open a YiKnowledge markdown file in the dialog. The dialog is a 91vw × 88vh `el-dialog` with a toolbar, an optional frontmatter strip, and a body that switches between three modes (preview/edit/split) plus an optional embedded chat panel.

## Core viewpoints

**A preview dialog is a read-path, not a write-path, and the architecture should reflect that.** The edit and save features are secondary to the primary job of viewing and navigating knowledge files. The fact that chat mode forces preview mode is correct: the LLM must see the saved content, not an in-progress edit. Resist the temptation to turn the preview dialog into a general-purpose markdown editor.

**Co-locating chat with content creates a powerful learning loop that standalone chat cannot replicate.** The embedded chat panel with the file content as system prompt turns every knowledge file into a conversation starter. This is more valuable than a generic chat interface because the context is precise and the user's intent is clear. The "Promote" and "Discuss in AI Chat" actions are the bridge from ephemeral file-chat to persistent conversation.

**Singleton components must be explicit about their lifecycle.** The dialog is a singleton instantiated once in `aiChat/index.vue` and shared via provide/inject. This means state cleanup on close is load-bearing: stale translation results, unsaved edits, and chat history must be reset when the dialog closes. The `loadDoc` method's reset-all behavior is not defensive coding; it is the contract that prevents cross-file state contamination.

**Internal link navigation is a mini-router that must handle relative paths, directory resolution, and edge cases.** The `resolvePath` method that handles `..`, `.`, and directory-to-README.md resolution is a small but critical piece of infrastructure. A broken internal link breaks the user's knowledge exploration flow. Every edge case (trailing slash, missing README.md, anchor links, external URLs) must be handled explicitly.

## Component hierarchy

```
aiChat/index.vue
  └─ KnowledgePreviewDialog (singleton, provide/inject trigger)
       ├─ Toolbar (nav + mode switch + actions)
       ├─ KnowledgeMetaStrip (frontmatter badges, when hasMeta)
       └─ Body
            ├─ [chat mode] Left: preview | Resizer | Right: KnowledgeChatPanel
            └─ [standard mode] TOC sidebar | Editor pane | Preview pane
```

## Module 1: File loading and navigation

**Purpose:** Open, load, and navigate between YiKnowledge markdown files.

**State:**
| Field | Type | Purpose |
|---|---|---|
| `currentPath` | `string` | Active file path (e.g. `engineer/projects/yivad/README.md`) |
| `title` | `string` | Dialog title derived from filename |
| `rawContent` | `string` | Saved markdown content from server |
| `loading` | `boolean` | Loading spinner flag |
| `navHistory` | `string[]` | Stack of previous paths for back-navigation |

**API:** `readKnowledgeFile(path)` → `{ content, meta }`

**Key behaviors:**
- `open(path)` — sets visible, resets navHistory, calls `loadDoc(path)`
- `loadDoc(path)` — resets all state (mode, chat, translation, TOC), fetches file content + meta
- `navigateTo(path)` — pushes current path to navHistory, then `loadDoc(path)`
- `goBack()` — pops navHistory, loads previous path
- Internal link clicks (`handlePreviewClick`) — intercepts `<a>` clicks in rendered markdown, resolves relative paths (supporting `..`, `.`, directory→README.md), calls `navigateTo`
- `resolvePath(href)` — resolves relative URLs against `currentPath`; external/anchor links pass through

**Trigger:** `openKnowledgePreview(path)` provided from `aiChat/index.vue`

---

## Module 2: View modes (Preview / Edit / Split)

**Purpose:** Three-mode toggle for viewing vs editing markdown.

**State:** `mode: "preview" | "edit" | "split"` (default `"preview"`)

**Behaviors:**
| Mode | Editor visible | Preview visible | TOC visible |
|---|---|---|---|
| Preview | No | Yes (saved content) | Yes (≥3 headings) |
| Edit | Yes (full height) | No | No |
| Split | Yes (left) | Yes (right, live preview) | No |

**Constraints:**
- Switching away from preview seeds `editContent` from `rawContent` (one-time copy)
- Mode switch is disabled when chat panel is open (forced to preview)
- TOC only renders in preview mode without chat (≥3 h2/h3 headings)

---

## Module 3: Markdown rendering

**Purpose:** Render markdown content to HTML.

**Hook:** `useMarkdown()` → `{ render }`

**Computed outputs:**
| Computed | Source | Used in |
|---|---|---|
| `displayHtml` | `rawContent` (saved) | Preview mode, chat-left pane |
| `previewHtml` | `editContent` (draft) | Split mode right pane |
| `savedPreviewHtml` | `rawContent` | TOC generation trigger |

**Rendering pipeline:** `render(markdown)` → HTML string → `v-html` binding

---

## Module 4: Frontmatter metadata strip

**Purpose:** Surface YiKnowledge frontmatter fields as badges and clickable related links.

**Component:** `KnowledgeMetaStrip` (`src/components/KnowledgeMetaStrip.vue`)

**State:** `meta: KnowledgeMeta` — parsed from `readKnowledgeFile` response

**Visibility:** `hasMeta` computed — true when any of `status`, `lifecycle`, `review_cycle`, `type`, `roles`, `tags`, `related`, `benefit`, `acceptance_criteria`, `tacit` is non-empty

**Rendered fields:**
- `status` / `lifecycle` / `review_cycle` / `type` — colored badges
- `tacit` — string: warning callout (3-line clamp); boolean true: warning badge
- `roles` / `tags` — tag chips
- `related` — internal paths: navigate within dialog; external URLs: `window.open` in new tab

**Event:** `@navigate-related="navigateToRelated"` — navigates to another knowledge file within the dialog

---

## Module 5: Table of contents (TOC)

**Purpose:** Auto-generated sidebar navigation from markdown headings.

**State:** `toc: { level, text, id }[]`

**Visibility:** `showToc` — true when mode is preview, chat is hidden, and ≥3 headings exist

**Generation:** After `savedPreviewHtml` renders, `nextTick` queries `h2, h3` elements from the preview DOM, assigns `id` attributes (`toc-h-{i}-{slug}`), and populates `toc`

**Interaction:** Click a TOC entry → `scrollToHeading(id)` → `el.scrollIntoView({ behavior: "smooth" })`

**Styling:** 200px sidebar, h3 entries indented with smaller font

---

## Module 6: Translation (CN / EN / Bilingual)

**Purpose:** Translate knowledge file content to Chinese, English, or bilingual display.

**State:**
| Field | Type | Purpose |
|---|---|---|
| `translating` | `boolean` | Loading flag |
| `translationAbort` | `(() => void) \| null` | Abort controller for current translation |
| `originalContent` | `string` | Backup of pre-translation content for "Show Original" |

**API:** `streamChat({ model: "qwen3.5:4b", messages, system })` — SSE streaming translation

**Methods:**
- `translateTo("zh")` — translate to Simplified Chinese
- `translateTo("en")` — translate to English
- `translateTo("zh", true)` — bilingual (original + CN, separated by `---`)
- `resetTranslation()` — abort + restore `originalContent`

**Constraints:**
- Only available in preview mode, non-loading, with content
- Model is hardcoded to `qwen3.5:4b` (not the user-selected chat model)
- Translation modifies `rawContent` in-place (not `editContent`)

---

## Module 7: Edit and save

**Purpose:** Edit markdown content and persist to the backend.

**State:**
| Field | Type | Purpose |
|---|---|---|
| `editContent` | `string` | Working draft in the editor |
| `saving` | `boolean` | Save loading flag |

**API:** `writeKnowledgeFile(path, content, meta)` → success/error

**Flow:**
1. User switches to Edit or Split mode → `editContent` seeded from `rawContent`
2. User edits in `<el-input type="textarea">`
3. Click Save → `writeKnowledgeFile(currentPath, editContent, meta)` → on success: `rawContent = editContent`, mode back to preview, `ElMessage.success`
4. Click Cancel → mode back to preview, discards `editContent`

**Constraint:** Internal-link navigation is blocked when unsaved edits exist (`editContent !== rawContent`)

---

## Module 8: Knowledge chat panel

**Purpose:** Embedded AI chat about the current knowledge file, in a resizable right-side panel.

**Component:** `KnowledgeChatPanel` (`./KnowledgeChatPanel.vue`)

**Trigger:** Click the chat toggle button (💬 icon) in the toolbar

**State:** `showChat: boolean`

**System prompt:** `chatSystemPrompt` — computed from `rawContent`, passed as `:system-prompt` to `KnowledgeChatPanel`

**Layout:** Left (preview, flex:1, min 280px) | Resizer (4px, draggable) | Right (chat panel, default 600px, range 320-900px)

**Resizer:** `useResizable(600, 320, 900, "aiChat.knowledgeChatW", true)` — width persisted in localStorage

**Constraint:** When chat mode is on, the mode radio group is disabled (forced to preview)

See [knowledge-preview-local-chat.md](./knowledge-preview-local-chat.md) for the model selector feature within the chat panel.

---

## Module 9: Source page navigation

**Purpose:** Navigate from a knowledge file to its source-domain detail page (BRD, code review, story, etc.).

**Method:** `resolveSourceRoute(path)` — pattern-matches the file path against known domain patterns:

| Path pattern | Target route |
|---|---|
| `brd/<role>/<key>` | `/brd/<role>/detail/<key>?mode=view` |
| `code-review/<topic>/<key>` | `/code-review/<topic>/detail/<key>?mode=view` |
| `tech-leadership/<topic>/<key>` | `/tech-leadership/<topic>/detail/<key>?mode=view` |
| `stories/<project>/<key>(/<file>)` | `/story?project=<project>&story=<key>` |
| `rss/<...>` | `/rss` |

**Trigger:** FolderOpened icon button in toolbar (only visible when `sourceRoute` is non-null)

**Behavior:** Closes the preview dialog, then `router.push(sourceRoute)`

---

## Module 10: Discuss in AI Chat

**Purpose:** Promote the current knowledge file into a standalone aiChat session.

**Method:** `discussInAiChat()` — calls `openInAiChat` from `useAiChatBridge` composable

**Payload:**
- `title` — derived from filename
- `pageContent` — markdown with title, path, frontmatter, and full body
- `tags` — `["ctx:<path>", "file:<path>", "knowledge"]`
- `sourceUrl` — undefined

**Behavior:** Opens a new aiChat conversation with the file content as page context, then closes the preview dialog

---

## KnowledgeChatPanel sub-modules

The embedded `KnowledgeChatPanel` has its own functional modules:

### Sub-module A: Chat messages

Local message list with per-file localStorage persistence (`kchat:msgs:<filePath>`). Each message: `{ type, message, timestamp, imageDataUrls?, error?, aborted?, sources?, searchContext? }`. Auto-scrolls on new message and during streaming.

### Sub-module B: Streaming chat

Two paths: standard LLM (`streamChat` with model/sse) and RAG (`streamRagChat` with scope). Both stream chunks into `streamingText`, updating the last pet message in-place. `AbortController` ref enables stop. `finishSend` saves to localStorage and auto-forwards to WeChat.

### Sub-module C: Per-message actions

| Action | Message type | Behavior |
|---|---|---|
| Copy | pet | `navigator.clipboard.writeText` |
| Edit | both | `ElMessageBox.prompt` → update message |
| Regenerate | pet | Remove pet msg, re-send preceding user msg |
| Retry | pet (error/aborted) | Same as Regenerate |
| Resend | user | Remove this msg and everything after, re-send |
| Delete | both | `ElMessageBox.confirm` → splice |
| Search Web | user | Enable web search, then resend |
| Promote | pet | `openInAiChat` with full conversation transcript |

### Sub-module D: Toggles and settings

| Toggle | State | Storage key |
|---|---|---|
| RAG | `ragEnabled` | `kchat:cfg:<filePath>` |
| Web Search | `webSearchEnabled` | `kchat:cfg:<filePath>` |
| Model | `selectedModel` | `kchat:model:<filePath>` |

All per-file persisted in localStorage, loaded on mount and on filePath change.

### Sub-module E: FAQ

Fetches FAQ documents via `getFaqs()`. Searchable dropdown above the input area. Two actions per FAQ item: Apply (append prompt to input) and Send (replace input and send immediately). Lazily loaded on first toggle.

### Sub-module F: Tag management

Context tags (`ctx:path/to/file`) for RAG context files. Tags persisted per-file in `kchat:tags:<filePath>`. Add/remove via tag manager UI. `contextFiles` computed strips the `ctx:` prefix for display in ChatToolbar.

### Sub-module G: Draft images

Image upload via hidden `<input type="file">`, max 4 images. Read as data URLs via `FileReader`. Displayed as thumbnails above the input area. Sent as `images` param in `streamChat` payload.

### Sub-module H: WeChat forwarding

Auto-forward completed pet messages to enabled WeCom bots with `autoForward: true`. Bot list from `loadRobots()`. Dialog shows configured bots and their auto-forward status.

### Sub-module I: Keyboard shortcuts

| Key | Condition | Action |
|---|---|---|
| Enter | Not composing, no Shift | Send message |
| Shift+Enter | — | Newline |
| Escape | Sending | Stop streaming |
| Escape | Input not empty | Clear input + draft images |
| Ctrl/Cmd+K | Not sending | Clear conversation |
| Ctrl/Cmd+L | Not sending | Clear input |

### Sub-module J: IME composition

Tracks `isComposing` and `compositionEndTime` to prevent Enter-to-send during IME composition (Chinese/Japanese input). 160ms grace period after `compositionend` before Enter is re-enabled.

## Inter-module constraints

- **Chat mode forces preview mode** — editing while chatting is disabled to ensure the LLM sees the saved content
- **Unsaved edits block navigation** — internal link clicks are ignored when `editContent !== rawContent`
- **Translation modifies rawContent** — translation writes to `rawContent` directly; "Show Original" restores from `originalContent` backup
- **TOC is preview-only** — TOC sidebar only renders in preview mode without chat (≥3 headings)
- **File path change resets all sub-state** — `loadDoc` resets mode, chat, translation, TOC, and meta
- **RAG mode bypasses model selector** — `streamRagChat` does not accept a model parameter; backend uses its own default

## When not to use

- This dialog is for **knowledge file preview** only — not for general markdown editing or chat
- The translation feature is for **quick inline translation**, not a replacement for proper localization
- The chat panel is **per-file ephemeral** — conversations are in localStorage, not synced to the server; for persistent chat, use "Promote" or "Discuss in AI Chat"
- The dialog is a **singleton** in aiChat/index.vue — do not instantiate multiple copies

## Action recommendations

1. **Add automated tests for the internal link resolver (`resolvePath`):** The `resolvePath` method is a mini-router that handles relative paths, directory resolution, and edge cases. A single broken edge case breaks the user's knowledge exploration flow. Create a test suite with at least 20 test cases covering: relative paths (`../`, `./`), directory-to-README.md resolution, trailing slashes, anchor links, external URLs, nonexistent paths, and chained relative paths (`../../foo/bar`). This is the highest-ROI test investment in the KnowledgePreviewDialog because the resolver is small, pure, and load-bearing.

2. **Extract the translation feature into a standalone composable:** The translation logic (state management, abort controller, bilingual mode, model selection) is currently embedded in the KnowledgePreviewDialog component. Extract it into a `useTranslation` composable that accepts `rawContent` and `onContentChange` as parameters and returns `translating`, `translateTo`, and `resetTranslation`. This reduces the KnowledgePreviewDialog's complexity, makes the translation feature independently testable, and allows it to be reused in other components that display knowledge content (e.g., the Story Board detail drawer).

3. **Add a "save draft" indicator that persists unsaved edits across dialog close:** The current behavior silently discards unsaved edits when the dialog closes or the user navigates away. This is a data loss risk. Implement a two-tier save mechanism: (1) an auto-save to `localStorage` with the key `kpd:draft:<filePath>` that runs on every edit (debounced at 2 seconds), and (2) a "You have unsaved changes" prompt when the dialog closes with edits that are newer than the last auto-save. The prompt should offer "Save", "Discard", and "Cancel" options. This prevents data loss without requiring the user to manually save before every navigation.

4. **Implement a WebSocket or polling-based collaborative editing awareness indicator:** If multiple team members can edit the same knowledge file, the current architecture has no mechanism to prevent conflicting edits. Add a lightweight awareness indicator: when the dialog opens in edit mode, poll the backend every 30 seconds for the file's `updated` timestamp. If the timestamp has changed since the dialog was opened, display a warning: "This file was modified by another user at [time]. Your changes may conflict." This is a minimal implementation that prevents the most damaging conflict scenario without requiring a full real-time collaboration system.

5. **Add a "search within file" feature to the preview mode:** The current preview mode has a TOC for structural navigation but no way to search within the file content. Add a search bar that: (1) performs a case-insensitive substring search on the markdown content, (2) highlights all matches in the preview pane, (3) displays a match count and navigation arrows (next/previous), and (4) supports regex mode via a toggle. This is a standard feature in documentation browsers and is especially valuable for long knowledge files where the TOC is insufficient for finding specific information.

## Anti-patterns

- **Using the preview dialog as a general-purpose markdown editor.** The dialog's edit mode is for quick fixes to knowledge files, not for authoring new content. The edit-save pipeline is constrained (no auto-save, no version history, no conflict resolution) and is not designed for long editing sessions. New knowledge files should be authored in the IDE and synced through the knowledge scanner.

- **Treating translation as a replacement for proper localization.** The inline translation feature uses a hardcoded lightweight model (`qwen3.5:4b`) and modifies `rawContent` in place. It is a convenience for reading foreign-language content, not a publishing pipeline. Translated content should not be saved back to the knowledge base through this mechanism.

- **Using localStorage chat as a permanent knowledge store.** The chat panel's conversations are persisted in `localStorage` per file path. This is ephemeral storage: clearing browser data, switching devices, or reinstalling the extension will lose all conversations. For persistent chat, use "Promote" to push to the main aiChat session, or "Discuss in AI Chat" to create a standalone conversation.

- **Instantiating multiple dialog instances.** The dialog is a singleton in `aiChat/index.vue` and shared via provide/inject. Instantiating a second `KnowledgePreviewDialog` elsewhere will create two competing singletons with separate state, breaking the navigation model (internal link clicks in one instance will not affect the other). The provide/inject pattern is the single source of truth for dialog visibility and file path.

- **Navigating away while unsaved edits exist.** The dialog blocks internal link navigation when `editContent !== rawContent`, but the user can close the dialog or navigate away in the browser. Unsaved edits are silently discarded. Before editing, verify that the content is worth saving, and save before any navigation action.

## Related

- [YiVad functional modules](./functional-modules.md) — 20 view domains, 18 API modules, 11 stores inventory including the aiChat store that hosts this dialog
- [YiVad architecture](./architecture.md) — tech stack, layer boundaries, and SSE streaming data flow
- [YiVad one-screen layout](./one-screen-layout.md) — three-layer flex layout and useResizable composable used by the dialog's resizable chat panel
- [Knowledge preview local chat](./knowledge-preview-local-chat.md) — model selector feature within the KnowledgeChatPanel
- [YiVad engineering CLAUDE.md](./engineering/claude.md) — recent changes tracking KnowledgePreviewDialog and KnowledgeMetaStrip fixes
