"use client";

import { useTranslations } from "next-intl";

import { useDescribeError } from "../provider.js";
import { CopyButton } from "./Clipboard.js";

/**
 * "HTTP 500 · Request ID 3f2a…" with a copy button, for any failed read. Renders nothing for an
 * error that carries neither (an exception thrown in render has no request).
 */
export function ErrorDetails({ error }: Readonly<{ error: unknown }>) {
  const t = useTranslations("adminKit.errors");
  const { status, requestId } = useDescribeError()(error);
  if (!status && !requestId) return null;
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-muted-foreground">
      {status ? <span>{t("status", { status })}</span> : null}
      {requestId ? (
        <span className="inline-flex items-center gap-0.5">
          {t("requestId")}: <code className="font-mono break-all">{requestId}</code>
          <CopyButton value={requestId} />
        </span>
      ) : null}
    </p>
  );
}
