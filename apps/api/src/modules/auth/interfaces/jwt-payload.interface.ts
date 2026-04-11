/**
 * Payload do JWT emitido pelo Supabase Auth (ES256 / ECC P-256).
 * Campos relevantes para o sistema de autenticação.
 */
export interface SupabaseJwtPayload {
  /** UUID do usuário no Supabase Auth */
  sub: string;
  email: string;
  role: string;
  aud: string;
  exp: number;
  iat: number;
  /** Metadados passados em signUp({ options: { data: {...} } }) */
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    genero?: string;
  };
}
