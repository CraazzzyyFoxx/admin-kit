import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The type-role vocabulary an app names its sizes from (`@theme`: `--text-label` … `--text-figure`)
// and the theme's head voice (`styles.css`). Without this, tailwind-merge files `text-ui` under
// text-COLOR: an app's `text-ui` deletes a primitive's `text-primary-foreground` and keeps its
// `text-sm` beside it, and keeps `font-medium` beside `font-admin-head`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["label", "caption", "body", "ui", "reading", "heading", "title", "headline", "display", "figure"] }
      ],
      "font-weight": [{ font: ["admin-head"] }],
      "font-family": [{ font: ["admin-data"] }],
      tracking: [{ tracking: ["label", "admin-head"] }],
      "text-transform": ["admin-head-case"]
    }
  }
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
