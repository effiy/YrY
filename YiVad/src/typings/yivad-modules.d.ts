declare module "@wangeditor/editor-for-vue" {
  import type { Component } from "vue";
  export const Editor: Component;
  export const Toolbar: Component;
}

declare module "@yivad/svg-icons-register" {
  const svgIconsRegister: string;
  export default svgIconsRegister;
}

declare module "@yivad/views-glob" {
  const views: Record<string, () => Promise<any>>;
  export default views;
}
