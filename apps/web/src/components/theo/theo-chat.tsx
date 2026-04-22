'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { queryTheo } from '@/lib/api/theo';
import { TheoIntro } from './theo-intro';
import { TheoServices } from './theo-services';
import type { TheoMessage, TheoTipoFilter } from '@/types/theo';

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

interface TheoChatProps {
  userName?: string;
}

export function TheoChat({ userName }: TheoChatProps) {
  const [messages, setMessages] = useState<TheoMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0 || isThinking;

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
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      mutate({ message: text.trim(), tipoFilter });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    },
    [isThinking, mutate],
  );

  useEffect(() => {
    if (hasMessages) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [hasMessages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }

  function handleReset() {
    setMessages([]);
    setIsThinking(false);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages / Empty state */}
      <div className="flex-1 overflow-y-auto px-4">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <TheoIntro userName={userName} />
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              className="flex flex-col gap-3 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {msg.role === 'theo' && (
                    <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/15 ring-1 ring-pink-500/25">
                      <span className="font-cormorant text-xs italic text-pink-300">T</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-br-sm bg-pink-500 px-4 py-2.5 text-white'
                        : 'rounded-2xl rounded-bl-sm bg-zinc-900 px-4 py-2.5 text-zinc-100 ring-1 ring-white/5'
                    }`}
                  >
                    {msg.text}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s) => (
                          <button
                            key={s}
                            className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:ring-pink-500/40"
                            onClick={() => sendMessage(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    className="flex items-end gap-2 justify-start"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/15 ring-1 ring-pink-500/25">
                      <span className="font-cormorant text-xs italic text-pink-300">T</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-zinc-900 px-4 py-3.5 ring-1 ring-white/5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-pink-400"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.18,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: services chips + input */}
      <div className="shrink-0 px-4 pb-28 pt-2">
        <AnimatePresence>
          {!hasMessages && (
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, delay: 0.5 }}
            >
              <TheoServices onSelect={sendMessage} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="flex items-end gap-2 rounded-2xl bg-zinc-900/80 px-3.5 py-2.5 ring-1 ring-white/8 backdrop-blur-sm transition-all duration-200 focus-within:ring-pink-500/25">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={hasMessages ? 'Continue a conversa…' : 'Ou pergunte livremente…'}
            rows={1}
            className="max-h-[120px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-white placeholder-zinc-600 outline-none"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <AnimatePresence>
              {hasMessages && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleReset}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition-colors hover:text-zinc-400"
                  aria-label="Recomeçar"
                >
                  <RotateCcw size={13} />
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isThinking}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-white transition-all hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Enviar"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
