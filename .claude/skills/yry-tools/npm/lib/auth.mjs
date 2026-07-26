/**
 * auth.mjs — npm authentication operations
 *
 * Extracted from rui-npm.mjs for single-responsibility.
 * Handles: login, token verification, whoami check.
 */

import { npm, registryArgs, NPM_TOKEN, maskToken } from './npm-utils.mjs';

export function checkNpmLogin() {
  const r = npm(["whoami", ...registryArgs()]);
  if (r.status !== 0) {
    const configuredToken = NPM_TOKEN || null;
    console.error("❌ 未认证 npm registry。请通过以下任一方式认证：");
    console.error("   环境变量:       NPM_TOKEN=<your-token> rui-npm <command>");
    console.error("   显式配置:       rui-npm login --token <your-token>");
    console.error("   交互式登录:      npm login");
    if (configuredToken) {
      console.error(`   ⚠️  已检测到 NPM_TOKEN 环境变量 (${maskToken(configuredToken)})，但未通过 npm 验证。`);
      console.error(`   token 可能已过期，请访问 https://www.npmjs.com/settings/<user>/tokens 检查`);
    } else {
      console.error("   获取 token:      访问 https://www.npmjs.com/settings/<user>/tokens");
      console.error("                    → Generate New Token → 选择 \"Automation\" 类型");
      console.error("   （如无 npm 账户，请先访问 https://www.npmjs.com/signup 注册）");
    }
    process.exit(1);
  }
  return r.stdout.trim();
}

export function cmdLogin(args) {
  const token = args.token || NPM_TOKEN || "";

  if (!token) {
    console.error("❌ 未提供 Access Token。请通过以下方式提供：");
    console.error("   环境变量:       NPM_TOKEN=<your-token> rui-npm <command>");
    console.error("   显式配置:       rui-npm login --token <your-token>");
    console.error("   获取 token:     访问 https://www.npmjs.com/settings/<user>/tokens");
    console.error("                   → Generate New Token → 选择 \"Automation\" 类型");
    process.exit(1);
  }

  if (token.length < 20) {
    console.error(`❌ token 格式无效（长度 ${token.length} < 20）。请检查是否完整复制了 Access Token。`);
    console.error("   获取 Access Token: https://www.npmjs.com/settings/<user>/tokens");
    process.exit(1);
  }

  if (args.token) {
    console.log(`🔑 配置 Access Token (${maskToken(token)}) ...`);
    const configResult = npm(["config", "set", "//registry.npmjs.org/:_authToken", token]);
    if (configResult.status !== 0) {
      console.error("❌ 配置 token 失败。请检查 npm 配置是否正常。");
      process.exit(1);
    }
  } else {
    console.log(`🔑 使用环境变量 NPM_TOKEN (${maskToken(token)})，已自动配置`);
  }

  console.log("🔍 验证 token ...");
  const whoami = npm(["whoami", ...registryArgs()]);
  if (whoami.status !== 0) {
    console.error("❌ token 验证失败。可能的原因：");
    console.error("   - token 已过期或已被撤销");
    console.error("   - token 类型不正确（建议使用 Automation 类型）");
    console.error("   请访问 https://www.npmjs.com/settings/<user>/tokens 检查 token 状态");
    npm(["config", "delete", "//registry.npmjs.org/:_authToken"]);
    process.exit(1);
  }

  const username = whoami.stdout.trim();
  console.log(`✅ 认证成功！`);
  console.log(`   用户: ${username}`);
  console.log(`   token: ${maskToken(token)}`);
  console.log(`   已配置到: npm config //registry.npmjs.org/:_authToken`);
  console.log();
  console.log("💡 提示：");
  console.log("   - 设置环境变量 NPM_TOKEN 后，所有操作自动使用该 token 认证");
  console.log("   - 查看当前认证状态: npm whoami");
  console.log("   - 清除 token: npm config delete //registry.npmjs.org/:_authToken");
}
