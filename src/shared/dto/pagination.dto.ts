import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ example: '-createdAt' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sort?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 25, minimum: 1, maximum: 200, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 25;
}

export class SearchPaginationDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Free text search' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
