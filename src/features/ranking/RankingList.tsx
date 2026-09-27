import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { RankingEntry } from "@/types";
import { RankChange } from "./RankChange";
import { usePlayEntry } from "@/hooks/usePlayEntry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * PUBLIC ranking list. Shows artist, track, branch and rank movement only.
 * Never add score fields here.
 */
export function RankingList({ entries, className }: { entries: RankingEntry[]; className?: string }) {
  const play = usePlayEntry();
  const queue = entries.map((e) => e.entryId);

  return (
    <ul className={cn(className)}>
      {entries.map((e) => (
        <li id={`rank-${e.rank}`} key={e.entryId} className="grid scroll-mt-20 grid-cols-[2rem_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/50 py-2.5 last:border-0">
          <div className="text-center">
            <p className={cn("text-lg font-bold tabular-nums leading-none", e.rank <= 3 && "text-accent")}>{e.rank}</p>
            <RankChange change={e.rankChange} rank={e.rank} previousRank={e.previousRank} className="mt-1" />
          </div>
          <img
            src={e.coverUrl}
            alt=""
            loading="lazy"
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-md object-cover"
          />
          <Link to="/artist/$id" params={{ id: e.entryId }} className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{e.artistName}</p>
            <p className="truncate text-xs text-muted-foreground">{e.trackTitle} · {e.branch}</p>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${e.artistName} 재생`}
            onClick={() => play(e.entryId, queue)}
            className="size-9 shrink-0 rounded-full bg-surface-2 text-accent"
          >
            <Play className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
