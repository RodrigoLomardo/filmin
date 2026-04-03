import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { SupabaseJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class SupabaseJwksService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.getOrThrow<string>('SUPABASE_URL');
    // JWKS publicado pelo Supabase Auth para validação de tokens ECC (ES256 / P-256)
    this.jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
    this.issuer = `${supabaseUrl}/auth/v1`;
  }

  /**
   * Verifica o token JWT do Supabase via JWKS remoto.
   * Valida automaticamente: assinatura ES256, issuer, audience e expiração.
   * Lança erro se o token for inválido, expirado ou com claims incorretos.
   */
  async verify(token: string): Promise<SupabaseJwtPayload> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      audience: 'authenticated',
    });
    return payload as unknown as SupabaseJwtPayload;
  }
}
