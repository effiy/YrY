---
name: tmux
description: >
  Curated tmux ecosystem navigator — pulls tmux tutorials, cheat
  sheets, configuration starters, theme packs, status-bar widgets,
  session managers, and plugins from rothgar/awesome-tmux, indexes
  them locally, and recommends the right plugin, theme, status widget,
  or session manager for a given task. Trigger when the user wants
  to: pick a tmux starter config (Oh My Tmux, tmux-extra), find a
  theme (dracula, catppuccin, gruvbox, tokyo-night, rose-pine, nord,
  kanagawa, solarized), find a status-bar widget (battery, CPU/RAM,
  git status, weather, Spotify/MPRIS, kubernetes context, VPN
  status, network bandwidth, Pomodoro, time-zone clock), find a
  session / window / pane manager (tmuxinator, tmuxp, tmuxifier,
  sesh, sessionx, smug, harpoon, xpanes, dmux, twm, teamocil), find
  a plugin for a capability (clipboard / yank, fzf pickers, fingers
  / easymotion hint-mode, prefix highlight, popup menus, AI / Claude
  / LLM integration, devcontainers, 1Password / Bitwarden, browser
  session, tpm plugin manager, resurrect, continuum, copycat, pain
  control, sessionist, logging), find a tutorial or cheat sheet, or
  find a tmux book (tmux 2: Productive Mouse-Free Development, The
  Tao of tmux). Trigger words: "tmux", "tmux plugin", "tmux theme",
  "tmux status bar", "tmux session manager", "tmux tutorial", "tmux
  cheat sheet", "tmux config", "tmux.conf", "tmux starter", "tmux
  yank", "tmux copy", "tmux clipboard", "tmux fzf", "tmux popup",
  "tmux sidebar", "tmux battery", "tmux cpu", "tmux weather", "tmux
  git status", "tmux kubernetes", "tmux vpn", "tmux spotify",
  "tmuxinator", "tmuxp", "tmuxifier", "tmux ai", "tmux claude",
  "tmux llm", "dracula tmux", "catppuccin tmux", "gruvbox tmux",
  "tokyo night tmux", "rose pine tmux", "nord tmux", "solarized
  tmux", "oh my tmux", "gpakosz tmux", "terminal multiplexer".

  Do NOT trigger for: Zellij / screen / Byobu / WezTerm / Kitty
  (other terminal multiplexers), tmux core / API / plugin
  development questions, or any task unrelated to the curated tmux
  ecosystem above.
lifecycle: default-pipeline
user_invocable: true
---

# tmux — Curated tmux Ecosystem Navigator

> Pick the right tmux plugin, theme, status-bar widget, session
> manager, configuration, tutorial, or book. Pulls from
> [rothgar/awesome-tmux](https://github.com/rothgar/awesome-tmux),
> ~202 resources across 9 categories and 10 topics.

## What this skill does

1. **Maps a tmux question** to a category + topic in the registered
   `awesome-tmux` source.
2. **Recommends a starter config** (Oh My Tmux!, mooks, tmux-extra)
   for the chosen aesthetic or workflow.
3. **Recommends a theme** (dracula, catppuccin, gruvbox, tokyo-night,
   rose-pine, nord, kanagawa, …) with dark/light/dynamic variants.
4. **Recommends a status-bar widget** for a specific signal (battery,
   CPU/RAM, git status, weather, Spotify/MPRIS, kubernetes context,
   VPN status, network bandwidth, packet loss, Pomodoro, world clock).
5. **Recommends a session / pane manager** (tmuxinator, tmuxp,
   tmuxifier, sesh, sessionx, t, smug, harpoon, xpanes, dmux, laio,
   moxide, mynav, twm, teamocil, tmux-tea) by config style (YAML /
   TOML / fzf-driven / DSL / bootstrap / AI-driven).
6. **Recommends a plugin** for a specific capability (clipboard/yank,
   fzf pickers, fingers hint-mode, popup menus, AI/Claude/LLM,
   devcontainers, 1Password/Bitwarden, tpm, resurrect, continuum,
   copycat, pain-control, sessionist, open, logging, fpp, urlview).
7. **Recommends a tutorial, cheat sheet, or book** (Tmux crash course,
   autostart on SSH, tmux 2, Tao of tmux).
8. **Cites every recommendation** by exact title and URL with
   `[src:awesome-tmux]`.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses a local snapshot
  in `references/`.
- Does NOT teach tmux from scratch — point at `man tmux` and the
  upstream tmux repo for conceptual questions.
- Does NOT cover other terminal multiplexers (Zellij, screen, Byobu,
  WezTerm, Kitty).
- Does NOT cover tmux core / plugin API development — point at the
  `Plugins > Development and testing` subtopic for `tmux-example-plugin`,
  `tmux-test`, `gotmux`.

## Workflow

1. **Read** `references/sources.json` and `references/index.md`.
2. **Match** the user's intent to a category:
   - "starter config for X aesthetic" → `Configuration` (Oh My Tmux!, mooks, tmux-extra)
   - "plugin for X capability" → `Plugins` (distinguish official `tmux-plugins` org from community)
   - "theme for X color scheme" → `Themes` (filter by color name)
   - "status-bar widget for X signal" → `Status Bar` (filter by signal)
   - "session / workspace manager for X" → `Tools and session management` (pick by config style)
   - "how do I do X in tmux" → `Tutorials` or `Books`
   - "cheat sheet" → `Cheat Sheets`
   - "I'm building a tmux plugin" → `Plugins > Development and testing`
3. **Filter** to 1-3 high-signal picks over a dump of 50 links.
4. **Cite** every recommendation with exact title + URL + `[src:…]`.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.
- [references/sources.json](./references/sources.json) — registered sources.
- [references/README-awesome-tmux.md](./references/README-awesome-tmux.md) — verbatim upstream README.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Grep `references/README-awesome-tmux.md` directly. |
| Topic not in any registered source | State the gap, suggest the closest related topic (e.g. "no Zellij / screen comparisons in the registry"). |
| User asks about tmux core / plugin API | Out of scope; point at the official tmux man pages and the `Plugins > Development and testing` subtopic. |
| User asks about other terminal multiplexers (Zellij, screen, Byobu, WezTerm, Kitty) | Out of scope; defer to general Claude. |
| User wants me to actually write / install a tmux config | Recommend a starter, then hand off — this skill is a navigator, not a generator. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
| Two resources share the same title (e.g. `tmux-spotify-info` for both macOS and Linux) | Distinguish by URL/repo owner in the citation. |
