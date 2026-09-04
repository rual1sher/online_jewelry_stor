export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function paginationSkip(
  page = 1,
  limit = 20,
): { skip: number; take: number } {
  return { skip: (page - 1) * limit, take: limit };
}

export function toPaginated<T>(
  items: T[],
  total: number,
  page = 1,
  limit = 20,
): Paginated<T> {
  return { items, total, page, limit };
}
