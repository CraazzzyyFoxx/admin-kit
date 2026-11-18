"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import type { AdminKitAdapter } from "./provider.js";

/**
 * Next's router and next-intl for the kit: `<AdminKitProvider adapter={nextAdapter}>`.
 * Each is read at call time, not here: a suite's `vi.mock("next/navigation")` that returns only
 * the hooks it needs must not fail the import of every kit module.
 */
export const nextAdapter: AdminKitAdapter = {
  usePathname: () => usePathname(),
  useSearchParams: () => useSearchParams(),
  useRouter: () => useRouter(),
  Link: (props) => <Link {...props} />,
  useTranslations: ((namespace?: string) => useTranslations(namespace as never)) as typeof useTranslations
};
