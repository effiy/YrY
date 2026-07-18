import fs from 'node:fs';
import path from 'node:path';

const TEST_FRAMEWORK_HINTS = {
    'vitest.config.{js,ts,mjs,cjs}': 'vitest',
    'jest.config.{js,ts,mjs,cjs}': 'jest',
    'pytest.ini': 'pytest',
    'pyproject.toml': 'pytest',
    'conftest.py': 'pytest',
    'go.mod': 'go test',
    'Cargo.toml': 'cargo test',
    'phpunit.xml': 'phpunit',
    'package.json': 'npm test',
};

const DOC_GLOBS = [
    /^CLAUDE\.md$/i,
    /^README(?:\..*)?$/i,
    /^CONTRIBUTING(?:\..*)?$/i,
    /^CHANGELOG(?:\..*)?$/i,
    /^LICENSE(?:\..*)?$/i,
    /^docs\//i,
    /^\.github\//i,
];

const DANGEROUS_PATTERNS = [
    { re: /eval\s*\(/g, name: 'eval()' },
    { re: /new\s+Function\s*\(/g, name: 'new Function()' },
    { re: /innerHTML\s*=/g, name: 'innerHTML assignment' },
    { re: /document\.write\s*\(/g, name: 'document.write' },
    { re: /dangerouslySetInnerHTML/g, name: 'dangerouslySetInnerHTML' },
    { re: /child_process\.(exec|spawn)\s*\(/g, name: 'child_process.exec/spawn' },
];

const STORY_DIRS = ['docs/arch', 'docs/self-test', 'docs/reports'];
const FILE_LINK_RE = /\[([^\]]+)\]\(([^)]+\.[a-z]{1,5})\)/gi;

export function buildTestFacet(records) {
    const testFiles = records.filter(record =>
        /\.(test|spec)\.[a-z]+$/.test(record.path) ||
        /(^|\/)__tests__\//.test(record.path) ||
        /\.(test|spec)\./.test(record.path)
    );

    let testFramework = null;
    for (const hint of Object.keys(TEST_FRAMEWORK_HINTS)) {
        const re = new RegExp(`^${hint.replace(/\{[^}]+\}/, '[^/]+')}$`);
        if (records.some(record => re.test(record.path))) {
            testFramework = TEST_FRAMEWORK_HINTS[hint];
            break;
        }
    }

    if (!testFramework) {
        const pkg = records.find(record => record.path === 'package.json');
        if (pkg) {
            try {
                const text = fs.readFileSync(pkg.absPath, 'utf8');
                if (/"scripts"\s*:\s*\{[^}]*"test"\s*:/m.test(text)) {
                    testFramework = 'npm test';
                }
            } catch {}
        }
    }

    return {
        framework: testFramework,
        testFileCount: testFiles.length,
        testFiles: testFiles.slice(0, 20).map(record => record.path),
        hasFramework: !!testFramework,
    };
}

export function buildDocFacet(records) {
    const docFiles = records.filter(record => DOC_GLOBS.some(re => re.test(record.path)));
    const codeFiles = records.filter(record =>
        /\.(js|ts|mjs|cjs|jsx|tsx|vue|py|go|java|rs|css|scss)$/.test(record.path)
    );

    return {
        docCount: docFiles.length,
        codeCount: codeFiles.length,
        docRatio: codeFiles.length > 0 ? +(docFiles.length / codeFiles.length).toFixed(3) : 0,
        files: docFiles.slice(0, 30).map(record => record.path),
        missingReadme: !records.some(record => /^README(?:\..*)?$/i.test(record.path)),
        missingClaude: !records.some(record => /^CLAUDE\.md$/i.test(record.path)),
        hasDocsDir: docFiles.some(record => /^docs\//i.test(record.path)),
    };
}

export function buildSecurityFacet(records) {
    const envFiles = records.filter(record => /^\.env(\..+)?$/.test(record.path));
    const htmlFiles = records.filter(record => /\.html?$/.test(record.path));
    const dangerousCalls = [];

    for (const record of records) {
        if (record.bytes > 256_000) continue;
        let content;
        try {
            content = fs.readFileSync(record.absPath, 'utf8');
        } catch {
            continue;
        }
        if (content.length > 64 * 1024) content = content.slice(0, 64 * 1024);

        for (const pattern of DANGEROUS_PATTERNS) {
            const re = new RegExp(pattern.re.source, pattern.re.flags);
            if (re.test(content)) {
                dangerousCalls.push({ file: record.path, kind: pattern.name });
            }
        }
    }

    return {
        envFileCount: envFiles.length,
        envFiles: envFiles.map(record => record.path),
        dangerousCallCount: dangerousCalls.length,
        dangerousCalls: dangerousCalls.slice(0, 20),
        htmlCount: htmlFiles.length,
        hasEnvFile: envFiles.length > 0,
    };
}

export function buildRefsFacet(records) {
    const storyDirs = STORY_DIRS.filter(dir =>
        records.some(record => record.path === dir || record.path.startsWith(`${dir}/`))
    );
    const mdFiles = records.filter(record => /\.md$/i.test(record.path));
    let brokenLinks = 0;
    let totalLinks = 0;
    const linkAudit = { byFile: {} };

    for (const record of mdFiles) {
        if (record.bytes > 256_000) continue;

        let content;
        try {
            content = fs.readFileSync(record.absPath, 'utf8');
        } catch {
            continue;
        }

        const links = [];
        let match;
        FILE_LINK_RE.lastIndex = 0;
        while ((match = FILE_LINK_RE.exec(content)) !== null) {
            const target = match[2].split('#')[0].split('?')[0];
            if (!target || /^[a-z]+:\/\//i.test(target)) continue;
            if (target.startsWith('/') || target.startsWith('http')) continue;
            links.push(target);
        }

        if (links.length === 0) continue;

        let broken = 0;
        for (const link of links) {
            const linkAbs = path.resolve(path.dirname(record.absPath), link);
            if (!fs.existsSync(linkAbs)) broken += 1;
        }

        linkAudit.byFile[record.path] = { total: links.length, broken };
        brokenLinks += broken;
        totalLinks += links.length;
    }

    return {
        storyDirCount: storyDirs.length,
        storyDirs,
        mdFileCount: mdFiles.length,
        totalLinks,
        brokenLinks,
        brokenRatio: totalLinks > 0 ? +(brokenLinks / totalLinks).toFixed(3) : 0,
        byFile: linkAudit.byFile,
    };
}

export function buildInitFacet(records, docFacet, testFacet) {
    return {
        hasClaude: docFacet.missingClaude === false,
        hasReadme: docFacet.missingReadme === false,
        hasDocs: docFacet.hasDocsDir,
        hasTests: testFacet.hasFramework,
        hasPackageJson: records.some(record => record.path === 'package.json'),
        hasPyproject: records.some(record => record.path === 'pyproject.toml'),
        hasGoMod: records.some(record => record.path === 'go.mod'),
        hasCargoToml: records.some(record => record.path === 'Cargo.toml'),
        totalFiles: records.length,
        totalBytes: records.reduce((sum, record) => sum + record.bytes, 0),
    };
}

export function detectDeps(records) {
    const out = {
        runtime: [],
        dev: [],
        items: [],
        runtimeCount: 0,
        devCount: 0,
        totalCount: 0,
        pinningRatio: 0,
        staleCount: 0,
    };
    const pkgJson = records.find(record => record.path === 'package.json');

    if (pkgJson) {
        try {
            const text = fs.readFileSync(pkgJson.absPath, 'utf8');
            let parsed = null;
            try {
                parsed = JSON.parse(text);
            } catch {}

            if (!parsed) {
                const depBlock = extractDepsBlock(text, '"dependencies"');
                const devBlock = extractDepsBlock(text, '"devDependencies"');
                out.runtime = parseBlock(depBlock);
                out.dev = parseBlock(devBlock);
            } else {
                out.runtime = Object.entries(parsed.dependencies || {}).map(([name, version]) => ({
                    name,
                    version,
                    category: 'unknown',
                }));
                out.dev = Object.entries(parsed.devDependencies || {}).map(([name, version]) => ({
                    name,
                    version,
                    category: 'unknown',
                }));
            }
        } catch {}
    }

    const CATEGORY_HINTS = {
        ui: ['vue', 'react', 'svelte', 'angular', 'ant', 'element', 'vant', 'naive'],
        state: ['pinia', 'redux', 'vuex', 'mobx', 'zustand', 'jotai'],
        router: ['router', 'tanstack'],
        build: ['vite', 'webpack', 'rollup', 'esbuild', 'parcel', 'turbopack', 'tsup', 'unplugin'],
        test: ['vitest', 'jest', 'mocha', 'chai', 'playwright', 'cypress', 'testing-library', '@vitest', 'happy-dom'],
        util: ['axios', 'lodash', 'dayjs', 'moment', 'date-fns', 'uuid', 'nanoid', 'crypto-js'],
        style: ['sass', 'less', 'stylus', 'tailwind', 'postcss', 'unocss'],
    };

    for (const dep of [...out.runtime, ...out.dev]) {
        const lowerName = dep.name.toLowerCase();
        dep.category = Object.entries(CATEGORY_HINTS)
            .find(([, hints]) => hints.some(hint => lowerName.includes(hint)))?.[0] || 'other';
    }

    out.items = [...out.runtime, ...out.dev].slice(0, 100);
    out.runtimeCount = out.runtime.length;
    out.devCount = out.dev.length;
    out.totalCount = out.runtime.length + out.dev.length;

    const all = [...out.runtime, ...out.dev];
    const pinned = all.filter(dep =>
        /^\d/.test(dep.version) || /^git\+/.test(dep.version) || /^file:/.test(dep.version)
    ).length;
    out.pinningRatio = all.length > 0 ? +(pinned / all.length).toFixed(3) : 0;
    out.staleCount = 0;
    return out;
}

function extractDepsBlock(text, key) {
    const re = new RegExp(`${key}\\s*:\\s*\\{([^}]*)\\}`, 'm');
    const match = text.match(re);
    return match ? match[1] : '';
}

function parseBlock(block) {
    if (!block) return [];
    const out = [];
    const re = /"([^"]+)"\s*:\s*"([^"]+)"/g;
    let match;
    while ((match = re.exec(block)) !== null) {
        out.push({ name: match[1], version: match[2], category: 'unknown' });
    }
    return out;
}
