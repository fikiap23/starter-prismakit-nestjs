import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Put,
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
import { UpsertCartItemDto } from '../dto/cart.dto';
import { CartService } from '../services/cart.service';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Put('items')
  @SwaggerEndpoint({
    summary: 'Upsert cart line (composite PK)',
    body: UpsertCartItemDto,
  })
  async upsert(
    @CurrentUser() user: IPayloadJWT,
    @Body() dto: UpsertCartItemDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.cart.handleUpsertItem(user.sub, dto);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Delete()
  @SwaggerEndpoint({ summary: 'Clear cart (deleteMany)' })
  async clear(@CurrentUser() user: IPayloadJWT, @Res() res: Response) {
    try {
      const data = await this.cart.handleClear(user.sub);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
