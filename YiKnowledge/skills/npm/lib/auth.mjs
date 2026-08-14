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
    console.error("❌ Not authenticated with npm registry. Please authenticate via one of the following methods:");
    console.error("   Environment variable:       NPM_TOKEN=<your-token> rui-npm <command>");
    console.error("   Explicit config:       rui-npm login --token <your-token>");
    console.error("   Interactive login:      npm login");
    if (configuredToken) {
      console.error(`   ⚠️  NPM_TOKEN environment variable detected (${maskToken(configuredToken)}), but failed npm verification.`);
      console.error(`   token may have expired, please visit https://www.npmjs.com/settings/<user>/tokens to check`);
    } else {
      console.error("   Get token:      Visit https://www.npmjs.com/settings/<user>/tokens");
      console.error("                    → Generate New Token → Select \"Automation\" type");
      console.error("   (If you don't have an npm account, please visit https://www.npmjs.com/signup to sign up)");
    }
    process.exit(1);
  }
  return r.stdout.trim();
}

export function cmdLogin(args) {
  const token = args.token || NPM_TOKEN || "";

  if (!token) {
    console.error("❌ Access Token not provided. Please provide via:");
    console.error("   Environment variable:       NPM_TOKEN=<your-token> rui-npm <command>");
    console.error("   Explicit config:       rui-npm login --token <your-token>");
    console.error("   Get token:     Visit https://www.npmjs.com/settings/<user>/tokens");
    console.error("                   → Generate New Token → Select \"Automation\" type");
    process.exit(1);
  }

  if (token.length < 20) {
    console.error(`❌ Invalid token format (length ${token.length} < 20). Please check if the Access Token was copied completely.`);
    console.error("   Get Access Token: https://www.npmjs.com/settings/<user>/tokens");
    process.exit(1);
  }

  if (args.token) {
    console.log(`🔑 Configuring Access Token (${maskToken(token)}) ...`);
    const configResult = npm(["config", "set", "//registry.npmjs.org/:_authToken", token]);
    if (configResult.status !== 0) {
      console.error("❌ Failed to configure token. Please check if npm configuration is correct.");
      process.exit(1);
    }
  } else {
    console.log(`🔑 Using environment variable NPM_TOKEN (${maskToken(token)}), auto-configured`);
  }

  console.log("🔍 Verifying token ...");
  const whoami = npm(["whoami", ...registryArgs()]);
  if (whoami.status !== 0) {
    console.error("❌ Token verification failed. Possible reasons:");
    console.error("   - token has expired or been revoked");
    console.error("   - incorrect token type (recommend Automation type)");
    console.error("   Please visit https://www.npmjs.com/settings/<user>/tokens to check token status");
    npm(["config", "delete", "//registry.npmjs.org/:_authToken"]);
    process.exit(1);
  }

  const username = whoami.stdout.trim();
  console.log(`✅ Authentication successful!`);
  console.log(`   User: ${username}`);
  console.log(`   token: ${maskToken(token)}`);
  console.log(`   Configured to: npm config //registry.npmjs.org/:_authToken`);
  console.log();
  console.log("💡 Tips:");
  console.log("   - After setting NPM_TOKEN env var, all operations auto-use this token for auth");
  console.log("   - Check current auth status: npm whoami");
  console.log("   - Clear token: npm config delete //registry.npmjs.org/:_authToken");
}