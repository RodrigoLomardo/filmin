'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TheoChat } from '@/components/theo/theo-chat';
import { getProfile } from '@/lib/api/profile';

export default function TheoPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <motion.div
      className="flex h-full flex-col bg-[#080808]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-4 pb-1 pt-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <ArrowLeft size={13} />
          voltar
        </Link>

        <AnimatePresence>
          {profile?.firstName && (
            <motion.span
              className="text-[10px] text-zinc-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {profile.firstName}
            </motion.span>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-pink-500"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">Theo</span>
        </div>
      </header>

      {/* Chat */}
      <TheoChat userName={profile?.firstName ?? undefined} />
    </motion.div>
  );
}
