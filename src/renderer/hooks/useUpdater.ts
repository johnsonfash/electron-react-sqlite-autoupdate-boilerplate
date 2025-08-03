import { useState, useEffect } from 'react';

type ProgressInfo = { percent: number; transferred: number; total: number };

export function useUpdater() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'up-to-date'>('idle');
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  const checkForUpdates = async () => {
    setStatus('checking');
    const ok = await window.electronAPI.checkForUpdates();
    if (!ok) setStatus('error');
  };

  const downloadUpdate = async () => {
    setStatus('downloading');
    const ok = await window.electronAPI.downloadUpdate();
    if (!ok) setStatus('error');
  };

  const quitAndInstall = () => window.electronAPI.quitAndInstall();

  // useEffect(() => {
  //   window.electronAPI.onUpdateAvailable(() => setStatus('available'));
  //   window.electronAPI.onUpdateNotAvailable(() => setStatus('up-to-date'));
  //   window.electronAPI.onUpdateDownloaded(() => setStatus('downloaded'));
  //   window.electronAPI.onUpdateError((_e, err) => {
  //     console.error('Update error', err);
  //     setStatus('error');
  //   });
  //   window.electronAPI.onDownloadProgress((_e, p) => setProgress(p));
  // }, []);

  return { status, progress, checkForUpdates, downloadUpdate, quitAndInstall };
}
