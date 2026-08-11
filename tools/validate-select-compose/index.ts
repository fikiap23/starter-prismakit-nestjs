import * as path from 'path';
import {
  assertSelectComposeValid,
  loadPrismaMetaFromSchema,
  setRelationModelAliases,
} from '@prismakit/core';
import { RELATION_MODEL_ALIASES } from '../../src/infrastructure/prisma/relation-model-aliases';

const projectRoot = path.resolve(__dirname, '../..');

loadPrismaMetaFromSchema(path.join(projectRoot, 'prisma/schema.prisma'));
setRelationModelAliases({ ...RELATION_MODEL_ALIASES });

try {
  assertSelectComposeValid(projectRoot);
  console.log('validate:compose OK — no issues found');
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
