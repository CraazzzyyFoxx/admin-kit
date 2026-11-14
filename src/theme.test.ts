import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cn } from "./lib/utils";

const SRC = import.meta.dirname;
const THEME_CLASS = /(?<![\w-])(?:bg|border|text|font|tracking)-admin(?:-[a-z]+)*(?![\w-])|(?<![\w-])admin-head-case(?![\w-])/g;

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.includes(".test.") ? [path] : [];
  });
}

describe("theme utilities", () => {
  it("every --admin-* class a component uses is defined in styles.css", () => {
    const defined = new Set(
      [...readFileSync(join(SRC, "styles.css"), "utf8").matchAll(/@utility ([\w-]+)/g)].map((m) => m[1])
    );
    const used = new Set(sources(SRC).flatMap((file) => readFileSync(file, "utf8").match(THEME_CLASS) ?? []));
    expect(used.size).toBeGreaterThan(0);
    expect([...used].filter((name) => !defined.has(name))).toEqual([]);
  });

  it("the head voice replaces a primitive's own weight, tracking and case", () => {
    expect(
      cn("font-medium tracking-label uppercase", "font-admin-head tracking-admin-head admin-head-case").split(" ")
    ).toEqual(["font-admin-head", "tracking-admin-head", "admin-head-case"]);
  });
});
