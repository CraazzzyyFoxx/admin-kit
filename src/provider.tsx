"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode
} from "react";
import { useTranslations } from "use-intl";

/** What the kit shows for a failed request: a toast's text, and the status and request id under a load error. */
export interface ErrorDescription {
  message: string;
  status?: number;
  requestId?: string;
}

/** The query string as the kit reads it: `URLSearchParams`, or Next's read-only one. */
export type AdminKitSearchParams = Pick<URLSearchParams, "get" | "getAll" | "has" | "toString">;

export interface AdminKitRouter {
  push(href: string): void;
  replace(href: string, options?: { scroll?: boolean }): void;
}

/**
 * The app's router and translator, as the kit uses them. The hooks are called as hooks, so the
 * object must be the same for the app's whole life: a module constant, never built in render.
 */
export interface AdminKitAdapter {
  usePathname(): string;
  useSearchParams(): AdminKitSearchParams | null;
  useRouter(): AdminKitRouter;
  Link: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
  /** use-intl's, or next-intl's (the same function, bound to Next's provider). */
  useTranslations: typeof useTranslations;
}

export interface AdminKitConfig {
  /** Turns anything a request can throw into what the kit shows. Default: the `Error`'s message. */
  describeError?: (error: unknown) => ErrorDescription;
  /** Default: `browserAdapter`. A Next app passes `nextAdapter` from `/next`. */
  adapter?: AdminKitAdapter;
}

const defaultDescribeError = (error: unknown): ErrorDescription => ({
  message: error instanceof Error ? error.message : String(error)
});

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};

// A pushed or replaced entry announces itself as `popstate`, the one event an app without a router
// (and the kit's own tables) already listens to.
const go = (method: "pushState" | "replaceState", href: string) => {
  window.history[method](null, "", href);
  window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
};

const browserRouter: AdminKitRouter = {
  push: (href) => go("pushState", href),
  replace: (href) => go("replaceState", href)
};

/** For an app without a router: the address bar is the store, links are `<a>`, strings come from use-intl's `IntlProvider`. */
export const browserAdapter: AdminKitAdapter = {
  usePathname: () =>
    useSyncExternalStore(
      subscribe,
      () => window.location.pathname,
      () => "/"
    ),
  useSearchParams: () => {
    const search = useSyncExternalStore(
      subscribe,
      () => window.location.search,
      () => ""
    );
    return useMemo(() => new URLSearchParams(search), [search]);
  },
  useRouter: () => browserRouter,
  Link: (props) => <a {...props} />,
  useTranslations
};

const AdminKitContext = createContext<Required<AdminKitConfig>>({
  describeError: defaultDescribeError,
  adapter: browserAdapter
});

/** The app's hooks into the kit; without it the kit falls back to plain error messages and `browserAdapter`. */
export function AdminKitProvider({
  describeError = defaultDescribeError,
  adapter = browserAdapter,
  children
}: Readonly<AdminKitConfig & { children: ReactNode }>) {
  const value = useMemo(() => ({ describeError, adapter }), [describeError, adapter]);
  return <AdminKitContext.Provider value={value}>{children}</AdminKitContext.Provider>;
}

export const useDescribeError = () => useContext(AdminKitContext).describeError;
export const useAdapter = () => useContext(AdminKitContext).adapter;
