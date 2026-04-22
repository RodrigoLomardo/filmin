'use client';

import { motion } from 'framer-motion';

interface TheoIntroProps {
  userName?: string;
}

const PHRASES = [
  'Conheço seu gosto melhor do que você pensa.',
  'Não sou um chatbot. Sou quem decide por você.',
  'Seu curador pessoal de conteúdo.',
];

export function TheoIntro({ userName }: TheoIntroProps) {
  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  const greeting = userName
    ? `Oi, ${userName}. O que a gente assiste hoje?`
    : 'O que a gente assiste hoje?';

  return (
    <motion.div
      className="flex flex-col items-center gap-6 py-6 text-center"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Orb avatar */}
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
      >
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-pink-500/10"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.05, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Mid pulse ring */}
        <motion.div
          className="absolute inset-3 rounded-full border border-pink-500/18"
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
        {/* Core orb */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/25 via-pink-500/10 to-zinc-900 ring-1 ring-pink-500/30">
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-full bg-pink-500/8 blur-xl" />
          <motion.span
            className="relative font-cormorant text-3xl font-light italic text-pink-200"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            T
          </motion.span>
        </div>
      </motion.div>

      {/* Identity */}
      <motion.div
        className="flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18, ease: 'easeOut' }}
      >
        <p className="text-[9px] uppercase tracking-[0.45em] text-zinc-600">
          assistente do filmin
        </p>
        <h1 className="font-cormorant text-5xl font-light italic leading-none text-white">
          Theo
        </h1>
      </motion.div>

      {/* Greeting */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.32, ease: 'easeOut' }}
      >
        <p className="text-base font-medium text-white/90">{greeting}</p>
        <p className="max-w-[200px] text-xs leading-relaxed text-zinc-600">{phrase}</p>
      </motion.div>

      {/* Divider */}
      <motion.div
        className="h-px w-16 bg-gradient-to-r from-transparent via-zinc-700 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
      />
    </motion.div>
  );
}
