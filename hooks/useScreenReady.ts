import { useEffect, useState } from "react";

export default function useScreenReady(delay = 200): boolean {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return ready;
}
