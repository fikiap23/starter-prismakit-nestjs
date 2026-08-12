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
    const [result, totalActive] = await Promise.all([
      this.products.getManyPaginate({
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
      }),
      this.products.count({
        where: { ...where, isActive: true },
        setCache: true,
        cacheTags: filter.categoryId
          ? [`category:${filter.categoryId}`]
          : undefined,
      }),
    ]);
    return {
      ...result,
      meta: {
        ...result.meta,
        sort: resolveAppliedSort(filter.sort, 'name'),
        activeCount: totalActive,
      },
    };
  }

  /** Cursor feed for infinite scroll (PrismaKit getManyCursor). */
  handleGetFeed(cursor?: string, take = 20) {
    return this.products.getManyCursor({
      where: { isActive: true },
      select: getProductSelect('general'),
      orderBy: { id: 'asc' },
      cursor: cursor ? { id: cursor } : undefined,
      take,
      setCache: true,
    });
  }

  handleGetById(id: string) {
    return this.products.getThrowById({
      id,
      select: getProductSelect('general'),
      setCache: true,
    });
  }

  async handleUpdateById(id: string, dto: UpdateProductDto) {
    return this.products.update({
      where: { id },
      data: dto,
      select: getProductSelect('general'),
      tags: (row) =>
        row.categoryId ? [`category:${row.categoryId}`] : undefined,
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
