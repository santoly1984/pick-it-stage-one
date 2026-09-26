import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { PublicEntry } from "@/types";
import { usePlayEntry } from "@/hooks/usePlayEntry";

export function EntryCard({ entry, queue }: { entry: PublicEntry; queue?: string[] }) {
  const play = usePlayEntry();
  return (
    <div className="w-40 shrink-0">
      <div className="relative">
        <Link to="/artist/$id" params={{ id: entry.id }}>
          <img
            src={entry.coverUrl}
            alt={`${entry.artistName} 커버`}
            loading="lazy"
            width={160}
            height={160}
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </Link>
        <button
          type="button"
          aria-label={`${entry.artistName} 재생`}
          onClick={() => play(entry.id, queue)}
          className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <Play className="size-4" />
        </button>
      </div>
      <p className="mt-2 truncate text-sm font-semibold">{entry.artistName}</p>
      <p className="truncate text-xs text-muted-foreground">{entry.tagline}</p>
    </div>
  );
}
