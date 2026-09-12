import type { RsbuildPluginAPI } from "@rsbuild/core";
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * YiPet build plugin — copies manifest.json, writes build-meta.json, removes
 * auto-generated background.html (MV3 service worker is JS-only).
 */
export function yipetBuildPlugin(rootDir: string, mode: string) {
  return {
    name: "yipet-build",
    setup(api: RsbuildPluginAPI) {
      api.onAfterBuild(() => {
        const pkg = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf-8"));
        const version = pkg.version || "0.0.0";
        const apiBase = process.env.RSBUILD_API_BASE || 'http://localhost:10086';

        const srcManifest = JSON.parse(readFileSync(resolve(rootDir, "manifest.json"), "utf-8"));

        // Apply env-driven overrides to the manifest before writing to dist
        srcManifest.version = version;
        srcManifest.host_permissions = [`${apiBase}/*`];
        if (srcManifest.content_security_policy?.extension_pages) {
          srcManifest.content_security_policy.extension_pages =
            srcManifest.content_security_policy.extension_pages.replace(
              /connect-src\s+\S+/,
              `connect-src ${apiBase}`,
            );
        }

        writeFileSync(resolve(rootDir, "dist", "manifest.json"), JSON.stringify(srcManifest, null, 2));
        copyFileSync(resolve(rootDir, "privacy-manifest.json"), resolve(rootDir, "dist", "privacy-manifest.json"));

        writeFileSync(
          resolve(rootDir, "dist", "build-meta.json"),
          JSON.stringify(
            {
              version,
              builtAt: Date.now(),
              mode,
              assets: {
                bootstrap: "assets/bootstrap.js",
                chat: "assets/chat.js",
                background: "assets/background.js",
                popup: "assets/popup.js"
              }
            },
            null,
            2
          )
        );

        const bgHtml = resolve(rootDir, "dist", "background.html");
        if (existsSync(bgHtml)) rmSync(bgHtml, { force: true });

        if (mode === "development") {
          console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log("  🐾  YiPet dev build ready (rsbuild)");
          console.log("  📁  dist/  →  Load as unpacked extension");
          console.log("  🕐 ", new Date().toLocaleTimeString());
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        }
      });
    }
  };
}