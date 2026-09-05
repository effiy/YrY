// Mock for @yivad/views-glob — build-time plugin that collects all view files.
// In test, we return an empty map since individual components are mounted directly.
const viewsGlob: Record<string, () => Promise<any>> = {};
export default viewsGlob;