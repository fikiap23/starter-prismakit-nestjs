import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SwaggerEndpoint } from 'src/common/decorators/swagger-endpoint.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { formatResponse } from 'src/common/utils/http.helper';
import { errorHandler } from 'src/common/utils/validation.helper';
import { UpsertCouponDto } from '../dto/coupon.dto';
import { CouponService } from '../services/coupon.service';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(JwtGuard)
export class CouponController {
  constructor(private readonly coupons: CouponService) {}

  @Put(':code')
  @SwaggerEndpoint({
    summary: 'Upsert coupon by unique code',
    body: UpsertCouponDto,
    params: [{ name: 'code' }],
  })
  async upsert(
    @Param('code') code: string,
    @Body() dto: UpsertCouponDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.coupons.handleUpsertByCode(code, dto);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
