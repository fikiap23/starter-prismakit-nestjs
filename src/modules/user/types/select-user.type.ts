import { Prisma } from 'src/infrastructure/prisma/prisma-client';

type Key = keyof typeof userSelectPresets;

export function getUserSelect<K extends Key>(key: K) {
  return userSelectPresets[key];
}

export const userSelectPresets = {
  minimal: {
    id: true,
    email: true,
    name: true,
    status: true,
  } satisfies Prisma.UserSelect,
  general: {
    id: true,
    email: true,
    name: true,
    status: true,
    createdAt: true,
    profile: { select: { id: true, bio: true, phone: true } },
  } satisfies Prisma.UserSelect,
  withPassword: {
    id: true,
    email: true,
    name: true,
    password: true,
    status: true,
  } satisfies Prisma.UserSelect,
};
