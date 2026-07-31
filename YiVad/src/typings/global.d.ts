/* Menu */
declare namespace Menu {
  interface MenuOptions {
    path: string;
    name: string;
    component?: string | (() => Promise<unknown>);
    redirect?: string;
    meta: MetaProps;
    children?: MenuOptions[];
  }
  interface MetaProps {
    icon: string;
    title: string;
    activeMenu?: string;
    isLink?: string;
    isHide: boolean;
    isFull: boolean;
    isAffix: boolean;
    isKeepAlive: boolean;
  }
}

/* FileType */
declare namespace File {
  type ImageMimeType =
    | "image/apng"
    | "image/bmp"
    | "image/gif"
    | "image/jpeg"
    | "image/pjpeg"
    | "image/png"
    | "image/svg+xml"
    | "image/tiff"
    | "image/webp"
    | "image/x-icon";

  type ExcelMimeType = "application/vnd.ms-excel" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

/* Rsbuild env types */
declare type Recordable<T = any> = Record<string, T>;

interface ImportMetaEnv {
  RSBUILD_ENV_USER_NODE_ENV: "development" | "production" | "test";
  RSBUILD_ENV_GLOB_APP_TITLE: string;
  RSBUILD_ENV_PORT: number;
  RSBUILD_ENV_OPEN: boolean;
  RSBUILD_ENV_REPORT: boolean;
  RSBUILD_ENV_ROUTER_MODE: "hash" | "history";
  RSBUILD_ENV_DROP_CONSOLE: boolean;
  RSBUILD_ENV_PUBLIC_PATH: string;
  RSBUILD_ENV_API_URL: string;
  RSBUILD_ENV_PROXY: [string, string][];
  RSBUILD_ENV_YIAI_OLLAMA_URL: string;
}

/* __APP_INFO__ */
declare const __APP_INFO__: {
  pkg: {
    name: string;
    version: string;
    dependencies: Recordable<string>;
    devDependencies: Recordable<string>;
  };
  lastBuildTime: string;
};
