export interface ResolvedDateRange {
  from: Date;
  to: Date;
}

// По умолчанию — последние 30 дней, если период не передан.
export function resolveDateRange(
  from?: string,
  to?: string,
): ResolvedDateRange {
  const resolvedTo = to ? new Date(to) : new Date();
  const resolvedFrom = from
    ? new Date(from)
    : new Date(resolvedTo.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: resolvedFrom, to: resolvedTo };
}
