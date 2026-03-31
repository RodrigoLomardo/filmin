'use client';

import { useEffect, useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { WatchItemsDashboard } from '@/components/watch-items/watch-items-dashboard';
import { SplashScreen } from '@/components/splash-screen';
import { MotionDiv } from '@/components/motion';




const menuItems = [
  { label: 'Modo Match', href: '/match', icon: Heart },
  { label: 'Novo item', href: '/cadastro', icon: Plus },
];


export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem('splash_shown');
    setShowSplash(!shown);
    setMounted(true);

    if (!sessionStorage.getItem('splashShown')) {
      setShowSplash(true);
      sessionStorage.setItem('splashShown', 'true');
    }

  }, []);

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {showSplash && (

          <SplashScreen onFinish={() => {
            sessionStorage.setItem('splash_shown', '1');
            setShowSplash(false);
          }} />



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

            {/* FAB Menu */}
            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
              {/* Backdrop */}
              <AnimatePresence>
                {menuAberto && (
                  <motion.div
                    className="fixed inset-0 -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMenuAberto(false)}
                  />
                )}
              </AnimatePresence>

              {/* Menu items */}
              <AnimatePresence>
                {menuAberto && menuItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 12, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: i * 0.06, ease: 'easeOut' }}
                    >
                      <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/10">
                        {item.label}
                      </span>
                      <Link
                        href={item.href}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg ring-1 ring-white/10 transition-colors hover:bg-zinc-700"
                        onClick={() => setMenuAberto(false)}
                      >
                        <Icon size={20} />
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Main FAB */}
              <motion.button
                className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => setMenuAberto((v) => !v)}
                aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              >
                <motion.div
                  animate={{ rotate: menuAberto ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <Plus size={24} />
                </motion.div>
              </motion.button>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}