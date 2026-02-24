import { Module } from '@nestjs/common';
import { CreditsModule } from '../credits/credits.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [CreditsModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
