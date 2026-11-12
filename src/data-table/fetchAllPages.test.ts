import { describe, expect, it, vi } from "vitest";

import { ALL_PAGES_SIZE, fetchAllPages } from "./fetchAllPages";

const pageOf = (page: number, size: number, total: number) => ({
  results: Array.from({ length: Math.max(0, Math.min(size, total - (page - 1) * size)) }, (_, i) => (page - 1) * size + i),
  total,
  page,
  per_page: size
});

describe("fetchAllPages", () => {
  it("reads pages of 500 until the total is reached", async () => {
    const fetchPage = vi.fn(async (page: number, size: number) => pageOf(page, size, 1200));
    const rows = await fetchAllPages(fetchPage);
    expect(rows).toHaveLength(1200);
    expect(rows.at(-1)).toBe(1199);
    expect(fetchPage.mock.calls).toEqual([[1, ALL_PAGES_SIZE], [2, ALL_PAGES_SIZE], [3, ALL_PAGES_SIZE]]);
  });

  it("stops after an exact multiple without asking for an empty page", async () => {
    const fetchPage = vi.fn(async (page: number, size: number) => pageOf(page, size, 1000));
    expect(await fetchAllPages(fetchPage)).toHaveLength(1000);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("stops on a short page even if the total says otherwise", async () => {
    const fetchPage = vi.fn(async () => ({ results: [1, 2], total: 9999, page: 1, per_page: 500 }));
    expect(await fetchAllPages(fetchPage)).toEqual([1, 2]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
