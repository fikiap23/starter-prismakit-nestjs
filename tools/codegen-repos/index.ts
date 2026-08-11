import * as path from 'path';
import { runCodegen } from '@prismakit/cli';

const projectRoot = path.resolve(__dirname, '../..');
const outFile = path.join(
  projectRoot,
  'src/infrastructure/prisma/suggested-relation-aliases.ts',
);

runCodegen({
  cwd: projectRoot,
  write: true,
  outFile,
});

console.log(
  'Review suggestions, then merge needed entries into relation-model-aliases.ts',
);
