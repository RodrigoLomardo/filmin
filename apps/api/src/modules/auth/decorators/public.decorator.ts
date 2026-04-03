import { SetMetadata } from '@nestjs/common';

/**
 * Marca uma rota como pública, dispensando o JwtAuthGuard.
 * Usado na Etapa 4 quando o guard for aplicado globalmente.
 *
 * @example
 * @Public()
 * @Get('generos')
 * findAll() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
