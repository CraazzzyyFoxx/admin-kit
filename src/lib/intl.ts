"use client";

import type { useTranslations as UseTranslations } from "use-intl";

import { useAdapter } from "../provider.js";

/** The app's translator, from the provider's adapter. */
export const useTranslations = ((namespace?: string) =>
  useAdapter().useTranslations(namespace as never)) as typeof UseTranslations;
