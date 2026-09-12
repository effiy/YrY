import path from "node:path";

export function isDevFn(mode: string): boolean {
  return mode === "development";
}

export function isProdFn(mode: string): boolean {
  return mode === "production";
}

export function isReportMode(): boolean {
  return process.env.RSBUILD_ENV_REPORT === "true";
}

export function getRootPath(...dir: string[]) {
  return path.resolve(process.cwd(), ...dir);
}