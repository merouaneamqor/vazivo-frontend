/**
 * SEO-friendly pagination series: which page numbers to show (left window, right window,
 * around current page, and "tens" for large page counts). Mirrors backend logic for consistency.
 */
interface PaginationSeriesOptions {
  currentPage: number;
  totalPages: number;
  left?: number;
  right?: number;
  window?: number;
}

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

export function getPaginationSeries(options: PaginationSeriesOptions): number[] {
  const {
    currentPage,
    totalPages,
    left = 1,
    right = 1,
    window: windowSize = 2,
  } = options;

  if (totalPages < 1) return [];
  const page = Math.max(1, Math.min(currentPage, totalPages));

  const left_window_plus_one = range(1, left + 1);
  const right_window_plus_one = range(
    Math.max(1, totalPages - right),
    totalPages
  );
  const inside_window_plus_each_sides = range(
    Math.max(1, page - windowSize - 1),
    Math.min(totalPages, page + windowSize + 1)
  );
  const current_hundred = Math.floor(page / 100);
  const tens = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
    (n) => n * 10 + current_hundred * 100
  );

  const combined = [
    ...new Set([
      ...left_window_plus_one,
      ...inside_window_plus_each_sides,
      ...tens,
      ...right_window_plus_one,
    ]),
  ];
  return combined
    .filter((x) => x >= 1 && x <= totalPages)
    .sort((a, b) => a - b);
}
