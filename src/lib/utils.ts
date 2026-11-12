import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The type-role utilities (`@theme` in globals.css). Without this, tailwind-merge files
// `text-label` under text-COLOR and a later `text-[color:…]` or `text-muted-foreground` deletes it.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["label", "caption", "body", "heading", "title"] }],
      tracking: [{ tracking: ["label"] }]
    }
  }
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
