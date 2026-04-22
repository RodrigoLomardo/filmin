'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TheoIntro() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-pink-500/5 ring-1 ring-pink-500/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <Sparkles size={26} className="text-pink-400" />
        <motion.div
          className="absolute inset-0 rounded-full bg-pink-500/10"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      >
        <h1 className="font-cormorant text-3xl font-light italic text-white">
          Theo
        </h1>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          assistente do filmin
        </p>
      </motion.div>

      {/* Description */}
      <motion.p
        className="max-w-xs text-sm leading-relaxed text-zinc-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
      >
        Não sou um chatbot. Sou o assistente de decisão do Filmin — te ajudo a
        escolher o que assistir ou ler, usando o seu acervo.
      </motion.p>
    </motion.div>
  );
}
