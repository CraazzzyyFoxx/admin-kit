"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

import { ConfirmDialog } from "./ConfirmDialog.js";
import { useUnsavedGuard } from "./useUnsavedGuard.js";
import { Button } from "../ui/button.js";
import { Card } from "../ui/card.js";
import { Spinner } from "../ui/spinner.js";

export interface SaveBarProps {
  /** The bar shows only while this is true: there is something to save. */
  dirty: boolean;
  /**
   * Whether leaving would LOSE something, arming the unsaved guard. Defaults
   * to `dirty`.
   *
   * The two differ on a create form: it always has work to offer (`dirty`),
   * but an untouched one discards nothing by being left (`edited`).
   */
  edited?: boolean;
  /** What is about to be saved: "Unsaved changes", "Review and create". */
  summary: ReactNode;
  /**
   * Why saving is refused or just failed. Takes the summary's place, in the
   * bar itself: a toast for it landed on top of this bar's Discard button.
   */
  error?: string | null;
  onDiscard: () => void;
  onSave: () => void;
  saving?: boolean;
  /** Overrides the default "Save changes"; e.g. "Create config". */
  primaryLabel?: string;
  /** Extra action before Discard, e.g. a Cancel link out of the form. */
  secondary?: ReactNode;
  /**
   * While `edited`, intercept internal link clicks anywhere in the document so leaving the page
   * goes through the discard prompt. Defaults to `true`. Pass `false` when the screen's own routed
   * sub-navigation (`?tab=`) is part of the form: those links do not unmount anything, so the
   * prompt would be a false alarm. The tab-close prompt stays armed either way.
   */
  guardNavigation?: boolean;
  /**
   * Called with whether leaving now would lose edits (`edited ?? dirty`, false while saving is not
   * considered), and with `false` when the bar unmounts. For a host that needs to know, such as a
   * page that holds back its own navigation while the form is unsaved.
   */
  onDirtyChange?: (unsaved: boolean) => void;
}

/**
 * The save affordance of a full-page form.
 *
 * Sticky at the bottom, so it is in reach however long the form is. While
 * `edited`, leaving goes through the discard prompt: it shares
 * `useUnsavedGuard` with `EntityFormDialog`, so a link click gets the prompt
 * and a reload or tab close gets the browser's own.
 */
export function SaveBar({
  dirty,
  edited,
  summary,
  error,
  onDiscard,
  onSave,
  saving = false,
  primaryLabel,
  secondary,
  guardNavigation = true,
  onDirtyChange
}: Readonly<SaveBarProps>) {
  const t = useTranslations("adminKit.saveBar");
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const handleNavigationBlocked = useCallback((href: string) => setPendingHref(href), []);

  useUnsavedGuard({
    dirty: (edited ?? dirty) && !saving,
    guardNavigation,
    onNavigationBlocked: handleNavigationBlocked
  });

  const unsaved = edited ?? dirty;
  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(unsaved);
    return () => onDirtyChange(false);
  }, [onDirtyChange, unsaved]);

  if (!dirty) return null;

  return (
    <>
      <Card
        role="region"
        aria-label={t("unsavedChanges")}
        className="sticky bottom-4 z-10 mt-4 flex-row flex-wrap items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      >
        {error ? (
          <p role="alert" className="flex min-w-0 flex-1 items-start gap-1.5 text-body text-destructive">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{error}</span>
          </p>
        ) : (
          <p className="min-w-0 flex-1 truncate text-body text-muted-foreground">{summary}</p>
        )}
        {secondary}
        <Button type="button" variant="outline" size="sm" onClick={onDiscard} disabled={saving}>
          {t("discard")}
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? <Spinner /> : null}
          {primaryLabel ?? t("save")}
        </Button>
      </Card>

      <ConfirmDialog
        open={pendingHref !== null}
        onOpenChange={(open) => (open ? undefined : setPendingHref(null))}
        intent={{
          title: t("discardTitle"),
          description: t("discardDescription"),
          confirmLabel: t("discardConfirm"),
          tone: "warning"
        }}
        onConfirm={() => {
          const href = pendingHref;
          setPendingHref(null);
          onDiscard();
          if (href) router.push(href);
        }}
      />
    </>
  );
}
