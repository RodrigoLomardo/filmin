'use client';

import { useState, useEffect, useRef } from 'react';

interface UseShakeDetectionOptions {
  enabled: boolean;
  onShake: () => void;
}

interface UseShakeDetectionResult {
  needsPermission: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

export function useShakeDetection({ enabled, onShake }: UseShakeDetectionOptions): UseShakeDetectionResult {
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const shakeRef = useRef({
    lastX: 0, lastY: 0, lastZ: 0,
    lastTime: 0, count: 0,
    timer: 0 as unknown as ReturnType<typeof setTimeout>,
  });

  useEffect(() => {
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    setNeedsPermission(typeof DME.requestPermission === 'function');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    const isIOS = typeof DME.requestPermission === 'function';
    if (isIOS && !permissionGranted) return;

    function onMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null) return;

      const now = Date.now();
      const s = shakeRef.current;
      if (now - s.lastTime < 80) return;
      s.lastTime = now;

      const dx = Math.abs((acc.x ?? 0) - s.lastX);
      const dy = Math.abs((acc.y ?? 0) - s.lastY);
      const dz = Math.abs((acc.z ?? 0) - s.lastZ);
      s.lastX = acc.x ?? 0;
      s.lastY = acc.y ?? 0;
      s.lastZ = acc.z ?? 0;

      if (dx + dy + dz > 25) {
        s.count++;
        clearTimeout(s.timer);
        s.timer = setTimeout(() => { s.count = 0; }, 700);
        if (s.count >= 3) {
          s.count = 0;
          onShake();
        }
      }
    }

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [enabled, permissionGranted, onShake]);

  async function requestPermission() {
    const DME = DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> };
    const result = await DME.requestPermission();
    if (result === 'granted') setPermissionGranted(true);
  }

  return { needsPermission, permissionGranted, requestPermission };
}
