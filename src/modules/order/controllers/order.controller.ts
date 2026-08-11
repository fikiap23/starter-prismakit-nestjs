import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SwaggerEndpoint } from 'src/common/decorators/swagger-endpoint.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { formatResponse } from 'src/common/utils/http.helper';
import { errorHandler } from 'src/common/utils/validation.helper';
import { IPayloadJWT } from 'src/shared/interfaces/auth.interface';
import { CheckoutDto } from '../dto/checkout.dto';
import { OrderService } from '../services/order.service';

@ApiTags('Checkout')
@Controller()
@UseGuards(JwtGuard)
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Post('checkout')
  @SwaggerEndpoint({
    summary:
      'Checkout: execTx + FOR UPDATE stock lock + afterCommit invalidate',
    body: CheckoutDto,
    success: { status: 201 },
  })
  async checkout(
    @CurrentUser() user: IPayloadJWT,
    @Body() dto: CheckoutDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.orders.handleCheckout(user.sub, dto ?? {});
      return formatResponse(res, HttpStatus.CREATED, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
