import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from 'src/infrastructure/prisma/prisma-client';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class UpsertCouponDto {
  @ApiProperty({ enum: CouponType, example: CouponType.PERCENT })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
