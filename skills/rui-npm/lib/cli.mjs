/**
 * rui-npm cli — argument parsing
 * Extracted from rui-npm.mjs for single-responsibility
 */

export function parseArgs(argv) {
  /** @type {{ _: string[], json: boolean, depth: number, dev: boolean, global: boolean, limit: number, name: string|null, version: string|null, description: string|null, access: string|null, dryRun: boolean, token: string|null, npxArgs: string[], raw: string[], force: boolean }} */
  const args = { _: [], json: false, depth: 0, dev: false, global: false, limit: 20,
    name: null, version: null, description: null, access: null, dryRun: false,
    token: null, npxArgs: [], raw: [], force: false };
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === "--json") { args.json = true; }
    else if (a === "--dev" || a === "-D") { args.dev = true; }
    else if (a === "--global" || a === "-g") { args.global = true; }
    else if (a === "--depth") { args.depth = parseInt(argv[++i], 10); }
    else if (a === "--limit") { args.limit = parseInt(argv[++i], 10); }
    else if (a === "--name") { args.name = argv[++i]; }
    else if (a === "--version") { args.version = argv[++i]; }
    else if (a === "--description") { args.description = argv[++i]; }
    else if (a === "--access") { args.access = argv[++i]; }
    else if (a === "--dry-run") { args.dryRun = true; }
    else if (a === "--token") { args.token = argv[++i]; }
    else if (a === "--force" || a === "-f") { args.force = true; }
    else if (a === "--") { args.npxArgs = argv.slice(i + 1); i = argv.length; }
    else if (a.startsWith("-")) { args.raw.push(a); }
    else { args._.push(a); }
    i++;
  }
  return args;
}
