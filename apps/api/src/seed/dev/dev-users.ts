/**
 * Criação dos usuários de teste no Supabase Auth local.
 *
 * Usa a Admin API via `fetch` nativo (Node 18+) para não introduzir dependência
 * nova no backend. Requer `SUPABASE_SERVICE_ROLE_KEY` — por isso só roda em dev.
 */

import { GeneroUsuario } from '../../common/enums/genero-usuario.enum';

export interface DevUserSpec {
  /** Chave interna usada pelo seed para referenciar o usuário. */
  key: string;
  email: string;
  firstName: string;
  lastName: string;
  genero: GeneroUsuario;
  isPrivate?: boolean;
}

export interface DevUser extends DevUserSpec {
  supabaseUserId: string;
}

/** Senha única para todos os usuários de teste — ambiente local, sem dados reais. */
export const DEV_PASSWORD = 'filmin123';

export const DEV_USERS: DevUserSpec[] = [
  {
    key: 'pai',
    email: 'dev.pai@filmin.local',
    firstName: 'Rodrigo',
    lastName: 'Dev',
    genero: GeneroUsuario.MASCULINO,
  },
  {
    key: 'mae',
    email: 'dev.mae@filmin.local',
    firstName: 'Giulia',
    lastName: 'Dev',
    genero: GeneroUsuario.FEMININO,
  },
  {
    key: 'solo',
    email: 'dev.solo@filmin.local',
    firstName: 'Solo',
    lastName: 'Teste',
    genero: GeneroUsuario.OUTRO,
  },
  {
    key: 'privado',
    email: 'dev.privado@filmin.local',
    firstName: 'Perfil',
    lastName: 'Privado',
    genero: GeneroUsuario.FEMININO,
    isPrivate: true,
  },
  {
    key: 'novato',
    email: 'dev.novato@filmin.local',
    firstName: 'Sem',
    lastName: 'Grupo',
    genero: GeneroUsuario.MASCULINO,
  },
  {
    key: 'convite',
    email: 'dev.convite@filmin.local',
    firstName: 'Duo',
    lastName: 'Aberto',
    genero: GeneroUsuario.MASCULINO,
  },
];

function adminHeaders(serviceRoleKey: string): Record<string, string> {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
}

async function listExistingUsers(
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<Map<string, string>> {
  const byEmail = new Map<string, string>();

  // A Admin API pagina em 50 por padrão; o ambiente de dev tem poucos usuários,
  // mas paginamos para o script continuar correto se o volume crescer.
  for (let page = 1; page <= 20; page++) {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=200`,
      { headers: adminHeaders(serviceRoleKey) },
    );

    if (!response.ok) {
      throw new Error(
        `Falha ao listar usuários do Auth (${response.status}): ${await response.text()}`,
      );
    }

    const body = (await response.json()) as {
      users: { id: string; email?: string }[];
    };

    if (!body.users?.length) break;

    for (const user of body.users) {
      if (user.email) byEmail.set(user.email.toLowerCase(), user.id);
    }

    if (body.users.length < 200) break;
  }

  return byEmail;
}

async function createUser(
  supabaseUrl: string,
  serviceRoleKey: string,
  spec: DevUserSpec,
): Promise<string> {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders(serviceRoleKey),
    body: JSON.stringify({
      email: spec.email,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: spec.firstName,
        last_name: spec.lastName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao criar usuário ${spec.email} (${response.status}): ${await response.text()}`,
    );
  }

  const body = (await response.json()) as { id: string };
  return body.id;
}

/**
 * Garante que todos os usuários de teste existam no Auth local.
 * Idempotente: reaproveita usuários já criados em execuções anteriores.
 */
export async function ensureDevAuthUsers(): Promise<DevUser[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para semear usuários de teste.',
    );
  }

  const existing = await listExistingUsers(supabaseUrl, serviceRoleKey);
  const users: DevUser[] = [];

  for (const spec of DEV_USERS) {
    const email = spec.email.toLowerCase();
    let id = existing.get(email);

    if (id) {
      console.log(`  • ${spec.email} — já existia no Auth`);
    } else {
      id = await createUser(supabaseUrl, serviceRoleKey, spec);
      console.log(`  • ${spec.email} — criado no Auth`);
    }

    users.push({ ...spec, supabaseUserId: id });
  }

  return users;
}
