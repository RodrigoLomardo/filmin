'use client';

import { useState, useRef } from 'react';

interface UseHoldButtonOptions {
  duration?: number;
  onComplete: () => void;
}

interface UseHoldButtonResult {
  holding: boolean;
  holdFraction: number;
  startHold: () => void;
  finishHold: () => void;
  cancelHold: () => void;
}

export function useHoldButton({ duration = 1400, onComplete }: UseHoldButtonOptions): UseHoldButtonResult {
  const [holding, setHolding] = useState(false);
  const [holdFraction, setHoldFraction] = useState(0);
  const holdRafRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartRef = useRef(0);

  function startHold() {
    if (holding) return;
    setHolding(true);
    holdStartRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - holdStartRef.current;
      const frac = Math.min(elapsed / duration, 1);
      setHoldFraction(frac);
      if (frac < 1) {
        holdRafRef.current = requestAnimationFrame(tick);
      } else {
        finishHold();
      }
    }
    holdRafRef.current = requestAnimationFrame(tick);
  }

  function finishHold() {
    setHolding(false);
    setHoldFraction(0);
    cancelAnimationFrame(holdRafRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    onComplete();
  }

  function cancelHold() {
    if (!holding) return;
    setHolding(false);
    setHoldFraction(0);
    cancelAnimationFrame(holdRafRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  }

  return { holding, holdFraction, startHold, finishHold, cancelHold };
}
