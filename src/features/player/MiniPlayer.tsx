import { Link, useLocation } from "@tanstack/react-router";
import { Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "./PlayerProvider";
import { cn } from "@/lib/utils";

export function MiniPlayer() {
  const { current, isPlaying, toggle, next, currentTime, duration, error, suspended } = usePlayer();
  const { pathname } = useLocation();

  if (!current || pathname === "/player") return null;

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const showsNav = ["/home", "/ranking", "/community", "/player"].some((p) => pathname.startsWith(p));

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-40 mx-auto max-w-2xl px-3",
        showsNav ? "bottom-[4.5rem]" : "bottom-3",
      )}
    >
      <div className="panel flex items-center gap-3 overflow-hidden p-2 pr-3 shadow-lg">
        <Link to="/player" className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src={current.coverUrl}
            alt=""
            loading="lazy"
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{current.title}</p>
            <p className={cn("truncate text-xs", error ? "text-destructive" : "text-muted-foreground")}>
              {error ?? (suspended ? "영상 재생 중 · 일시정지됨" : current.artistName)}
            </p>
          </div>
        </Link>
        <button type="button" onClick={toggle} aria-label={isPlaying ? "일시정지" : "재생"} className="p-2">
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <button type="button" onClick={next} aria-label="다음 곡" className="p-2">
          <SkipForward className="size-5" />
        </button>
      </div>
      <div className="mx-2 h-0.5 rounded-full bg-border">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
