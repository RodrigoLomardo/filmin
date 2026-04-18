import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import type { WatchItem } from '@/types/watch-item';

export function SpinCard({ item }: { item: WatchItem }) {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.06 }}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-xl">
        {item.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.posterUrl} alt={item.titulo} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3">
            <Film size={32} className="text-white/15" />
            <p className="text-center text-xs font-medium leading-tight text-white/40 line-clamp-3">
              {item.titulo}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
