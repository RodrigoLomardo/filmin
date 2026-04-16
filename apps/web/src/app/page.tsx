'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Plus, Heart, Shuffle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { WatchItemsDashboard } from '@/components/watch-items/watch-items-dashboard';
import { SplashScreen } from '@/components/splash-screen';
import { MotionDiv } from '@/components/motion';
import { AvatarButton, GroupMembersButton, ProfileModal } from '@/components/profile-modal';
import {
  PendingRatingNotificationModal,
  PendingNotificationButton,
  markPendingDismissed,
  clearPendingDismissed,
  isPendingDismissed,
} from '@/components/watch-items/pending-rating-notification';
import { useGroupTipo } from '@/lib/hooks/use-group-tipo';
import { usePendingRatings } from '@/lib/hooks/use-pending-ratings';


export default function HomePage() {
  const groupTipo = useGroupTipo();
  // Lê sessionStorage no lazy initializer — sem effect, sem render em cascata
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    const shown = sessionStorage.getItem('splash_shown');
    if (!shown) {
      sessionStorage.setItem('splash_shown', '1');
      return true;
    }
    return false;
  });
  // useSyncExternalStore: client=true / SSR=false, sem useEffect nem setState em cascata
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [menuAberto, setMenuAberto] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const autoShownRef = useRef(false);

  const pendingItems = usePendingRatings();

  useEffect(() => {
    if (pendingItems.length === 0) return;
    if (autoShownRef.current) return;
    if (isPendingDismissed()) return;
    autoShownRef.current = true;
    const timer = setTimeout(() => setPendingOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [pendingItems.length]);

  function handleDismiss() {
    markPendingDismissed();
    setPendingOpen(false);
  }

  function handleBellClick() {
    clearPendingDismissed();
    setPendingOpen(true);
  }

  const menuItems = [
    groupTipo === 'duo'
      ? { label: 'Modo Match', href: '/match', icon: Heart }
      : { label: 'Escolha Rápida', href: '/escolha-rapida', icon: Shuffle },
    { label: 'Novo item', href: '/cadastro', icon: Plus },
  ];



  if (!mounted) return null;

  return (
    <>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <PendingRatingNotificationModal
        items={pendingItems}
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        onDismiss={handleDismiss}
      />

      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {!showSplash && (
          <motion.main
            className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 pt-10 pb-28 md:pt-8 md:pb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* ── Header ── */}
            <MotionDiv
              className="relative flex items-start justify-between"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Atmospheric glow behind brand */}
              <div className="pointer-events-none absolute -left-6 -top-12 h-40 w-64 rounded-full bg-pink-500/[0.08] blur-3xl" />

              <div className="relative">
                {/* Brand name: film + in stagger */}
                <div className="flex items-baseline">
                  <motion.span
                    className="font-cormorant text-[42px] font-light italic leading-none tracking-tight text-white md:text-[48px]"
                    initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    film
                  </motion.span>
                  <motion.span
                    className="font-cormorant text-[42px] font-light italic leading-none tracking-tight text-pink-500 md:text-[48px]"
                    initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    in
                  </motion.span>
                </div>

                {/* Animated rule */}
                <motion.div
                  className="mt-2 h-px bg-gradient-to-r from-pink-500/50 via-pink-500/15 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 1.0, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Tagline */}
                <motion.p
                  className="mt-1.5 text-[10px] uppercase tracking-[0.3em] text-zinc-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.75 }}
                >
                  seu acervo
                </motion.p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <PendingNotificationButton
                  count={pendingItems.length}
                  onClick={handleBellClick}
                />
                <GroupMembersButton />
                <AvatarButton onClick={() => setProfileOpen(true)} />
              </div>
            </MotionDiv>

            <WatchItemsDashboard />

            {/* ── FAB Menu ── */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
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
                {menuAberto &&
                  menuItems.map((item, i) => {
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
                className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-white shadow-[0_0_32px_rgba(255,46,166,0.5),0_4px_16px_rgba(0,0,0,0.4)]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
                whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
                whileHover={{ scale: 1.07 }}
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
