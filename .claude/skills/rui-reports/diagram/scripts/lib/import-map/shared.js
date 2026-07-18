export function toPosix(p) {
  return p.split(/[\\/]/).filter(Boolean).join('/');
}

export function resolveRelative(dir, rel) {
  const parts = (dir ? dir.split('/').filter(Boolean) : []).concat(
    rel.split('/').filter(Boolean),
  );
  const stack = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (stack.length === 0) return '';
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

export function dirOf(p) {
  const i = p.lastIndexOf('/');
  return i === -1 ? '' : p.slice(0, i);
}

export function mergeResolved(outs, resolvedSet, fileSet) {
  for (const out of outs) {
    if (out && fileSet.has(out)) resolvedSet.add(out);
  }
}

export function findNearestConfigDir(startDir, configMap) {
  if (configMap.size === 0) return undefined;
  const parts = startDir ? startDir.split('/').filter(Boolean) : [];
  for (let i = parts.length; i >= 0; i--) {
    const ancestor = parts.slice(0, i).join('/');
    if (configMap.has(ancestor)) return ancestor;
  }
  return undefined;
}

export function buildSuffixIndex(files, extPredicate) {
  const idx = new Map();
  for (const f of files) {
    const p = toPosix(f.path);
    if (!extPredicate(p)) continue;
    const parts = p.split('/');
    for (let i = 0; i < parts.length; i++) {
      const suffix = parts.slice(i).join('/');
      if (!idx.has(suffix)) idx.set(suffix, []);
      idx.get(suffix).push(p);
    }
  }
  for (const arr of idx.values()) {
    arr.sort((a, b) => a.localeCompare(b));
  }
  return idx;
}
