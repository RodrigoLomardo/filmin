import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface VoteButtonProps {
  variant: 'yes' | 'no';
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function VoteButton({ variant, active, disabled, onClick }: VoteButtonProps) {
  const isYes = variant === 'yes';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
        active
          ? isYes
            ? 'border-green-400 bg-green-500 text-white'
            : 'border-red-400 bg-red-500 text-white'
          : disabled
            ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/20'
            : isYes
              ? 'border-white/20 bg-white/5 text-white/50 hover:border-green-400/50 hover:text-green-400'
              : 'border-white/20 bg-white/5 text-white/50 hover:border-red-400/50 hover:text-red-400'
      }`}
      whileTap={!disabled ? { scale: 0.85 } : {}}
      whileHover={!disabled && !active ? { scale: 1.08 } : {}}
    >
      {isYes ? <Heart size={18} /> : <X size={18} />}
    </motion.button>
  );
}
