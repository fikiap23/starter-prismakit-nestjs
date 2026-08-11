import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { getCategorySelect } from '../types/select-category.type';

@Injectable()
export class CategoryService {
  constructor(private readonly categories: CategoryRepository) {}

  handleGetMany() {
    return this.categories.getMany({
      where: { status: 'ACTIVE', parentId: null },
      select: getCategorySelect('general'),
      orderBy: { name: 'asc' },
      setCache: true,
      cacheTags: ['category:tree'],
    });
  }
}
