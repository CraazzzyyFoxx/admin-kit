/**
 * The query-string half of the table's state: page, search, page size and
 * sort, parsed out of and written back into `URLSearchParams`.
 *
 * Pure — the effects that call these live in `useAdminTableState`.
 */

import type { SortingState } from "@tanstack/react-table";

import type { SortDir } from "./types.js";

export function parsePositiveInt<T extends number | null>(
  value: string | null,
  fallback: T
): number | T {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSortDir(value: string | null): SortDir {
  return value === "desc" ? "desc" : "asc";
}

/** `?sort=a,b&dir=desc,asc` — one entry per sorted column, `dir` omitted when every one is ascending. */
export function parseSorting(params: URLSearchParams, fallback: SortingState): SortingState {
  const sort = params.get("sort");
  if (!sort) return fallback;
  const dirs = (params.get("dir") ?? "").split(",");
  return sort
    .split(",")
    .filter(Boolean)
    .map((id, index) => ({ id, desc: parseSortDir(dirs[index] ?? null) === "desc" }));
}

export function writeSorting(params: URLSearchParams, sorting: SortingState) {
  if (sorting.length === 0) {
    params.delete("sort");
    params.delete("dir");
    return;
  }
  params.set("sort", sorting.map((entry) => entry.id).join(","));
  if (sorting.some((entry) => entry.desc))
    params.set("dir", sorting.map((entry) => (entry.desc ? "desc" : "asc")).join(","));
  else params.delete("dir");
}

/** Stable string identity of a sort, so "did the sort change" is one `!==`. */
export function serializeSorting(sorting: SortingState) {
  return sorting.map((entry) => `${entry.id}:${entry.desc ? "desc" : "asc"}`).join(",");
}

/** The table's own params out of the whole query string: those under `<prefix>.`, unprefixed. */
export function readScope(all: URLSearchParams, prefix: string): URLSearchParams {
  if (!prefix) return new URLSearchParams(all);
  const scoped = new URLSearchParams();
  for (const [key, value] of all)
    if (key.startsWith(`${prefix}.`)) scoped.append(key.slice(prefix.length + 1), value);
  return scoped;
}

/** `all` with the table's params replaced by `scoped`; the rest of the query is kept. */
export function writeScope(all: URLSearchParams, scoped: URLSearchParams, prefix: string) {
  if (!prefix) return scoped;
  const next = new URLSearchParams();
  for (const [key, value] of all) if (!key.startsWith(`${prefix}.`)) next.append(key, value);
  for (const [key, value] of scoped) next.append(`${prefix}.${key}`, value);
  return next;
}
