import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, isAbsolute, relative, basename } from "node:path";
import { validateGraph } from "../schema.js";
const GRAPH_FILE = "knowledge-graph.json";
const META_FILE = "meta.json";
const FINGERPRINT_FILE = "fingerprints.json";
const CONFIG_FILE = "config.json";
const DOMAIN_GRAPH_FILE = "domain-graph.json";

/**
 * Ensure the output directory exists and return its path.
 *
 * `outputDir` is the directory containing the generated `architecture-diagram.html`
 * (e.g., the parent directory of the `--out` path, or CWD by default). All
 * data files (knowledge-graph.json, meta.json, fingerprints.json, config.json,
 * domain-graph.json) are colocated with the HTML output.
 */
function ensureDir(outputDir) {
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }
    return outputDir;
}
/**
 * Sanitise every node's filePath before writing to disk.
 *
 * The analysis agent produces absolute paths like:
 *   /Users/alice/company/src/auth.ts
 *
 * We convert them to paths relative to projectRoot:
 *   src/auth.ts
 *
 * Three cases are handled:
 *   1. Path is inside projectRoot      → make it relative
 *   2. Path is absolute but outside    → keep only the filename (last segment)
 *   3. Path is already relative        → leave it untouched
 *
 * This means the developer's home directory, username, and company
 * directory layout are never written to knowledge-graph.json.
 */
function sanitiseFilePaths(graph, projectRoot) {
    const normalRoot = projectRoot.endsWith("/")
        ? projectRoot
        : projectRoot + "/";
    const sanitisedNodes = graph.nodes.map((node) => {
        if (typeof node.filePath !== "string")
            return node;
        const fp = node.filePath;
        if (!isAbsolute(fp)) {
            // Already relative — nothing to do.
            return node;
        }
        if (fp.startsWith(normalRoot) || fp.startsWith(projectRoot)) {
            // Inside the project root — make it relative.
            return { ...node, filePath: relative(projectRoot, fp) };
        }
        // Absolute but outside the project root — use only the filename
        // so we leak as little as possible.
        return { ...node, filePath: basename(fp) };
    });
    return { ...graph, nodes: sanitisedNodes };
}

/**
 * Save the knowledge graph to `<outputDir>/knowledge-graph.json`.
 *
 * @param {string} outputDir     - directory containing the generated HTML
 * @param {object} graph         - the knowledge graph to persist
 * @param {string} [projectRoot] - required when graph nodes carry absolute
 *                                 paths; used to sanitise them to relative
 */
export function saveGraph(outputDir, graph, projectRoot) {
    const dir = ensureDir(outputDir);
    // FIX — sanitise absolute file paths before persisting.
    // Without this, absolute paths like /Users/alice/company/src/auth.ts
    // are written verbatim into knowledge-graph.json and later served
    // by the dashboard server, leaking the developer's directory layout.
    const sanitised = projectRoot
        ? sanitiseFilePaths(graph, projectRoot)
        : graph;
    writeFileSync(join(dir, GRAPH_FILE), JSON.stringify(sanitised, null, 2), "utf-8");
}
export function loadGraph(outputDir, options) {
    const filePath = join(outputDir, GRAPH_FILE);
    if (!existsSync(filePath))
        return null;
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    if (options?.validate !== false) {
        const result = validateGraph(data);
        if (!result.success) {
            throw new Error(`Invalid knowledge graph: ${result.fatal ?? "unknown error"}`);
        }
        return result.data;
    }
    return data;
}
export function saveMeta(outputDir, meta) {
    const dir = ensureDir(outputDir);
    writeFileSync(join(dir, META_FILE), JSON.stringify(meta, null, 2), "utf-8");
}
export function loadMeta(outputDir) {
    const filePath = join(outputDir, META_FILE);
    if (!existsSync(filePath))
        return null;
    return JSON.parse(readFileSync(filePath, "utf-8"));
}
export function saveFingerprints(outputDir, store) {
    const dir = ensureDir(outputDir);
    writeFileSync(join(dir, FINGERPRINT_FILE), JSON.stringify(store, null, 2), "utf-8");
}
export function loadFingerprints(outputDir) {
    const filePath = join(outputDir, FINGERPRINT_FILE);
    if (!existsSync(filePath))
        return null;
    try {
        return JSON.parse(readFileSync(filePath, "utf-8"));
    }
    catch {
        return null;
    }
}
const DEFAULT_CONFIG = { autoUpdate: false, outputLanguage: "en" };
export function saveConfig(outputDir, config) {
    const dir = ensureDir(outputDir);
    writeFileSync(join(dir, CONFIG_FILE), JSON.stringify(config, null, 2), "utf-8");
}
export function loadConfig(outputDir) {
    const filePath = join(outputDir, CONFIG_FILE);
    if (!existsSync(filePath))
        return { ...DEFAULT_CONFIG };
    try {
        return JSON.parse(readFileSync(filePath, "utf-8"));
    }
    catch {
        return { ...DEFAULT_CONFIG };
    }
}

/**
 * Save the domain graph to `<outputDir>/domain-graph.json`.
 *
 * @param {string} outputDir     - directory containing the generated HTML
 * @param {object} graph         - the domain graph to persist
 * @param {string} [projectRoot] - required when graph nodes carry absolute
 *                                 paths; used to sanitise them to relative
 */
export function saveDomainGraph(outputDir, graph, projectRoot) {
    const dir = ensureDir(outputDir);
    const sanitised = projectRoot
        ? sanitiseFilePaths(graph, projectRoot)
        : graph;
    writeFileSync(join(dir, DOMAIN_GRAPH_FILE), JSON.stringify(sanitised, null, 2), "utf-8");
}
export function loadDomainGraph(outputDir, options) {
    const filePath = join(outputDir, DOMAIN_GRAPH_FILE);
    if (!existsSync(filePath))
        return null;
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    if (options?.validate !== false) {
        const result = validateGraph(data);
        if (!result.success) {
            throw new Error(`Invalid domain graph: ${result.fatal ?? "unknown error"}`);
        }
        return result.data;
    }
    return data;
}
