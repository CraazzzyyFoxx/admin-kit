import type { PaginatedResponse } from "./types.js";

/** The backend's `per_page` ceiling (`MAX_PER_PAGE`). */
export const ALL_PAGES_SIZE = 500;

/**
 * Every row matching the current search/filters, read in pages of 500 until the total is reached
 * (or a short page ends the list). Used by "Select all N".
 */
export async function fetchAllPages<TData>(
  fetchPage: (page: number, pageSize: number) => Promise<PaginatedResponse<TData>>
): Promise<TData[]> {
  const rows: TData[] = [];
  for (let page = 1; ; page++) {
    const { results, total } = await fetchPage(page, ALL_PAGES_SIZE);
    rows.push(...results);
    if (results.length < ALL_PAGES_SIZE || rows.length >= total) return rows;
  }
}
