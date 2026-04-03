import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../auth.service';
import { SupabaseJwksService } from '../services/supabase-jwks.service';
import type { SupabaseJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseJwksService: SupabaseJwksService,
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Permite rotas marcadas com @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    let supabaseUserId: string;
    let email: string;
    let userMetadata: SupabaseJwtPayload['user_metadata'];

    try {
      const payload = await this.supabaseJwksService.verify(token);
      supabaseUserId = payload.sub;
      email = payload.email ?? '';
      userMetadata = payload.user_metadata;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const { profile, groupId } =
      await this.authService.findOrCreateProfile(supabaseUserId, email, userMetadata);

    request['user'] = {
      supabaseUserId,
      email,
      profileId: profile.id,
      groupId,
    };

    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
