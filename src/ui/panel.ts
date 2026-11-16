// No "use client": `Card` renders in Server Components and reads these too. Through a
// client module (`dialog`) they would arrive as a reference proxy, not a string.

/**
 * `panel` is a work surface rather than a message: flush (no padding or gap), a flex column that
 * clips, so the body runs its own scroller between a header and a footer ruled off by
 * `DialogHeader`/`DialogFooter variant="panel"`.
 */
export type PanelVariant = "default" | "panel";

export const PANEL_CONTENT_CLASS = "flex flex-col gap-0 overflow-hidden p-0";
