'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { getMyGroup } from '@/lib/api/groups';
import { updateProfile } from '@/lib/api/profile';
import type { GeneroUsuario } from '@/lib/api/profile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Mode = 'login' | 'cadastro';

const GENERO_OPTIONS: { value: GeneroUsuario; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>('login');

  // Campos comuns
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Campos extras do cadastro
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [genero, setGenero] = useState<GeneroUsuario | ''>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'auth_callback'
      ? 'O link de confirmação expirou ou é inválido. Tente criar a conta novamente.'
      : null,
  );
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: authError } = await signIn(email, password);
        if (authError) { setError(translateAuthError(authError.message)); return; }

        const group = await getMyGroup().catch(() => null);
        router.replace(group ? '/' : '/onboarding');
      } else {
        const profileData = {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          genero: genero || undefined,
        };

        const { error: authError, session } = await signUp(email, password, profileData);
        if (authError) { setError(translateAuthError(authError.message)); return; }

        if (!session) {
          setInfo('Cadastro realizado! Verifique seu e-mail para confirmar o acesso.');
          return;
        }

        // Sessão imediata (confirmação desativada) — salva dados do perfil
        if (profileData.firstName || profileData.lastName || profileData.genero) {
          await updateProfile(profileData).catch(() => null);
        }

        const group = await getMyGroup().catch(() => null);
        router.replace(group ? '/' : '/onboarding');
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'cadastro' : 'login'));
    setError(null);
    setInfo(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-pink-500">Filmin</p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Campos exclusivos do cadastro */}
            <AnimatePresence initial={false}>
              {mode === 'cadastro' && (
                <motion.div
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-zinc-400">Nome</label>
                      <Input
                        type="text"
                        placeholder="Ana"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-zinc-400">Sobrenome</label>
                      <Input
                        type="text"
                        placeholder="Silva"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">Gênero</label>
                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value as GeneroUsuario | '')}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500 transition"
                    >
                      <option value="">Selecionar...</option>
                      {GENERO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="h-px bg-[var(--border)]" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Info */}
            <AnimatePresence>
              {info && (
                <motion.p
                  className="rounded-lg bg-pink-500/10 px-3 py-2 text-xs text-pink-300"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {info}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>
        </div>

        {/* Toggle mode */}
        <p className="mt-4 text-center text-sm text-zinc-500">
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-pink-500 hover:text-pink-400"
          >
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </motion.div>
    </main>
  );
}

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (message.includes('User already registered')) return 'Este e-mail já está cadastrado.';
  if (message.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  return 'Algo deu errado. Tente novamente.';
}
