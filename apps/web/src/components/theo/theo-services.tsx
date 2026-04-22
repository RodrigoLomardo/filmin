'use client';

import { motion } from 'framer-motion';
import { BookOpen, Clapperboard, Shuffle, Tv, Users, Zap } from 'lucide-react';
import type { TheoTipoFilter } from '@/types/theo';

interface TheoService {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  message: string;
  tipoFilter?: TheoTipoFilter;
}

const MAIN_SERVICES: TheoService[] = [
  {
    id: 'recommend',
    label: 'Recomendar',
    description: 'Sugiro algo baseado no seu gosto',
    icon: Zap,
    message: 'Quero uma recomendação personalizada',
  },
  {
    id: 'surprise',
    label: 'Me surpreenda',
    description: 'Deixa eu escolher por você',
    icon: Shuffle,
    message: 'Me surpreenda com alguma coisa do meu acervo',
  },
  {
    id: 'duo',
    label: 'Para assistir em dupla',
    description: 'Algo que os dois vão curtir',
    icon: Users,
    message: 'Quero uma sugestão para assistir em dupla',
  },
];

const FILTER_SERVICES: TheoService[] = [
  {
    id: 'filme',
    label: 'Só filmes',
    description: '',
    icon: Clapperboard,
    message: 'Quero uma recomendação de filme',
    tipoFilter: 'filme',
  },
  {
    id: 'serie',
    label: 'Só séries',
    description: '',
    icon: Tv,
    message: 'Quero uma recomendação de série',
    tipoFilter: 'serie',
  },
  {
    id: 'livro',
    label: 'Só livros',
    description: '',
    icon: BookOpen,
    message: 'Quero uma recomendação de livro',
    tipoFilter: 'livro',
  },
];

interface TheoServicesProps {
  onSelect: (message: string, tipoFilter?: TheoTipoFilter) => void;
}

export function TheoServices({ onSelect }: TheoServicesProps) {
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="flex flex-col gap-2">
        <p className="mb-1 text-xs uppercase tracking-widest text-zinc-600">O que posso fazer</p>
        {MAIN_SERVICES.map((service, i) => {
          const Icon = service.icon;
          return (
            <motion.button
              key={service.id}
              className="flex items-center gap-3 rounded-xl bg-zinc-900/80 px-4 py-3 text-left ring-1 ring-white/5 transition-colors hover:bg-zinc-800/80 hover:ring-pink-500/30"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.55 + i * 0.07, ease: 'easeOut' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(service.message, service.tipoFilter)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20">
                <Icon size={16} className="text-pink-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{service.label}</span>
                <span className="text-xs text-zinc-500">{service.description}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="mb-0.5 text-xs uppercase tracking-widest text-zinc-600">Filtrar por tipo</p>
        <div className="flex gap-2">
          {FILTER_SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.id}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900/80 px-3 py-2.5 text-xs font-medium text-zinc-400 ring-1 ring-white/5 transition-colors hover:bg-zinc-800/80 hover:text-white hover:ring-pink-500/30"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.75 + i * 0.06, ease: 'easeOut' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(service.message, service.tipoFilter)}
              >
                <Icon size={13} />
                {service.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
