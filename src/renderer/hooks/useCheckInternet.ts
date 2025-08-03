import { useEffect, useRef, useState } from 'react';

export default function useCheckInternet(interval = 10000) {
  const [online, setOnline] = useState(true);
  const isChecking = useRef(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const ping = async () => {
      if (isChecking.current) return; // prevent concurrent checks
      isChecking.current = true;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch('https://www.google.com/generate_204', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        setOnline(true);
      } catch {
        setOnline(false);
      } finally {
        isChecking.current = false;
      }
    };

    ping();

    timer.current = setInterval(ping, interval);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [interval]);

  return online;
}
