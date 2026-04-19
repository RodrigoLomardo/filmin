'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Copy, DoorOpen, KeyRound, Loader2, Lock, Pencil, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import { getMyGroup, joinGroupByInviteCode, leaveDuoGroup } from '@/lib/api/groups';
import { getProfile, updateProfile, GENERO_LABELS, type GeneroUsuario, type UpdateProfileInput } from '@/lib/api/profile';
import { createClient } from '@/lib/supabase/client';
import { ApiError } from '@/lib/api/client';

const GENERO_OPTIONS: { value: GeneroUsuario; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Profile section ──
  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [genero, setGenero] = useState<GeneroUsuario | ''>('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Account section ──
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);

  // ── Group section ──
  const [codeCopied, setCodeCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const { data: group } = useQuery({
    queryKey: ['group'],
    queryFn: getMyGroup,
    staleTime: 1000 * 60 * 5,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 2,
  });

  const joinMutation = useMutation({
    mutationFn: () => joinGroupByInviteCode(joinCode.trim().toUpperCase()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      router.replace('/');
    },
    onError: (err: unknown) => {
      setJoinError(translateJoinError(err));
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveDuoGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      setConfirmLeave(false);
    },
    onError: () => {
      setConfirmLeave(false);
    },
  });

  // Pre-fill profile form
  useEffect(() => {
    if (editingProfile && profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setGenero(profile.genero ?? '');
    }
  }, [editingProfile, profile]);

  useEffect(() => {
    if (editingEmail) setNewEmail(user?.email ?? '');
    if (editingPassword) { setNewPassword(''); setConfirmPassword(''); }
  }, [editingEmail, editingPassword, user]);

  // ── Handlers ──

  async function saveProfile() {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const payload: UpdateProfileInput = {};
      if (firstName.trim()) payload.firstName = firstName.trim();
      if (lastName.trim()) payload.lastName = lastName.trim();
      if (genero) payload.genero = genero;
      await updateProfile(payload);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditingProfile(false);
    } catch {
      setProfileError('Não foi possível salvar. Tente novamente.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveEmail() {
    if (!newEmail.trim()) return;
    setAccountSaving(true);
    setAccountError(null);
    setAccountSuccess(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      setEditingEmail(false);
      setAccountSuccess('Verifique seu novo e-mail para confirmar a alteração.');
    } catch (err: unknown) {
      setAccountError(err instanceof Error ? err.message : 'Erro ao atualizar e-mail.');
    } finally {
      setAccountSaving(false);
    }
  }

  async function savePassword() {
    if (newPassword !== confirmPassword) {
      setAccountError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setAccountError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setAccountSaving(true);
    setAccountError(null);
    setAccountSuccess(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setEditingPassword(false);
      setAccountSuccess('Senha atualizada com sucesso.');
    } catch (err: unknown) {
      setAccountError(err instanceof Error ? err.message : 'Erro ao atualizar senha.');
    } finally {
      setAccountSaving(false);
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

  const displayName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
      : null;

  return (
    <main className="min-h-screen bg-[var(--background)] pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-4 backdrop-blur">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold text-white">Configurações</h1>
      </div>

      <div className="mx-auto max-w-md px-4 pt-6 flex flex-col gap-6">

        {/* ── Perfil ── */}
        <Section>
          <SectionTitle label="Perfil" icon={<Pencil size={13} className="text-pink-400" />} />

          <AnimatePresence mode="wait">
            {editingProfile ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 p-4"
              >
                <AnimatePresence>
                  {profileError && (
                    <motion.p
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {profileError}
                    </motion.p>
                  )}
                </AnimatePresence>
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
                  saving={profileSaving}
                  onSave={saveProfile}
                  onCancel={() => { setEditingProfile(false); setProfileError(null); }}
                />
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {profileLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={16} className="animate-spin text-zinc-500" />
                  </div>
                ) : (
                  <>
                    <InfoRow label="Nome" value={displayName ?? '—'} onEdit={() => setEditingProfile(true)} />
                    <InfoRow
                      label="Gênero"
                      value={profile?.genero ? GENERO_LABELS[profile.genero] : '—'}
                      onEdit={() => setEditingProfile(true)}
                      hideEdit
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── Conta ── */}
        <Section>
          <SectionTitle label="Conta" icon={<Lock size={13} className="text-pink-400" />} />

          <AnimatePresence>
            {accountError && (
              <motion.p
                className="mx-4 mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {accountError}
              </motion.p>
            )}
            {accountSuccess && (
              <motion.p
                className="mx-4 mb-2 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {accountSuccess}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {editingEmail ? (
              <motion.div
                key="edit-email"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 p-4"
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
                  saving={accountSaving}
                  onSave={saveEmail}
                  onCancel={() => { setEditingEmail(false); setAccountError(null); }}
                />
              </motion.div>
            ) : editingPassword ? (
              <motion.div
                key="edit-password"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 p-4"
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
                  saving={accountSaving}
                  onSave={savePassword}
                  onCancel={() => { setEditingPassword(false); setAccountError(null); }}
                />
              </motion.div>
            ) : (
              <motion.div key="view-account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InfoRow label="E-mail" value={user?.email ?? '—'} onEdit={() => setEditingEmail(true)} />
                <InfoRow
                  label="Senha"
                  value="••••••••"
                  onEdit={() => setEditingPassword(true)}
                  icon={<Lock size={12} className="text-zinc-600" />}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── Grupo ── */}
        <Section>
          <SectionTitle label="Grupo" icon={<Users size={13} className="text-pink-400" />} />

          {group?.tipo === 'duo' ? (
            // ── Usuário em Duo ──
            <div className="flex flex-col gap-1 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-2.5 py-1 text-xs font-medium text-pink-400">
                  <Users size={10} /> Duo ativo
                </span>
              </div>

              {group.inviteCode && (
                <div className="mb-3">
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
              )}

              <AnimatePresence mode="wait">
                {confirmLeave ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-xl bg-red-500/8 px-3 py-3 ring-1 ring-red-500/20"
                  >
                    <p className="mb-2 text-xs text-red-300 leading-snug">
                      Tem certeza? Os itens do duo serão copiados para sua galeria solo. Essa ação não pode ser desfeita.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmLeave(false)}
                        disabled={leaveMutation.isPending}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-700 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-600 disabled:opacity-50"
                      >
                        <X size={11} /> Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => leaveMutation.mutate()}
                        disabled={leaveMutation.isPending}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-500/80 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                      >
                        {leaveMutation.isPending
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Check size={11} />}
                        {leaveMutation.isPending ? 'Saindo...' : 'Confirmar'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="leave-btn"
                    type="button"
                    onClick={() => setConfirmLeave(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-red-500/8 hover:text-red-400"
                  >
                    <DoorOpen size={15} />
                    Sair do grupo duo
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // ── Usuário Solo — entrar em Duo ──
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
                  Solo
                </span>
                <span className="text-xs text-zinc-600">Sua galeria pessoal</span>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-[var(--border)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound size={14} className="text-pink-400" />
                  <p className="text-sm font-medium text-white">Entrar em um Duo</p>
                </div>
                <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                  Insira o código do grupo da outra pessoa. Sua galeria solo é preservada.
                </p>

                <AnimatePresence>
                  {joinError && (
                    <motion.p
                      className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {joinError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!joinCode.trim() || joinMutation.isPending) return;
                    setJoinError(null);
                    joinMutation.mutate();
                  }}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    maxLength={20}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="w-full rounded-xl bg-zinc-950 px-4 py-3 font-mono text-base tracking-[0.22em] text-pink-400 outline-none ring-1 ring-zinc-800 transition placeholder:text-zinc-700 focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="submit"
                    disabled={!joinCode.trim() || joinMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-500 py-2.5 text-sm font-medium text-white transition hover:bg-pink-400 disabled:opacity-50"
                  >
                    {joinMutation.isPending
                      ? <><Loader2 size={14} className="animate-spin" /> Entrando...</>
                      : <><Users size={14} /> Entrar no grupo</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </Section>

      </div>
    </main>
  );
}

// ── Sub-components ──

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {children}
    </div>
  );
}

function SectionTitle({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border)]">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-widest text-pink-400">{label}</span>
    </div>
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
    <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition">
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

function EditActions({ saving, onSave, onCancel }: { saving: boolean; onSave: () => void; onCancel: () => void }) {
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

function translateJoinError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'Código inválido ou não encontrado.';
    if (err.status === 400) return 'Este código não é válido.';
    if (err.status === 409) {
      if (err.message.includes('completo')) return 'Este grupo já está completo.';
      if (err.message.includes('duo')) return 'Você já pertence a um grupo duo.';
    }
  }
  return 'Não foi possível entrar no grupo. Tente novamente.';
}
