import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentSessionDto } from './dto';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create-session')
  createSession(
    @Body() paymentSessionDto: PaymentSessionDto
  ) {
    // return paymentSessionDto;
    return this.paymentService.createSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment successful',
    }
  }


  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment cancelled',
    }
  }

  @Post('webhook')
  async stripeWebhook(
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.paymentService.stripeWebhook(req, res);
  }

}
