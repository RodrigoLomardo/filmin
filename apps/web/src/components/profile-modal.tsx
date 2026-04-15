'use client';

import { useEffect, useRef, useState } from 'react';
import { User, LogOut, Users, UserCircle, Pencil, X, Check, Loader2, Lock, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyGroup, type GroupMember } from '@/lib/api/groups';
import {
  getProfile,
  updateProfile,
  GENERO_LABELS,
  type GeneroUsuario,
  type UpdateProfileInput,
} from '@/lib/api/profile';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GENERO_OPTIONS: { value: GeneroUsuario; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

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
        {/* green dot indicating duo is active */}
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
            {/* Header */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border)]">
              <Users size={13} className="text-pink-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-pink-400">
                Grupo Duo
              </span>
            </div>

            {/* Members */}
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

            {/* Footer: group created date */}
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
// ProfileModal
// ---------------------------------------------------------------------------

type ProfileModalProps = { open: boolean; onClose: () => void };

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  // Editing state
  const [editing, setEditing] = useState<'profile' | 'email' | 'password' | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [genero, setGenero] = useState<GeneroUsuario | ''>('');

  // Email / password form fields
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: group } = useQuery({
    queryKey: ['group'],
    queryFn: getMyGroup,
    staleTime: 1000 * 60 * 5,
    enabled: open,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 2,
    enabled: open,
  });

  // Pre-fill form when profile loads or editing starts
  useEffect(() => {
    if (editing === 'profile' && profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setGenero(profile.genero ?? '');
    }
    if (editing === 'email') setNewEmail(user?.email ?? '');
    if (editing === 'password') { setNewPassword(''); setConfirmPassword(''); }
  }, [editing, profile, user]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (editing) { setEditing(null); setSaveError(null); }
        else onClose();
      }
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, editing, onClose]);

  // Reset editing state when modal closes
  useEffect(() => {
    if (!open) { setEditing(null); setSaveError(null); }
  }, [open]);

  // ---------------------------------------------------------------------------
  // Save handlers
  // ---------------------------------------------------------------------------

  async function saveProfile() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdateProfileInput = {};
      if (firstName.trim()) payload.firstName = firstName.trim();
      if (lastName.trim()) payload.lastName = lastName.trim();
      if (genero) payload.genero = genero;

      await updateProfile(payload);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditing(null);
    } catch {
      setSaveError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function saveEmail() {
    if (!newEmail.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      setEditing(null);
      // Supabase sends a confirmation email — inform user
      setSaveError(null);
      alert('Verifique seu novo e-mail para confirmar a alteração.');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao atualizar e-mail.');
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    if (newPassword !== confirmPassword) {
      setSaveError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setSaveError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setEditing(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao atualizar senha.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyCode() {
    if (!group?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  async function handleSignOut() {
    onClose();
    await signOut();
    window.location.replace('/login');
  }

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const email = user?.email ?? '—';
  const initial = email[0]?.toUpperCase() ?? '?';
  const groupLabel = group?.tipo === 'duo' ? 'Duo' : group?.tipo === 'solo' ? 'Solo' : null;
  const displayName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
      : null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            onClick={() => { if (!editing) onClose(); }}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">

              {/* ── Header ── */}
              <div className="flex flex-col items-center gap-2 px-6 pt-7 pb-5">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-pink-500/60">
                  <span className="text-xl font-bold text-white">{initial}</span>
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500">
                    <User size={10} className="text-white" />
                  </div>
                </div>

                <div className="text-center">
                  {displayName && (
                    <p className="text-base font-semibold text-white">{displayName}</p>
                  )}
                  <p className="text-xs text-zinc-400 break-all">{email}</p>
                  {groupLabel && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-2.5 py-0.5">
                      <Users size={10} className="text-pink-400" />
                      <span className="text-xs font-medium text-pink-400">{groupLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-[var(--border)]" />

              {/* ── Body ── */}
              <div className="p-4 flex flex-col gap-1">

                {/* Error banner */}
                <AnimatePresence>
                  {saveError && (
                    <motion.p
                      className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {saveError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* ── Section: Dados do perfil ── */}
                <SectionHeader label="Dados do perfil" />

                <AnimatePresence mode="wait">
                  {editing === 'profile' ? (
                    <motion.div
                      key="edit-profile"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3 px-1 py-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Nome">
                          <input
                            className="field-input"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Nome"
                          />
                        </Field>
                        <Field label="Sobrenome">
                          <input
                            className="field-input"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Sobrenome"
                          />
                        </Field>
                      </div>

                      <Field label="Gênero">
                        <select
                          className="field-input"
                          value={genero}
                          onChange={(e) => setGenero(e.target.value as GeneroUsuario | '')}
                        >
                          <option value="">Selecionar...</option>
                          {GENERO_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </Field>

                      <EditActions
                        saving={saving}
                        onSave={saveProfile}
                        onCancel={() => { setEditing(null); setSaveError(null); }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view-profile"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {profileLoading ? (
                        <div className="flex justify-center py-3">
                          <Loader2 size={16} className="animate-spin text-zinc-500" />
                        </div>
                      ) : (
                        <InfoRow
                          label="Nome"
                          value={displayName ?? '—'}
                          onEdit={() => setEditing('profile')}
                        />
                      )}
                      <InfoRow
                        label="Gênero"
                        value={profile?.genero ? GENERO_LABELS[profile.genero] : '—'}
                        onEdit={() => setEditing('profile')}
                        hideEdit
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-px bg-[var(--border)] my-1" />

                {/* ── Section: Conta ── */}
                <SectionHeader label="Conta" />

                <AnimatePresence mode="wait">
                  {editing === 'email' ? (
                    <motion.div
                      key="edit-email"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3 px-1 py-2"
                    >
                      <Field label="Novo e-mail">
                        <input
                          type="email"
                          className="field-input"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="novo@email.com"
                          autoComplete="email"
                        />
                      </Field>
                      <EditActions
                        saving={saving}
                        onSave={saveEmail}
                        onCancel={() => { setEditing(null); setSaveError(null); }}
                      />
                    </motion.div>
                  ) : editing === 'password' ? (
                    <motion.div
                      key="edit-password"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3 px-1 py-2"
                    >
                      <Field label="Nova senha">
                        <input
                          type="password"
                          className="field-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          autoComplete="new-password"
                        />
                      </Field>
                      <Field label="Confirmar senha">
                        <input
                          type="password"
                          className="field-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </Field>
                      <EditActions
                        saving={saving}
                        onSave={savePassword}
                        onCancel={() => { setEditing(null); setSaveError(null); }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view-account"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <InfoRow
                        label="E-mail"
                        value={email}
                        onEdit={() => setEditing('email')}
                      />
                      <InfoRow
                        label="Senha"
                        value="••••••••"
                        onEdit={() => setEditing('password')}
                        icon={<Lock size={12} className="text-zinc-600" />}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-px bg-[var(--border)] my-1" />

                {/* ── Section: Grupo ── */}
                {group?.tipo === 'duo' && group.inviteCode && (
                  <>
                    <SectionHeader label="Grupo" />
                    <div className="px-1 pb-1">
                      <p className="mb-1.5 text-[10px] text-zinc-600">Código de convite</p>
                      <div className="flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 ring-1 ring-zinc-800">
                        <span className="flex-1 font-mono text-sm tracking-[0.22em] text-pink-400">
                          {group.inviteCode}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
                        >
                          {codeCopied
                            ? <Check size={12} className="text-green-400" />
                            : <Copy size={12} />}
                          {codeCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <p className="mt-1.5 text-[10px] text-zinc-700">
                        Compartilhe com sua dupla para ela entrar no grupo.
                      </p>
                    </div>
                    <div className="h-px bg-[var(--border)] my-1" />
                  </>
                )}

                {/* Sign out */}
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
      {label}
    </p>
  );
}

function InfoRow({
  label,
  value,
  onEdit,
  hideEdit,
  icon,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  hideEdit?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-600">{label}</p>
          <p className="text-sm text-zinc-300 truncate">{value}</p>
        </div>
      </div>
      {!hideEdit && (
        <button
          onClick={onEdit}
          className="ml-2 flex-shrink-0 rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-300"
          aria-label={`Editar ${label}`}
        >
          <Pencil size={13} />
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

function EditActions({
  saving,
  onSave,
  onCancel,
}: {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-50"
      >
        <X size={14} /> Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-pink-500 py-2 text-sm font-medium text-white transition hover:bg-pink-400 disabled:opacity-50"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );
}
