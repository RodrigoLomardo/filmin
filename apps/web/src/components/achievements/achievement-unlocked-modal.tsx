'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '@/types/achievement';

interface AchievementUnlockedModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

// ── Partículas pré-calculadas (sem Math.random no render) ─────────────────────

const GOLDEN_ANGLE = 137.508;
const PARTICLE_COLORS = [
  '#ff2ea6', '#ff2ea6', '#f472b6',
  '#a855f7', '#c084fc',
  '#facc15', '#fbbf24',
  '#38bdf8', '#818cf8',
  '#4ade80', '#ff2ea6',
];

const PARTICLES = Array.from({ length: 48 }, (_, i) => {
  const angleDeg = i * GOLDEN_ANGLE;
  const angleRad = (angleDeg * Math.PI) / 180;
  const radiusFactor = 0.35 + ((i * 1.618) % 100) / 142;
  const size = 3 + (i % 6);
  const duration = 1.1 + (i % 9) / 10;
  const delay = (i % 14) / 140;
  return {
    id: i,
    vx: Math.cos(angleRad) * radiusFactor,
    vy: Math.sin(angleRad) * radiusFactor,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    size,
    duration,
    delay,
    rotate: (i * GOLDEN_ANGLE) % 360,
    isSquare: i % 3 === 0,
  };
});

const RAYS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  angle: i * 36,
  delay: i * 0.04,
  length: 160 + (i % 4) * 40,
}));

// ── Sub-componentes ────────────────────────────────────────────────────────────

function Particle({ vx, vy, color, size, duration, delay, rotate, isSquare }: typeof PARTICLES[0]) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        width: size,
        height: isSquare ? size : size * 0.45,
        background: color,
        borderRadius: isSquare ? 1 : size,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x: vx * 500, y: vy * 500, opacity: 0, scale: 0, rotate }}
      transition={{ duration, ease: [0.15, 0, 0.7, 1], delay }}
    />
  );
}

