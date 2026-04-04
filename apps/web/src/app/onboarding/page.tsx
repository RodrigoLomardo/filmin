'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Copy, Check, Share2 } from 'lucide-react';
import { createSoloGroup, createDuoGroup, type Group } from '@/lib/api/groups';
import { Button } from '@/components/ui/button';

type Step = 'escolha' | 'convite';

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('escolha');
  const [loading, setLoading] = useState<'solo' | 'duo' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSolo() {
    if (loading) return;
    setError(null);
    setLoading('solo');
    try {
      await createSoloGroup();
      router.replace('/');
    } catch {
      setError('Não foi possível criar o grupo. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }

  async function handleDuo() {
    if (loading) return;
    setError(null);
    setLoading('duo');
    try {
      const created = await createDuoGroup();
      setGroup(created);
      setStep('convite');
    } catch {
      setError('Não foi possível criar o grupo. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }

  async function handleCopy() {
    if (!group?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteLink(group.inviteCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silently ignore
    }
  }

  function handleShare() {
    if (!group?.inviteCode) return;
    if (navigator.share) {
      navigator.share({
        title: 'Filmin — convite',
        text: 'Entre no meu Filmin e vamos rastrear filmes juntos!',
        url: inviteLink(group.inviteCode),
      }).catch(() => undefined);
    } else {
      handleCopy();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <AnimatePresence mode="wait">

        {/* ── ETAPA 1: escolha ── */}
        {step === 'escolha' && (
          <motion.div
            key="escolha"
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-500">Filmin</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Como você vai usar?</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Isso define como seu acervo é organizado.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Solo */}
              <button
                onClick={handleSolo}
                disabled={!!loading}
                className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:border-zinc-600 disabled:opacity-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 transition group-hover:bg-zinc-700">
                  <User size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Solo
                    {loading === 'solo' && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">Criando...</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Só eu. Meu acervo pessoal de filmes e séries.
                  </p>
                </div>
              </button>

              {/* Duo */}
              <button
                onClick={handleDuo}
                disabled={!!loading}
                className="group flex items-start gap-4 rounded-2xl border border-pink-500/30 bg-[var(--card)] p-5 text-left transition hover:border-pink-500/60 disabled:opacity-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 transition group-hover:bg-pink-500/20">
                  <Users size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Duo
                    {loading === 'duo' && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">Criando...</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Eu e outra pessoa. Acervo compartilhado e modo match.
                  </p>
                </div>
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── ETAPA 2: convite duo ── */}
        {step === 'convite' && group && (
          <motion.div
            key="convite"
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-500">Filmin</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Convide sua dupla</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Compartilhe o link abaixo. Quando a outra pessoa entrar, o acervo de vocês será unificado.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              {/* Invite code display */}
              <p className="mb-2 text-xs text-zinc-500">Código de convite</p>
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3">
                <span className="flex-1 font-mono text-sm tracking-widest text-pink-400">
                  {group.inviteCode}
                </span>
              </div>

              {/* Link display */}
              <p className="mb-1 text-xs text-zinc-500">Link de convite</p>
              <p className="mb-5 break-all rounded-xl bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-400">
                {inviteLink(group.inviteCode!)}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-zinc-900 py-3 text-xs font-medium text-white transition hover:bg-zinc-800"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copiado!' : 'Copiar link'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-zinc-900 py-3 text-xs font-medium text-white transition hover:bg-zinc-800"
                >
                  <Share2 size={14} />
                  Compartilhar
                </button>
              </div>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => router.replace('/')}
            >
              Começar a usar
            </Button>

            <p className="mt-3 text-center text-xs text-zinc-600">
              Você pode compartilhar o código depois nas configurações.
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}

function inviteLink(code: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/convite/${code}`;
}
