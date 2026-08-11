import { Injectable } from '@nestjs/common';
import {
  parsePrismaOrderBy,
  resolveAppliedSort,
} from 'src/common/utils/sort.util';
import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  AttachTagsDto,
  BulkDeactivateDto,
  FilterProductDto,
  UpdateProductDto,
} from '../dto/product.dto';
import { ProductRepository } from '../repositories/product.repository';
import { ProductTagRepository } from '../repositories/product-tag.repository';
import { getProductSelect } from '../types/select-product.type';
import { whereProductGetManyPaginate } from '../types/where-product.type';

@Injectable()
export class ProductService {
  constructor(
    private readonly products: ProductRepository,
    private readonly productTags: ProductTagRepository,
  ) {}

  async handleGetManyPaginate(filter: FilterProductDto) {
    const { where } = whereProductGetManyPaginate(filter);
    const result = await this.products.getManyPaginate({
      where,
      select: getProductSelect('general'),
      orderBy: parsePrismaOrderBy<Prisma.ProductOrderByWithRelationInput>(
        filter.sort,
        'name',
      ),
      page: filter.page,
      pageSize: filter.pageSize,
      setCache: true,
      cacheTags: filter.categoryId
        ? [`category:${filter.categoryId}`]
        : undefined,
    });
    return {
      ...result,
      meta: {
        ...result.meta,
        sort: resolveAppliedSort(filter.sort, 'name'),
      },
    };
  }

  handleGetById(id: string) {
    return this.products.getThrowById({
      id,
      select: getProductSelect('general'),
      setCache: true,
    });
  }

  async handleUpdateById(id: string, dto: UpdateProductDto) {
    const current = await this.products.getThrowById({
      id,
      select: getProductSelect('minimal'),
    });
    return this.products.updateById({
      id,
      data: dto,
      select: getProductSelect('general'),
      tags: [`category:${current.categoryId}`],
    });
  }

  handleBulkDeactivate(dto: BulkDeactivateDto) {
    return this.products.updateMany({
      where: { categoryId: dto.categoryId },
      data: { isActive: false },
      tags: [`category:${dto.categoryId}`],
    });
  }

  handleAttachTags(productId: string, dto: AttachTagsDto) {
    return this.productTags.createMany({
      data: dto.tagIds.map((tagId) => ({ productId, tagId })),
      skipDuplicates: true,
    });
  }
}
