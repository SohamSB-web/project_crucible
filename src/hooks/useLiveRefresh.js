import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL = 5000;

export default function useLiveRefresh(refresh, interval = DEFAULT_INTERVAL) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    let refreshing = false;

    const runRefresh = async () => {
      if (refreshing || document.visibilityState === 'hidden') return;
      refreshing = true;
      try {
        await refreshRef.current();
      } finally {
        refreshing = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') runRefresh();
    };

    const timer = window.setInterval(runRefresh, interval);
    window.addEventListener('focus', runRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', runRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interval]);
}
