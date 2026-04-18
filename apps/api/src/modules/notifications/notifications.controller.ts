import { Controller, Get, Query, Req, Sse, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/entities/profile.entity';
import { SupabaseJwksService } from '../auth/services/supabase-jwks.service';
import { NotificationsService, NotificationEvent } from './notifications.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly supabaseJwksService: SupabaseJwksService,
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
  ) {}

  /**
   * SSE stream para notificações em tempo real.
   * Autenticação via token JWT como query param (EventSource não suporta headers).
   */
  @Public()
  @Sse('stream')
  @ApiOperation({ summary: 'SSE stream de notificações do usuário autenticado' })
  @ApiQuery({ name: 'token', required: true, description: 'JWT de autenticação Supabase' })
  stream(
    @Query('token') token: string,
    @Req() req: Request,
  ): Observable<NotificationEvent> {
    const subject = new Subject<NotificationEvent>();

    if (!token) {
      subject.error(new UnauthorizedException('Token não fornecido.'));
      return subject.asObservable();
    }

    (async () => {
      try {
        const payload = await this.supabaseJwksService.verify(token);
        const profile = await this.profilesRepo.findOne({
          where: { supabaseUserId: payload.sub },
        });

        if (!profile) {
          subject.error(new UnauthorizedException('Perfil não encontrado.'));
          return;
        }

        this.notificationsService.register(profile.id, subject);

        req.on('close', () => {
          this.notificationsService.unregister(profile.id);
        });
      } catch {
        subject.error(new UnauthorizedException('Token inválido ou expirado.'));
      }
    })();

    return subject.asObservable();
  }
}
