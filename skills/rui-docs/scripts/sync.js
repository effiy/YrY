#!/usr/bin/env node

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const PROJECT = path.basename(process.cwd());
const DOCS_DIR = path.join(process.cwd(), 'docs');
const API_URL = process.env.RUI_DOCS_API_URL || 'https://api.effiy.cn';
const TOKEN = process.env.API_X_TOKEN;

function fail(msg) {
  console.error(`[rui-docs/sync] ${msg}`);
  process.exit(1);
}

// ---------- fetch ----------

async function fetchRemoteFiles() {
  if (!TOKEN) fail('API_X_TOKEN 未设置，无法连接远端');

  const res = await fetch(`${API_URL}/list-files`, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) fail(`list-files 失败: ${res.status}`);
  const data = await res.json();
  return (data.files || []).filter(f => f.path.startsWith(`${PROJECT}/docs/`));
}

// ---------- diff ----------

function localState() {
  const files = [];
  if (!fs.existsSync(DOCS_DIR)) return files;

  function walk(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      let stat;
      try { stat = fs.statSync(full); } catch { continue; }
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile() && entry.endsWith('.md')) {
        const rel = path.relative(DOCS_DIR, full);
        let hash = '';
        try { hash = require('crypto').createHash('md5').update(fs.readFileSync(full)).digest('hex'); } catch {}
        files.push({ path: rel, mtime: stat.mtimeMs, hash });
      }
    }
  }
  walk(DOCS_DIR);
  return files;
}

function diffRemoteLocal(remoteFiles, localFiles) {
  const localMap = new Map(localFiles.map(f => [f.path, f]));
  const remoteMap = new Map(remoteFiles.map(f => [f.path.replace(`${PROJECT}/docs/`, ''), f]));

  const diff = { added: [], changed: [], conflict: [], same: [] };

  for (const [rpath, rfile] of remoteMap) {
    const local = localMap.get(rpath);
    if (!local) {
      diff.added.push(rpath);
    } else if (local.hash !== rfile.hash) {
      diff.conflict.push(rpath);
    } else {
      diff.same.push(rpath);
    }
  }

  const localOnly = [];
  for (const lpath of localMap.keys()) {
    if (!remoteMap.has(lpath)) localOnly.push(lpath);
  }

  return { ...diff, localOnly };
}

// ---------- apply ----------

async function applyAdded(files) {
  if (!TOKEN) fail('API_X_TOKEN 未设置');
  let count = 0;
  for (const f of files) {
    try {
      const res = await fetch(`${API_URL}/read-file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `${PROJECT}/docs/${f}` }),
      });
      if (!res.ok) { console.error(`  拉取失败: ${f} (${res.status})`); continue; }
      const data = await res.json();
      const localPath = path.join(DOCS_DIR, f);
      await fsp.mkdir(path.dirname(localPath), { recursive: true });
      await fsp.writeFile(localPath, data.content || '', 'utf8');
      console.log(`  + ${f}`);
      count++;
    } catch (e) {
      console.error(`  拉取异常: ${f} (${e.message})`);
    }
  }
  return count;
}

// ---------- CLI ----------

const args = process.argv.slice(2);
const command = args[0] || 'diff';

(async () => {
  if (command === 'fetch') {
    if (!TOKEN) fail('API_X_TOKEN 未设置');
    const files = await fetchRemoteFiles();
    console.log(JSON.stringify(files, null, 2));
    return;
  }

  if (command === 'diff') {
    let remoteFiles = [];
    try { remoteFiles = await fetchRemoteFiles(); } catch (e) { console.error(`远端不可达: ${e.message}`); }

    const localFiles = localState();
    const diff = diffRemoteLocal(remoteFiles, localFiles);

    console.log(`📚 docs/ 同步 diff: ${PROJECT}\n`);
    console.log(`  远端新增: ${diff.added.length} 个`);
    for (const f of diff.added) console.log(`    → ${f}`);
    console.log(`  冲突 (双方修改): ${diff.conflict.length} 个`);
    for (const f of diff.conflict) console.log(`    ⚡ ${f}`);
    console.log(`  本地独有 (未推送): ${diff.localOnly.length} 个`);
    for (const f of diff.localOnly) console.log(`    ← ${f}`);
    console.log(`  一致: ${diff.same.length} 个`);

    if (diff.added.length === 0 && diff.conflict.length === 0) {
      console.log(`\n✅ 已同步，无操作需要。`);
    } else if (diff.conflict.length > 0) {
      console.log(`\n⚠️ 存在冲突文件，请手动裁决后执行 /rui-docs sync apply`);
    } else {
      console.log(`\n💡 执行 /rui-docs sync apply 拉取 ${diff.added.length} 个新文件`);
    }
    return;
  }

  if (command === 'apply') {
    let remoteFiles = [];
    try { remoteFiles = await fetchRemoteFiles(); } catch (e) { fail(`远端不可达: ${e.message}`); }

    const localFiles = localState();
    const diff = diffRemoteLocal(remoteFiles, localFiles);

    if (diff.conflict.length > 0) {
      console.error(`⚠️ 存在 ${diff.conflict.length} 个冲突文件，请先手动裁决再 apply`);
      for (const f of diff.conflict) console.error(`   ⚡ ${f}`);
      process.exit(1);
    }

    if (diff.added.length === 0) {
      console.log('没有需要拉取的新文件。');
      return;
    }

    console.log(`拉取 ${diff.added.length} 个新文件...`);
    const count = await applyAdded(diff.added);
    console.log(`\n完成: 新增 ${count} / ${diff.added.length}`);
    return;
  }

  console.log(`用法: node sync.js [fetch|diff|apply]`);
})().catch(err => { console.error(err); process.exit(1); });
