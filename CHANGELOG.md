# Changelog

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
