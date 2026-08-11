import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SwaggerEndpoint } from 'src/common/decorators/swagger-endpoint.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { validateUUID } from 'src/common/utils/helper.common';
import { formatResponse } from 'src/common/utils/http.helper';
import { errorHandler } from 'src/common/utils/validation.helper';
import {
  AttachTagsDto,
  BulkDeactivateDto,
  FilterProductDto,
  UpdateProductDto,
} from '../dto/product.dto';
import { ProductService } from '../services/product.service';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get('products')
  @SwaggerEndpoint({
    summary: 'Paginated catalog (cacheTags + defaultSetCache)',
    auth: false,
    pagination: true,
  })
  async list(@Query() filter: FilterProductDto, @Res() res: Response) {
    try {
      const page = await this.products.handleGetManyPaginate(filter);
      return formatResponse(res, HttpStatus.OK, page.data, page.meta);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Get('products/:id')
  @SwaggerEndpoint({
    summary: 'Product detail with nested category + images',
    auth: false,
    params: [{ name: 'id' }],
  })
  async getById(@Param('id') id: string, @Res() res: Response) {
    try {
      validateUUID(id, 'product');
      const data = await this.products.handleGetById(id);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Patch('products/:id')
  @UseGuards(JwtGuard)
  @SwaggerEndpoint({
    summary: 'Update product + tagged invalidation',
    body: UpdateProductDto,
    params: [{ name: 'id' }],
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Res() res: Response,
  ) {
    try {
      validateUUID(id, 'product');
      const data = await this.products.handleUpdateById(id, dto);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Post('admin/products/bulk-deactivate')
  @UseGuards(JwtGuard)
  @SwaggerEndpoint({
    summary: 'updateMany deactivate by category',
    body: BulkDeactivateDto,
  })
  async bulk(@Body() dto: BulkDeactivateDto, @Res() res: Response) {
    try {
      const data = await this.products.handleBulkDeactivate(dto);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Post('products/:id/tags')
  @UseGuards(JwtGuard)
  @SwaggerEndpoint({
    summary: 'Attach tags (composite PK createMany skipDuplicates)',
    body: AttachTagsDto,
    params: [{ name: 'id' }],
  })
  async tags(
    @Param('id') id: string,
    @Body() dto: AttachTagsDto,
    @Res() res: Response,
  ) {
    try {
      validateUUID(id, 'product');
      const data = await this.products.handleAttachTags(id, dto);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
