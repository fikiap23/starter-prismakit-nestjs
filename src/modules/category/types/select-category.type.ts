import { Prisma } from 'src/infrastructure/prisma/prisma-client';

type Key = keyof typeof categorySelectPresets;

export function getCategorySelect<K extends Key>(key: K) {
  return categorySelectPresets[key];
}

export const categorySelectPresets = {
  minimal: { id: true, slug: true } satisfies Prisma.CategorySelect,
  general: {
    id: true,
    slug: true,
    name: true,
    parentId: true,
    status: true,
    parent: { select: { id: true, name: true, slug: true } },
    children: { select: { id: true, name: true, slug: true } },
  } satisfies Prisma.CategorySelect,
};
