'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, PhoneOff } from 'lucide-react';
import { TheoVoiceOrb } from './theo-voice-orb';
import type { VoiceState } from './theo-voice-orb';
import { queryTheo, transcribeAudio } from '@/lib/api/theo';

// ── Tuning constants ────────────────────────────────────────────────────────

const SPEECH_THRESHOLD    = 0.025; // RMS: above = voice detected (time-domain)
const INTERRUPT_THRESHOLD = 0.06;  // RMS: above = interrupt Theo during TTS
const SILENCE_DURATION    = 1100;  // ms of silence → auto-send
const MIN_SPEECH_MS       = 250;   // ignore bursts shorter than this
const POST_SPEECH_DELAY   = 350;   // ms wait after Theo speaks before listening

// ── Sanitize text for TTS ────────────────────────────────────────────────────

function sanitizeForSpeech(raw: string): string {
  return raw
    // Remove markdown tables entirely
    .replace(/\|[^\n]*\|/g, '')
    // Remove table separators (|---|---|)
    .replace(/\|[-: ]+\|[-| :]*\n?/g, '')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic (**x**, *x*, __x__, _x_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove bullet/list markers at start of line
    .replace(/^[\s]*[-*•]\s+/gm, '')
    // Remove numbered list markers
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove parenthetical labels like (Acervo), (do seu acervo), (Externa)
    .replace(/\(do seu acervo\)/gi, '')
    .replace(/\((acervo|externa)\)/gi, '')
    // Remove column name artifacts just in case
    .replace(/\b(Título|Origem|Sobre|Acervo|Externa)\b\s*[|:]/gi, '')
    // Replace em dash / en dash with comma + space for natural pause
    .replace(/\s*[—–]\s*/g, ', ')
    // Collapse multiple spaces and blank lines
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const GREETINGS = [
  'E aí, o que você tá afim de assistir hoje?',
  'Oi! Me fala o que você quer ver.',
  'Tô ouvindo. O que tá na sua cabeça?',
  'Pronto. Me conta o que você quer assistir.',
];

const STATUS_LABELS: Record<VoiceState, string> = {
  idle     : 'pronto',
  waiting  : 'ouvindo',
  listening: 'escutando',
  thinking : 'processando',
  speaking : 'falando',
};

function generateSessionId() {
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror   = reject;
    reader.readAsDataURL(blob);
  });
}

function pickMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ];
  return (
    candidates.find((t) => {
      try { return MediaRecorder.isTypeSupported(t); } catch { return false; }
    }) ?? ''
  );
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const maleNames = /daniel|lucas|paulo|antônio|antonio|eddy|marco|bruno|male|masculin/i;
  return (
    voices.find((v) => v.lang === 'pt-BR' && maleNames.test(v.name)) ??
    voices.find((v) => v.lang === 'pt-BR' && v.localService) ??
    voices.find((v) => v.lang === 'pt-BR') ??
    voices.find((v) => v.lang.startsWith('pt') && maleNames.test(v.name)) ??
    voices.find((v) => v.lang.startsWith('pt')) ??
    voices.find((v) => v.lang === 'en-US' && /david|daniel|mark|james|alex/i.test(v.name)) ??
    null
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TheoVoiceChat({ isOpen, onClose }: Props) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isStarted,  setIsStarted]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── All mutable state lives in refs to avoid stale-closure bugs ────────────
  const voiceStateRef    = useRef<VoiceState>('idle');
  const activeRef        = useRef(false);
  const isSpeakingRef    = useRef(false);
  const isRecordingRef   = useRef(false);
  const sessionIdRef     = useRef(generateSessionId());
  const mimeTypeRef      = useRef('');

  const streamRef        = useRef<MediaStream | null>(null);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const levelRafRef      = useRef<number>(0);

  const recorderRef      = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const hasSpeechRef     = useRef(false);
  const speechStartRef   = useRef(0);
  const silenceStartRef  = useRef<number | null>(null);

  const voicesRef        = useRef<SpeechSynthesisVoice[]>([]);
  const listenTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── State sync helper ──────────────────────────────────────────────────────

  function setVS(s: VoiceState) {
    voiceStateRef.current = s;
    setVoiceState(s);
  }

  // ── Load TTS voices (Chrome fills them async) ──────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    const load = () => { voicesRef.current = synth.getVoices(); };
    load();
    synth.onvoiceschanged = load;
    return () => { synth.onvoiceschanged = null; };
  }, []);

  // ── Reset on close ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      shutdown();
      setVS('idle');
      setAudioLevel(0);
      setIsStarted(false);
      setError(null);
      sessionIdRef.current = generateSessionId();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Teardown ───────────────────────────────────────────────────────────────

  function shutdown() {
    activeRef.current = false;
    if (listenTimerRef.current) { clearTimeout(listenTimerRef.current); listenTimerRef.current = null; }
    stopRecorderNow();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    cancelAnimationFrame(levelRafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => { /* ignore */ });
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  // ── Recording helpers ──────────────────────────────────────────────────────

  function stopRecorderNow() {
    const rec = recorderRef.current;
    if (!rec) return;
    try { if (rec.state !== 'inactive') rec.stop(); } catch { /* ignore */ }
    recorderRef.current  = null;
    isRecordingRef.current = false;
  }

  function startListeningLoop() {
    if (!activeRef.current || isSpeakingRef.current) return;

    const stream = streamRef.current;
    if (!stream) return;

    // Reset VAD state for this round
    chunksRef.current     = [];
    hasSpeechRef.current  = false;
    silenceStartRef.current = null;
    speechStartRef.current  = 0;

    const mime = mimeTypeRef.current;
    let recorder: MediaRecorder;
    try {
      recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    // No timeslice — full audio delivered in one chunk on stop → valid webm container
    recorder.start();
    recorderRef.current   = recorder;
    isRecordingRef.current = true;
    setVS('waiting');              // mic hot, waiting for speech
  }

  // ── Level monitor + Voice Activity Detection ───────────────────────────────

  function startLevelMonitor() {
    const analyserNode = analyserRef.current;
    if (!analyserNode) return;
    const analyser: AnalyserNode = analyserNode;
    // Time-domain buffer — RMS is far more reliable than frequency average
    const data = new Uint8Array(analyser.fftSize);

    function rms(): number {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const x = (data[i] - 128) / 128;
        sum += x * x;
      }
      return Math.sqrt(sum / data.length);
    }

    function tick() {
      if (!activeRef.current) return;

      const level = rms();
      setAudioLevel(Math.min(1, level * 6)); // scale for orb visualization

      // ── Interrupt Theo when user speaks ──────────────────────
      if (isSpeakingRef.current && level > INTERRUPT_THRESHOLD) {
        window.speechSynthesis?.cancel();
        isSpeakingRef.current = false;
        if (listenTimerRef.current) {
          clearTimeout(listenTimerRef.current);
          listenTimerRef.current = null;
        }
        setTimeout(() => { if (activeRef.current) startListeningLoop(); }, 150);
        levelRafRef.current = requestAnimationFrame(tick);
        return;
      }

      // ── VAD (only when recorder active and Theo is silent) ───
      if (isRecordingRef.current && !isSpeakingRef.current) {
        const now = Date.now();

        if (level > SPEECH_THRESHOLD) {
          if (!hasSpeechRef.current) {
            hasSpeechRef.current   = true;
            speechStartRef.current = now;
            if (voiceStateRef.current === 'waiting') setVS('listening');
          }
          silenceStartRef.current = null;

        } else if (hasSpeechRef.current) {
          if (silenceStartRef.current === null) {
            silenceStartRef.current = now;
          } else if (
            now - silenceStartRef.current > SILENCE_DURATION &&
            now - speechStartRef.current   > MIN_SPEECH_MS
          ) {
            // Enough silence → flush recorder then process
            silenceStartRef.current = null;
            hasSpeechRef.current    = false;
            isRecordingRef.current  = false;

            const rec = recorderRef.current;
            recorderRef.current = null;
            if (rec && rec.state !== 'inactive') {
              // onstop fires AFTER the final ondataavailable — guarantees full chunks
              rec.onstop = () => void processAudio();
              try { rec.stop(); } catch { void processAudio(); }
            } else {
              void processAudio();
            }
          }
        }
      }

      levelRafRef.current = requestAnimationFrame(tick);
    }

    levelRafRef.current = requestAnimationFrame(tick);
  }

  // ── Process recorded audio ─────────────────────────────────────────────────

  async function processAudio() {
    if (!activeRef.current) return;
    setVS('thinking');

    const chunks = [...chunksRef.current];
    chunksRef.current = [];

    if (chunks.length === 0) {
      startListeningLoop();
      return;
    }

    try {
      const mime = mimeTypeRef.current || 'audio/webm';
      const blob = new Blob(chunks, { type: mime });

      // Skip audio that's too small to be a valid media file (< 3 KB)
      if (blob.size < 3000) {
        startListeningLoop();
        return;
      }

      const base64 = await blobToBase64(blob);

      const { transcript } = await transcribeAudio(base64, mime);

      if (!activeRef.current) return;

      if (!transcript.trim()) {
        startListeningLoop();
        return;
      }

      const res = await queryTheo({
        message  : transcript.trim(),
        sessionId: sessionIdRef.current,
        voiceMode: true,
      });

      if (!activeRef.current) return;
      theoSpeak(res.message);

    } catch {
      if (!activeRef.current) return;
      theoSpeak('Tive um probleminha técnico. Pode repetir?');
    }
  }

  // ── TTS ────────────────────────────────────────────────────────────────────

  function theoSpeak(rawText: string) {
    if (!activeRef.current || typeof window === 'undefined') return;

    const text = sanitizeForSpeech(rawText);

    // Stop recording while Theo speaks (prevents echo capture)
    stopRecorderNow();
    isSpeakingRef.current = true;
    setVS('speaking');

    const synth = window.speechSynthesis;
    synth.cancel();

    const utt    = new SpeechSynthesisUtterance(text);
    utt.lang     = 'pt-BR';
    utt.pitch    = 0.88;  // slightly lower = more natural, less robotic
    utt.rate     = 1.08;  // slightly slower = clearer, more human pacing
    utt.volume   = 1.0;

    const voice = pickVoice(voicesRef.current);
    if (voice) utt.voice = voice;

    let settled = false;

    // Fallback timeout — Brave blocks speechSynthesis.onend
    // Estimate: ~11 chars/s at rate 1.08, plus 2s buffer
    const estimatedMs = Math.max(2500, (text.length / 11) * 1000) + 2000;
    const fallbackTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try { synth.cancel(); } catch { /* ignore */ }
        resume();
      }
    }, estimatedMs);

    function resume() {
      clearTimeout(fallbackTimer);
      isSpeakingRef.current = false;
      if (!activeRef.current) return;
      listenTimerRef.current = setTimeout(() => {
        if (activeRef.current) startListeningLoop();
      }, POST_SPEECH_DELAY);
    }

    utt.onend = () => {
      if (!settled) { settled = true; resume(); }
    };
    utt.onerror = () => {
      if (!settled) { settled = true; resume(); }
    };

    synth.speak(utt);
  }

  // ── Orb tap: only interrupts Theo ─────────────────────────────────────────

  function handleOrbTap() {
    if (voiceStateRef.current !== 'speaking') return;
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    if (listenTimerRef.current) { clearTimeout(listenTimerRef.current); listenTimerRef.current = null; }
    setTimeout(() => { if (activeRef.current) startListeningLoop(); }, 200);
  }

  // ── Session start ──────────────────────────────────────────────────────────

  async function handleStart() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current  = stream;
      mimeTypeRef.current = pickMimeType();

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;              // more samples → better RMS resolution
      analyser.smoothingTimeConstant = 0.4; // fast response
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      activeRef.current = true;
      setIsStarted(true);
      startLevelMonitor();

      // Theo greets, then listening loop starts automatically
      theoSpeak(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);

    } catch {
      setError('Não foi possível acessar o microfone.');
    }
  }

  function handleEnd() {
    shutdown();
    onClose();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-[#050505]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Header */}
      <div className="z-10 flex w-full items-center justify-between px-6 pt-12">
        <span className="text-[9px] uppercase tracking-[0.45em] text-zinc-700">
          conversa de voz
        </span>
        <div className="flex items-center gap-2">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-pink-500"
            animate={voiceState === 'idle' ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="font-cormorant text-xl font-light italic text-white/50">Theo</span>
        </div>
      </div>

      {/* Orb — tappable only to interrupt Theo */}
      <div className="z-10 flex flex-col items-center gap-6">
        <motion.button
          onClick={handleOrbTap}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          whileTap={voiceState === 'speaking' ? { scale: 0.96 } : undefined}
          className="select-none outline-none"
          aria-label={voiceState === 'speaking' ? 'Toque para interromper' : undefined}
        >
          <TheoVoiceOrb state={voiceState} audioLevel={audioLevel} />
        </motion.button>

        {/* Status */}
        <AnimatePresence mode="wait">
          <motion.p
            key={voiceState}
            className="text-[10px] uppercase tracking-[0.4em] text-zinc-600"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
          >
            {STATUS_LABELS[voiceState]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="z-10 flex flex-col items-center gap-4 pb-16">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.button
              key="start"
              onClick={handleStart}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.3 }}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-white/10 transition-all duration-300 group-hover:ring-pink-500/35">
                <motion.div
                  className="absolute inset-0 rounded-full bg-pink-500/10"
                  animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Mic size={22} className="relative text-zinc-500 transition-colors group-hover:text-pink-400" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-700">
                toque para começar
              </span>
            </motion.button>
          ) : (
            <motion.button
              key="end"
              onClick={handleEnd}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.25 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 ring-1 ring-white/10 transition-all duration-200 hover:bg-red-500/15 hover:text-red-400 hover:ring-red-500/30"
              aria-label="Encerrar conversa"
            >
              <PhoneOff size={19} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
