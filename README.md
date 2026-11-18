# @craazzzyyfoxx/admin-kit

The admin list table, its pagination and the form kit shared by
[dudeduck](https://github.com/CraazzzyyFoxx/dudeduck),
[overwatch-tournaments](https://github.com/CraazzzyyFoxx/overwatch-tournaments) (Next.js 16) and
pm-document-rag (Vite): React 19, Tailwind 4, shadcn/ui (`new-york`), use-intl 4.

## Setup

```sh
npm i @craazzzyyfoxx/admin-kit
```

Peer dependencies the app already has: `react`, `react-dom`, `use-intl` (next-intl brings it),
`@tanstack/react-query`, `@tanstack/react-table`, `radix-ui`, `lucide-react`, `sonner`; `next` and
`next-intl` only for the `/next` adapter.

**Styles.** In `globals.css`, right after Tailwind and before the app's own `@theme`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@craazzzyyfoxx/admin-kit/styles.css";
```

It points Tailwind at the kit's files and adds `text-label` / `text-caption` / `text-body`,
`shadow-surface` and the `--admin-row-tint` property. The app's `@theme` overrides any of them.
An app's own type sizes take their names from one vocabulary, `text-label`, `caption`, `body`,
`ui`, `reading`, `heading`, `title`, `headline`, `display`, `figure`: the kit's `cn` files those
as font sizes, so a `className="text-ui"` passed to a kit component replaces its size. Any other
`text-<name>` reads as a colour and replaces the component's text colour instead.
The kit colours only through Tailwind's theme: shadcn's tokens as `--color-*` (`--color-card`,
`--color-primary`, …) plus `--color-success`, `--color-warning`, `--color-info` and
`--color-danger`, in whatever colour format the app uses. It reads them as utilities
(`bg-card`) or `--theme(--color-*)`, which Tailwind inlines as the app's own value, never as
`var(--color-*)`: that takes the value computed on `<html>`, so a `.dark` on `<body>` would miss it.

**Theming.** Out of the box the kit wears the shadcn tokens above. An app that wants its own look
for the kit's primitives, table, filters and fields sets `--admin-*` variables; each one left unset keeps the
default in the table. Any colour format works. Set them on the element that carries the theme
class (`.dark`), or on `:root` when the theme lives there: a variable resolves where it is
declared, so `hsl(var(--card))` declared on `:root` reads `:root`'s `--card`.

```css
.dark {
  --admin-surface: color-mix(in srgb, hsl(var(--card)) 50%, hsl(var(--background)));
  --admin-row-border: transparent;
  --admin-head-case: uppercase;
}
```

| Variable | Paints | Default |
| --- | --- | --- |
| `--admin-surface` | the framed table's card and its pinned cells | `--color-card` |
| `--admin-border` | the frame, toolbar, header and footer rules | `--color-border` |
| `--admin-row-border` | the rules between rows | `--color-border` at 70% |
| `--admin-head-bg` | header cells (opaque: the header sticks over the rows) | `--color-muted` 45% over the surface |
| `--admin-row-hover` | a hovered row | `--color-muted` |
| `--admin-row-selected` | a selected row | `--color-primary` at 8% |
| `--admin-head-fg` | column heads | `--color-muted-foreground` |
| `--admin-lead-fg` | a body row's first cell (an id column reads quieter; a name column sets the foreground) | `--color-muted-foreground` |
| `--admin-fg-muted`, `--admin-fg-dim`, `--admin-fg-faint` | the eyebrow's `muted`/`dim`/`faint` tones; footer text (dim); the search icon and an idle chip's count (faint) | `--color-muted-foreground` |
| `--admin-control-bg`, `--admin-control-border` | `Input` (and the `surface` select/combobox trigger), `Checkbox`; the border also rims an `outline` or `dashed` button, a select-like trigger and the floating panel | transparent (`--color-input` at 30% under `dark:`), `--color-input` |
| `--admin-chip-bg` | an idle filter chip's count | `--color-accent` |
| `--admin-head-weight`, `--admin-head-case`, `--admin-head-tracking` | column heads' weight, `text-transform`, `letter-spacing` | `500`, `none`, `normal` |
| `--admin-data-font` | `font-family` of eyebrows, column heads and chip counts | inherited |
| `--admin-raised`, `--admin-raised-hover` | the raised surface: an `outline` button and a select-like trigger at rest, a ghost button under the pointer, a skeleton; the same under the pointer, and the cursor row of a menu, select or command list | `--color-accent` |
| `--admin-control-border-hover` | an `outline` button or trigger's border under the pointer and while its panel is open | `--color-input` |
| `--admin-panel` | the floating panel of popovers, menus, select and combobox lists, tooltips | `--color-popover` |
| `--admin-separator` | the hairline between a menu's or list's groups | `--color-border` |
| `--admin-edge` | the 1px light along the top edge of a raised surface (outline button, floating panel, modal) | none |
| `--admin-sheen` | the same light on a filled button | white at 18% |

The framed table's shadow is `shadow-surface`, shared with `Card`: `--shadow-surface: none` in the
app's `@theme` flattens both. The same roles exist as utilities (`bg-admin-surface`,
`border-admin`, `text-admin-dim`, …) for an app's own surfaces to match.

**Messages.** The kit's strings sit under `adminKit`; merge them into the app's next-intl messages,
or, without next-intl, give them to use-intl's `<IntlProvider locale messages>`:

```ts
import { en, ru } from "@craazzzyyfoxx/admin-kit/messages";

const messages = { ...appMessages[locale], ...{ en, ru }[locale] };
```

**Provider.** Optional: without it a failed request shows the `Error`'s message, and the kit runs
on `browserAdapter`: the History API (a change is announced as `popstate`), a plain `<a>` and
use-intl's `useTranslations`. A Next app passes Next's router and next-intl:

```tsx
import { AdminKitProvider } from "@craazzzyyfoxx/admin-kit/provider";
import { nextAdapter } from "@craazzzyyfoxx/admin-kit/next";

<AdminKitProvider adapter={nextAdapter} describeError={(error) => ({ message, status, requestId })}>
  {children}
</AdminKitProvider>
```

Another router supplies its own `AdminKitAdapter` (`usePathname`, `useSearchParams`, `useRouter`,
`Link`, `useTranslations`): a module constant, because the kit calls its hooks as hooks.

**Vitest.** In a Next app inline the package (`test.server.deps.inline: ["@craazzzyyfoxx/admin-kit"]`):
`/next` imports `next/navigation` and `next/link`, which Node cannot resolve on its own. Suites that
render the kit bare and mock `next/navigation` or `next-intl` make `nextAdapter` the default in
their setup file:

```ts
vi.mock("@craazzzyyfoxx/admin-kit/provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@craazzzyyfoxx/admin-kit/provider")>();
  const { nextAdapter } = await import("@craazzzyyfoxx/admin-kit/next");
  return { ...actual, useAdapter: () => nextAdapter };
});
```

## Imports

| Path | Holds |
| --- | --- |
| `@craazzzyyfoxx/admin-kit/data-table` | `DataTable`, `columnMeta`, `createKebabColumn`, filters, types (and `/data-table/<file>` for the rest) |
| `@craazzzyyfoxx/admin-kit/kit/<name>` | `ConfirmDialog`, `EntityFormDialog`, `EmptyNote` (`LoadErrorNote`), `ErrorDetails`, `Clipboard`, `FilterBar`, `useFilters`, `ServerSearchCombobox`, `useSearchComboboxQuery`, `useUnsavedGuard`, `SaveBar` (`guardNavigation`, `onDirtyChange`) |
| `@craazzzyyfoxx/admin-kit/ui/<name>` | The primitives the kit is built from, on shadcn's API (`button`, `select`, `dialog`, `popover`, `tooltip`, `table`, …) plus `data-pagination` and `infinite-scroll`. An app imports these instead of keeping its own copies, and themes them through `--admin-*`. `button` also has the `accent`, `positive`, `dashed` and `ghost-destructive` variants and the `inline`, `label` and `icon-toolbar` sizes; a disabled button keeps its pointer events, so a tooltip can say why; `card` is a bare surface (its header, content and footer pad themselves; the title uses the app's `text-heading`), and it and its title take `asChild`; `table` a `wrapperClassName`; `popover` `animate` and `PopoverClose`; `select`/`combobox` a `variant` (`surface`); `input` a `size` and `controlSurfaceClass`; `dialog` a `panel` variant plus `MODAL_SURFACE_CLASS`, `PANEL_CONTENT_CLASS` and `ModalCloseButton` for a sheet; `skeleton` a `text` variant; `spinner` a `label` that announces it (decorative without one); `tooltip` `TOOLTIP_DELAY`. |
| `@craazzzyyfoxx/admin-kit/provider` | `AdminKitProvider`, `useDescribeError`, `useAdapter`, `browserAdapter`, `AdminKitAdapter` |
| `@craazzzyyfoxx/admin-kit/next` | `nextAdapter` |
| `@craazzzyyfoxx/admin-kit/messages` | `en`, `ru` |
| `@craazzzyyfoxx/admin-kit/styles.css` | See Setup |

## DataTable

- **Two data modes.** Server (`queryKey`/`queryFn`, one page per request) or client (`rows`,
  everything in memory: search, sort, filters and paging run locally).
- **URL is the state.** Page, search, page size, sort and column filters are mirrored into the
  query string and restored from it; back/forward works. `urlState="docs"` puts them under
  `docs.page`, `docs.sort`, … so two tables on one screen keep apart; `urlState={false}` keeps
  them in the component (and drops saved views, which are URLs).
- **Rows per page.** In the View menu: "Auto · N" (a `pages` table without `initialPageSize` fits
  its page to the viewport) and `pageSizeOptions` (default 10, 25, 50, 100). The pick is
  remembered per screen in localStorage; a link's `?per_page=` wins over it.
- **One section of a page.** `fillViewport={false}`: the table is as tall as its rows instead of
  taking the viewport's height, and offers no "Auto" page size.
- **Paging.** Seven fixed page slots (the arrows never move), a "…" that opens a jump-to-page
  field, `‹ Page [n] of N ›` on phones. `[` / `]` page, Shift+`[` / `]` go to the ends (physical
  keys); the reader turns them off in the View menu, a screen turns them off with
  `pageHotkeys={false}` or rebinds them. A loading page dims its rows, the next page is
  prefetched, and a new page starts at the table's top.
- **Selection.** Checkbox column with paint-select, Shift/Ctrl ranges, keyboard selection;
  server-mode selection survives paging; `bulkActions` in a floating bar with "Select all N".
- **Columns.** Persisted visibility (`columnsStorageKey`), drag to reorder, drag to resize,
  `meta`: `sticky`, `align`, `valign`, `ellipsis`, `nowrap`, `className`, `headerTooltip`,
  `onCell`, `filter`, `searchValue`.
- **Rendering.** Sticky header in its own scroll box, virtualised body past 100 rows, grouped
  rows (`groupRows`, `groupBy`, `groupsCollapsed`), expandable details, density, cards below `md`
  (`renderMobileCard`), search highlighting, `summary`, `framed={false}` inside another card.
- **Row actions.** `createKebabColumn`, mirrored in the right-click / long-press menu.
- **Toolbar.** Search and the screen's `FilterBar` (`toolbar`); one "View" menu (CSV, density,
  page shortcuts, rows per page, sort for cards, grouping, saved views, columns); the screen's
  `commands`. The footer holds only the range ("1–15 of 1 860"), `summary` and the pager.

Props are documented on `DataTableProps` in `src/data-table/types.ts`.

## Development

```sh
npm ci
npm test          # vitest, happy-dom
npm run typecheck
npm run build     # tsc file by file into dist/: "use client" stays on every module
```

Working on the kit inside an app: `npm run dev` here (`tsc --watch`), then `npm link
@craazzzyyfoxx/admin-kit` in the app (`bun link` for bun). If the app's bundler refuses the
symlink, use [`yalc`](https://github.com/wclr/yalc) (`yalc publish` here, `yalc add` there).

## Releasing

Bump `version` in `package.json`, add the entry to `CHANGELOG.md`, push a `vX.Y.Z` tag: the
`publish` workflow tests, builds and publishes to npm with provenance. Versions stay `0.x` while
the API settles; a breaking change bumps the minor.
