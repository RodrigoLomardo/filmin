'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  open: boolean;
  partnerName: string;
  onClose: () => void;
};

export function DuoDissolvedModal({ open, partnerName, onClose }: Props) {
  const queryClient = useQueryClient();

  // Ao abrir: invalida o grupo e os itens para refletir o novo estado solo
  useEffect(() => {
    if (open) {
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
    }
  }, [open, queryClient]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 bottom-0 z-50 mx-auto mb-6 max-w-sm"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          >
            <div
              className="overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(160deg, #131315 0%, #0d0d10 100%)',
                boxShadow: '0 -2px 0 rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.9)',
              }}
            >
              {/* Glow decorativo */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(248,113,113,0.08) 0%, transparent 65%)',
                }}
              />

              {/* Conteúdo */}
              <div className="relative px-6 pb-7 pt-8">
                {/* Ícone */}
                <div className="mb-5 flex justify-center">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      background: 'rgba(248,113,113,0.1)',
                      boxShadow: '0 0 0 1px rgba(248,113,113,0.2)',
                    }}
                  >
                    <Heart size={28} className="text-red-400" />
                  </div>
                </div>

                {/* Texto principal */}
                <h2 className="mb-2 text-center text-[17px] font-bold leading-tight text-white">
                  O duo foi desfeito
                </h2>
                <p className="mb-1 text-center text-sm text-zinc-400 leading-relaxed">
                  <span className="font-medium text-zinc-200">{partnerName}</span> saiu do seu grupo.
                </p>
                <p className="text-center text-sm text-zinc-500 leading-relaxed">
                  Não se preocupe — todo o seu acervo está salvo e disponível na sua galeria solo.
                </p>

                {/* Destaque: acervo preservado */}
                <div
                  className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: 'rgba(52,211,153,0.07)',
                    boxShadow: '0 0 0 1px rgba(52,211,153,0.15)',
                  }}
                >
                  <ShieldCheck size={16} className="flex-shrink-0 text-emerald-400" />
                  <p className="text-[13px] text-emerald-300 leading-snug">
                    Todos os filmes, séries e livros do duo foram copiados para sua galeria solo.
                  </p>
                </div>

                {/* Botão */}
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                    boxShadow: '0 4px 24px rgba(236,72,153,0.25)',
                  }}
                >
                  Entendido, ir para meu acervo
                </motion.button>
              </div>

              {/* X discreto */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition hover:bg-white/5 hover:text-zinc-400"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
