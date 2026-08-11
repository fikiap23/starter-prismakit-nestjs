import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductRepository } from './repositories/product.repository';
import { ProductTagRepository } from './repositories/product-tag.repository';
import { TagRepository } from './repositories/tag.repository';
import { ProductService } from './services/product.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    ProductTagRepository,
    TagRepository,
  ],
  exports: [ProductRepository, ProductTagRepository, TagRepository],
})
export class ProductModule {}
