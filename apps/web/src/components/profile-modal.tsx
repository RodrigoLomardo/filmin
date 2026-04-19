'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings, User, UserCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getMyGroup, type GroupMember } from '@/lib/api/groups';
import { getProfile } from '@/lib/api/profile';
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
// AvatarButton — exported for use in page.tsx
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
// GroupMembersButton — exported for use in page.tsx (duo only)
// ---------------------------------------------------------------------------

export function GroupMembersButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: group } = useQuery({
    queryKey: ['group'],
    queryFn: getMyGroup,
    staleTime: 1000 * 60 * 5,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Only render for duo groups
  if (group?.tipo !== 'duo') return null;

  const members = [...(group.members ?? [])].sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
  );
  const ownerProfileId = members[0]?.profileId;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10 transition hover:ring-pink-500/60"
        aria-label="Membros do grupo"
      >
        <Users size={16} className="text-zinc-300" />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl shadow-black/40"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border)]">
              <Users size={13} className="text-pink-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-pink-400">
                Grupo Duo
              </span>
            </div>

            <ul className="flex flex-col gap-0.5 p-2">
              {members.map((m) => {
                const isOwner = m.profileId === ownerProfileId;
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
                      <span className="text-xs font-semibold text-white">{memberInitial(m)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{memberDisplayName(m)}</p>
                      {isOwner && (
                        <p className="text-[10px] font-medium text-pink-400">Owner</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {group.createdAt && (
              <div className="px-4 py-3 border-t border-[var(--border)]">
                <p className="text-[10px] text-zinc-600">
                  Grupo criado em{' '}
                  <span className="text-zinc-400">{formatDate(group.createdAt)}</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileModal — lean version
// ---------------------------------------------------------------------------

type ProfileModalProps = { open: boolean; onClose: () => void };

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const { data: group } = useQuery({
    queryKey: ['group'],
    queryFn: getMyGroup,
    staleTime: 1000 * 60 * 5,
    enabled: open,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 2,
    enabled: open,
  });

  // Close on Escape
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

  const email = user?.email ?? '—';
  const initial = email[0]?.toUpperCase() ?? '?';
  const groupLabel = group?.tipo === 'duo' ? 'Duo' : group?.tipo === 'solo' ? 'Solo' : null;
  const displayName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
      : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">

              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-pink-500/40">
                  <span className="text-base font-bold text-white">{initial}</span>
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500">
                    <User size={8} className="text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  {displayName && (
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  )}
                  <p className="text-xs text-zinc-400 truncate">{email}</p>
                  {groupLabel && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2 py-0.5">
                      <Users size={9} className="text-pink-400" />
                      <span className="text-[10px] font-medium text-pink-400">{groupLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-[var(--border)]" />

              {/* Actions */}
              <div className="p-2 flex flex-col gap-0.5">
                <button
                  onClick={handleSettings}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Settings size={15} className="text-zinc-500" />
                  Configurações
                </button>

                <div className="h-px bg-[var(--border)] my-1 mx-2" />

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut size={15} />
                  Sair da conta
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
