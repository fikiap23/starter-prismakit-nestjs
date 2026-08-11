import { PrismaPg } from '@prisma/adapter-pg';
import { hashSync } from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/postgres',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL_SEED ?? 'admin@gmail.com';
  const password = hashSync(process.env.ADMIN_PASSWORD_SEED ?? 'admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: 'Admin',
      password,
      profile: { create: { bio: 'Starter shop admin' } },
    },
    update: {},
  });

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    create: { slug: 'electronics', name: 'Electronics' },
    update: { name: 'Electronics' },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    create: {
      slug: 'accessories',
      name: 'Accessories',
      parentId: electronics.id,
    },
    update: { name: 'Accessories', parentId: electronics.id },
  });

  const tagNew = await prisma.tag.upsert({
    where: { slug: 'new' },
    create: { slug: 'new', name: 'New' },
    update: { name: 'New' },
  });
  const tagSale = await prisma.tag.upsert({
    where: { slug: 'sale' },
    create: { slug: 'sale', name: 'Sale' },
    update: { name: 'Sale' },
  });

  const products = [
    {
      sku: 'KB-01',
      name: 'Mechanical Keyboard',
      priceCents: 12900,
      categoryId: electronics.id,
      qty: 25,
      tagIds: [tagNew.id],
    },
    {
      sku: 'MS-01',
      name: 'Wireless Mouse',
      priceCents: 4900,
      categoryId: accessories.id,
      qty: 40,
      tagIds: [tagSale.id],
    },
    {
      sku: 'HD-01',
      name: 'Studio Headphones',
      priceCents: 19900,
      categoryId: electronics.id,
      qty: 12,
      tagIds: [tagNew.id, tagSale.id],
    },
  ];

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      create: {
        sku: item.sku,
        name: item.name,
        description: `${item.name} demo product`,
        priceCents: item.priceCents,
        categoryId: item.categoryId,
        stock: { create: { qty: item.qty } },
      },
      update: {
        name: item.name,
        priceCents: item.priceCents,
        categoryId: item.categoryId,
      },
    });

    await prisma.stock.upsert({
      where: { productId: product.id },
      create: { productId: product.id, qty: item.qty },
      update: { qty: item.qty },
    });

    await prisma.productTag.createMany({
      data: item.tagIds.map((tagId) => ({ productId: product.id, tagId })),
      skipDuplicates: true,
    });
  }

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    create: { code: 'WELCOME10', type: 'PERCENT', amount: 10, isActive: true },
    update: { type: 'PERCENT', amount: 10, isActive: true },
  });

  console.log(
    `Seeded admin ${admin.email}, 2 categories, 3 products, 1 coupon`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
