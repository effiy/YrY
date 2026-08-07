"""One-shot seed script: populate RSS seeds + items for the RSS page.

Stores seed configs in MongoDB `seeds` collection and RSS items in `rss` collection.
Idempotent: skips if collection already has >= 1 doc.

Run from YiAi/:
    /opt/homebrew/Cellar/python@3.11/3.11.9/Frameworks/Python.framework/Versions/3.11/Resources/Python.app/Contents/MacOS/Python scripts/seed_rss.py
"""
from __future__ import annotations

import asyncio
import sys
import time
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from data.database import db  # type: ignore

SEEDS = [
    {"url": "https://feeds.feedburner.com/TheHackersNews", "name": "The Hacker News", "category": "security-engineer", "tags": ["security", "news"]},
    {"url": "https://blog.rust-lang.org/feed.xml", "name": "Rust Blog", "category": "engineer", "tags": ["rust", "systems"]},
    {"url": "https://martinfowler.com/feed.atom", "name": "Martin Fowler", "category": "tech-lead", "tags": ["architecture", "patterns"]},
    {"url": "https://engineering.fb.com/feed/", "name": "Meta Engineering", "category": "engineer", "tags": ["infrastructure", "scale"]},
    {"url": "https://aws.amazon.com/blogs/architecture/feed/", "name": "AWS Architecture", "category": "tech-lead", "tags": ["cloud", "architecture"]},
    {"url": "https://github.blog/feed/", "name": "GitHub Blog", "category": "engineer", "tags": ["dev-tools", "github"]},
    {"url": "https://openai.com/blog/rss.xml", "name": "OpenAI Blog", "category": "ai-engineer", "tags": ["llm", "openai"]},
    {"url": "https://www.anthropic.com/blog/rss.xml", "name": "Anthropic Blog", "category": "ai-engineer", "tags": ["llm", "claude"]},
]

