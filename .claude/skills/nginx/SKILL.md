---
name: nginx
description: >
  Curated Nginx operations & ecosystem navigator — uses curated local
  indexes derived from trimstray/nginx-admins-handbook and recommends
  the right book, official doc,
  tooling, generator, parser, static analyzer, log/performance
  analyzer, benchmarking tool, debugger, security scanner, or
  hardening guide for a given Nginx task. Trigger when the user wants
  to: pick an Nginx book (Nginx Essentials, Cookbook, HTTP Server,
  High Performance, Mastering Nginx, ModSecurity 3.0), find official
  Nginx docs / wiki, compare Nginx with alternatives (Apache,
  OpenResty, Tengine, varnish, squid), pick a cheatsheet or boilerplate
  config, find a hardening / performance guide (SSL Labs, Mozilla
  Observatory, HSTS, OCSP stapling, TLS 1.2/1.3, PFS), generate a
  config (nginxconfig.io, Mozilla SSL generator), parse a running
  config (crossplane, nginxparser), manage Nginx with Ansible/Puppet
  (jdauphant, geerlingguy, nginxinc), run static analysis (gixy,
  nginxbeautifier, nginx-minify-conf), analyze logs (GoAccess,
  Graylog, Logstash, ngxtop), build custom deb/rpm
  (TinkoffCreditSystems/Nginx-builder), load-test (ab, siege, wrk,
  wrk2, vegeta, bombardier, JMeter, Gatling, locust, slowloris,
  slowhttptest), debug a running process (strace, gdb, SystemTap,
  stapxx, htrace.sh), test SSL/TLS (testssl.sh, sslyze, ssllabs-scan,
  http-observatory, nikto, h2spec), or develop Nginx / OpenResty
  modules (agentzh, emiller). Trigger words: "nginx", "nginx book",
  "nginx cookbook", "nginx docs", "nginx config", "nginx generator",
  "crossplane", "nginxparser", "ansible nginx", "puppet nginx",
  "gixy", "nginx analyzer", "nginx linter", "goaccess", "ngxtop",
  "graylog", "logstash nginx", "nginx builder", "wrk", "vegeta",
  "bombardier", "jmeter gatling locust", "strace", "gdb", "systemtap",
  "stapxx", "nginx ssl", "nginx tls", "ssl labs", "mozilla
  observatory", "hsts", "ocsp stapling", "modsecurity nginx",
  "naxsi", "openresty", "tengine", "nginx reverse proxy", "nginx
  rate limit", "nginx performance", "nginx tuning", "nginx
  hardening", "nikto", "testssl.sh", "sslyze", "nghttp2", "h2spec",
  "emiller nginx module", "openresty lua".

  Do NOT trigger for: non-Nginx web servers (Apache alone, Caddy,
  HAProxy, Envoy, Traefik, IIS) without an Nginx angle, generic
  HTTP/TLS concept questions, server-side scripting that doesn't
  involve Nginx / OpenResty, or any task unrelated to the curated
  Nginx operations & ecosystem above.
lifecycle: default-pipeline
user_invocable: true
---

# nginx — Curated Nginx Operations & Ecosystem Navigator

> Pick the right Nginx book, official doc, tool, or hardening guide.
> Uses local indexes derived from [trimstray/nginx-admins-handbook](https://github.com/trimstray/nginx-admins-handbook),
> covering ~205 resources across 2 categories and 21 topics,
> and answers with exact titles, URLs, and source provenance.

## What this skill does

1. **Maps an Nginx question** to a topic across the registered source
   (`nginx-admins-handbook`): books, official docs, distributions,
   cheatsheets, hardening, talks, generators, parsers, managers,
   analyzers, builders, benchmarking, debugging, security, development.
2. **Recommends a book** for the user's level (Nginx Essentials for
   beginner, Nginx Cookbook for recipes, Nginx High Performance for
   tuning, Mastering Nginx for sysadmins, ModSecurity 3.0 for WAF,
   Cisco ACE → NGINX for migration).
3. **Picks the right tool** — generator (nginxconfig.io), parser
   (crossplane), manager (Ansible/Puppet roles), static analyzer (gixy),
   log/performance analyzer (GoAccess, ngxtop), builder (Nginx-builder),
   benchmarking (wrk, vegeta, JMeter, slowloris), debugger (strace,
   gdb, SystemTap, htrace.sh), security (Burp Suite, nikto, testssl.sh,
   ssllabs-scan, h2spec).
4. **Cites every recommendation** by exact title and URL with the
   `[src:nginx-admins-handbook]` tag.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses local indexes in `references/`.
- Does NOT teach Nginx from scratch — recommend books instead.
- Does NOT cover non-Nginx web servers (Apache-only, Caddy, HAProxy,
  Envoy, Traefik, IIS) without an Nginx angle.
- Does NOT auto-generate project scaffolding — recommend a tool, then
  point the user at its README.

## Workflow

1. **Read** `references/index.md`.
2. **Match** the user's intent to a category:
   - "which Nginx book" → `Books`
   - "official Nginx docs / wiki / pitfalls" → `Nginx official`
   - "Nginx vs X" / "OpenResty or Tengine" → `Nginx distributions` + `Comparison reviews`
   - "Nginx cheatsheet / boilerplate" → `Cheatsheets & References`
   - "harden Nginx" / "TLS ciphers" / "HSTS" / "ModSecurity" / "NAXSI" → `Performance & Hardening`
   - "config generator / parser / Ansible role" → `Config generators` / `Config parsers` / `Config managers`
   - "check my nginx.conf" / "gixy" → `Static analyzers`
   - "analyse access log" / "GoAccess" / "ngxtop" → `Log analyzers` + `Performance analyzers`
   - "build deb / rpm" → `Builder tools`
   - "load test Nginx" / "wrk" / "vegeta" / "JMeter" → `Benchmarking tools`
   - "debug a running Nginx" / "strace" / "htrace.sh" → `Debugging tools`
   - "test SSL/TLS" / "nikto" / "testssl.sh" → `Security & Web testing tools`
   - "develop Nginx / OpenResty module" → `Development`
3. **Filter** to 1-3 high-signal picks — distinguish throughput vs load
   vs DoS-simulator benchmarking tools.
4. **Cite** every recommendation with exact title + URL + `[src:…]`.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Re-run `/yry-init` to rebuild the index. |
| Topic not in any registered source | State the gap, suggest the closest indexed topic, then point to the source homepage if needed. |
| User asks about Nginx core / API debugging or conceptual narrative (HTTP/SSL/Nginx basics) | Out of scope — recommend official docs or one of the indexed books. |
| User asks about non-Nginx web servers | Out of scope; defer to general Claude. |
| User wants an Nginx config actually generated | Recommend a generator / boilerplate from the index, then hand off — this skill is a navigator, not a generator. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
