"use client";

import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * The error of an active query under `queryKey` that sits in its final error, else `null`. A
 * server-mode `DataTable` would otherwise render a failed page as "no rows". Pass it on as
 * `<LoadErrorNote error={failed} />` so the note shows the HTTP status and request id.
 */
export function useListFailed(queryKey: readonly unknown[]): unknown {
  const cache = useQueryClient().getQueryCache();
  return useSyncExternalStore(
    (onChange) => cache.subscribe(onChange),
    () =>
      cache.findAll({ queryKey, type: "active" }).find((query) => query.state.status === "error")
        ?.state.error ?? null,
    () => null
  );
}
