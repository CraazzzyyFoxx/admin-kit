// The page window's shape at every page of every size, and which pager a hotkey turns.
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test/render.js";
import {
  DataPagination,
  DEFAULT_PAGE_HOTKEYS,
  buildPageWindow,
  hotkeyLabel
} from "./data-pagination.js";

describe("buildPageWindow", () => {
  it("lists every page up to seven", () => {
    expect(buildPageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(buildPageWindow(1, 1)).toEqual([1]);
  });

  it("slides a three-wide window between fixed first and last pages", () => {
    expect(buildPageWindow(1, 124)).toEqual([1, 2, 3, 4, 5, null, 124]);
    expect(buildPageWindow(4, 124)).toEqual([1, 2, 3, 4, 5, null, 124]);
    expect(buildPageWindow(5, 124)).toEqual([1, null, 4, 5, 6, null, 124]);
    expect(buildPageWindow(121, 124)).toEqual([1, null, 120, 121, 122, 123, 124]);
    expect(buildPageWindow(8, 8)).toEqual([1, null, 4, 5, 6, 7, 8]);
  });

  it("keeps seven slots, the current page, and gaps of two pages or more at every page", () => {
    for (let total = 8; total <= 40; total++) {
      for (let current = 1; current <= total; current++) {
        const window = buildPageWindow(current, total);
        expect(window).toHaveLength(7);
        expect(window).toContain(current);
        expect([window[0], window[6]]).toEqual([1, total]);
        window.forEach((entry, i) => {
          if (entry === null) expect(window[i + 1]! - window[i - 1]!).toBeGreaterThan(2);
          else if (i > 0 && window[i - 1] !== null) expect(entry).toBe(window[i - 1]! + 1);
        });
      }
    }
  });
});

describe("DataPagination hotkeys", () => {
  const press = (code: string, init: KeyboardEventInit = {}, target: Element = document.body) =>
    fireEvent.keyDown(target, { code, ...init });

  it("turns, ends and stops at the edges by the physical key", () => {
    const onPageChange = vi.fn();
    const { rerender } = renderWithProviders(
      <DataPagination
        page={3}
        totalPages={10}
        onPageChange={onPageChange}
        hotkeys={DEFAULT_PAGE_HOTKEYS}
      />
    );
    press("BracketRight", { key: "ъ" });
    press("BracketLeft", { shiftKey: true });
    press("BracketRight", { shiftKey: true });
    expect(onPageChange.mock.calls).toEqual([[4], [1], [10]]);

    onPageChange.mockClear();
    rerender(
      <DataPagination
        page={10}
        totalPages={10}
        onPageChange={onPageChange}
        hotkeys={DEFAULT_PAGE_HOTKEYS}
      />
    );
    press("BracketRight");
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("ignores typing, chords and held keys", () => {
    const onPageChange = vi.fn();
    renderWithProviders(
      <>
        <input aria-label="search" />
        <DataPagination
          page={3}
          totalPages={10}
          onPageChange={onPageChange}
          hotkeys={DEFAULT_PAGE_HOTKEYS}
        />
      </>
    );
    press("BracketRight", {}, screen.getByLabelText("search"));
    press("BracketRight", { ctrlKey: true });
    press("BracketRight", { repeat: true });
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("with two pagers, turns only the one holding focus", () => {
    const first = vi.fn();
    const second = vi.fn();
    renderWithProviders(
      <>
        <DataPagination
          page={3}
          totalPages={10}
          onPageChange={first}
          hotkeys={DEFAULT_PAGE_HOTKEYS}
        />
        <DataPagination
          page={3}
          totalPages={10}
          onPageChange={second}
          hotkeys={DEFAULT_PAGE_HOTKEYS}
        />
      </>
    );
    press("BracketRight");
    expect([first, second].map((fn) => fn.mock.calls.length)).toEqual([0, 0]);

    const inSecond = screen.getAllByRole("button", { name: "Go to page 2" })[1];
    inSecond.focus();
    press("BracketRight", {}, inSecond);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(4);
  });

  it("labels keys as typed on a US layout", () => {
    expect(hotkeyLabel("Shift+BracketLeft")).toBe("Shift+[");
    expect(hotkeyLabel("KeyJ")).toBe("J");
  });
});
