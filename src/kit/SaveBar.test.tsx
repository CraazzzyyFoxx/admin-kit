// @vitest-environment happy-dom
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SaveBar } from "./SaveBar.js";

const bar = (props: Partial<React.ComponentProps<typeof SaveBar>> = {}) => (
  <SaveBar dirty summary="3 changes" onDiscard={() => {}} onSave={() => {}} {...props} />
);

describe("SaveBar", () => {
  it("reports whether leaving would lose edits, and false when it unmounts", () => {
    const onDirtyChange = vi.fn();
    const { rerender, unmount } = render(bar({ onDirtyChange }));
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);

    // A create form has work to offer (`dirty`) but nothing to lose until edited.
    rerender(bar({ onDirtyChange, edited: false }));
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);

    rerender(bar({ onDirtyChange, edited: true }));
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);

    unmount();
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it("asks before an in-app link leaves a dirty form, unless guardNavigation is off", () => {
    const link = () => (
      <a href="/elsewhere" onClick={(event) => event.preventDefault()}>
        elsewhere
      </a>
    );
    const { rerender } = render(
      <>
        {link()}
        {bar()}
      </>
    );
    act(() => {
      fireEvent.click(screen.getByText("elsewhere"));
    });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    rerender(
      <>
        {link()}
        {bar({ guardNavigation: false })}
      </>
    );
    // The open prompt belongs to the earlier click; dismiss it, then click again.
    act(() => {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    });
    expect(screen.queryByRole("alertdialog")).toBeNull();
    act(() => {
      fireEvent.click(screen.getByText("elsewhere"));
    });
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
