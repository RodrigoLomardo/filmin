'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  Film,
  Tv,
  BookOpen,
  Lock,
  Globe,
  Settings,
  LogOut,
  UserCircle,
  Users,
  X,
  Trophy,
} from 'lucide-react';
import { StalkersDisplay } from '@/components/stalkers-display';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyGroup, type GroupMember } from '@/lib/api/groups';
import { getProfile, updateProfile } from '@/lib/api/profile';
import { useProfileStats } from '@/lib/hooks/use-profile-stats';
import { useAchievements } from '@/lib/hooks/use-achievements';
import { useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function memberDisplayName(member: GroupMember): string {
  const p = member.profile;
  if (!p) return '—';
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  return name || p.email || '—';
}

function memberInitial(member: GroupMember): string {
  const p = member.profile;
  if (!p) return '?';
  return (p.firstName?.[0] ?? p.email?.[0] ?? '?').toUpperCase();
}

// ---------------------------------------------------------------------------
// AnimatedCounter — interpola de 0 até target via callback (sem setState no body)
// ---------------------------------------------------------------------------

function AnimatedCounter({ target, active }: { target: number; active: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [target, active]);

  return <>{display}</>;
}

// ---------------------------------------------------------------------------
// FadeRow — entrada em stagger por seção
// ---------------------------------------------------------------------------

function FadeRow({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PrivacyToggle — switch iOS-style
// ---------------------------------------------------------------------------

function PrivacyToggle({
  active,
  onToggle,
  loading,
}: {
  active: boolean;
  onToggle: () => void;
  loading: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      disabled={loading}
      className={`relative flex h-[22px] w-9 shrink-0 items-center rounded-full transition-all duration-300 focus-visible:outline-none ${loading ? 'opacity-40' : ''}`}
      style={{ background: active ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
    >
      <motion.div
        className="absolute h-[18px] w-[18px] rounded-full bg-white"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        animate={{ x: active ? 16 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// StatColumn — coluna individual dos stats
// ---------------------------------------------------------------------------

function StatColumn({
  icon,
  value,
  label,
  active,
  delay,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  active: boolean;
  delay: number;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 py-3.5">
      <div className="mb-1.5 text-zinc-700">{icon}</div>
      <motion.span
        className="text-[22px] font-light leading-none tracking-tight text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.5 }}
      >
        <AnimatedCounter target={value} active={active} />
      </motion.span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-700">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AvatarButton — exportado para page.tsx
// ---------------------------------------------------------------------------

type AvatarButtonProps = { onClick: () => void };

export function AvatarButton({ onClick }: AvatarButtonProps) {
  const { user } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase();

  return (
    <button
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10 transition hover:ring-pink-500/60"
      aria-label="Perfil"
    >
      {initial ? (
        <span className="text-sm font-semibold text-white">{initial}</span>
      ) : (
        <UserCircle size={18} className="text-zinc-400" />
      )}
    </button>
  );
}


// ---------------------------------------------------------------------------
// ProfileModal — floating card (top-right)
// ---------------------------------------------------------------------------

type ProfileModalProps = { open: boolean; onClose: () => void };

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: group } = useQuery({
    queryKey: ['group'],
    queryFn: getMyGroup,
    staleTime: 0,
    enabled: open,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 0,
    enabled: open,
  });

  const { data: stats } = useProfileStats(profile?.id);
  const { data: achievementsData } = useAchievements();
  const unlockedCount = achievementsData?.filter((a) => a.unlocked).length ?? 0;

  const privacyMutation = useMutation({
    mutationFn: (isPrivate: boolean) => updateProfile({ isPrivate }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function handleSignOut() {
    onClose();
    await signOut();
    window.location.replace('/login');
  }

  function handleSettings() {
    onClose();
    router.push('/configuracoes');
  }

  function handleConquistas() {
    onClose();
    router.push('/conquistas');
  }

  function handleTogglePrivacy() {
    if (!profile || privacyMutation.isPending) return;
    privacyMutation.mutate(!profile.isPrivate);
  }

  const email = user?.email ?? '—';
  const initial = email[0]?.toUpperCase() ?? '?';
  const groupLabel =
    group?.tipo === 'duo' ? 'Duo' : group?.tipo === 'solo' ? 'Solo' : null;
  const displayName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
      : null;
  const isPrivate = profile?.isPrivate ?? false;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay com blur */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Modal centralizado */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl"
            style={{
              translateX: '-50%',
              translateY: '-50%',
              background: 'rgba(11, 11, 12, 0.97)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow:
                'inset 0 1px 0 rgba(255,46,166,0.13), 0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
              transformOrigin: 'center',
            }}
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >

            {/* ── Profile header ── */}
            <FadeRow delay={0.04}>
              <div className="relative flex items-center gap-3 px-4 pt-4 pb-3.5">
                {/* Botão fechar */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
                  aria-label="Fechar"
                >
                  <X size={14} />
                </button>
                {/* Avatar com borda gradiente estática */}
                <div className="relative shrink-0">
                  <div
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-full p-[1.5px]"
                    style={{ background: 'linear-gradient(135deg, #ff2ea6, #a855f7)' }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
                      <span className="text-base font-semibold text-white">{initial}</span>
                    </div>
                  </div>
                  {/* Ponto online */}
                  <div
                    className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-500"
                    style={{ boxShadow: '0 0 0 2px rgba(11,11,12,0.97)' }}
                  />
                </div>

                {/* Nome + email + badge */}
                <div className="min-w-0 flex-1">
                  {displayName ? (
                    <>
                      <p className="truncate text-sm font-semibold leading-tight text-white">
                        {displayName}
                      </p>
                      <p className="truncate text-[11px] text-zinc-600">{email}</p>
                    </>
                  ) : (
                    <p className="truncate text-sm font-medium text-zinc-300">{email}</p>
                  )}
                  {groupLabel && (
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(255,46,166,0.09)', border: '1px solid rgba(255,46,166,0.16)' }}
                    >
                      <Users size={9} className="text-pink-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-pink-500">
                        {groupLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </FadeRow>

            {/* ── Stats ── */}
            <FadeRow delay={0.1}>
              <div
                className="flex"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <StatColumn
                  icon={<Film size={12} />}
                  value={stats?.filmes ?? 0}
                  label="Filmes"
                  active={open}
                  delay={0.18}
                />
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
                <StatColumn
                  icon={<Tv size={12} />}
                  value={stats?.series ?? 0}
                  label="Séries"
                  active={open}
                  delay={0.24}
                />
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
                <StatColumn
                  icon={<BookOpen size={12} />}
                  value={stats?.livros ?? 0}
                  label="Livros"
                  active={open}
                  delay={0.30}
                />
              </div>
            </FadeRow>

            {/* ── Membros duo ── */}
            {group?.tipo === 'duo' && (
              <FadeRow delay={0.13}>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                    <Users size={11} className="text-pink-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-400">
                      Grupo Duo
                    </span>
                  </div>
                  <ul className="flex flex-col gap-0.5 px-2 pb-2">
                    {[...(group.members ?? [])]
                      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
                      .map((m, i) => {
                        const isOwner = i === 0;
                        return (
                          <li
                            key={m.id}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/[0.04]"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
                              <span className="text-xs font-semibold text-white">{memberInitial(m)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs text-zinc-200">{memberDisplayName(m)}</p>
                            </div>
                            {isOwner && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-pink-400">
                                Owner
                              </span>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                  {group.createdAt && (
                    <p className="px-4 pb-3 text-[10px] text-zinc-700">
                      Criado em <span className="text-zinc-500">{formatDate(group.createdAt)}</span>
                    </p>
                  )}
                </div>
              </FadeRow>
            )}

            {/* ── Stalkers ── */}
            <FadeRow delay={0.14}>
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[11px] text-zinc-600">Visitantes do perfil</p>
                <StalkersDisplay />
              </div>
            </FadeRow>

            {/* ── Privacidade ── */}
            <FadeRow delay={0.16}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <AnimatePresence mode="wait">
                    {isPrivate ? (
                      <motion.div
                        key="lock"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Lock size={13} className="text-pink-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="globe"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Globe size={13} className="text-zinc-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <p className="text-[12px] font-medium text-zinc-300">Perfil privado</p>
                    <motion.p
                      key={String(isPrivate)}
                      className="text-[10px] text-zinc-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isPrivate ? 'Apenas você vê' : 'Visível para todos'}
                    </motion.p>
                  </div>
                </div>
                <PrivacyToggle
                  active={isPrivate}
                  onToggle={handleTogglePrivacy}
                  loading={privacyMutation.isPending}
                />
              </div>
            </FadeRow>

            {/* ── Separador ── */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

            {/* ── Ações ── */}
            <div className="p-2">
              <FadeRow delay={0.18}>
                <button
                  onClick={handleConquistas}
                  className="group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-zinc-500 transition-colors duration-150 hover:text-zinc-200"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy size={14} className="text-zinc-700 transition-colors group-hover:text-pink-400" />
                    <span className="text-[12px] font-medium">Conquistas</span>
                  </div>
                  {unlockedCount > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold text-pink-400"
                      style={{ background: 'rgba(255,46,166,0.12)', border: '1px solid rgba(255,46,166,0.2)' }}
                    >
                      {unlockedCount}
                    </span>
                  )}
                </button>
              </FadeRow>

              <FadeRow delay={0.2}>
                <button
                  onClick={handleSettings}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-zinc-500 transition-colors duration-150 hover:text-zinc-200"
                  style={{ ':hover': { background: 'rgba(255,255,255,0.04)' } } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Settings size={14} className="text-zinc-700 transition-colors group-hover:text-zinc-400" />
                  <span className="text-[12px] font-medium">Configurações</span>
                </button>
              </FadeRow>

              <FadeRow delay={0.24}>
                <button
                  onClick={handleSignOut}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-zinc-600 transition-colors duration-150 hover:text-red-400"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} className="text-zinc-700 transition-colors group-hover:text-red-500" />
                  <span className="text-[12px] font-medium">Sair da conta</span>
                </button>
              </FadeRow>
            </div>

            {/* Espaço inferior */}
            <div className="h-1.5" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
