import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { RankingEntry } from "@/types";
import { RankChange } from "./RankChange";
import { usePlayEntry } from "@/hooks/usePlayEntry";
import { cn } from "@/lib/utils";

/**
 * PUBLIC ranking list. Renders rank / previousRank / change only.
 * Never add score fields here.
 */
export function RankingList({ entries, className }: { entries: RankingEntry[]; className?: string }) {
  const play = usePlayEntry();
  const queue = entries.map((e) => e.entryId);

  return (
    <ul className={cn("divide-y divide-border", className)}>
      {entries.map((e) => (
        <li key={e.entryId} className="grid grid-cols-[2.25rem_auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums leading-none">{e.rank}</p>
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
            <p className="truncate text-sm font-semibold">{e.artistName}</p>
            <p className="truncate text-xs text-muted-foreground">{e.branch}</p>
          </Link>
          <button
            type="button"
            aria-label={`${e.artistName} 재생`}
            onClick={() => play(e.entryId, queue)}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border"
          >
            <Play className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
