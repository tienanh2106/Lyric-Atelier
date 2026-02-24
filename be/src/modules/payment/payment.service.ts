import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import type { Webhook, PaymentLink } from '@payos/node/lib/resources';
import { CreditsService } from '../credits/credits.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly payos: PayOS;

  constructor(
    private readonly configService: ConfigService,
    private readonly creditsService: CreditsService,
  ) {
    const clientId = this.configService.get<string>('payos.clientId') ?? '';
    const apiKey = this.configService.get<string>('payos.apiKey') ?? '';
    const checksumKey =
      this.configService.get<string>('payos.checksumKey') ?? '';
    this.payos = new PayOS({ clientId, apiKey, checksumKey });
  }

  async createPaymentLink(userId: string, dto: CreatePaymentLinkDto) {
    const pkg = await this.creditsService.findPackage(dto.packageId);

    if (!pkg) {
      throw new NotFoundException('Credit package not found');
    }

    const orderCode = Number(
      `${Date.now()}`.slice(-8) + `${Math.floor(Math.random() * 100)}`,
    );

    const frontendUrl =
      this.configService.get<string>('app.frontendUrl') ??
      'http://localhost:3000';

    try {
      const paymentLink = await this.payos.paymentRequests.create({
        orderCode,
        amount: Math.round(Number(pkg.price)),
        description: pkg.name.slice(0, 25),
        returnUrl: `${frontendUrl}/payment/return?packageId=${pkg.id}&orderCode=${orderCode}`,
        cancelUrl: `${frontendUrl}/payment/cancel`,
        items: [
          {
            name: pkg.name,
            quantity: 1,
            price: Math.round(Number(pkg.price)),
          },
        ],
      });

      this.logger.log(
        `Payment link created for user ${userId}, package ${pkg.id}, orderCode ${orderCode}`,
      );

      return {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode,
        packageId: pkg.id,
        amount: pkg.price,
        credits: pkg.credits,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to create payment link: ${message}`,
      );
    }
  }

  async handleWebhook(webhookData: Record<string, unknown>) {
    try {
      await this.payos.webhooks.verify(webhookData as unknown as Webhook);
    } catch {
      throw new BadRequestException('Invalid webhook data');
    }

    const { code, data } = webhookData as {
      code: string;
      data: Record<string, unknown>;
    };

    if (code !== '00') {
      this.logger.log(
        `Payment webhook received with non-success code: ${code}`,
      );
      return { received: true };
    }

    this.logger.log(`Payment confirmed via webhook: ${JSON.stringify(data)}`);

    return { received: true };
  }

  async confirmPayment(userId: string, dto: ConfirmPaymentDto) {
    const orderCodeStr = dto.orderCode.toString();

    // 1. Idempotency — prevent duplicate credit grants
    const alreadyProcessed =
      await this.creditsService.isOrderProcessed(orderCodeStr);
    if (alreadyProcessed) {
      throw new ConflictException('This order has already been processed');
    }

    // 2. Verify actual payment status with PayOS API
    let paymentLink: PaymentLink;
    try {
      paymentLink = await this.payos.paymentRequests.get(dto.orderCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to verify payment with PayOS: ${message}`,
      );
    }

    if (paymentLink.status !== 'PAID') {
      this.logger.warn(
        `Payment not completed for orderCode ${dto.orderCode}: status=${paymentLink.status}`,
      );
      throw new BadRequestException(
        `Payment not completed. Status: ${paymentLink.status}`,
      );
    }

    // 3. Verify the package matches (prevent tampering the packageId param)
    const pkg = await this.creditsService.findPackage(dto.packageId);
    const paidAmount = paymentLink.amount;
    const expectedAmount = Math.round(Number(pkg.price));
    if (paidAmount !== expectedAmount) {
      this.logger.error(
        `Amount mismatch for orderCode ${dto.orderCode}: paid=${paidAmount}, expected=${expectedAmount}`,
      );
      throw new BadRequestException(
        'Payment amount does not match package price',
      );
    }

    // 4. Grant credits with orderCode stored for idempotency
    await this.creditsService.purchaseCredits(userId, {
      packageId: dto.packageId,
      paymentMethod: 'payos',
      paymentTransactionId: orderCodeStr,
    });

    this.logger.log(
      `Credits granted for user ${userId}, package ${dto.packageId}, orderCode ${dto.orderCode} (${pkg.credits} credits)`,
    );

    return {
      success: true,
      credits: pkg.credits,
      packageName: pkg.name,
    };
  }
}
