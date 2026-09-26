import { usePlayer } from "./PlayerProvider";
import { cn } from "@/lib/utils";

/** Read-only view of the global queue; tapping a row restarts that track. */
export function QueueList() {
  const { queue, index, playAt } = usePlayer();
  if (queue.length < 2) return null;
  return (
    <section className="mt-8" aria-label="재생 목록">
      <h3 className="text-sm font-bold">
        재생 목록 <span className="font-normal text-muted-foreground">{index + 1}/{queue.length}</span>
      </h3>
      <ol className="mt-2 space-y-1">
        {queue.map((t, i) => (
          <li key={`${t.trackId}-${i}`}>
            <button
              type="button"
              onClick={() => playAt(i)}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "grid w-full grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-2 py-2 text-left text-sm",
                i === index ? "bg-surface font-semibold text-primary" : "text-muted-foreground",
              )}
            >
              <span className="tabular-nums text-xs">{i + 1}</span>
              <span className="truncate">
                {t.title} · {t.artistName}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
