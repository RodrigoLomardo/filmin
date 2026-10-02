import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { maskDatabaseUrl, resolveAppEnv } from './common/config/environment';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    let database = 'down';

    try {
      await this.dataSource.query('SELECT 1');
      database = 'up';
    } catch {
      // Mantém 'down' — detalhes do erro não são expostos na resposta pública.
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      env: resolveAppEnv(),
      database,
      databaseHost: maskDatabaseUrl(),
      timestamp: new Date().toISOString(),
    };
  }
}
