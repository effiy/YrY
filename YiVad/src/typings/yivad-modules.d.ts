declare module "@yivad/svg-icons-register" {
  const svgIconsRegister: string;
  export default svgIconsRegister;
}

declare module "@yivad/views-glob" {
  const views: Record<string, () => Promise<any>>;
  export default views;
}
