'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = 300, H = 360;

    function easeOutQuart(x: number) { return 1 - Math.pow(1 - x, 4); }
    function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
    function easeInOutCubic(x: number) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
    function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
    function prog(t: number, s: number, e: number) { return clamp((t - s) / (e - s), 0, 1); }

    const SRC_CX = 259.5, SRC_CY = 175;
    const SCALE = 1.05;
    const DST_CX = W / 2, DST_CY = H / 2 - 32;

    function t(x: number, y: number): [number, number] {
      const sx = x * 0.1, sy = 500 - y * 0.1;
      return [DST_CX + (sx - SRC_CX) * SCALE, DST_CY + (sy - SRC_CY) * SCALE];
    }

    function buildPaths() {
      const pA = new Path2D();
      let cp: [number, number] = [2340, 3703];
      pA.moveTo(...t(cp[0], cp[1]));

      function rcA(p: [number, number], rx1: number, ry1: number, rx2: number, ry2: number, rdx: number, rdy: number): [number, number] {
        pA.bezierCurveTo(...t(p[0] + rx1, p[1] + ry1), ...t(p[0] + rx2, p[1] + ry2), ...t(p[0] + rdx, p[1] + rdy));
        return [p[0] + rdx, p[1] + rdy];
      }

      cp = rcA(cp, -160, -24, -289, -112, -350, -239);
      cp = rcA(cp, -17, -36, -40, -109, -51, -162);
      cp = rcA(cp, -10, -53, -33, -162, -49, -242);
      cp = rcA(cp, -40, -193, -72, -379, -68, -391);
      cp = rcA(cp, 2, -5, 18, 17, 37, 48);
      cp = rcA(cp, 89, 152, 244, 247, 437, 268);
      cp = [cp[0] + 61, cp[1] + 7]; pA.lineTo(...t(cp[0], cp[1]));
      cp = [cp[0] + 16, cp[1] + 96]; pA.lineTo(...t(cp[0], cp[1]));
      cp = rcA(cp, 10, 53, 20, 118, 23, 145);
      cp = [cp[0] + 7, cp[1] + 47]; pA.lineTo(...t(cp[0], cp[1]));
      cp = [cp[0] + 297, cp[1] + 0]; pA.lineTo(...t(cp[0], cp[1]));
      cp = rcA(cp, 265, 0, 305, 2, 359, 19);
      cp = rcA(cp, 135, 42, 202, 126, 217, 271);
      cp = rcA(cp, 6, 66, 5, 72, -14, 76);
      cp = rcA(cp, -12, 4, -22, 17, -26, 35);
      cp = [cp[0] - 5, cp[1] + 29]; pA.lineTo(...t(cp[0], cp[1]));
      cp = [cp[0] - 433, cp[1] - 1]; pA.lineTo(...t(cp[0], cp[1]));
      rcA(cp, -238, -1, -444, -3, -458, -6);
      pA.closePath();

      const pB = new Path2D();
      cp = [2350, 2959];
      pB.moveTo(...t(cp[0], cp[1]));

      function rcB(p: [number, number], rx1: number, ry1: number, rx2: number, ry2: number, rdx: number, rdy: number): [number, number] {
        pB.bezierCurveTo(...t(p[0] + rx1, p[1] + ry1), ...t(p[0] + rx2, p[1] + ry2), ...t(p[0] + rdx, p[1] + rdy));
        return [p[0] + rdx, p[1] + rdy];
      }

      cp = rcB(cp, -224, -12, -364, -85, -478, -250);
      cp = rcB(cp, -28, -42, -82, -197, -82, -238);
      cp = rcB(cp, 0, -9, -7, -47, -15, -86);
      cp = rcB(cp, -22, -102, -85, -438, -85, -454);
      cp = rcB(cp, 0, -11, 26, -13, 138, -9);
      cp = rcB(cp, 132, 3, 141, 5, 205, 36);
      cp = rcB(cp, 79, 39, 138, 102, 166, 177);
      cp = rcB(cp, 11, 29, 35, 135, 53, 234);
      cp = [cp[0] + 32, cp[1] + 181]; pB.lineTo(...t(cp[0], cp[1]));
      cp = [cp[0] + 60, cp[1] + 1]; pB.lineTo(...t(cp[0], cp[1]));
      cp = rcB(cp, 34, 1, 124, 2, 201, 3);
      cp = rcB(cp, 150, 2, 218, 16, 298, 60);
      cp = rcB(cp, 81, 45, 147, 164, 162, 294);
      cp = [cp[0] + 6, cp[1] + 52]; pB.lineTo(...t(cp[0], cp[1]));
      cp = [cp[0] - 118, cp[1] + 1]; pB.lineTo(...t(cp[0], cp[1]));
      cp = rcB(cp, -65, 0, -188, 2, -273, 2);
      rcB(cp, -85, 1, -207, -1, -270, -4);
      pB.closePath();

      return [pA, pB];
    }

    const [pathA, pathB] = buildPaths();

    // rings giratórios
    const rings = [
      { r: 110, speed: 0.4, dash: 6, gap: 14, color: '#f020bb' },
      { r: 80, speed: -0.6, dash: 3, gap: 8, color: '#7c3aed' },
      { r: 50, speed: 0.9, dash: 2, gap: 5, color: '#e040d0' },
    ];

    // partículas que convergem
    const particles = Array.from({ length: 70 }, (_, i) => {
      const angle = (i / 70) * Math.PI * 2 + Math.random() * 0.2;
      const r = 60 + Math.random() * 110;
      return {
        sx: DST_CX + Math.cos(angle) * r,
        sy: DST_CY + Math.sin(angle) * r,
        size: 0.8 + Math.random() * 1.6,
        hue: 295 + Math.random() * 70,
        delay: Math.random() * 0.25,
      };
    });

    function drawBackground(p: number) {
      const intensity = easeOutCubic(p);
      const bg = ctx.createRadialGradient(DST_CX, DST_CY, 0, DST_CX, DST_CY, 200);
      bg.addColorStop(0, `rgba(18,0,28,${intensity})`);
      bg.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }

    function drawRings(p: number, rotation: number) {
      rings.forEach((ring, i) => {
        const delay = i * 0.08;
        const alpha = easeOutCubic(clamp((p - delay) / 0.4, 0, 1)) * 0.25;
        if (alpha <= 0) return;
        ctx.save();
        ctx.translate(DST_CX, DST_CY);
        ctx.rotate(rotation * ring.speed);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([ring.dash, ring.gap]);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawParticles(p: number) {
      particles.forEach(d => {
        const tp = clamp((p - d.delay) / 0.7, 0, 1);
        const ep = easeOutCubic(tp);
        const x = lerp(d.sx, DST_CX, ep);
        const y = lerp(d.sy, DST_CY, ep);
        const fadeOut = clamp(1 - (p - 0.7) * 6, 0, 1);
        const alpha = tp < 0.05 ? 0 : (tp < 1 ? 0.55 * easeOutCubic(tp) : 0.55 * fadeOut);
        if (alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${d.hue},85%,65%)`;
        ctx.shadowColor = `hsl(${d.hue},90%,70%)`;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(x, y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function drawGlowBurst(p: number) {
      // pulso de luz no momento que o F aparece
      const alpha = Math.sin(p * Math.PI) * 0.5;
      if (alpha <= 0) return;
      ctx.save();
      const g = ctx.createRadialGradient(DST_CX, DST_CY, 0, DST_CX, DST_CY, 120);
      g.addColorStop(0, `rgba(240,32,187,${alpha * 0.6})`);
      g.addColorStop(0.4, `rgba(168,85,247,${alpha * 0.3})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    function drawFLogo(p: number, glowP: number) {
      // entra com scale + fade, sem bounce
      const scale = lerp(1.15, 1, easeOutQuart(Math.min(1, p * 1.8)));
      const alpha = easeOutCubic(Math.min(1, p * 2));
      if (alpha <= 0) return;

      ctx.save();
      ctx.translate(DST_CX, DST_CY);
      ctx.scale(scale, scale);
      ctx.translate(-DST_CX, -DST_CY);
      ctx.globalAlpha = alpha;

      // glow suave ao redor do F
      if (glowP > 0) {
        ctx.shadowColor = '#e040d0';
        ctx.shadowBlur = lerp(0, 24, Math.sin(glowP * Math.PI));
      }

      const [lx1, ly1] = t(1690, 3750);
      const [lx2, ly2] = t(3500, 2400);

      const g1 = ctx.createLinearGradient(lx1, ly1, lx2, ly2);
      g1.addColorStop(0, '#ff1a9d');
      g1.addColorStop(0.3, '#f020bb');
      g1.addColorStop(0.6, '#c026d3');
      g1.addColorStop(1, '#6d28d9');

      const g2 = ctx.createLinearGradient(lx1, ly1, lx2, ly2);
      g2.addColorStop(0, '#c026d3');
      g2.addColorStop(0.45, '#9333ea');
      g2.addColorStop(1, '#5b21b6');

      ctx.fillStyle = g2; ctx.fill(pathB);
      ctx.fillStyle = g1; ctx.fill(pathA);

      // apaga ponto artefato
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(124.3, 178.6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = g1; ctx.fill(pathA);
      ctx.restore();
    }

    function drawSparkle(p: number) {
      const alpha = Math.sin(p * Math.PI);
      if (alpha <= 0) return;
      const [spx, spy] = t(3326, 3879);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      const ss = 9 * alpha;
      [[0, -ss], [0, ss], [-ss, 0], [ss, 0], [-ss * .6, -ss * .6], [ss * .6, ss * .6], [-ss * .6, ss * .6], [ss * .6, -ss * .6]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(spx + dx * .25, spy + dy * .25);
        ctx.lineTo(spx + dx, spy + dy);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(spx, spy, 2.2 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8 * alpha;
      ctx.fill();
      ctx.restore();
    }

    function drawText(p: number) {
      if (p <= 0) return;
      // texto sobe suavemente
      const alpha = easeOutCubic(p);
      const offsetY = lerp(10, 0, easeOutCubic(p));
      const [, yBottom] = t(1690, 2400);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.font = '700 13.5px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.letterSpacing = '0.42em';
      ctx.shadowColor = 'rgba(240,32,187,0.6)';
      ctx.shadowBlur = 12 * alpha;
      ctx.fillText('FILMIN', W / 2 + 4, yBottom + 32 + offsetY);
      ctx.restore();
    }

    function drawVignette() {
      const g = ctx.createRadialGradient(DST_CX, DST_CY, 60, DST_CX, DST_CY, 200);
      g.addColorStop(0, 'transparent');
      g.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    const DURATION = 4000;
    let startTime: number | null = null;
    let rafId: number;

    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const p = Math.min(1, (ts - startTime) / DURATION);

      // fundo preto sempre
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      drawBackground(prog(p, 0, 0.3));

      // rings: entram no início, somem quando o F aparece
      const ringsAlpha = easeOutCubic(prog(p, 0, 0.2)) * (1 - easeOutCubic(prog(p, 0.45, 0.65)));
      if (ringsAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = ringsAlpha;
        drawRings(1, p * 3);
        ctx.restore();
      }

      // partículas convergem
      if (p > 0.05) drawParticles(prog(p, 0.05, 0.9));

      // burst de luz antes do F aparecer
      drawGlowBurst(prog(p, 0.38, 0.58));

      // F entra com scale suave
      if (p > 0.4) {
        const glowP = prog(p, 0.55, 0.85);
        drawFLogo(prog(p, 0.4, 0.7), glowP);
      }

      // sparkle aparece depois do F
      drawSparkle(prog(p, 0.65, 0.85));

      // texto sobe
      drawText(prog(p, 0.7, 0.88));

      drawVignette();

      if (p < 1) rafId = requestAnimationFrame(animate);
      else setTimeout(onFinish, 300);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <canvas ref={canvasRef} width={300} height={360} />
    </motion.div>
  );
}