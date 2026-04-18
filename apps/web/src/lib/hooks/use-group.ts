import { useQuery } from '@tanstack/react-query';
import { getMyGroup, type Group } from '@/lib/api/groups';

/**
 * Retorna dados completos do grupo do usuário.
 * - tipo: 'solo' | 'duo' | null
 * - soloGroupId: ID do grupo solo pessoal (sempre disponível após onboarding)
 * - isDuo: atalho para tipo === 'duo'
 * - hasSoloGallery: duo users com galeria solo ativa
 */
export function useGroup(): {
  group: Group | null;
  tipo: 'solo' | 'duo' | null;
  soloGroupId: string | null;
  isDuo: boolean;
  hasSoloGallery: boolean;
  isLoading: boolean;
} {
  const { data: group, isLoading } = useQuery({
    queryKey: ['group'],
    queryFn: getMyGroup,
    staleTime: 1000 * 60 * 5,
  });

  const tipo = group?.tipo ?? null;
  const soloGroupId = group?.soloGroupId ?? null;
  const isDuo = tipo === 'duo';
  const hasSoloGallery = isDuo && soloGroupId !== null;

  return { group: group ?? null, tipo, soloGroupId, isDuo, hasSoloGallery, isLoading };
}
