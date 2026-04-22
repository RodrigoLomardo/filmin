'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { queryTheo } from '@/lib/api/theo';
import type { TheoMessage, TheoTipoFilter } from '@/types/theo';

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

interface TheoChatProps {
  initialMessage?: string;
  initialTipoFilter?: TheoTipoFilter;
  onInitialMessageConsumed?: () => void;
}

export function TheoChat({
  initialMessage,
  initialTipoFilter,
  onInitialMessageConsumed,
}: TheoChatProps) {
  const [messages, setMessages] = useState<TheoMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);

  const { mutate } = useMutation({
    mutationFn: queryTheo,
    onSuccess: (res) => {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'theo',
          text: res.message,
          suggestions: res.suggestions,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    },
    onError: () => {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'theo',
          text: 'Tive um problema ao processar. Tente novamente.',
          suggestions: [],
          timestamp: new Date(),
        },
      ]);
    },
  });

  const sendMessage = useCallback(
    (text: string, tipoFilter?: TheoTipoFilter) => {
      if (!text.trim() || isThinking) return;
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'user',
          text: text.trim(),
          timestamp: new Date(),
        },
      ]);
      setIsThinking(true);
      setInput('');
      mutate({ message: text.trim(), tipoFilter });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    },
    [isThinking, mutate],
  );

  useEffect(() => {
    if (!initialMessage || initialSentRef.current) return;
    initialSentRef.current = true;
    onInitialMessageConsumed?.();
    sendMessage(initialMessage, initialTipoFilter);
  }, [initialMessage, initialTipoFilter, onInitialMessageConsumed, sendMessage]);

  function handleSuggestion(text: string) {
    sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (messages.length === 0 && !isThinking) return null;

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-3 pb-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-pink-500 text-white'
                    : 'bg-zinc-900 text-zinc-200 ring-1 ring-white/5'
                }`}
              >
                {msg.text}

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:ring-pink-500/40"
                        onClick={() => handleSuggestion(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isThinking && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-900 px-4 py-3 ring-1 ring-white/5">
                <Loader2 size={13} className="animate-spin text-pink-400" />
                <span className="text-xs text-zinc-500">Theo está pensando...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 rounded-2xl bg-zinc-900 px-3 py-2 ring-1 ring-white/5">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite aqui..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isThinking}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white transition-opacity disabled:opacity-30"
          aria-label="Enviar"
        >
          <ArrowUp size={15} />
        </button>
      </div>
    </motion.div>
  );
}
