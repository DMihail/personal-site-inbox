import { useEffect, useEffectEvent, useState } from "react";

interface UseOnlineStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const onOnline = useEffectEvent(() => {
    options.onOnline?.();
  });
  const onOffline = useEffectEvent(() => {
    options.onOffline?.();
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onOnline();
    };
    const handleOffline = () => {
      setIsOnline(false);
      onOffline();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
