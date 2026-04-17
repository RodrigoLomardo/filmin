import { useEffect, useState } from 'react';

export function useCounted(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    setValue(0);
    const steps = 40;
    const step = duration / steps;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setValue(Math.round((target * i) / steps));
      if (i >= steps) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [active, target, duration]);

  return value;
}
