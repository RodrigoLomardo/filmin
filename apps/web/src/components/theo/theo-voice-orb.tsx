'use client';

import { useEffect, useRef } from 'react';

export type VoiceState = 'idle' | 'waiting' | 'listening' | 'thinking' | 'speaking';

interface Props {
  state: VoiceState;
  audioLevel?: number; // 0–1
}

type RGB = [number, number, number];

const PALETTE: Record<VoiceState, { core: RGB; ring: RGB; glow: RGB }> = {
  idle: {
    core: [236, 72, 153],
    ring: [236, 72, 153],
    glow: [236, 72, 153],
  },
  waiting: {
    core: [245, 85, 165],
    ring: [245, 85, 165],
    glow: [245, 85, 165],
  },
  listening: {
    core: [240, 95, 175],
    ring: [180, 100, 255],
    glow: [200, 80, 245],
  },
  thinking: {
    core: [255, 165, 60],
    ring: [255, 205, 85],
    glow: [255, 180, 50],
  },
  speaking: {
    core: [255, 130, 175],
    ring: [236, 72, 153],
    glow: [255, 100, 165],
  },
};

function rgba(c: RGB, a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
}

function mix(c: RGB, factor: number): RGB {
  return [
    Math.round(c[0] * factor),
    Math.round(c[1] * factor),
    Math.round(c[2] * factor),
  ];
}

