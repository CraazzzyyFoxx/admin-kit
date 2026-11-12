"use client";

import { type ReactNode } from "react";

import {
  useSearchComboboxQuery,
  type SearchComboboxMessages
} from "./useSearchComboboxQuery.js";
import { Combobox, ComboboxCheck } from "../ui/combobox.js";
import { CommandGroup, CommandItem } from "../ui/command.js";
import { Skeleton } from "../ui/skeleton.js";

/** Trigger props every server-searched picker forwards unchanged. */
interface ServerSearchChrome {
  /** Forwarded to the trigger so a `<Label htmlFor>` can name it. */
  id?: string;
  /** The picked item's id; `undefined` (or 0 / "") when nothing is picked. */
  value?: number | string;
  /** Trigger text for `value` until it shows up among the loaded results. */
  selectedLabel?: string;
  /** Skeleton in the trigger while the caller resolves `selectedLabel`. */
  labelLoading?: boolean;
  /** Accessible name when no `<Label htmlFor>` points at the trigger. */
  triggerAriaLabel?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  "aria-invalid"?: boolean;
  /** Merged over the trigger's classes (width). */
  triggerClassName?: string;
}

export interface ServerSearchComboboxProps<TItem> extends ServerSearchChrome {
  onSelect: (item: TItem | undefined) => void;
  /** react-query key prefix; the debounced, trimmed search term is appended. */
  queryKey: unknown[];
  fetch: (params: { query: string; signal: AbortSignal }) => Promise<TItem[]>;
  itemId: (item: TItem) => number | string;
  /** Plain-text name, shown in the trigger once the item is picked. */
  label: (item: TItem) => string;
  /** Row body; defaults to `label`. */
  renderItem?: (item: TItem) => ReactNode;
  messages: SearchComboboxMessages;
  placeholder: string;
  searchPlaceholder: string;
  /** Label of the first row, "nothing picked"; omit for no such row. */
  clearLabel?: string;
  /** Trimmed characters before the first request; the hook's default (2) when omitted. */
  minQueryLength?: number;
}

/**
 * The one server-searched picker: type two characters, get the server's
 * matches. Query plumbing comes from `useSearchComboboxQuery`, the shell from
 * `ui/combobox`; callers say what to fetch and how a row reads.
 */
export function ServerSearchCombobox<TItem>({
  id,
  value,
  selectedLabel,
  labelLoading = false,
  triggerAriaLabel,
  disabled = false,
  size,
  "aria-invalid": ariaInvalid,
  triggerClassName,
  onSelect,
  queryKey,
  fetch,
  itemId,
  label,
  renderItem,
  messages,
  placeholder,
  searchPlaceholder,
  clearLabel,
  minQueryLength
}: Readonly<ServerSearchComboboxProps<TItem>>) {
  const { open, setOpen, searchValue, setSearchValue, results, handleSelect, emptyMessage } =
    useSearchComboboxQuery<TItem, TItem>({
      queryKeyPrefix: queryKey,
      fetchResults: fetch,
      onSelect,
      messages,
      minQueryLength
    });

  const picked = value ? results.find((item) => itemId(item) === value) : undefined;
  const text = picked ? label(picked) : selectedLabel;

  return (
    <Combobox
      id={id}
      open={open}
      onOpenChange={setOpen}
      label={labelLoading ? <Skeleton className="h-4 w-32" /> : text}
      placeholder={placeholder}
      // A Skeleton cannot title the trigger; the text it stands in for can.
      labelTitle={labelLoading ? text : undefined}
      triggerAriaLabel={triggerAriaLabel}
      size={size}
      aria-invalid={ariaInvalid}
      triggerClassName={triggerClassName}
      disabled={disabled}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      // Results are already server-filtered; don't let cmdk re-filter them out.
      shouldFilter={false}
      clear={
        clearLabel
          ? { label: clearLabel, value: "__clear__", onSelect: () => handleSelect(undefined) }
          : undefined
      }
    >
      <CommandGroup>
        {results.map((item) => (
          <CommandItem
            key={itemId(item)}
            value={String(itemId(item))}
            onSelect={() => handleSelect(item)}
          >
            <span className="min-w-0 flex-1">
              {renderItem ? (
                renderItem(item)
              ) : (
                <span className="block truncate">{label(item)}</span>
              )}
            </span>
            <ComboboxCheck selected={value === itemId(item)} />
          </CommandItem>
        ))}
      </CommandGroup>
    </Combobox>
  );
}
