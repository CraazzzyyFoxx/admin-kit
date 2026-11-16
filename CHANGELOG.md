# Changelog

## 0.4.0

- `Card` takes `variant="panel"`: flush (no `py-5`, no `gap-5`), clipping, the same
  `PANEL_CONTENT_CLASS` as `DialogContent variant="panel"`. For a card that is a work surface made
  of its own ruled regions, which each pad themselves; the default's padding stacked on theirs.

## 0.3.1

- `TooltipContent` opens on the shared floating panel (`floatingPanelClass`: `bg-popover`, border,
  shadow) like every other overlay, instead of shadcn's inverted `bg-foreground`, which painted a
  white tooltip on a dark theme. The arrow goes with it; `sideOffset` defaults to 4. `IconTooltip`'s
  hint line moves from `text-background/70` to `text-muted-foreground` to stay readable on the panel.

## 0.3.0

- Theming: `--admin-*` variables recolour the table (surface, rules, header, row hover and
  selection), the eyebrow tones, filter-chip counts, the search icon, `Input` and `Checkbox`,
  and set the column heads' weight, case, tracking and the label font. Unset, every one falls
  back to the shadcn token it used before, so nothing changes until an app sets them. README
  "Theming" lists them.
- `styles.css` adds the matching utilities (`bg-admin-surface`, `border-admin`,
  `border-admin-row`, `text-admin-{head,muted,dim,faint}`, `font-admin-{head,data}`,
  `tracking-admin-head`, `admin-head-case`, `bg-admin-control`, `border-admin-control`,
  `bg-admin-chip`); `cn` merges the type ones against `font-*`, `tracking-*` and case classes.

## 0.2.0

- Rows per page moved from the table footer into the View menu, as a radio list: "Auto · N"
  shows how many rows the fit gives. The footer keeps the range, the summary and the pager, at
  a fixed height.
- The pick is remembered per screen (localStorage, under the table's preferences key);
  `?per_page=` in a link still wins.
- Default `pageSizeOptions` are 10, 25, 50, 100 (15 is gone from the list; it stays the size of a
  phone's card list).

## 0.1.0

First release: dudeduck's admin `DataTable` (with the reworked pagination), kit and the shadcn
primitives they use, moved out of the app.

- Colours only through Tailwind's theme (`--color-*` read as utilities or `--theme()`, never
  `var(--color-*)`), so the kit renders in apps whose tokens are oklch values or HSL triplets,
  with the theme class on `<html>` or `<body>` alike.
- `host.ts` is gone: routing comes from `next/*`, error text from `AdminKitProvider`'s
  `describeError`.
- Strings live under the `adminKit` namespace (`@craazzzyyfoxx/admin-kit/messages`, en and ru).
- overwatch-tournaments' behavior tests run here, on happy-dom.
- Primitives cover overwatch-tournaments' API too: `button` variants `accent`, `positive`, `dashed`,
  `ghost-destructive`, sizes `inline`, `label`, `icon-toolbar`, `type="button"` by default and
  `selectTriggerClass(size, variant)`; `card`/`card` title `asChild`; `table` `wrapperClassName`;
  `popover` `animate` and `PopoverClose`; `select`/`combobox` `variant="surface"`; `input` `size` and
  `controlSurfaceClass`; `dialog` `variant="panel"` with the sheet's shared exports and a translated
  close label; `skeleton` `variant="text"`; `icon-tooltip` without children; `SaveBar`
  `guardNavigation` and `onDirtyChange`.
