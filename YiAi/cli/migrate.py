"""YiAi MongoDB migration CLI.

Usage:
    python -m cli.migrate status
    python -m cli.migrate migrate [--target VERSION]
    python -m cli.migrate rollback --target VERSION
"""

import argparse
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

from shared.config import settings
from shared.migration import MigrationEngine


async def main():
    parser = argparse.ArgumentParser(description="YiAi MongoDB Migration Tool")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("status", help="Show migration status")
    mp = sub.add_parser("migrate", help="Run pending migrations")
    mp.add_argument("--target", type=int, help="Target version")
    rp = sub.add_parser("rollback", help="Rollback migrations")
    rp.add_argument("--target", type=int, required=True, help="Target version")

    args = parser.parse_args()

    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client.get_default_database()
    engine = MigrationEngine(db)

    if args.command == "status":
        s = await engine.status()
        print(f"\n=== Migration Status ===\n")
        print(f"Total: {s['total']}  Executed: {s['executed']}  Pending: {s['pending']}\n")
        for m in s["migrations"]:
            icon = "✅" if m["executed"] else "⏳"
            print(f"  {icon} [{m['version']:03d}] {m['name']}")

    elif args.command == "migrate":
        pending = await engine.get_pending_migrations()
        if not pending:
            print("✅ Database is up to date")
            return
        print(f"\nPending migrations ({len(pending)}):")
        for m in pending:
            print(f"  [{m.version:03d}] {m.name}")
        print()
        result = await engine.migrate(args.target)
        print(f"\nResult: {result['status']}")
        for r in result.get("results", []):
            icon = "✅" if r["status"] == "success" else "❌"
            print(f"  {icon} [{r['version']:03d}] {r['name']}")

    elif args.command == "rollback":
        print(f"\nRolling back to version {args.target}...")
        result = await engine.rollback(args.target)
        print(f"\nResult: {result['status']}")
        for r in result.get("results", []):
            icon = "✅" if r["status"] == "success" else "❌"
            print(f"  {icon} [{r['version']:03d}] {r['name']}")

    else:
        parser.print_help()

    client.close()


if __name__ == "__main__":
    asyncio.run(main())