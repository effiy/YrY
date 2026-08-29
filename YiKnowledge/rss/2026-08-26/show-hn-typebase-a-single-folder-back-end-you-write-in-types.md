---
title: 'Show HN: Typebase – A single-folder back end you write in TypeScript'
tags:
- Hacker News
category: engineer/lessons
created: '2026-08-29'
source: https://typebase.io
type: rss
source_name: Hacker News
source_url: https://hnrss.org/frontpage
published: Wed, 26 Aug 2026 11:33:31 +0000
author: andrewww-dev
---

<p>Hey HN!<p>I built Typebase, a library that gives you Convex's DX with Supabase's openness.<p>After trying Supabase I liked how fast it is to spin up a DB and auth, but really didn't like using RLS and SQL for authorization. With Convex I loved how your server "lives" in your code, but disliked the DB model and the realtime-first defaults.<p>With Typebase you just write TS files inside a typebase/ folder in your existing repo. You can define your DB tables inside a schema.ts file and export server functions that your frontend calls like local functions, fully typed. Auth is built in.<p>Then one CLI command uploads your server to any of the available providers (Vercel, Cloudflare Workers or Deno Deploy for the servera and Neon for the DB), or generates the code so you can deploy it wherever you want.<p>Built on top of oRPC, Drizzle, and better-auth.<p>Happy to answer any questions or feedback!</p>
<hr />
<p>Comments URL: <a href="https://news.ycombinator.com/item?id=49447178">https://news.ycombinator.com/item?id=49447178</a></p>
<p>Points: 5</p>
<p># Comments: 0</p>