export function TheoVoiceOrb({ state, audioLevel = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const levelRef = useRef(audioLevel);
  const rafRef = useRef<number>(0);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { levelRef.current = Math.min(1, audioLevel); }, [audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    // Rebind so TypeScript preserves non-null type inside all closures
    const ctx: CanvasRenderingContext2D = rawCtx;

    const DPR = window.devicePixelRatio || 1;
    const SIZE = 260;
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.scale(DPR, DPR);

    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const BASE_R = 50;

    // Speaking wave pool
    const waves: { born: number }[] = [];
    let lastWave = 0;

    const t0 = performance.now();

    function drawRing(
      r: number,
      col: RGB,
      alpha: number,
      lw = 1,
      dash?: number[],
      dashOff = 0,
    ) {
      if (alpha <= 0.005) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, Math.max(0.1, r), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = lw;
      if (dash?.length) {
        ctx.setLineDash(dash);
        ctx.lineDashOffset = dashOff;
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawGlowRing(r: number, col: RGB, alpha: number, blur: number) {
      if (alpha <= 0.005) return;
      ctx.save();
      ctx.shadowBlur = blur;
      ctx.shadowColor = rgba(col, 0.85);
      ctx.beginPath();
      ctx.arc(CX, CY, Math.max(0.1, r), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    function frame(now: number) {
      const t = (now - t0) / 1000;
      const s = stateRef.current;
      const al = levelRef.current;
      const pal = PALETTE[s];

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Ambient background bloom
      {
        const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, SIZE * 0.5);
        g.addColorStop(0, rgba(pal.glow, 0.06));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, SIZE, SIZE);
      }

      // ── IDLE: slow breathing rings ──────────────────────────
      if (s === 'idle') {
        drawRing(BASE_R + 32, pal.ring, 0.13 + 0.07 * Math.sin(t * 0.85));
        drawRing(BASE_R + 58, pal.ring, 0.08 + 0.04 * Math.sin(t * 0.62 + 1.1));
        drawRing(BASE_R + 86, pal.ring, 0.04 + 0.02 * Math.sin(t * 0.44 + 2.3), 0.7);
      }

      // ── WAITING: energetic pulse suggesting "tap me" ─────────
      if (s === 'waiting') {
        drawRing(BASE_R + 30, pal.ring, 0.18 + 0.1 * Math.sin(t * 1.5));
        drawRing(BASE_R + 54, pal.ring, 0.10 + 0.06 * Math.sin(t * 1.2 + 1.0));
        // Outward expanding ring (the "tap me" cue)
        const expand = (t % 2.2) / 2.2;
        drawRing(BASE_R + 22 + expand * 65, pal.ring, (1 - expand) * 0.28, 1.4);
        drawGlowRing(BASE_R + 30, pal.ring, 0.14 + 0.08 * Math.sin(t * 1.5), 12);
      }

      // ── LISTENING: audio-reactive rings ──────────────────────
      if (s === 'listening') {
        const boost = al;
        const config: Array<[number, number, number]> = [
          [26, 2.1, 0.0],
          [44, 3.3, 0.9],
          [62, 1.9, 1.8],
          [80, 2.8, 2.7],
          [97, 1.6, 3.6],
          [112, 3.9, 4.5],
        ];
        config.forEach(([baseOff, freq, phase], i) => {
          const r = BASE_R + baseOff + boost * 22 * Math.sin(t * freq + phase);
          const alpha = Math.max(0, (0.22 - i * 0.03) + boost * 0.28);
          drawRing(r, pal.ring, alpha, 1.3 - i * 0.12);
        });
        drawGlowRing(BASE_R + 28 + boost * 24, pal.ring, 0.26 + boost * 0.38, 20);
      }

      // ── THINKING: rotating arcs + dashed rings ────────────────
      if (s === 'thinking') {
        drawRing(BASE_R + 56, pal.ring, 0.18, 1, [7, 9], -t * 36);
        drawRing(BASE_R + 83, pal.ring, 0.09, 1, [3, 14], t * 23);

        // Primary rotating glow arc
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(t * 1.9);
        ctx.shadowBlur = 14;
        ctx.shadowColor = rgba(pal.core, 0.9);
        ctx.beginPath();
        ctx.arc(0, 0, BASE_R + 56, 0, (Math.PI * 2) / 2.8);
        ctx.strokeStyle = rgba(pal.core, 0.78);
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // Counter-rotating secondary arc
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(-t * 1.15 + Math.PI * 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, BASE_R + 56, 0, (Math.PI * 2) / 4.2);
        ctx.strokeStyle = rgba(pal.ring, 0.38);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // ── SPEAKING: expanding wave rings ────────────────────────
      if (s === 'speaking') {
        if (t - lastWave > 0.5) {
          waves.push({ born: t });
          lastWave = t;
          if (waves.length > 10) waves.shift();
        }
        waves.forEach((w) => {
          const age = t - w.born;
          const r = BASE_R + age * 88;
          const alpha = Math.max(0, 0.55 - age * 0.48);
          if (alpha > 0.008) {
            drawRing(r, pal.ring, alpha, Math.max(0.4, 2 - age * 0.8));
          }
        });
        const pulse = (t % 0.44) / 0.44;
        drawRing(BASE_R + 18 + pulse * 54, pal.core, (1 - pulse) * 0.42, 1);
      }

      // ── Core orb ─────────────────────────────────────────────
      const breathScale =
        s === 'idle'
          ? 1 + 0.055 * Math.sin(t * 1.15)
          : s === 'waiting'
            ? 1 + 0.07 * Math.sin(t * 1.6)
            : s === 'listening'
            ? 1 + 0.08 + al * 0.18
            : s === 'thinking'
              ? 1 + 0.04 * Math.sin(t * 4.2)
              : 1 + 0.07 * Math.abs(Math.sin(t * 2.9));

      const cR = BASE_R * breathScale;

      // Outer bloom halo
      {
        const g = ctx.createRadialGradient(CX, CY, cR * 0.35, CX, CY, cR * 2.6);
        g.addColorStop(0, rgba(pal.glow, 0.28));
        g.addColorStop(0.5, rgba(pal.glow, 0.07));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(CX, CY, cR * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main sphere gradient — offset highlight for 3-D feel
      {
        const ox = CX - cR * 0.22;
        const oy = CY - cR * 0.28;
        const g = ctx.createRadialGradient(ox, oy, 0, CX, CY, cR);
        g.addColorStop(0, 'rgba(255, 220, 238, 1)');
        g.addColorStop(0.28, rgba(pal.core, 1));
        g.addColorStop(0.68, rgba(mix(pal.core, 0.48), 0.95));
        g.addColorStop(1, 'rgba(2, 0, 6, 0.88)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(CX, CY, cR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Specular highlight
      {
        const sx = CX - cR * 0.28;
        const sy = CY - cR * 0.34;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, cR * 0.52);
        g.addColorStop(0, 'rgba(255,255,255,0.38)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(CX, CY, cR, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} className="block" />;
}
