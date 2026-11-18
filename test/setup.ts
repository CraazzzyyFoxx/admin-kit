import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { act, createElement, type ComponentProps } from "react";
import type * as ReactDomClient from "react-dom/client";
import type { Root } from "react-dom/client";
import type * as UseIntl from "use-intl";
import { afterEach, vi } from "vitest";

import { en } from "../src/messages/index.js";

// Outside a provider `useTranslations` falls back to the kit's English messages instead of
// throwing, so a suite can render a component bare; inside one (or under a file's own
// `vi.mock("use-intl")`) nothing changes. One translator per namespace: a fresh function every
// render would change the identity of `t` and re-fire every effect and memo that depends on it.
vi.mock("use-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof UseIntl>();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fallbacks = new Map<string, ReturnType<typeof actual.createTranslator>>();
  const fallback = (namespace?: string) => {
    const key = namespace ?? "";
    let translator = fallbacks.get(key);
    if (!translator) {
      translator = actual.createTranslator({
        locale: "en",
        messages: en,
        namespace: namespace as never,
        timeZone
      });
      fallbacks.set(key, translator);
    }
    return translator;
  };
  return {
    ...actual,
    IntlProvider: (props: ComponentProps<typeof actual.IntlProvider>) =>
      createElement(actual.IntlProvider, { timeZone, ...props }),
    useTranslations: ((namespace?: string) => {
      try {
        return actual.useTranslations(namespace as never);
      } catch {
        return fallback(namespace);
      }
    }) as typeof actual.useTranslations
  };
});

if (typeof window !== "undefined") {
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }) as unknown as MediaQueryList;
  // Radix (Select) calls these on pointerdown.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
}

// Suites that mount with `createRoot` themselves are unmounted after each test, as Testing
// Library's cleanup does for its own: a leftover root keeps its queries subscribed and re-renders
// outside `act` when an answer lands after its test.
const mountedRoots = vi.hoisted(() => new Set<Root>());
vi.mock("react-dom/client", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactDomClient>();
  const track = <R extends Root>(root: R): R => {
    mountedRoots.add(root);
    return root;
  };
  return {
    ...actual,
    createRoot: ((...args) => track(actual.createRoot(...args))) as typeof actual.createRoot,
    hydrateRoot: ((...args) => track(actual.hydrateRoot(...args))) as typeof actual.hydrateRoot
  };
});

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

afterEach(() => {
  cleanup();
  if (mountedRoots.size > 0) {
    const actEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    try {
      act(() => {
        for (const root of mountedRoots) root.unmount();
      });
    } finally {
      mountedRoots.clear();
      globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    }
  }
  window.localStorage.clear();
  vi.restoreAllMocks();
});
