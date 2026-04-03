'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { joinGroupByInviteCode } from '@/lib/api/groups';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

type Props = {
  params: Promise<{ code: string }>;
};

export default function ConvitePage({ params }: Props) {
  const { code } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await joinGroupByInviteCode(code);
      router.replace('/');
    } catch (err) {
      setError(translateJoinError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-pink-500">Filmin</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Convite para o Filmin</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Você foi convidado para um grupo duo.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          {/* Invite code display */}
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
              <Users size={20} />
            </span>
            <div>
              <p className="text-sm font-medium text-white">Grupo duo</p>
              <p className="font-mono text-xs tracking-widest text-pink-400">{code}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Auth loading */}
            {authLoading && (
              <motion.p
                key="loading"
                className="text-center text-sm text-zinc-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Verificando sessão...
              </motion.p>
            )}

            {/* Not authenticated */}
            {!authLoading && !user && (
              <motion.div
                key="unauthenticated"
                className="flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-center text-sm text-zinc-400">
                  Faça login para aceitar o convite.
                </p>
                <Link href="/login">
                  <Button className="w-full gap-2">
                    <LogIn size={16} />
                    Entrar na conta
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Authenticated — ready to join */}
            {!authLoading && user && (
              <motion.div
                key="authenticated"
                className="flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={handleAccept}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Entrando...' : 'Aceitar convite'}
                </Button>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-400"
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
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}

function translateJoinError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'Convite inválido ou não encontrado.';
    if (err.status === 400) return 'Este link não é um convite válido.';
    if (err.status === 409) {
      if (err.message.includes('completo')) return 'Este grupo já está completo.';
      if (err.message.includes('pertence')) return 'Você já pertence a um grupo.';
    }
  }
  return 'Não foi possível entrar no grupo. Tente novamente.';
}
