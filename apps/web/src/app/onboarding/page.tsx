'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Copy, Check, KeyRound, ArrowLeft } from 'lucide-react';
import { createSoloGroup, createDuoGroup, joinGroupByInviteCode, type Group } from '@/lib/api/groups';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

type Step = 'escolha' | 'show-code' | 'enter-code';

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('escolha');
  const [loading, setLoading] = useState<'solo' | 'duo' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setCodeInput(code.toUpperCase());
      setStep('enter-code');
    }
  }, [searchParams]);

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
      setStep('show-code');
    } catch {
      setError('Não foi possível criar o grupo. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code || loading) return;
    setError(null);
    setLoading('join');
    try {
      await joinGroupByInviteCode(code);
      router.replace('/');
    } catch (err) {
      setError(translateJoinError(err));
    } finally {
      setLoading(null);
    }
  }

  async function handleCopyCode() {
    if (!group?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
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
                    Duo — criar grupo
                    {loading === 'duo' && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">Criando...</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Eu e outra pessoa. Acervo compartilhado e modo match.
                  </p>
                </div>
              </button>

              {/* Entrar com código */}
              <button
                onClick={() => { setStep('enter-code'); setError(null); }}
                disabled={!!loading}
                className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:border-zinc-600 disabled:opacity-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 transition group-hover:bg-zinc-700">
                  <KeyRound size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Tenho um código</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Entrar no grupo de outra pessoa com o código de convite.
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

        {/* ── ETAPA 2: mostrar código do grupo criado ── */}
        {step === 'show-code' && group && (
          <motion.div
            key="show-code"
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-500">Filmin</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Grupo criado!</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Compartilhe o código abaixo com sua dupla. Ela deve entrar no app e digitar o código no onboarding.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="mb-2 text-xs text-zinc-500">Código do grupo</p>
              <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-4 py-4">
                <span className="flex-1 font-mono text-xl tracking-[0.3em] text-pink-400">
                  {group.inviteCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
                >
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-600">
                Você pode ver este código a qualquer momento no seu perfil.
              </p>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => router.replace('/')}
            >
              Começar a usar
            </Button>
          </motion.div>
        )}

        {/* ── ETAPA 3: entrar com código ── */}
        {step === 'enter-code' && (
          <motion.div
            key="enter-code"
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-500">Filmin</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Entrar em um grupo</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Digite o código compartilhado pela outra pessoa.
              </p>
            </div>

            <form onSubmit={handleJoin} className="flex flex-col gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <label className="mb-2 block text-xs text-zinc-500">Código de convite</label>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  maxLength={20}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-mono text-lg tracking-[0.25em] text-pink-400 outline-none ring-1 ring-zinc-800 transition placeholder:text-zinc-700 focus:ring-2 focus:ring-pink-500"
                />

                <AnimatePresence>
                  {error && (
                    <motion.p
                      className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="submit"
                disabled={!codeInput.trim() || loading === 'join'}
                className="w-full"
              >
                {loading === 'join' ? 'Entrando...' : 'Entrar no grupo'}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => { setStep('escolha'); setError(null); setCodeInput(''); }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm text-zinc-600 transition hover:text-zinc-400"
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}

function translateJoinError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'Código inválido ou não encontrado.';
    if (err.status === 400) return 'Este código não é válido.';
    if (err.status === 409) {
      if (err.message.includes('completo')) return 'Este grupo já está completo.';
      if (err.message.includes('pertence')) return 'Você já pertence a um grupo.';
    }
  }
  return 'Não foi possível entrar no grupo. Tente novamente.';
}
