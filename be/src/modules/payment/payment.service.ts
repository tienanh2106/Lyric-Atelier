import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import type { Webhook } from '@payos/node';
import { CreditsService } from '../credits/credits.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';

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
        returnUrl: `${frontendUrl}/payment/return?packageId=${pkg.id}&userId=${userId}`,
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

  async confirmPayment(userId: string, packageId: string) {
    const pkg = await this.creditsService.findPackage(packageId);
    if (!pkg) {
      throw new NotFoundException('Credit package not found');
    }

    await this.creditsService.purchaseCredits(userId, {
      packageId,
      paymentMethod: 'payos',
    });

    this.logger.log(
      `Credits confirmed for user ${userId}, package ${packageId} (${pkg.credits} credits)`,
    );

    return {
      success: true,
      credits: pkg.credits,
      packageName: pkg.name,
    };
  }
}
