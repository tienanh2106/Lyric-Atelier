import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CreditsService } from '../credits/credits.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Cron')
@Controller('cron')
export class CronController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('expire-credits')
  @Public()
  @ApiOperation({
    operationId: 'expireCredits',
    summary: 'Trigger credit expiration (Vercel Cron)',
    description:
      'Called daily by Vercel Cron at midnight UTC. Requires Authorization: Bearer <CRON_SECRET>.',
  })
  @ApiResponse({ status: 200, description: 'Credits expired successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing cron secret' })
  async expireCredits(
    @Headers('authorization') authorization: string,
  ): Promise<{ message: string }> {
    const cronSecret = this.configService.get<string>('cronSecret');

    if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    await this.creditsService.expireCredits();
    return { message: 'Credit expiration completed successfully' };
  }
}
