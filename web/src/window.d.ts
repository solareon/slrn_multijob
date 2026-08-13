export {};

declare global {
  interface Window {
    invokeNative?: unknown;
    GetParentResourceName?: () => string;
    fetchNui?: <T = unknown>(event: string, data?: unknown) => Promise<T>;
    getSettings?: () => Promise<{ display?: { theme?: string } }>;
    onSettingsChange?: (
      callback: (settings: { display?: { theme?: string } }) => void,
    ) => void;
  }
}
