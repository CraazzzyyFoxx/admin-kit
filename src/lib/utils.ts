import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The type-role utilities (`@theme` in globals.css) and the theme's head voice (`styles.css`).
// Without this, tailwind-merge files `text-label` under text-COLOR and a later
// `text-[color:…]` or `text-muted-foreground` deletes it, and keeps `font-medium` beside
// `font-admin-head`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["label", "caption", "body", "heading", "title"] }],
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
