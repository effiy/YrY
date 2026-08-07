"""One-shot seed script: populate 3 realistic stories for the Story Board.

Stores story documents in MongoDB `stories` collection.
Idempotent: skips if collection already has >= 3 docs.

Run from YiAi/:
    /opt/homebrew/Cellar/python@3.11/3.11.9/Frameworks/Python.framework/Versions/3.11/Resources/Python.app/Contents/MacOS/Python scripts/seed_stories.py
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

STORIES = [
    {
        "name": "AI Chat with Knowledge Grounding",
        "project": "YiAi",
        "status": "develop",
        "priority": "p0",
        "description": "Enable RAG-powered knowledge grounding in the AI chat endpoint. Users can ask questions and get answers grounded in the YiKnowledge markdown corpus with inline citations.",
        "background": "YiAi currently supports plain LLM chat via Ollama. Users want answers grounded in our internal knowledge base (YiKnowledge). The RAG module (llama_index) is already built but not wired into the chat flow.",
        "acceptance": "Given a user asks a question about YiKnowledge content, when knowledge grounding is enabled, then the answer includes inline citations with source file paths.",
        "assignee": "Chengliang Yi",
        "tags": ["ai", "rag", "knowledge"],
        "scenarios": [
            {
                "key": "sc_rag_001",
                "name": "Basic grounded question",
                "description": "User asks a question about a known YiKnowledge topic with grounding enabled",
                "priority": "p0",
                "status": "develop",
                "steps": [
                    {"order": 1, "action": "Given", "description": "User has knowledge grounding enabled in chat"},
                    {"order": 2, "action": "When", "description": "User asks 'What is the RPC envelope pattern?'"},
                    {"order": 3, "action": "Then", "description": "Response includes inline citations like [1] linking to source files"},
                ],
                "trigger": "User sends a chat message with grounding=true",
                "expectedResult": "Response with 2-5 cited sources from YiKnowledge",
            },
            {
                "key": "sc_rag_002",
                "name": "Scope-limited grounding",
                "description": "User scopes RAG to a specific file or folder",
                "priority": "p1",
                "status": "planning",
                "steps": [
                    {"order": 1, "action": "Given", "description": "User has set RAG scope to 'engineer/patterns/'"},
                    {"order": 2, "action": "When", "description": "User asks about engineering patterns"},
                    {"order": 3, "action": "Then", "description": "Only sources from engineer/patterns/ are cited"},
                ],
                "trigger": "User sends a chat message with a scope filter",
                "expectedResult": "Only sources within the scoped path are returned",
            },
        ],
    },
    {
        "name": "Bug Management Dashboard",
        "project": "YiVad",
        "status": "testing",
        "priority": "p1",
        "description": "Build a comprehensive bug tracking dashboard with list view, detail view, keyboard shortcuts, and AI chat integration. The detail page includes auto-generated retrospective analysis.",
        "background": "YiVad needs a bug management page to track defects across YiAi, YiVad, and YiPet. The bug data is stored in MongoDB with long-form content in YiKnowledge markdown files.",
        "acceptance": "Given a bug exists in the system, when the user navigates to the bug detail page, then they see the full bug report with lifecycle timeline, reproduction steps, resolution, retrospective, and cross-domain links.",
        "assignee": "Frontend Team",
        "tags": ["bug", "dashboard", "ai-chat"],
        "scenarios": [
            {
                "key": "sc_bug_001",
                "name": "Bug lifecycle tracking",
                "description": "Track a bug from open to closed with all intermediate states",
                "priority": "p1",
                "status": "testing",
                "steps": [
                    {"order": 1, "action": "Given", "description": "A bug exists with status 'open'"},
                    {"order": 2, "action": "When", "description": "Engineer marks it 'in_progress', then 'resolved'"},
                    {"order": 3, "action": "Then", "description": "Lifecycle timeline shows all 3 events with timestamps"},
                ],
                "trigger": "Status change via edit drawer",
                "expectedResult": "Timeline rendered with Created → In Progress → Resolved",
            },
        ],
    },
    {
        "name": "Cross-Project Session Hub",
        "project": "YiPet",
        "status": "operations",
        "priority": "p1",
        "description": "YiPet serves as a cross-project chat hub, capturing conversations from any page (YiAi, YiVad, YiKnowledge, external) and bridging them into YiVad aiChat sessions.",
        "background": "YiPet v1.2.0 supports multi-role chat, session persistence, and cross-project navigation. Users can start a chat on any page, then open it in YiVad for deeper analysis.",
        "acceptance": "Given a user has a chat session in YiPet about a YiVad bug, when they click 'Discuss in YiVad aiChat', then a new YiVad session is seeded with the page context and the user lands in YiVad's aiChat page.",
        "assignee": "YiPet Team",
        "tags": ["cross-project", "chat", "session"],
        "scenarios": [
            {
                "key": "sc_pet_001",
                "name": "Bridge to YiVad aiChat",
                "description": "Seed a YiVad session from YiPet and navigate there",
                "priority": "p1",
                "status": "operations",
                "steps": [
                    {"order": 1, "action": "Given", "description": "User is on a YiVad bug detail page in Chrome"},
                    {"order": 2, "action": "When", "description": "User opens YiPet, discusses the bug, clicks 'Discuss in YiVad'"},
                    {"order": 3, "action": "Then", "description": "A new YiVad aiChat session opens in a new tab with the bug context"},
                ],
                "trigger": "User clicks 'Discuss in YiVad aiChat' in YiPet toolbar",
                "expectedResult": "YiVad aiChat opens with session pre-seeded",
            },
        ],
    },
]

def _key(prefix: str) -> str:
    stamp = int(time.time() * 1000)
    rand = random.randint(10_000, 99_999)
    return f"{prefix}_{stamp}{rand}"

async def seed_stories():
    cname = "stories"
    existing_count = 0
    try:
        result = await db.find_many(cname, {}, limit=1)
        existing_count = len(result) if result else 0
    except Exception:
        pass
    if existing_count >= 3:
        print(f"skip   {cname:<30} (already has {existing_count} entries)")
        return

    now = int(time.time() * 1000)
    today = now
    next_week = today + 7 * 86400000

    for story in STORIES:
        doc = {
            "key": _key("story"),
            "name": story["name"],
            "project": story["project"],
            "status": story["status"],
            "priority": story["priority"],
            "description": story["description"],
            "background": story["background"],
            "acceptance": story["acceptance"],
            "assignee": story["assignee"],
            "tags": story["tags"],
            "scenarios": story["scenarios"],
            "files": [],
            "startDate": today,
            "dueDate": next_week,
            "completedAt": today if story["status"] == "operations" else None,
            "createdAt": today,
            "updatedAt": today,
        }
        await db.insert_one(cname, doc)
        today += 1  # Slightly different timestamps

    print(f"wrote  {cname:<30} {len(STORIES)} stories")

async def main():
    await db.initialize()
    await seed_stories()
    print("\nDone. Stories seeded.")

if __name__ == "__main__":
    asyncio.run(main())