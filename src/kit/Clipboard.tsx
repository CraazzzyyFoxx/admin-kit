"use client";

import React, { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "../lib/intl.js";
import { toast } from "sonner";

import { Button } from "../ui/button.js";
import { cn } from "../lib/utils.js";

/** A 24px ghost button that copies `value`; the icon turns into a check for a moment. */
export function CopyButton({ value, className }: Readonly<{ value: string; className?: string }>) {
  const t = useTranslations("adminKit.common");
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t("copy")}
      className={cn("size-6 shrink-0 text-muted-foreground [&_svg]:size-3.5", className)}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
          setDone(true);
          toast.success(t("copied"));
          setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {done ? <Check className="text-success" /> : <Copy />}
    </Button>
  );
}

/** A credential or payout detail: masked until asked, copyable without revealing. */
export function SecretValue({ value, className }: Readonly<{ value: string; className?: string }>) {
  const t = useTranslations("adminKit.common");
  const [shown, setShown] = useState(false);
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-0.5", className)}>
      <span className="truncate font-mono text-[13px]">
        {shown ? value : "•".repeat(Math.min(Math.max(value.length, 8), 14))}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={shown ? t("hide") : t("show")}
        aria-pressed={shown}
        className="size-6 shrink-0 text-muted-foreground [&_svg]:size-3.5"
        onClick={() => setShown((s) => !s)}
      >
        {shown ? <EyeOff /> : <Eye />}
      </Button>
      <CopyButton value={value} />
    </span>
  );
}
