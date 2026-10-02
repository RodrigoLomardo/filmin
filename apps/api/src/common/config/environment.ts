/**
 * Resolução de ambiente da aplicação.
 *
 * `APP_ENV` é a fonte da verdade (`development` | `production`). `NODE_ENV` é
 * aceito como fallback para compatibilidade com o que já estava configurado.
 */

export type AppEnv = 'development' | 'production';

export function resolveAppEnv(): AppEnv {
  const raw = (process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development')
    .toLowerCase()
    .trim();
  return raw === 'production' ? 'production' : 'development';
}

export function isProduction(): boolean {
  return resolveAppEnv() === 'production';
}

/** Hosts considerados locais — não aceitam conexão SSL. */
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', 'host.docker.internal'];

function extractHost(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * O Supabase hospedado exige SSL (SNI); sem isso a conexão falha com ENOIDENTIFIER.
 * O Postgres local não fala SSL e rejeita a conexão se ela for forçada.
 *
 * Controlado explicitamente por `DATABASE_SSL`. Sem a variável, infere pelo host.
 */
export function resolveDatabaseSsl(
  url = process.env.DATABASE_URL,
): false | { rejectUnauthorized: boolean } {
  const flag = process.env.DATABASE_SSL?.toLowerCase().trim();
  if (flag === 'true') return { rejectUnauthorized: false };
  if (flag === 'false') return false;

  const host = extractHost(url);
  const isLocal =
    !host || LOCAL_HOSTS.includes(host) || host.endsWith('.local');
  return isLocal ? false : { rejectUnauthorized: false };
}

/** Remove credenciais da connection string para log seguro. */
export function maskDatabaseUrl(url = process.env.DATABASE_URL): string {
  if (!url) return '(não definida)';
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`;
  } catch {
    return '(inválida)';
  }
}

/** Indica se a connection string atual aponta para um banco local. */
export function isLocalDatabase(url = process.env.DATABASE_URL): boolean {
  const host = extractHost(url);
  return !!host && (LOCAL_HOSTS.includes(host) || host.endsWith('.local'));
}

/**
 * Guardrail para scripts destrutivos (seed, reset, truncate).
 *
 * Aborta se o ambiente não for de desenvolvimento ou se o banco não for local —
 * evita que um `.env` apontando para produção seja alvo de um reset.
 */
export function assertSafeToMutate(operation: string): void {
  const appEnv = resolveAppEnv();

  if (appEnv !== 'development') {
    throw new Error(
      `[${operation}] Bloqueado: APP_ENV=${appEnv}. Esta operação só roda em development.`,
    );
  }

  if (!isLocalDatabase()) {
    throw new Error(
      `[${operation}] Bloqueado: DATABASE_URL aponta para ${maskDatabaseUrl()}, ` +
        'que não é um banco local. Use o banco do Supabase local (127.0.0.1:54322).',
    );
  }
}
