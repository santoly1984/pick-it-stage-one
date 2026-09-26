import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";
import type { RankChange as RankChangeKind } from "@/types";
import { cn } from "@/lib/utils";

export function RankChange({
  change,
  rank,
  previousRank,
  className,
}: {
  change: RankChangeKind;
  rank: number;
  previousRank: number | null;
  className?: string;
}) {
  const diff = previousRank == null ? null : Math.abs(previousRank - rank);

  if (change === "new") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-accent", className)}>
        <Sparkles className="size-3" /> NEW
      </span>
    );
  }
  if (change === "flat") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-flat", className)}>
        <Minus className="size-3" /> —
      </span>
    );
  }
  const Icon = change === "up" ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs tabular-nums", change === "up" ? "text-up" : "text-down", className)}
    >
      <Icon className="size-3" />
      {diff}
    </span>
  );
}

export function UpdatedAt({ iso, className }: { iso: string; className?: string }) {
  const d = new Date(iso);
  const text = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return <span className={cn("text-xs text-muted-foreground", className)}>{text} 기준</span>;
}
