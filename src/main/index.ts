// main/index.ts
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { dbClient } from './database/client';

let mainWindow: BrowserWindow | null = null;

/**
 * Get preload path based on environment
 */
function getPreloadPath() {
  return app.isPackaged
    ? path.join(app.getAppPath(), 'dist', 'main', 'preload.js')
    : path.join(__dirname, 'preload.js');
}


/**
 * Create main application window
 */
const indexPath = app.isPackaged
  ? `file://${path.join(app.getAppPath(), 'dist', 'renderer', 'index.html')}`
  : 'http://localhost:5173';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      devTools: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });


  mainWindow.loadURL(indexPath);

  // Fix reload on subpaths in production
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (app.isPackaged && !url.startsWith('file://')) {
      event.preventDefault();
      mainWindow?.loadURL(indexPath);
    }
  });

  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow?.loadURL(indexPath);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Notify renderer when DOM ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('app-ready', { version: app.getVersion() });
  });
}

/**
 * Send status to renderer
 */
function sendStatusToRenderer(event: string, data?: any) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(event, data);
  }
}

/**
 * Auto-update setup (VS Code style) - only if packaged
 */
function setupAutoUpdater() {
  autoUpdater.logger = log;
  (autoUpdater.logger as any).transports.file.level = 'info';

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Initial check
  autoUpdater.checkForUpdatesAndNotify();

  // Re-check every 3 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3 * 60 * 60 * 1000);

  autoUpdater.on('update-available', () => sendStatusToRenderer('update-available'));
  autoUpdater.on('update-not-available', () => sendStatusToRenderer('update-not-available'));
  autoUpdater.on('update-downloaded', () => sendStatusToRenderer('update-ready'));
  autoUpdater.on('error', (err) => sendStatusToRenderer('update-error', err?.message || 'Unknown error'));
  autoUpdater.on('download-progress', (progress) => sendStatusToRenderer('update-download-progress', progress));

  ipcMain.handle('quit-and-install', () => autoUpdater.quitAndInstall());
}

/**
 * App lifecycle
 */
app.whenReady().then(() => {
  createWindow();

  if (app.isPackaged) {
    setupAutoUpdater();
  }

  globalShortcut.register('CommandOrControl+R', () => {
    if (mainWindow) {
      if (app.isPackaged) {
        mainWindow.loadURL(indexPath); // Always reload index.html in production
      } else {
        mainWindow.webContents.reload(); // Dev mode behaves like a browser reload
      }
    }
  });

  globalShortcut.register('CommandOrControl+D', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/**
 * Prisma proxy: handles direct model calls + $transaction
 */
ipcMain.handle('db:call', async (_, { model, method, args }) => {
  try {
    const modelClient = (dbClient as any)[model];
    if (!modelClient || typeof modelClient[method] !== 'function') {
      throw new Error(`dbClient model or method not found: ${model}.${method}`);
    }
    return await modelClient[method](...(Array.isArray(args) ? args : [args]));
  } catch (err: any) {
    return {
      __dbError: true,
      name: err?.name || 'DbClientError',
      message: err?.message || 'DB operation failed',
      stack: err?.stack,
    };
  }
});

/**
 * App IPC handlers
 */
ipcMain.handle('get-app-version', async () => app.getVersion());