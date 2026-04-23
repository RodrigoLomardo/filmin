'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MessageSquare, FileText, X, Square } from 'lucide-react';
import { transcribeAudio } from '@/lib/api/theo';

interface Props {
  onOpenVoiceChat: () => void;
  onTranscribe: (text: string) => void;
  disabled?: boolean;
}

function pickMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ];
  return candidates.find((t) => {
    try { return MediaRecorder.isTypeSupported(t); } catch { return false; }
  }) ?? '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function TheoVoiceFab({ onOpenVoiceChat, onTranscribe, disabled }: Props) {
  const [isOpen, setIsOpen]               = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const containerRef  = useRef<HTMLDivElement>(null);
  const recorderRef   = useRef<MediaRecorder | null>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const chunksRef     = useRef<Blob[]>([]);

  // Close popup on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAndClean();
  }, []);

  function stopAndClean() {
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    chunksRef.current = [];
  }

  async function handleTranscribe() {
    setIsOpen(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime = pickMimeType();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorderRef.current = recorder;
      recorder.start(100);
      setIsTranscribing(true);
    } catch {
      setIsTranscribing(false);
    }
  }

  async function handleStopTranscribe() {
    const recorder = recorderRef.current;
    if (!recorder) return;

    setIsTranscribing(false);

    // Collect final chunk
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      try { recorder.stop(); } catch { resolve(); }
    });

    const mime = recorderRef.current?.mimeType || chunksRef.current[0]?.type || 'audio/webm';
    const chunks = chunksRef.current;
    stopAndClean();

    if (chunks.length === 0) return;

    try {
      const blob   = new Blob(chunks, { type: mime });
      const base64 = await blobToBase64(blob);
      const { transcript } = await transcribeAudio(base64, mime);
      if (transcript.trim()) onTranscribe(transcript.trim());
    } catch {
      // silently fail — no disruption to user
    }
  }

  function handleCancelTranscribe() {
    stopAndClean();
    setIsTranscribing(false);
  }

  function handleOpenVoiceChat() {
    setIsOpen(false);
    onOpenVoiceChat();
  }

  const isDisabled = disabled || isTranscribing;

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-[calc(100%+10px)] right-0 z-20 w-52 overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 ring-white/8"
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <button
              onClick={handleOpenVoiceChat}
              className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
            >
              <MessageSquare
                size={13}
                className="shrink-0 text-zinc-600 transition-colors group-hover:text-pink-400"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-medium text-zinc-300">Conversar com Theo</span>
                <span className="text-[10px] text-zinc-600">modo Jarvis</span>
              </div>
            </button>

            <div className="mx-4 h-px bg-white/[0.05]" />

            <button
              onClick={handleTranscribe}
              className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
            >
              <FileText
                size={13}
                className="shrink-0 text-zinc-600 transition-colors group-hover:text-pink-400"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-medium text-zinc-300">Transcrever mensagem</span>
                <span className="text-[10px] text-zinc-600">fala → texto</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <AnimatePresence mode="wait">
        {isTranscribing ? (
          /* Recording active — show stop + cancel */
          <motion.div
            key="recording"
            className="flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
          >
            {/* Cancel */}
            <motion.button
              onClick={handleCancelTranscribe}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:text-zinc-400"
              aria-label="Cancelar"
            >
              <X size={12} />
            </motion.button>

            {/* Stop + send */}
            <motion.button
              onClick={handleStopTranscribe}
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/40"
              aria-label="Parar e transcrever"
            >
              <motion.div
                className="absolute inset-0 rounded-full border border-pink-500/50"
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Square size={10} fill="currentColor" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            onClick={() => !isDisabled && setIsOpen((v) => !v)}
            disabled={isDisabled}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
              isOpen
                ? 'bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/40'
                : 'text-zinc-600 hover:text-zinc-400 disabled:opacity-30'
            }`}
            aria-label="Opções de voz"
          >
            <Mic size={13} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
