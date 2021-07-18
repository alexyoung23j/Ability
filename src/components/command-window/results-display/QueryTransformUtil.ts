import { DateTime } from 'luxon';

export function chooseYearForDateFilter(day: number, month: number): number {
  const toCompareTo = DateTime.fromObject({ day, month });
  const now = DateTime.now().startOf('day');

  const year = toCompareTo < now ? now.year + 1 : now.year;
  return year;
}
