---
title: Analysis Files Prompt Generation and AICR Linkage
key: 189f1953-295e-478b-859e-f0fe0e32ad29
tags:
- analysis-files
- ai-prompt
- claude-code
- ollama
- qwen3.5
- story-board
- aicr
- code-review
- scenario-files
- rpc
category: engineer/learn/projects/yivad/stories
created: '2026-07-26'
updated: '2026-07-26'
source: internal
type: story
status: operations
project: YiVad
story_name: analysis-files-prompt-generation-and-aicr-linkage
---

# Analysis Files Prompt Generation and AICR Linkage

The Analysis Files button generates AI-powered Claude Code prompts that map scenario definitions to relevant project files. The generated prompt does NOT modify any source code — it instructs Claude Code to analyze a scenario and populate its files array via the RPC updateDocument API. These populated files then link with the AICR (AI Code Review) page, enabling developers to navigate from scenario definitions directly to the associated source files for review, chat-based code analysis, and session management.
