import { Inject, Injectable } from '@nestjs/common';
import { PRISMAKIT_PRISMA } from '@prismakit/nestjs';

type PrismaClientLike = {
  $queryRaw: (
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<unknown>;
};

@Injectable()
export class HealthCheckRepository {
  constructor(
    @Inject(PRISMAKIT_PRISMA) private readonly prisma: PrismaClientLike,
  ) {}

  async pingDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
