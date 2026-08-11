import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SwaggerEndpoint } from 'src/common/decorators/swagger-endpoint.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { validateUUID } from 'src/common/utils/helper.common';
import { formatResponse } from 'src/common/utils/http.helper';
import { errorHandler } from 'src/common/utils/validation.helper';
import { IPayloadJWT } from 'src/shared/interfaces/auth.interface';
import { ConfirmFileDto, CreateFileDto } from '../dto/file-asset.dto';
import { FileAssetService } from '../services/file-asset.service';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtGuard)
export class FileAssetController {
  constructor(private readonly files: FileAssetService) {}

  @Post()
  @SwaggerEndpoint({
    summary: 'Create file metadata + presigned PUT URL',
    body: CreateFileDto,
    success: { status: 201 },
  })
  async create(
    @Body() dto: CreateFileDto,
    @CurrentUser() user: IPayloadJWT,
    @Res() res: Response,
  ) {
    try {
      const result = await this.files.handleCreate(dto, user);
      res.setHeader('Location', `/files/${result.id}`);
      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Post(':id/confirm')
  @SwaggerEndpoint({
    summary: 'Confirm MinIO upload (statObject → READY)',
    params: [{ name: 'id' }],
    body: ConfirmFileDto,
  })
  async confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmFileDto,
    @CurrentUser() user: IPayloadJWT,
    @Res() res: Response,
  ) {
    try {
      validateUUID(id, 'file');
      const result = await this.files.handleConfirm(id, dto, user);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Get(':id')
  @SwaggerEndpoint({
    summary: 'Get file metadata',
    params: [{ name: 'id' }],
  })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: IPayloadJWT,
    @Res() res: Response,
  ) {
    try {
      validateUUID(id, 'file');
      const result = await this.files.handleGetById(id, user);
      return formatResponse(res, HttpStatus.OK, result);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Get(':id/download')
  @SwaggerEndpoint({
    summary: 'Presigned GET URL (JSON if Accept: application/json)',
    params: [{ name: 'id' }],
  })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: IPayloadJWT,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      validateUUID(id, 'file');
      const result = await this.files.handleDownload(id, user);
      const accept = req.headers.accept ?? '';
      if (accept.includes('application/json')) {
        return formatResponse(res, HttpStatus.OK, result);
      }
      return res.redirect(302, result.url);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
