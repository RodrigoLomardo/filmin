'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  open: boolean;
  memberName: string;
  onClose: () => void;
};

export function MemberJoinedToast({ open, memberName, onClose }: Props) {
  const queryClient = useQueryClient();

  // Invalida o grupo para refletir o novo membro
  useEffect(() => {
    if (open) {
      queryClient.invalidateQueries({ queryKey: ['group'] });
    }
  }, [open, queryClient]);

  // Auto-fecha após 5 segundos
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{
              background: 'linear-gradient(135deg, #131315 0%, #0f0f12 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 16px 48px rgba(0,0,0,0.8)',
            }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,46,166,0.12)', boxShadow: '0 0 0 1px rgba(255,46,166,0.25)' }}
            >
              <UserPlus size={15} className="text-pink-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-none text-white">
                Novo membro no duo!
              </p>
              <p className="mt-1 truncate text-[12px] text-zinc-400">
                <span className="text-zinc-200">{memberName}</span> entrou no seu grupo.
              </p>
            </div>

            {/* Barra de progresso */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] rounded-full bg-pink-500/50"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
