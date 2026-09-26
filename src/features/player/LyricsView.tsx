/** Timestamp-driven line highlight with auto scroll. */
import { useEffect, useMemo, useRef } from "react";
import type { LyricLine } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  lines: LyricLine[];
  currentTime: number;
  onSeek?: (sec: number) => void;
  className?: string;
}

export function LyricsView({ lines, currentTime, onSeek, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const activeIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < lines.length; i += 1) {
      if (currentTime >= lines[i].startSec) idx = i;
      else break;
    }
    return idx;
  }, [lines, currentTime]);

  useEffect(() => {
    const el = activeRef.current;
    const box = containerRef.current;
    if (!el || !box) return;
    const offset = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
    box.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
  }, [activeIndex]);

  if (!lines.length) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        아직 싱크된 가사가 없습니다. 관리자가 가사를 등록하면 여기에 표시됩니다.
      </p>
    );
  }

  return (
    <div ref={containerRef} className={cn("max-h-72 overflow-y-auto pr-1", className)}>
      <div className="flex flex-col gap-3 py-4">
        {lines.map((line, i) => (
          <button
            key={line.id}
            ref={i === activeIndex ? activeRef : undefined}
            type="button"
            onClick={() => onSeek?.(line.startSec)}
            className={cn(
              "text-left text-base leading-relaxed transition-colors",
              i === activeIndex ? "lyric-active" : "lyric-idle",
            )}
          >
            {line.text}
          </button>
        ))}
      </div>
    </div>
  );
}
