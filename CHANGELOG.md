# Changelog

## 0.1.0

First release: dudeduck's admin `DataTable` (with the reworked pagination), kit and the shadcn
primitives they use, moved out of the app.

- Colours only through Tailwind's `--color-*` theme variables, so the kit renders in apps whose
  tokens are oklch values or HSL triplets alike.
- `host.ts` is gone: routing comes from `next/*`, error text from `AdminKitProvider`'s
  `describeError`.
- Strings live under the `adminKit` namespace (`@craazzzyyfoxx/admin-kit/messages`, en and ru).
- overwatch-tournaments' behavior tests run here, on happy-dom.
