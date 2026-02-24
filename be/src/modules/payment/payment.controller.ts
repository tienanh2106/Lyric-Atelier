import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import {
  PaymentLinkResponseDto,
  ConfirmPaymentResponseDto,
} from './dto/payment-link-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Payment')
@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-link')
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'createPaymentLink',
    summary: 'Tạo link thanh toán PayOS',
    description:
      'Tạo payment link để mua gói credits qua PayOS (VietQR, ngân hàng nội địa)',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment link created successfully',
    type: PaymentLinkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createPaymentLink(
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentLinkDto,
  ) {
    return this.paymentService.createPaymentLink(user.id, dto);
  }

  @Post('confirm')
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'confirmPayment',
    summary: 'Xác nhận thanh toán và cộng credits',
    description: 'Gọi sau khi user được redirect về từ PayOS với status PAID',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment confirmed, credits added',
    type: ConfirmPaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  confirmPayment(@CurrentUser() user: User, @Body() dto: ConfirmPaymentDto) {
    return this.paymentService.confirmPayment(user.id, dto.packageId);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({
    operationId: 'payosWebhook',
    summary: 'PayOS webhook endpoint',
    description: 'Nhận webhook từ PayOS khi thanh toán thành công',
  })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  handleWebhook(@Body() webhookData: Record<string, unknown>) {
    return this.paymentService.handleWebhook(webhookData);
  }
}
