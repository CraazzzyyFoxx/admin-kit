import type { ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";

import { en } from "../src/messages/index.js";

export interface ProviderRenderResult extends RenderResult {
  queryClient: QueryClient;
}

/** Components pull `useQueryClient` and `useTranslations`; retries are off so a rejected query surfaces at once. */
export const renderWithProviders = (
  ui: ReactNode,
  options: Omit<RenderOptions, "wrapper"> & { queryClient?: QueryClient } = {}
): ProviderRenderResult => {
  const { queryClient: provided, ...renderOptions } = options;
  const queryClient =
    provided ??
    new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } }
    });
  const result = render(<>{ui}</>, {
    ...renderOptions,
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="en" messages={en}>
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    )
  });
  return { ...result, queryClient };
};
