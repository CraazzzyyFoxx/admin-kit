// `urlState`: a prefix keeps two tables on one screen out of each other's params and the page's
// own; `false` keeps the table out of the address altogether.
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithProviders } from "../../test/render.js";
import { DataTable } from "./DataTable.js";

interface Row {
  id: number;
  name: string;
}

const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];
const rows: Row[] = [
  { id: 1, name: "alpha" },
  { id: 2, name: "beta" }
];

const table = (urlState: boolean | string, label: string) => (
  <DataTable<Row>
    columns={columns}
    rows={rows}
    paging="all"
    searchPlaceholder={label}
    columnsStorageKey={label}
    urlState={urlState}
  />
);

beforeEach(() => {
  window.history.replaceState(null, "", "/docs?view=settings&page=7");
});

describe("DataTable urlState", () => {
  it("writes a prefixed table's search under its prefix and keeps every other param", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        {table("a", "First")}
        {table("b", "Second")}
      </>
    );

    await user.type(screen.getByLabelText("First"), "beta");

    await waitFor(() => expect(new URLSearchParams(window.location.search).get("a.search")).toBe("beta"));
    const params = new URLSearchParams(window.location.search);
    expect(params.get("view")).toBe("settings");
    expect(params.get("page")).toBe("7");
    expect(params.get("b.search")).toBeNull();
    expect(params.get("search")).toBeNull();
  });

  it("reads its state back from its prefix", () => {
    window.history.replaceState(null, "", "/docs?b.search=alpha&search=beta");
    renderWithProviders(table("b", "Second"));

    expect(screen.getByLabelText("Second")).toHaveValue("alpha");
  });

  it("leaves the address alone when false", async () => {
    const user = userEvent.setup();
    renderWithProviders(table(false, "Only"));

    await user.type(screen.getByLabelText("Only"), "beta");
    await waitFor(() => expect(screen.queryByText("alpha")).toBeNull());

    expect(window.location.search).toBe("?view=settings&page=7");
  });
});
