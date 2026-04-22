'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shuffle, Users, Zap } from 'lucide-react';
import type { TheoTipoFilter } from '@/types/theo';

interface TheoService {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  message: string;
}

interface FilterOption {
  id: TheoTipoFilter;
  label: string;
  message: string;
}

const MAIN_SERVICES: TheoService[] = [
  {
    id: 'recommend',
    label: 'Recomendar',
    sublabel: 'baseado no seu histórico',
    icon: Zap,
    message: 'Quero uma recomendação personalizada',
  },
  {
    id: 'surprise',
    label: 'Me surpreenda',
    sublabel: 'deixa eu escolher por você',
    icon: Shuffle,
    message: 'Me surpreenda com alguma coisa do meu acervo',
  },
  {
    id: 'duo',
    label: 'Em dupla',
    sublabel: 'algo que os dois vão curtir',
    icon: Users,
    message: 'Quero uma sugestão para assistir em dupla',
  },
];

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'filme', label: 'filmes', message: 'Quero uma recomendação de filme' },
  { id: 'serie', label: 'séries', message: 'Quero uma recomendação de série' },
  { id: 'livro', label: 'livros', message: 'Quero uma recomendação de livro' },
];

interface TheoServicesProps {
  onSelect: (message: string, tipoFilter?: TheoTipoFilter) => void;
}

const rowVariants = {
  rest: {},
  hover: {},
};

const accentVariants = {
  rest: { scaleY: 0, opacity: 0 },
  hover: { scaleY: 1, opacity: 1 },
};

const iconVariants = {
  rest: { color: 'rgb(63,63,70)' },
  hover: { color: 'rgb(236,72,153)' },
};

const labelVariants = {
  rest: { color: 'rgb(113,113,122)' },
  hover: { color: 'rgb(255,255,255)' },
};

const sublabelVariants = {
  rest: { opacity: 0.0 },
  hover: { opacity: 0.45 },
};

const arrowVariants = {
  rest: { x: 0, opacity: 0.12 },
  hover: { x: 3, opacity: 0.55 },
};

const chipBgVariants = {
  rest: { opacity: 0, scale: 0.88 },
  hover: { opacity: 1, scale: 1 },
};

const chipLabelVariants = {
  rest: { color: 'rgb(82,82,91)' },
  hover: { color: 'rgb(212,212,216)' },
};

export function TheoServices({ onSelect }: TheoServicesProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Main services — editorial list */}
      <div className="flex flex-col">
        {MAIN_SERVICES.map((service, i) => {
          const Icon = service.icon;
          return (
            <motion.button
              key={service.id}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.985, opacity: 0.85 }}
              variants={rowVariants}
              className="group relative flex items-center gap-3.5 border-t border-white/[0.04] py-3.5 text-left first:border-t-0"
              onClick={() => onSelect(service.message)}
              style={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.52 + i * 0.09, ease: 'easeOut' } as never}
            >
              {/* Left accent bar */}
              <motion.span
                className="absolute left-0 top-2 h-[calc(100%-16px)] w-[2px] rounded-full bg-pink-500 origin-top"
                variants={accentVariants}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              />

              {/* Icon */}
              <motion.span
                variants={iconVariants}
                transition={{ duration: 0.16 }}
                className="shrink-0 pl-3"
              >
                <Icon size={13} strokeWidth={1.75} />
              </motion.span>

              {/* Labels */}
              <div className="flex flex-1 flex-col">
                <motion.span
                  variants={labelVariants}
                  transition={{ duration: 0.16 }}
                  className="text-[13px] font-medium leading-none"
                >
                  {service.label}
                </motion.span>
                <motion.span
                  variants={sublabelVariants}
                  transition={{ duration: 0.2 }}
                  className="mt-1 text-[10px] leading-none text-zinc-500"
                >
                  {service.sublabel}
                </motion.span>
              </div>

              {/* Arrow */}
              <motion.span
                variants={arrowVariants}
                transition={{ duration: 0.16 }}
                className="shrink-0 text-zinc-500"
              >
                <ArrowRight size={12} strokeWidth={1.5} />
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Type filters — inline typographic */}
      <motion.div
        className="flex items-center gap-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.82 }}
      >
        <span className="mr-3 text-[9px] uppercase tracking-[0.35em] text-zinc-700">Só</span>

        <div className="flex items-center">
          {FILTER_OPTIONS.map((filter, i) => (
            <span key={filter.id} className="flex items-center">
              {i > 0 && (
                <span className="mx-2.5 select-none text-[10px] text-zinc-800">·</span>
              )}
              <motion.button
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.93 }}
                variants={rowVariants}
                className="relative px-1 py-0.5"
                onClick={() => onSelect(filter.message, filter.id)}
              >
                {/* Hover chip background */}
                <motion.span
                  className="absolute inset-0 rounded-md bg-pink-500/10"
                  variants={chipBgVariants}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
                <motion.span
                  variants={chipLabelVariants}
                  transition={{ duration: 0.15 }}
                  className="relative text-[11px] tracking-wide"
                >
                  {filter.label}
                </motion.span>
              </motion.button>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
