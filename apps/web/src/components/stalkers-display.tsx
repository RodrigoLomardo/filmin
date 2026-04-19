'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMyViewers } from '@/lib/api/social-profile';
import type { ProfileViewerEntry } from '@/types/social-profile';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function viewerDisplayName(v: ProfileViewerEntry): string {
  const name = [v.firstName, v.lastName].filter(Boolean).join(' ');
  return name || v.email?.split('@')[0] || 'Usuário';
}

function viewerInitial(v: ProfileViewerEntry): string {
  return (v.firstName?.[0] ?? v.email?.[0] ?? 'U').toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'agora mesmo';
  if (m < 60) return `há ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d}d`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ---------------------------------------------------------------------------
// ViewersModal
// ---------------------------------------------------------------------------

function ViewersModal({
  open,
  count,
  viewers,
  onClose,
}: {
  open: boolean;
  count: number;
  viewers: ProfileViewerEntry[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl"
            style={{
              translateX: '-50%',
              translateY: '-50%',
              background: 'rgba(11,11,12,0.97)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,46,166,0.1), 0 24px 64px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-pink-500" />
                <span className="text-sm font-semibold text-white">
                  Quem visitou seu perfil
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-pink-400"
                  style={{ background: 'rgba(255,46,166,0.1)' }}
                >
                  {count}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition hover:bg-white/[0.06] hover:text-zinc-300"
              >
                <X size={14} />
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

            {/* List */}
            {viewers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Eye size={22} className="text-zinc-800" />
                <p className="text-sm text-zinc-600">Ninguém visitou seu perfil ainda.</p>
                <p className="text-[11px] text-zinc-700">
                  Compartilhe seu perfil para ganhar visitas!
                </p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto p-2">
                {viewers.map((v, i) => (
                  <motion.li
                    key={v.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.03]"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.03 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/[0.06]">
                      <span className="text-xs font-semibold text-zinc-300">
                        {viewerInitial(v)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-200">{viewerDisplayName(v)}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-600">{timeAgo(v.viewedAt)}</span>
                  </motion.li>
                ))}
              </ul>
            )}

            <div className="h-2" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// StalkersDisplay — trigger button + modal
// ---------------------------------------------------------------------------

export function StalkersDisplay() {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['profile-viewers'],
    queryFn: getMyViewers,
    staleTime: 60_000,
  });

  const count = data?.count ?? 0;
  const viewers = data?.viewers ?? [];

  return (
    <>
      <motion.button
        className="flex items-center gap-0.5 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-zinc-800/60 active:bg-zinc-800"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.93 }}
        title="Ver quem visitou seu perfil"
        aria-label="Visitantes do perfil"
      >
        {/* Eye icon */}
        <Eye size={18} className="text-zinc-400" />

        {/* Count — smaller than icon, very close */}
        <motion.span
          key={count}
          className="text-[11px] font-semibold tabular-nums leading-none text-zinc-400"
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {count}
        </motion.span>
      </motion.button>

      <ViewersModal
        open={open}
        count={count}
        viewers={viewers}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
