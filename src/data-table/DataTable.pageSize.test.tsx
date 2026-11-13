// Rows per page lives in the View menu and is remembered per screen; a link's `?per_page=` wins.
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test/render.js";
import { DataTable } from "./DataTable.js";

vi.mock("next/navigation", () => ({ usePathname: () => "/rows" }));

interface Row {
  id: number;
  name: string;
}

const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];
const STORAGE_KEY = "rows-test:pageSize";

const queryFn = vi.fn(async (page: number, _search: string, pageSize: number) => ({
  page,
  per_page: pageSize,
  total: 500,
  results: Array.from({ length: pageSize }, (_, i) => ({ id: (page - 1) * pageSize + i + 1, name: `Row ${i}` }))
}));

const renderTable = () =>
  renderWithProviders(
    <DataTable<Row>
      columns={columns}
      columnsStorageKey="rows-test"
      initialPageSize={25}
      queryKey={(page, search, pageSize) => ["rows", page, search, pageSize]}
      queryFn={queryFn}
    />
  );

const lastPageSize = () => queryFn.mock.calls.at(-1)?.[2];

beforeEach(() => {
  queryFn.mockClear();
  window.history.replaceState(null, "", "/rows");
});

describe("DataTable rows per page", () => {
  it("is picked in the View menu and remembered for the screen", async () => {
    const user = userEvent.setup();
    const first = renderTable();
    await waitFor(() => expect(lastPageSize()).toBe(25));

    await user.click(screen.getByRole("button", { name: "View" }));
    await user.click(screen.getByRole("menuitemradio", { name: "50" }));

    await waitFor(() => expect(lastPageSize()).toBe(50));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("50");

    first.unmount();
    window.history.replaceState(null, "", "/rows");
    queryFn.mockClear();
    renderTable();
    await waitFor(() => expect(lastPageSize()).toBe(50));
  });

  it("forgets the pick when the reader goes back to the screen's own size", async () => {
    window.localStorage.setItem(STORAGE_KEY, "50");
    const user = userEvent.setup();
    renderTable();
    await waitFor(() => expect(lastPageSize()).toBe(50));

    await user.click(screen.getByRole("button", { name: "View" }));
    await user.click(screen.getByRole("menuitemradio", { name: "25" }));

    await waitFor(() => expect(lastPageSize()).toBe(25));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("lets a link's ?per_page= win over the remembered size", async () => {
    window.localStorage.setItem(STORAGE_KEY, "50");
    window.history.replaceState(null, "", "/rows?per_page=10");
    renderTable();
    await waitFor(() => expect(lastPageSize()).toBe(10));
    expect(queryFn.mock.calls.some((call) => call[2] === 50)).toBe(false);
  });
});
