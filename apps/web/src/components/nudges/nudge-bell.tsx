'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Clock, Play, Sparkles, X, Zap } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNudges, markAllNudgesRead, markNudgeRead } from '@/lib/api/nudges';
import type { Nudge, NudgeType } from '@/types/nudge';

// ─── Utils ────────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<NudgeType, React.ElementType> = {
  session: Clock,
  continuity: Play,
  inactivity: Zap,
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
}

// ─── Nudge card ───────────────────────────────────────────────────────────────

function NudgeCard({
  nudge,
  onDismiss,
}: {
  nudge: Nudge;
  onDismiss: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = TYPE_ICON[nudge.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group relative flex gap-3 rounded-xl bg-zinc-900 px-3.5 py-3 ring-1 ring-white/5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mt-0.5 shrink-0">
        <Icon size={14} className="text-pink-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-zinc-200">{nudge.message}</p>
        <p className="mt-1 text-[10px] text-zinc-600">{relativeTime(nudge.createdAt)}</p>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            onClick={() => onDismiss(nudge.id)}
            aria-label="Dispensar"
          >
            <X size={10} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NudgeBell() {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: nudges = [] } = useQuery({
    queryKey: ['nudges'],
    queryFn: fetchNudges,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const { mutate: dismiss } = useMutation({
    mutationFn: markNudgeRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nudges'] }),
  });

  const { mutate: dismissAll } = useMutation({
    mutationFn: markAllNudgesRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nudges'] });
      setOpen(false);
    },
  });

  // Calcula posição do dropdown para não sair da viewport
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const PADDING = 8;
    const width = Math.min(320, window.innerWidth - PADDING * 2);
    const rightFromViewport = window.innerWidth - rect.right;
    const leftEdge = rect.right - width;
    const clampedRight = leftEdge < PADDING ? PADDING : rightFromViewport;
    setDropdownPos({
      position: 'fixed',
      top: rect.bottom + 8,
      right: clampedRight,
      width,
    });
  }, [open]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unreadCount = nudges.filter((n) => !n.readAt).length;
  const visible = nudges.slice(0, 5);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10 transition hover:ring-pink-500/40"
        aria-label="Notificações do Theo"
      >
        <Bell size={15} className="text-zinc-300" />

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 py-px text-[9px] font-semibold leading-none text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="z-50 rounded-2xl bg-zinc-900/95 shadow-2xl shadow-black/40 ring-1 ring-white/8 backdrop-blur-md"
            style={dropdownPos}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="font-cormorant text-sm italic text-pink-400">Theo</span>
                <span className="text-xs text-zinc-600">diz</span>
              </div>
              {nudges.length > 0 && (
                <button
                  onClick={() => dismissAll()}
                  className="text-[11px] text-pink-400 transition hover:text-pink-300"
                >
                  Marcar tudo lido
                </button>
              )}
            </div>

            <div className="h-px bg-white/5 mx-4" />

            {/* Content */}
            <div className="max-h-[340px] overflow-y-auto px-3 py-2.5">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Sparkles size={28} className="text-pink-400/30" />
                  <p className="text-center text-xs text-zinc-600">
                    Theo não tem nada novo por agora
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <AnimatePresence mode="popLayout">
                    {visible.map((nudge) => (
                      <NudgeCard
                        key={nudge.id}
                        nudge={nudge}
                        onDismiss={(id) => dismiss(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
