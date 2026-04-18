import { useGroup } from './use-group';

/** Atalho para obter apenas o tipo do grupo. Use useGroup() para mais dados. */
export function useGroupTipo() {
  const { tipo } = useGroup();
  return tipo;
}
