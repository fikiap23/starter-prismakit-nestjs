import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import prismakit from '@prismakit/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettier,
  prismakit.configs.recommended,
  {
    ignores: [
      'build/**',
      'dist/**',
      'src/generated/**',
      'node_modules/**',
      'eslint.config.mjs',
      'prisma/seed.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: [
      'src/app.module.ts',
      'src/infrastructure/prisma/**/*.ts',
      'prisma/**/*.ts',
    ],
    rules: {
      'prismakit/no-prisma-service-outside-repos': 'off',
      'prismakit/no-direct-prisma-delegate': 'off',
      'prismakit/require-transaction-service': 'off',
    },
  },
);
