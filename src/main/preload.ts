// preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('db', {
  call: (payload: { model: string; method: string; args: any[] }) =>
    ipcRenderer.invoke('db:call', payload),
});

contextBridge.exposeInMainWorld('electronAPI', {
  // APP APIs
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  // Auto-updater APIs
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateAvailable: (callback: () => void) =>
    ipcRenderer.on('update-available', () => callback()),
  onUpdateNotAvailable: (callback: () => void) =>
    ipcRenderer.on('update-not-available', () => callback()),
  onUpdateReady: (callback: () => void) =>
    ipcRenderer.once('update-ready', () => callback()),
  onUpdateError: (callback: (error: any) => void) =>
    ipcRenderer.on('update-error', (_: IpcRendererEvent, error) => callback(error)),
  onDownloadProgress: (callback: (progress: any) => void) =>
    ipcRenderer.on('update-download-progress', (_: IpcRendererEvent, progress) => callback(progress)),
  // App ready event sends version info after DOM ready
  onAppReady: (callback: (data: { version: string }) => void) =>
    ipcRenderer.on('app-ready', (_: IpcRendererEvent, data) => callback(data)),
  // Utility to remove listeners
  removeListener: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.removeListener(channel, listener),
});
