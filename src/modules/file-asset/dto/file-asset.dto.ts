import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilePurpose } from 'src/infrastructure/prisma/prisma-client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFileDto {
  @ApiProperty({ enum: FilePurpose, example: FilePurpose.PRODUCT_IMAGE })
  @IsEnum(FilePurpose)
  purpose: FilePurpose;

  @ApiProperty({ example: 'hero.jpg' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsNotEmpty()
  @IsString()
  contentType: string;

  @ApiProperty({ example: 245760 })
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  sizeBytes: number;
}

export class ConfirmFileDto {
  @ApiPropertyOptional({ description: 'Hex SHA-256 checksum' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  checksumSha256?: string;
}
