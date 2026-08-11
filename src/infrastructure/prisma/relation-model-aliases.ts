/**
 * Maps Prisma relation field names to repository registry `model` keys when they
 * differ from suffix heuristics. Applied at bootstrap via schema meta; keep this
 * list small. Do not dump `yarn codegen:repos` output here — that tool writes
 * `suggested-relation-aliases.ts` for review (ambiguous names like `products`
 * exist on both Category and Tag).
 */
export const RELATION_MODEL_ALIASES: Readonly<Record<string, string>> = {
  actor: 'user',
  children: 'category',
  images: 'productImage',
  parent: 'category',
  uploadedByUser: 'user',
};
