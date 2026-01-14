import {
  ref,
  readonly,
  onMounted,
  onUnmounted,
  reactive,
  watch,
  isRef,
  type Ref,
} from "vue";

export interface TweakpaneBinding {
  key: string;
  label?: string;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Record<string, any>;
}

export interface TweakpaneFolder {
  title: string;
  expanded?: boolean;
  bindings: TweakpaneBinding[];
}

export interface TweakpaneConfig {
  title?: string;
  container?: Ref<HTMLElement | null>;
  folders?: TweakpaneFolder[];
  bindings?: TweakpaneBinding[];
  expanded?: boolean;
  theme?: Record<string, string>;
}

export function useTweakpane(
  data: Record<string, any>,
  config: TweakpaneConfig = {}
) {
  const pane = ref<any>(null);
  const isReady = ref(false);

  // Helper function to add a single binding
  const addBinding = (
    key: string,
    options: Omit<TweakpaneBinding, "key"> = {}
  ) => {
    if (!pane.value) return null;

    // Check if the value can be bound to Tweakpane
    const value = data[key];
    const valueType = typeof value;

    // Skip if value is null, undefined, or a complex object/array
    if (value === null || value === undefined) {
      console.warn(`Skipping binding for ${key}: value is null/undefined`);
      return null;
    }

    if (valueType === "object" && value !== null) {
      // Convert objects/arrays to JSON string for display
      try {
        data[key] = JSON.stringify(value);
      } catch (e) {
        console.warn(`Skipping binding for ${key}: cannot stringify object`);
        return null;
      }
    }

    // Only bind simple types
    if (!["string", "number", "boolean"].includes(typeof data[key])) {
      console.warn(
        `Skipping binding for ${key}: unsupported type ${typeof data[key]}`
      );
      return null;
    }

    try {
      return pane.value.addBinding(data, key, {
        readonly: options.readonly ?? false,
        label: options.label ?? key,
        min: options.min,
        max: options.max,
        step: options.step,
        ...options.options,
      });
    } catch (error) {
      console.error(`Error adding binding for ${key}:`, error);
      return null;
    }
  };

  // Helper function to add a folder with bindings
  const addFolder = (
    title: string,
    bindings: TweakpaneBinding[],
    expanded = true
  ) => {
    if (!pane.value) return null;

    try {
      const folder = pane.value.addFolder({
        title,
        expanded,
      });

      bindings.forEach((binding) => {
        folder.addBinding(data, binding.key, {
          readonly: binding.readonly ?? false,
          label: binding.label ?? binding.key,
          min: binding.min,
          max: binding.max,
          step: binding.step,
          ...binding.options,
        });
      });

      return folder;
    } catch (error) {
      console.error(`Error adding folder ${title}:`, error);
      return null;
    }
  };

  // Helper to add multiple bindings at once
  const addBindings = (bindings: TweakpaneBinding[]) => {
    return bindings
      .map((binding) => addBinding(binding.key, binding))
      .filter(Boolean);
  };

  // Apply default Tweakpane theme styles
  const applyThemeStyles = (container: HTMLElement) => {
    const defaultStyles = {
      "--tp-base-background-color": "hsla(0, 0%, 7%, 1)",
      "--tp-base-shadow-color": "hsla(0, 0%, 0%, 0.2)",
      "--tp-button-background-color": "hsla(0, 0%, 80%, 1)",
      "--tp-button-background-color-active": "hsla(0, 0%, 100%, 1)",
      "--tp-button-background-color-focus": "hsla(0, 0%, 95%, 1)",
      "--tp-button-background-color-hover": "hsla(0, 0%, 85%, 1)",
      "--tp-button-foreground-color": "hsla(0, 0%, 0%, 0.8)",
      "--tp-container-background-color": "hsla(0, 0%, 0%, 0.3)",
      "--tp-container-background-color-active": "hsla(0, 0%, 0%, 0.6)",
      "--tp-container-background-color-focus": "hsla(0, 0%, 0%, 0.5)",
      "--tp-container-background-color-hover": "hsla(0, 0%, 0%, 0.4)",
      "--tp-container-foreground-color": "hsla(0, 0%, 100%, 0.5)",
      "--tp-groove-foreground-color": "hsla(0, 0%, 0%, 0.2)",
      "--tp-input-background-color": "hsla(0, 0%, 0%, 0.3)",
      "--tp-input-background-color-active": "hsla(0, 0%, 0%, 0.6)",
      "--tp-input-background-color-focus": "hsla(0, 0%, 0%, 0.5)",
      "--tp-input-background-color-hover": "hsla(0, 0%, 0%, 0.4)",
      "--tp-input-foreground-color": "hsla(0, 0%, 100%, 0.5)",
      "--tp-label-foreground-color": "hsla(0, 0%, 100%, 0.5)",
      "--tp-monitor-background-color": "hsla(0, 0%, 0%, 0.3)",
      "--tp-monitor-foreground-color": "hsla(0, 0%, 100%, 0.3)",
    };

    // Merge with custom theme overrides
    const finalStyles = { ...defaultStyles, ...config.theme };

    Object.entries(finalStyles).forEach(([property, value]) => {
      container.style.setProperty(property, value);
    });
  };

  // Initialize Tweakpane
  const init = async () => {
    if (!process.client) return;

    try {
      const { Pane } = await import("tweakpane");

      // Apply theme styles to container if provided
      if (config.container?.value) {
        applyThemeStyles(config.container.value);
      }

      pane.value = new Pane({
        title: config.title || "Debug Panel",
        container: config.container?.value || undefined,
        expanded: config.expanded ?? true,
      });

      // Add configured folders
      if (config.folders) {
        config.folders.forEach((folder) => {
          addFolder(folder.title, folder.bindings, folder.expanded);
        });
      }

      // Add configured bindings
      if (config.bindings) {
        addBindings(config.bindings);
      }

      isReady.value = true;
      console.log("Tweakpane initialized successfully");
    } catch (error) {
      console.error("Error initializing Tweakpane:", error);
    }
  };

  // Cleanup
  const dispose = () => {
    if (pane.value) {
      pane.value.dispose();
      pane.value = null;
      isReady.value = false;
    }
  };

  // Auto-initialize on mount and cleanup on unmount
  onMounted(init);
  onUnmounted(dispose);

  return {
    pane: readonly(pane),
    isReady: readonly(isReady),
    addBinding,
    addFolder,
    addBindings,
    init,
    dispose,
  };
}
