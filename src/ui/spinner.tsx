import { cn } from "../lib/utils.js";
import { Loader2Icon } from "lucide-react";

type SpinnerProps = React.ComponentProps<"svg"> & {
  /**
   * Announce the wait. Pass it when the spinner is the only loading indicator of its region;
   * leave it off when visible text already says "Saving…".
   */
  label?: string;
};

/**
 * The one loading spinner. Decorative by default — an icon inside a button whose label already
 * changed to "Saving…" must not be announced twice.
 */
function Spinner({ className, label, ...props }: SpinnerProps) {
  const icon = <Loader2Icon aria-hidden className={cn("size-4 animate-spin", className)} {...props} />;

  if (!label) return icon;

  return (
    <span role="status" className="inline-flex items-center">
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