function Ray({ angle, delay, length }: typeof RAYS[0]) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        width: 1.5,
        height: length,
        background: 'linear-gradient(to bottom, rgba(255,46,166,0.9), transparent)',
        transformOrigin: 'top center',
        transform: `translateX(-50%) rotate(${angle}deg)`,
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: [0, 1, 0], opacity: [0, 0.7, 0] }}
      transition={{ duration: 0.75, delay, ease: 'easeOut' }}
    />
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function AchievementUnlockedModal({ achievements, onClose }: AchievementUnlockedModalProps) {
  const [index, setIndex] = useState(0);
  const [particleKey, setParticleKey] = useState(0);

  const current = achievements[index];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < achievements.length - 1) {
        setIndex((i) => i + 1);
        setParticleKey((k) => k + 1);
      } else {
        onClose();
      }
    }, 3800);
    return () => clearTimeout(timer);
  }, [index, achievements.length, onClose]);

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.88) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        />

        {/* Partículas full-screen */}
        <div key={particleKey} className="absolute inset-0 pointer-events-none">
          {PARTICLES.map((p) => <Particle key={p.id} {...p} />)}
        </div>

        {/* Raios de luz */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {RAYS.map((r) => <Ray key={r.id} {...r} />)}
        </div>

        {/* Blob de glow central */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 360,
            height: 360,
            background: 'radial-gradient(circle, rgba(255,46,166,0.22) 0%, rgba(168,85,247,0.1) 50%, transparent 70%)',
            filter: 'blur(48px)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2, 1.3], opacity: [0, 1, 0.55] }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        {/* ── Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.slug}
            className="relative z-10 mx-4 overflow-hidden"
            style={{
              maxWidth: 340,
              width: '100%',
              borderRadius: 28,
              background: 'linear-gradient(170deg, rgba(22,10,20,0.99) 0%, rgba(8,4,14,0.99) 100%)',
              border: '1px solid rgba(255,46,166,0.28)',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.04) inset, 0 48px 96px rgba(0,0,0,0.65), 0 0 80px rgba(255,46,166,0.12)',
            }}
            initial={{ scale: 0.35, opacity: 0, y: 72, rotate: -4 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: -28 }}
            transition={{ type: 'spring', stiffness: 440, damping: 28, mass: 0.75 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Linha superior shimmer */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,46,166,0.9) 30%, rgba(168,85,247,0.9) 70%, transparent 100%)',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.55, ease: 'easeOut' }}
            />

            {/* Scan line varredura */}
            <motion.div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                height: 80,
                background:
                  'linear-gradient(to bottom, transparent, rgba(255,46,166,0.05), transparent)',
              }}
              initial={{ top: -80 }}
              animate={{ top: '110%' }}
              transition={{ duration: 1.8, delay: 0.5, ease: 'linear' }}
            />

            <div className="relative flex flex-col items-center gap-5 px-8 py-8">

              {/* Label topo */}
              <motion.div
                className="flex items-center gap-3 w-full justify-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.35 }}
              >
                <motion.div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(255,46,166,0.55))' }}
                  initial={{ scaleX: 0, originX: 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.38, duration: 0.4 }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    color: '#ff2ea6',
                  }}
                >
                  Conquista desbloqueada
                </span>
                <motion.div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(to left, transparent, rgba(255,46,166,0.55))' }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.38, duration: 0.4 }}
                />
              </motion.div>

              {/* Emoji com anéis orbitais */}
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ scale: 0.2, rotate: -18 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.14 }}
              >
                {/* Anel pulsante externo */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 136, height: 136, border: '1px solid rgba(255,46,166,0.25)' }}
                  animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Anel rotacional com ponto */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 110, height: 110 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: '#a855f7',
                      boxShadow: '0 0 6px rgba(168,85,247,0.8)',
                      top: -3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ border: '1px solid rgba(168,85,247,0.2)' }}
                  />
                </motion.div>

                {/* Emoji box */}
                <motion.div
                  className="relative z-10 flex items-center justify-center rounded-[20px] text-[52px]"
                  style={{
                    width: 90,
                    height: 90,
                    background:
                      'linear-gradient(145deg, rgba(255,46,166,0.14) 0%, rgba(168,85,247,0.18) 100%)',
                    border: '1px solid rgba(255,46,166,0.38)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 28px rgba(255,46,166,0.28)',
                  }}
                  animate={{
                    boxShadow: [
                      'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 28px rgba(255,46,166,0.28)',
                      'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 52px rgba(255,46,166,0.52)',
                      'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 28px rgba(255,46,166,0.28)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {current.icone}
                </motion.div>
              </motion.div>

              {/* Nome com gradiente + descrição */}
              <motion.div
                className="flex flex-col items-center gap-2 text-center"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.38 }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #ffffff 20%, #ff2ea6 65%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {current.nome}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'rgba(161,161,170,0.82)',
                    maxWidth: 240,
                  }}
                >
                  {current.descricao}
                </p>
              </motion.div>

              {/* Dots múltiplas conquistas */}
              {achievements.length > 1 && (
                <motion.div
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.42 }}
                >
                  {achievements.map((_, i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      style={{ height: 5, background: i === index ? '#ff2ea6' : 'rgba(255,255,255,0.14)' }}
                      animate={{ width: i === index ? 18 : 5 }}
                      transition={{ duration: 0.28 }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Barra de progresso do tempo */}
              <motion.div
                className="w-full overflow-hidden rounded-full"
                style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #ff2ea6, #a855f7)' }}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3.6, ease: 'linear', delay: 0.2 }}
                />
              </motion.div>

              {/* Hint fechar */}
              <motion.button
                style={{ fontSize: 10, fontWeight: 500, color: 'rgba(82,82,91,0.8)', letterSpacing: '0.06em' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                onClick={onClose}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(244,244,245,0.7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(82,82,91,0.8)'; }}
              >
                toque para fechar
              </motion.button>
            </div>

            {/* Linha inferior */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.45), transparent)',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.42, duration: 0.5 }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
