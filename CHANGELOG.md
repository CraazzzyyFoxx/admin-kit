# Changelog

## 0.7.0

Breaking: only `/next` imports Next. A Next app passes its router and next-intl through the
provider: `<AdminKitProvider adapter={nextAdapter}>` with `nextAdapter` from
`@craazzzyyfoxx/admin-kit/next`; its test setup makes `nextAdapter` the default (see README, Vitest).

- Why: the kit ran only under Next (`next/navigation`, `next/link`, `next-intl`), so a Vite app
  could not use it without stubbing Next.
- `AdminKitProvider` takes `adapter` (`usePathname`, `useSearchParams`, `useRouter`, `Link`,
  `useTranslations`). Without it the kit uses `browserAdapter`: the History API, announcing each
  change as `popstate`, a plain `<a>` and use-intl's `useTranslations`.
- Peers: `use-intl` (next-intl brings it); `next` and `next-intl` are optional, for `/next`.
- `DataTable` takes `urlState`: a string puts its params under `<prefix>.`, so two tables on one
  screen keep apart; `false` keeps its state out of the URL and hides saved views.
- `DataTable` takes `fillViewport={false}` for a table that is one section of a page: as tall as
  its rows, no "Auto" page size, no filling of the viewport under `paging="all"`/`"infinite"`.
- `--admin-lead-fg` paints a body row's first cell, muted as before: an app whose first column is
  the row's name sets it to its foreground.

## 0.6.1

- `DataTable` with `paging="all"` or `"infinite"` fills the viewport on desktop like an Auto-paged
  one: a search down to a few rows no longer leaves the card, and an inspector stretched beside it,
  ending halfway down the screen. Row fitting stays Auto-only (`useTableScrollBox` takes `fit`
  apart from `fill`).

## 0.6.0

Breaking: the primitives keep the geometry and behaviour of the app they were extracted from, and
take their colours from `--admin-*` roles. An app that imported them as stock shadcn sees them change.

- Why: the primitives were stock shadcn with the variant and size NAMES an app's code calls, but
  shadcn's VALUES. Every call site compiled and silently changed look: `size="icon-xs"` went from a
  20px box with a 14px glyph to 24px with 12px, an `outline` button lost its raised surface, menus
  gained a drop shadow, dialogs a black scrim.
- `button`: `rounded-lg`, a 2px offset focus ring, semibold filled variants with a top sheen that
  brighten under the pointer, the raised `outline` surface. A disabled button keeps its pointer
  events (a tooltip can still say why); each variant resets its own hover instead. `sm` is 13px,
  `icon-sm` 28px with a 14px glyph, `icon-xs` 20px with a 14px glyph, `xs` and `icon-xs` take the
  label size.
- An unsized icon inside a control is sized by `[&_:where(svg:not([class*=size-]))]` (specificity
  0,1,0): an icon's own `size-*` keeps its size, and a caller's `[&_svg]:size-5` now wins.
- `input`: `rounded-lg`, 40px below `sm`. `select`: the trigger's `size` reaches the list rows.
  `checkbox`: indeterminate draws a dash. `skeleton`: the raised fill. `table`: cells in
  `text-caption`, heads in the eyebrow voice, wrapping allowed.
- Overlays (`popover`, menus, select and combobox lists, `tooltip`): one floating panel, 10px radius,
  the control border, a 1px top light, no drop shadow. `tooltip` opens after `TOOLTIP_DELAY`
  (150ms) instead of at once. Menu labels speak in the eyebrow voice; radio items show a check.
- `dialog`/`alert-dialog`: the page colour at 80% as the scrim, the card fill, no drop shadow, fade
  only; a 28px close button; titles `text-heading`, descriptions `text-body`.
  `MODAL_SURFACE_CLASS` no longer sets a border width, so a sheet's one-sided border stays one-sided;
  `MODAL_OVERLAY_CLASS`, `MODAL_CONTENT_CLASS`, `MODAL_HEADER_CLASS`, `MODAL_TITLE_CLASS` and
  `MODAL_DESCRIPTION_CLASS` are exported.
- `spinner` is decorative unless given a `label`, which renders a `role="status"` with that text. A
  bare `<Spinner />` used to announce "Loading": pass `label` where it is the only loading cue.
- `CommandDialog`'s default title and description come from the kit's messages
  (`adminKit.commandPalette`).
- `tone` and `status-dot` paint danger in `--color-danger`, not `--color-destructive`.
- New theme roles, each with a shadcn default (README "Theming"): `--admin-raised`,
  `--admin-raised-hover`, `--admin-control-border-hover`, `--admin-panel`, `--admin-separator`,
  `--admin-edge`, `--admin-sheen`.
- `cn` knows the whole type-role vocabulary (`text-ui`, `reading`, `headline`, `display`,
  `figure` joined `label` … `title`). An app's `text-ui` used to read as a text colour: it deleted a
  button's `text-primary-foreground` and kept its `text-sm` beside it.

## 0.5.0

Breaking: `Card` is a bare surface again.

- `Card` drops `flex flex-col gap-5 py-5`: fill, border, radius and `shadow-surface` only. A card
  built from its own regions (a table, a ruled list, an inspector) was getting 20px of padding and
  gap stacked on every region's own, in every app that composed cards that way.
- `CardHeader` (`p-6`, a flex column), `CardContent` and `CardFooter` (`p-6 pt-0`) pad themselves.
  `CardTitle` takes the app's `text-heading` type role.
- Removed: `Card`'s `variant="panel"` (a bare card needs no opt-out), `CardAction`, and the
  `ui/panel` module; `PanelVariant` and `PANEL_CONTENT_CLASS` live in `ui/dialog` as before 0.4.0.
- `DataTable` and `SaveBar` set the flex layout they relied on themselves.

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
