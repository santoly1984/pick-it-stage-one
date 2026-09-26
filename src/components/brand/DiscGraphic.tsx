import { cn } from "@/lib/utils";

/** Flat stage/record graphic (magenta → violet), replaces photo heroes. Uses tokens only. */
export function DiscGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden className={cn("w-full", className)}>
      <circle cx="210" cy="120" r="92" fill="var(--color-violet)" />
      <circle cx="210" cy="120" r="70" fill="none" stroke="var(--color-background)" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="210" cy="120" r="48" fill="none" stroke="var(--color-background)" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="210" cy="120" r="22" fill="var(--color-accent)" />
      <circle cx="210" cy="120" r="5" fill="var(--color-background)" />
      <circle cx="96" cy="150" r="46" fill="var(--color-accent)" fillOpacity="0.85" />
      <circle cx="96" cy="150" r="10" fill="var(--color-background)" fillOpacity="0.6" />
    </svg>
  );
}
