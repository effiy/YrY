---
title: Grok exfiltrates user data when malicious instructions are encrypted
tags:
- Ars Technica
category: executive/industry
created: '2026-08-22'
source: https://arstechnica.com/security/2026/08/grok-exfiltrates-user-data-when-malicious-instructions-are-encrypted/
type: rss
source_name: Ars Technica
source_url: https://feeds.arstechnica.com/arstechnica/index
published: Thu, 20 Aug 2026 13:00:35 +0000
author: Dan Goodin
---

<p>Earlier this week, researchers outlined an attack that used a secret input provided by Microsoft 365 Copilot for enterprise to cause the AI assistant to exfiltrate a password present in the user’s inbox. Now, a separate team has devised a similar attack against Grok. The new data theft hack employs a deceptively simple trick to force the Elon Musk-owned large language model to steal user chats and other personal information. At the time this post went live, the assistant continued to cough up the data, despite xAI being informed of it in June.</p>
<p>The lesson from both this week’s episodes—and the countless other ones that have come before it—is that LLMs are incapable of solving the root causes for prompt injections, the most severe vulnerability classes they’re most prone to. That leaves AI developers with no other option but to build a guardrail that steers the model away from the harmful actions. As I noted in <a href="https://arstechnica.com/security/2026/08/microsoft-copilot-reveals-secret-input-that-allowed-it-to-be-hacked/">Tuesday’s story</a>, the approach is tantamount to a road traffic safety engineer erecting a protective rail around a dangerous bend rather than banking the curve.</p>
<h2>Cryptographic Context Injection in the house</h2>
<p>Prompt injections exploit LLMs' training to comply with user requests whenever possible. Attackers can capitalize on the predilection by smuggling harmful instructions into emails or webpages the assistant is instructed to summarize. Because LLMs can’t reliably distinguish between content in an email sent by an untrusted party and user instructions entered directly into a prompt, the overly solicitous LLM faithfully follows them. To date, Grok and other LLMs' only recourse is to create guardrails that flag suspicious instructions and forbid them from being executed.</p><p><a href="https://arstechnica.com/security/2026/08/grok-exfiltrates-user-data-when-malicious-instructions-are-encrypted/">Read full article</a></p>
<p><a href="https://arstechnica.com/security/2026/08/grok-exfiltrates-user-data-when-malicious-instructions-are-encrypted/#comments">Comments</a></p>