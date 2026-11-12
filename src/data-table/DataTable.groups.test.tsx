// Grouped rows: a header folds its own rows and brings them back, groups can
// start folded, and a group's actions work without folding it.
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef, Row as TableRow } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test/render.js";
import { DataTable } from "./DataTable.js";
import type { DataTableGroup } from "./types.js";

vi.mock("next/navigation", () => ({ usePathname: () => "/groups" }));

interface Row {
  id: number;
  name: string;
  role: string;
}

const ROWS: Row[] = [
  { id: 1, name: "Ana", role: "tank" },
  { id: 2, name: "Bo", role: "tank" },
  { id: 3, name: "Cy", role: "support" }
];

const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];

const onPay = vi.fn();

const byRole = (rows: TableRow<Row>[]): DataTableGroup<Row>[] =>
  ["tank", "support"].map((role) => ({
    key: role,
    label: role,
    rows: rows.filter((row) => row.original.role === role),
    actions: (
      <button type="button" onClick={() => onPay(role)}>
        Pay {role}
      </button>
    )
  }));

const renderTable = (groupsCollapsed?: boolean) =>
  renderWithProviders(
    <DataTable<Row>
      rows={ROWS}
      columns={columns}
      getRowId={(row) => String(row.id)}
      paging="all"
      groupRows={byRole}
      groupsCollapsed={groupsCollapsed}
    />
  );

const header = (role: string) => screen.getByRole("button", { name: new RegExp(`^${role}`) });
const shown = () => ROWS.filter((row) => screen.queryByText(row.name)).map((row) => row.name);

describe("DataTable groups", () => {
  it("folds one group's rows behind its header and unfolds them again", async () => {
    const user = userEvent.setup();
    renderTable();
    expect(header("tank")).toHaveTextContent("tank2");
    expect(header("tank")).toHaveAttribute("aria-expanded", "true");
    expect(shown()).toEqual(["Ana", "Bo", "Cy"]);

    await user.click(header("tank"));
    expect(header("tank")).toHaveAttribute("aria-expanded", "false");
    expect(shown()).toEqual(["Cy"]);
    // The first row on screen takes the Tab stop when the first group is folded.
    expect(screen.getByText("Cy").closest("tr")).toHaveAttribute("tabindex", "0");

    await user.click(header("tank"));
    expect(shown()).toEqual(["Ana", "Bo", "Cy"]);
  });

  it("starts as headers only with groupsCollapsed and opens the clicked group alone", async () => {
    const user = userEvent.setup();
    renderTable(true);
    expect(header("tank")).toHaveAttribute("aria-expanded", "false");
    expect(header("support")).toHaveTextContent("support1");
    expect(shown()).toEqual([]);

    await user.click(header("support"));
    expect(shown()).toEqual(["Cy"]);
  });

  it("runs a group's action without folding the group", async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole("button", { name: "Pay tank" }));
    expect(onPay).toHaveBeenCalledWith("tank");
    expect(header("tank")).toHaveAttribute("aria-expanded", "true");
    expect(shown()).toEqual(["Ana", "Bo", "Cy"]);
  });
});
