export function parseSortOrder<T extends Record<string, 'asc' | 'desc'>>(
  sort: string | undefined,
  defaultSort: string,
  allowedFields?: readonly string[],
): T | T[] {
  const raw = (sort?.trim() || defaultSort).trim();
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const orderBy: T[] = [];
  for (const part of parts) {
    const desc = part.startsWith('-');
    const field = desc ? part.slice(1) : part;
    if (!field) continue;
    if (allowedFields && !allowedFields.includes(field)) continue;
    orderBy.push({ [field]: desc ? 'desc' : 'asc' } as T);
  }

  if (orderBy.length === 0) {
    return parseSortOrder(undefined, defaultSort, allowedFields);
  }

  return orderBy.length === 1 ? orderBy[0] : orderBy;
}

export function resolveAppliedSort(
  sort: string | undefined,
  defaultSort: string,
): string {
  return (sort?.trim() || defaultSort).trim();
}

export function parsePrismaOrderBy<T>(
  sort: string | undefined,
  defaultSort: string,
): T {
  return parseSortOrder(sort, defaultSort) as T;
}