RSS_ITEMS = [
    {
        "title": "New Ransomware Variant Targets Linux Systems via SSH Brute-Force",
        "link": "https://thehackernews.com/2026/08/ransomware-linux-ssh.html",
        "source_name": "The Hacker News",
        "source_url": "https://feeds.feedburner.com/TheHackersNews",
        "published": "2026-08-04",
        "author": "Ravie Lakshmanan",
        "category_path": "security-engineer/threats",
        "file_path": "security-engineer/threats/ransomware-linux-ssh-2026.md",
        "tags": ["security", "ransomware", "linux"],
    },
    {
        "title": "Rust 2026 Edition: Async Traits and Const Generics Stabilized",
        "link": "https://blog.rust-lang.org/2026/08/01/rust-2026-edition.html",
        "source_name": "Rust Blog",
        "source_url": "https://blog.rust-lang.org/feed.xml",
        "published": "2026-08-01",
        "author": "Rust Core Team",
        "category_path": "engineer/languages",
        "file_path": "engineer/languages/rust-2026-edition.md",
        "tags": ["rust", "language-design"],
    },
    {
        "title": "Refactoring to a Microservices Architecture: Lessons from 5 Years",
        "link": "https://martinfowler.com/articles/refactoring-microservices-2026.html",
        "source_name": "Martin Fowler",
        "source_url": "https://martinfowler.com/feed.atom",
        "published": "2026-07-28",
        "author": "Martin Fowler",
        "category_path": "tech-lead/architecture",
        "file_path": "tech-lead/architecture/microservices-lessons-2026.md",
        "tags": ["microservices", "architecture", "refactoring"],
    },
    {
        "title": "How Meta Scales PostgreSQL to 10M QPS",
        "link": "https://engineering.fb.com/2026/07/25/data-infrastructure/postgresql-10m-qps/",
        "source_name": "Meta Engineering",
        "source_url": "https://engineering.fb.com/feed/",
        "published": "2026-07-25",
        "author": "Meta Data Infra Team",
        "category_path": "engineer/database",
        "file_path": "engineer/database/meta-postgresql-10m-qps.md",
        "tags": ["postgresql", "scaling", "database"],
    },
    {
        "title": "Event-Driven Architectures on AWS: Patterns and Anti-Patterns",
        "link": "https://aws.amazon.com/blogs/architecture/event-driven-patterns-2026/",
        "source_name": "AWS Architecture",
        "source_url": "https://aws.amazon.com/blogs/architecture/feed/",
        "published": "2026-07-20",
        "author": "AWS Architecture Team",
        "category_path": "tech-lead/architecture",
        "file_path": "tech-lead/architecture/aws-event-driven-patterns.md",
        "tags": ["aws", "event-driven", "patterns"],
    },
    {
        "title": "GitHub Copilot Workspace: AI-Native Dev Environment Goes GA",
        "link": "https://github.blog/2026-07-15-copilot-workspace-ga/",
        "source_name": "GitHub Blog",
        "source_url": "https://github.blog/feed/",
        "published": "2026-07-15",
        "author": "GitHub Team",
        "category_path": "ai-engineer/tools",
        "file_path": "ai-engineer/tools/copilot-workspace-ga.md",
        "tags": ["copilot", "ai-coding", "github"],
    },
    {
        "title": "GPT-5: What We Learned from the First Year in Production",
        "link": "https://openai.com/blog/gpt5-first-year/",
        "source_name": "OpenAI Blog",
        "source_url": "https://openai.com/blog/rss.xml",
        "published": "2026-07-10",
        "author": "OpenAI Team",
        "category_path": "ai-engineer/llm",
        "file_path": "ai-engineer/llm/gpt5-first-year.md",
        "tags": ["gpt5", "llm", "production"],
    },
    {
        "title": "Claude's System Prompt Engineering Guide: Best Practices for 2026",
        "link": "https://www.anthropic.com/blog/system-prompt-guide-2026",
        "source_name": "Anthropic Blog",
        "source_url": "https://www.anthropic.com/blog/rss.xml",
        "published": "2026-07-05",
        "author": "Anthropic Research",
        "category_path": "ai-engineer/prompts",
        "file_path": "ai-engineer/prompts/claude-system-prompt-2026.md",
        "tags": ["claude", "prompt-engineering", "best-practices"],
    },
]

def _key(prefix: str) -> str:
    stamp = int(time.time() * 1000)
    rand = random.randint(10_000, 99_999)
    return f"{prefix}_{stamp}{rand}"

async def _collection_has_any(cname: str) -> bool:
    existing = await db.find_one(cname, {})
    return existing is not None

async def seed_seeds():
    cname = "seeds"
    if await _collection_has_any(cname):
        print(f"skip   {cname:<30} (already has entries)")
        return
    now = int(time.time() * 1000)
    for s in SEEDS:
        doc = {
            "key": _key("seed"),
            "url": s["url"],
            "name": s["name"],
            "enabled": True,
            "category": s["category"],
            "tags": s["tags"],
            "createdAt": now,
            "updatedAt": now,
        }
        await db.insert_one(cname, doc)
    print(f"wrote  {cname:<30} {len(SEEDS)} seeds")

async def seed_rss():
    cname = "rss"
    if await _collection_has_any(cname):
        print(f"skip   {cname:<30} (already has entries)")
        return
    now = int(time.time() * 1000)
    for item in RSS_ITEMS:
        doc = {
            "key": _key("rss"),
            "title": item["title"],
            "link": item["link"],
            "source_name": item["source_name"],
            "source_url": item["source_url"],
            "published": item["published"],
            "author": item["author"],
            "category_path": item["category_path"],
            "file_path": item["file_path"],
            "tags": item["tags"],
            "createdTime": now,
            "updatedTime": now,
        }
        await db.insert_one(cname, doc)
    print(f"wrote  {cname:<30} {len(RSS_ITEMS)} items")

async def main():
    await db.initialize()
    await seed_seeds()
    await seed_rss()
    print("\nDone. RSS seeds + items seeded.")

if __name__ == "__main__":
    asyncio.run(main())