/**
 * Tone vocabulary for tinted status surfaces, on the shadcn theme tokens.
 *
 * One tint for every chip, alert and "chosen" state: a 32% rim and a 12% wash
 * of `--tone-hue`, the text in the hue itself. Index these maps instead of
 * re-typing the classes.
 */
export type Tone = "neutral" | "accent" | "success" | "warning" | "info" | "danger";

/** The tint over `--tone-hue`. A hue no `Tone` names (a lifecycle status) sets the variable itself. */
export const TONE_TINT =
  "border-[color:color-mix(in_srgb,var(--tone-hue)_32%,transparent)] bg-[color:color-mix(in_srgb,var(--tone-hue)_12%,transparent)] text-[color:var(--tone-hue)]";

/** `--tone-hue` per tone, for a surface that spends the hue its own way (a toast's rim and icon, an active tab's count). */
export const TONE_HUE: Record<Tone, string> = {
  neutral: "[--tone-hue:--theme(--color-muted-foreground)]",
  accent: "[--tone-hue:--theme(--color-primary)]",
  success: "[--tone-hue:--theme(--color-success)]",
  warning: "[--tone-hue:--theme(--color-warning)]",
  info: "[--tone-hue:--theme(--color-info)]",
  danger: "[--tone-hue:--theme(--color-destructive)]"
};

/** Tinted surface: border colour + wash + readable text. The caller adds `border`. */
export const TONE_CLASS: Record<Tone, string> = {
  neutral: `${TONE_TINT} ${TONE_HUE.neutral}`,
  accent: `${TONE_TINT} ${TONE_HUE.accent}`,
  success: `${TONE_TINT} ${TONE_HUE.success}`,
  warning: `${TONE_TINT} ${TONE_HUE.warning}`,
  info: `${TONE_TINT} ${TONE_HUE.info}`,
  danger: `${TONE_TINT} ${TONE_HUE.danger}`
};

/** Text-only tone, for icons and inline labels on an untinted surface. */
export const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-[color:--theme(--color-muted-foreground)]",
  accent: "text-[color:--theme(--color-primary)]",
  success: "text-[color:--theme(--color-success)]",
  warning: "text-[color:--theme(--color-warning)]",
  info: "text-[color:--theme(--color-info)]",
  danger: "text-[color:--theme(--color-destructive)]"
};
