/**
 * Lifecycle contract for every extension surface.
 *
 * Every component (popup, options, side panel, content script)
 * implements this interface so testing, onboarding, and debugging
 * follow a predictable pattern.
 */

export interface ExtensionComponent {
  readonly id: string;
  mount(): Promise<void>;
  unmount(): Promise<void>;
  readonly isReady: boolean;
}

/**
 * Wrap a component with error boundaries — mount/unmount failures
 * are caught, logged, and never propagated.
 */
export function wrapComponent(
  component: ExtensionComponent,
): ExtensionComponent {
  const originalMount = component.mount.bind(component);
  const originalUnmount = component.unmount.bind(component);

  return {
    ...component,
    async mount() {
      try {
        await originalMount();
      } catch (err) {
        console.error(`[${component.id}] mount failed:`, err);
        (component as { isReady: boolean }).isReady = false;
      }
    },
    async unmount() {
      try {
        await originalUnmount();
      } catch (err) {
        console.error(`[${component.id}] unmount failed:`, err);
      }
    },
  };
}
