import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check público — usado pelo Render e para conferir rapidamente
   * qual ambiente e qual banco a instância está servindo.
   */
  @Public()
  @Get('health')
  async getHealth() {
    return this.appService.getHealth();
  }
}
