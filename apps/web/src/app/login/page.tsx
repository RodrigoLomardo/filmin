'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { getMyGroup } from '@/lib/api/groups';
import { updateProfile } from '@/lib/api/profile';
import type { GeneroUsuario } from '@/lib/api/profile';

type Mode = 'login' | 'cadastro';

const GENERO_OPTIONS: { value: GeneroUsuario; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

// ─── Float input ───────────────────────────────────────────────────────────────

function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== '';

  return (
    <div className="relative">
      <motion.label
        animate={{
          top: floated ? '8px' : '50%',
          y: floated ? '0%' : '-50%',
          fontSize: floated ? '10px' : '14px',
          color: focused
            ? 'rgb(255 46 166)'
            : floated
              ? 'rgb(113 113 122)'
              : 'rgb(82 82 91)',
          letterSpacing: floated ? '0.12em' : '0',
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-none absolute left-4 z-10 font-medium uppercase leading-none"
      >
        {label}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={`w-full rounded-2xl bg-zinc-900/70 px-4 pb-3.5 pt-7 text-sm text-white outline-none transition-all duration-300 ${focused
            ? 'ring-2 ring-pink-500/80 shadow-[0_0_24px_rgba(255,46,166,0.1)]'
            : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
          }`}
      />
    </div>
  );
}

function AuthSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);

  const floated = true;

  return (
    <div className="relative">
      <motion.label
        animate={{
          top: floated ? '8px' : '50%',
          y: floated ? '0%' : '-50%',
          fontSize: floated ? '10px' : '14px',
          color: focused
            ? 'rgb(255 46 166)'
            : floated
              ? 'rgb(113 113 122)'
              : 'rgb(82 82 91)',
          letterSpacing: floated ? '0.12em' : '0',
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-none absolute left-4 z-10 font-medium uppercase leading-none"
      >
        {label}
      </motion.label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full rounded-2xl bg-zinc-900/70 px-4 pb-3.5 pt-7 text-sm text-white outline-none transition-all duration-300 ${focused
            ? 'ring-2 ring-pink-500/80 shadow-[0_0_24px_rgba(255,46,166,0.1)]'
            : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
          }`}
      >
        <option value="">Selecionar...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Decorative film poster cards ─────────────────────────────────────────────

function PosterCard({
  delay,
  top,
  left,
  rotate,
  scale,
  opacity,
}: {
  delay: number;
  top: string;
  left: string;
  rotate: number;
  scale: number;
  opacity: number;
}) {
  return (
    <motion.div
      className="absolute rounded-xl bg-zinc-900 ring-1 ring-white/5"
      style={{
        top,
        left,
        rotate,
        scale,
        opacity,
        width: 72,
        height: 108,
        background:
          'linear-gradient(135deg, rgb(24 24 27) 0%, rgb(18 18 20) 100%)',
      }}
      animate={{
        y: [0, -8, 4, 0],
        rotate: [rotate, rotate + 2, rotate - 1, rotate],
      }}
      transition={{
        duration: 7 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500/5 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 h-0.5 rounded-full bg-zinc-700/60" />
      <div className="absolute bottom-5.5 left-3 right-5 h-0.5 rounded-full bg-zinc-800/60" />
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        if (authError) {
          setError(translateAuthError(authError.message));
          return;
        }
        const group = await getMyGroup().catch(() => null);
        if (group) {
          sessionStorage.removeItem('splash_shown');
          sessionStorage.removeItem('splashShown');
          router.replace('/');
        } else {
          router.replace('/onboarding');
        }
      } else {
        const profileData = {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          genero: genero || undefined,
        };
        const { error: authError, session } = await signUp(
          email,
          password,
          profileData,
        );
        if (authError) {
          setError(translateAuthError(authError.message));
          return;
        }
        if (!session) {
          setInfo(
            'Cadastro realizado! Verifique seu e-mail para confirmar o acesso.',
          );
          return;
        }
        if (profileData.firstName || profileData.lastName || profileData.genero) {
          await updateProfile(profileData).catch(() => null);
        }
        const group = await getMyGroup().catch(() => null);
        if (group) {
          sessionStorage.removeItem('splash_shown');
          sessionStorage.removeItem('splashShown');
          router.replace('/');
        } else {
          router.replace('/onboarding');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setInfo(null);
  }

  const isLogin = mode === 'login';

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#050505]">
      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Film grain */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '160px',
          }}
        />
        {/* Bottom-left pink glow */}
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-pink-600/15 blur-[140px]" />
        {/* Top-right subtle glow */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rose-900/10 blur-[100px]" />
        {/* Center breathing glow */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-950/15 blur-[180px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Left decorative panel (desktop) ── */}
      <div className="relative hidden flex-col overflow-hidden border-r border-zinc-900/40 lg:flex lg:w-[46%]">
        {/* Floating poster cards */}
        <PosterCard delay={0} top="15%" left="12%" rotate={-8} scale={0.9} opacity={0.4} />
        <PosterCard delay={1.5} top="22%" left="58%" rotate={6} scale={0.75} opacity={0.25} />
        <PosterCard delay={0.8} top="55%" left="8%" rotate={4} scale={0.7} opacity={0.2} />
        <PosterCard delay={2.2} top="62%" left="62%" rotate={-5} scale={0.85} opacity={0.35} />
        <PosterCard delay={1.1} top="78%" left="32%" rotate={3} scale={0.65} opacity={0.18} />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050505]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 via-transparent to-[#050505]/50" />

        {/* Central content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
          {/* Vertical side label */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-semibold uppercase tracking-[0.55em] text-zinc-700">
            Seu cinema pessoal
          </div>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
          >
            {/* Eyebrow */}
            <motion.p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.55em] text-pink-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              ✦ bem-vindo ao ✦
            </motion.p>

            {/* Logo */}
            <motion.h1
              className="font-cormorant text-[88px] font-light italic leading-none tracking-tight text-white/90"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            >
              Filmin
            </motion.h1>

            {/* Divider */}
            <motion.div
              className="my-6 flex items-center gap-3"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-zinc-700" />
              <div className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(255,46,166,0.6)]" />
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-zinc-700" />
            </motion.div>

            {/* Description */}
            <motion.p
              className="max-w-[260px] text-sm leading-relaxed text-zinc-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.7 }}
            >
              Gerencie seu acervo de filmes e séries. Encontre o próximo título
              perfeito para assistir com quem você ama.
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom label */}
        <div className="relative z-10 pb-8 text-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.45em] text-zinc-800">
            filmes · séries · dupla
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <motion.div
          className="mb-10 flex flex-col items-center lg:hidden"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-pink-500">
            ✦ bem-vindo ao ✦
          </p>
          <h1 className="font-cormorant mt-1 text-6xl font-light italic leading-none text-white/90">
            Filmin
          </h1>
        </motion.div>

        {/* Form area */}
        <motion.div
          className="w-full max-w-[390px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
        >
          {/* Mode switcher */}
          <div className="mb-7 flex rounded-2xl bg-zinc-900/50 p-1 ring-1 ring-zinc-800/60 backdrop-blur-sm">
            {(['login', 'cadastro'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="relative flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors duration-200"
                style={{ color: mode === m ? 'white' : 'rgb(82 82 91)' }}
              >
                {mode === m && (
                  <motion.div
                    layoutId="mode-pill"
                    className="absolute inset-0 rounded-xl bg-zinc-800 shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </span>
              </button>
            ))}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + '-heading'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mb-5"
            >
              <h2 className="text-xl font-semibold text-white">
                {isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                {isLogin
                  ? 'Entre para acessar seu acervo pessoal'
                  : 'Comece a construir seu acervo de filmes e séries'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Cadastro-only fields */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  key="extra-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    duration: 0.32,
                    ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
                  }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <AuthInput
                      label="Nome"
                      value={firstName}
                      onChange={setFirstName}
                      autoComplete="given-name"
                    />
                    <AuthInput
                      label="Sobrenome"
                      value={lastName}
                      onChange={setLastName}
                      autoComplete="family-name"
                    />
                  </div>

                  <AuthSelect
                    label="Gênero"
                    value={genero}
                    onChange={(v) => setGenero(v as GeneroUsuario | '')}
                    options={GENERO_OPTIONS}
                  />

                  <div className="h-px bg-zinc-800/70" />
                </motion.div>
              )}
            </AnimatePresence>

            <AuthInput
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <AuthInput
              label="Senha"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-950/40 px-3.5 py-3 ring-1 ring-red-500/20">
                    <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    <p className="text-xs leading-relaxed text-red-400">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info message */}
            <AnimatePresence>
              {info && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2.5 rounded-xl bg-pink-950/40 px-3.5 py-3 ring-1 ring-pink-500/20">
                    <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400" />
                    <p className="text-xs leading-relaxed text-pink-300">{info}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={!loading ? { scale: 0.975 } : {}}
              className="relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#ff2ea6] py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-opacity disabled:opacity-60"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    style={{ animation: 'spin 0.7s linear infinite' }}
                  />
                ) : (
                  <motion.span
                    key={mode + '-label'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {isLogin ? 'Entrar' : 'Criar conta'}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Shimmer sweep */}
              {!loading && (
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  animate={{ backgroundPositionX: ['-200%', '300%'] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: 'easeInOut',
                  }}
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.13) 53%, transparent 68%)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}
            </motion.button>
          </form>

          {/* Mode toggle link */}
          <p className="mt-5 text-center text-xs text-zinc-600">
            {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? 'cadastro' : 'login')}
              className="font-semibold text-pink-500 transition-colors hover:text-pink-400"
            >
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'E-mail ou senha incorretos.';
  if (message.includes('Email not confirmed'))
    return 'Confirme seu e-mail antes de entrar.';
  if (message.includes('User already registered'))
    return 'Este e-mail já está cadastrado.';
  if (message.includes('Password should be at least'))
    return 'A senha deve ter pelo menos 6 caracteres.';
  return 'Algo deu errado. Tente novamente.';
}
