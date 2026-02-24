import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [CreditsModule],
  controllers: [CronController],
})
export class CronModule {}
