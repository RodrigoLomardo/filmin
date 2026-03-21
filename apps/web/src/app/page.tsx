'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { WatchItemsDashboard } from '@/components/watch-items/watch-items-dashboard';
import { SplashScreen } from '@/components/splash-screen';
import { MotionDiv, MotionLink } from '@/components/motion';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showSplash && (
          <motion.main
            className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <MotionDiv
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-pink-500">Filmin</p>
              <h1 className="text-3xl font-bold">Seus filmes, séries e livros</h1>
            </MotionDiv>

            <WatchItemsDashboard />

            <MotionLink
              href="/cadastro"
              className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.08 }}
            >
              <Plus size={24} />
            </MotionLink>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}