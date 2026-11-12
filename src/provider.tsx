"use client";

import { createContext, useContext, type ReactNode } from "react";

/** What the kit shows for a failed request: a toast's text, and the status and request id under a load error. */
export interface ErrorDescription {
  message: string;
  status?: number;
  requestId?: string;
}

export interface AdminKitConfig {
  /** Turns anything a request can throw into what the kit shows. Default: the `Error`'s message. */
  describeError?: (error: unknown) => ErrorDescription;
}

const defaultDescribeError = (error: unknown): ErrorDescription => ({
  message: error instanceof Error ? error.message : String(error)
});

const AdminKitContext = createContext<Required<AdminKitConfig>>({
  describeError: defaultDescribeError
});

/** The app's hooks into the kit; without it the kit falls back to plain error messages. */
export function AdminKitProvider({
  describeError = defaultDescribeError,
  children
}: Readonly<AdminKitConfig & { children: ReactNode }>) {
  return <AdminKitContext.Provider value={{ describeError }}>{children}</AdminKitContext.Provider>;
}

export const useDescribeError = () => useContext(AdminKitContext).describeError;
