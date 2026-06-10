/**
 * rui-story merge — git merge-to-main workflow
 * Extracted from rui-story.mjs for single-responsibility
 */

import { execSync } from "node:child_process";

export function checkGitBranch(name) {
  try {
    const output = execSync(`git branch --list "feat/${name}"`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (output) return `feat/${name}`;
    return null;
  } catch {
    return null;
  }
}

export async function cmdMergeToMain(projectRoot) {
  const mainBranch = "main";

  let currentBranch;
  try {
    currentBranch = execSync("git branch --show-current", {
      encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    console.error("[rui-story] 无法获取当前分支");
    process.exit(1);
  }

  if (!currentBranch) {
    console.error("[rui-story] 当前不在任何分支上（detached HEAD）");
    process.exit(1);
  }

  if (currentBranch === mainBranch) {
    console.error(`[rui-story] 当前已在 ${mainBranch} 分支，无需合并`);
    process.exit(0);
  }

  console.error(`[rui-story] §1 当前分支: ${currentBranch}`);

  // §2 Check for uncommitted changes
  let stashed = false;
  try {
    const status = execSync("git status --porcelain", {
      encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (status) {
      console.error("[rui-story] §2 检测到未提交变更，执行 git stash");
      execSync("git stash -u", { encoding: "utf-8", stdio: "inherit" });
      stashed = true;
    } else {
      console.error("[rui-story] §2 工作区干净，无需 stash");
    }
  } catch (err) {
    console.error(`[rui-story] stash 失败: ${err.message}`);
    process.exit(1);
  }

  // §3 Fetch latest main
  console.error("[rui-story] §3 拉取远端最新 main");
  try {
    execSync(`git fetch origin ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] fetch 失败: ${err.message}`);
    if (stashed) execSync("git stash pop", { encoding: "utf-8", stdio: "inherit" });
    process.exit(1);
  }

  // §4 Checkout main and pull
  console.error(`[rui-story] §4 切换到 ${mainBranch}`);
  try {
    execSync(`git checkout ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
    execSync(`git pull origin ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] checkout/pull ${mainBranch} 失败: ${err.message}`);
    if (stashed) {
      execSync(`git checkout ${currentBranch}`, { encoding: "utf-8", stdio: "inherit" });
      execSync("git stash pop", { encoding: "utf-8", stdio: "inherit" });
    }
    process.exit(1);
  }

  // §5 Merge feature branch
  console.error(`[rui-story] §5 合并 ${currentBranch} → ${mainBranch}`);
  try {
    execSync(`git merge ${currentBranch} --no-edit`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] 合并失败，可能存在冲突: ${err.message}`);
    console.error(`[rui-story] 请手动解决冲突后执行 git push origin ${mainBranch}`);
    process.exit(1);
  }

  // §6 Push to remote
  console.error(`[rui-story] §6 推送 ${mainBranch} 到远端`);
  try {
    execSync(`git push origin ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] push 失败: ${err.message}`);
    process.exit(1);
  }

  // §7 Checkout back to feature branch
  console.error(`[rui-story] §7 切回 ${currentBranch}`);
  try {
    execSync(`git checkout ${currentBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch {
    // non-fatal
  }

  // §8 Restore stash
  if (stashed) {
    console.error("[rui-story] §8 恢复 stash");
    try {
      execSync("git stash pop", { encoding: "utf-8", stdio: "inherit" });
    } catch {
      console.error("[rui-story] stash pop 失败，请手动 git stash pop");
    }
  }

  // §9 Summary
  console.error("");
  console.error("[rui-story] ✅ 合并完成");
  console.error(`[rui-story]    ${currentBranch} → ${mainBranch} → origin/${mainBranch}`);
}
