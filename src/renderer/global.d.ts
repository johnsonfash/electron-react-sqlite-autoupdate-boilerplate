declare global {
  interface Window {
    app: {
      getVersion: () => Promise<string>; // your ipcRenderer.invoke returns Promise
    };
    prisma: {
      call: (call: PrismaCall) => Promise<any>;
    };
    electronAPI: {
      // Auto-updater APIs
      getAppVersion: () => Promise<void>; // ipc invoke returns Promise<void>
      quitAndInstall: () => Promise<void>; // ipc invoke returns Promise<void>

      // Auto-updater events (all event listeners return void)
      onUpdateAvailable: (callback: () => void) => void;
      onUpdateNotAvailable: (callback: () => void) => void;
      onUpdateReady: (callback: () => void) => void;
      onUpdateError: (callback: (error: any) => void) => void;
      onDownloadProgress: (callback: (progress: any) => void) => void;

      // App ready event sends version info after DOM ready
      onAppReady: (callback: (data: { version: string }) => void) => void;

      // Utility to remove listeners
      removeListener: (channel: string, listener: (...args: any[]) => void) => void;
    };
  }
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export { };
