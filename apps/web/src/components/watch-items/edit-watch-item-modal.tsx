'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { WatchItem } from '@/types/watch-item';
import { EditWatchItemForm } from './edit-watch-item-form';

type EditWatchItemModalProps = {
  item: WatchItem | null;
  onClose: () => void;
};

export function EditWatchItemModal({ item, onClose }: EditWatchItemModalProps) {
  useEffect(() => {
    if (item) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  return (
    <AnimatePresence>
      {item && (
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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-zinc-950 px-4 pb-8 pt-4"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="mx-auto h-1 w-10 rounded-full bg-zinc-700" />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.titulo}</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
              >
                <X size={16} />
              </button>
            </div>

            <EditWatchItemForm item={item} onSuccess={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}