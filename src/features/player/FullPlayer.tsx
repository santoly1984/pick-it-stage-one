import { useQuery } from "@tanstack/react-query";
import { Heart, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatTime, usePlayer } from "./PlayerProvider";
import { LyricsView } from "./LyricsView";
import { lyricsService, DEFAULT_ROUND_ID } from "@/services";
import { useVoteSheet } from "@/features/voting/VoteSheetProvider";
import { useLiveRankOf } from "@/features/ranking/queries";
import { RankChange } from "@/features/ranking/RankChange";

export function FullPlayer() {
  const { current, isPlaying, isLoading, error, suspended, toggle, next, prev, seek, currentTime, duration } =
    usePlayer();
  const liveRank = useLiveRankOf(current?.entryId);
  const vote = useVoteSheet();

  const { data: lyrics } = useQuery({
    queryKey: ["lyrics", current?.trackId],
    queryFn: () => lyricsService.getLyrics(current!.trackId),
    enabled: Boolean(current?.trackId),
  });

  if (!current) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-semibold">재생 중인 무대가 없습니다</p>
        <p className="text-xs text-muted-foreground">홈이나 랭킹에서 무대를 선택해 보세요.</p>
      </div>
    );
  }

  const publishedLines = lyrics?.status === "published" ? lyrics.lines : [];

  return (
    <div className="px-5 pb-10 pt-2">
      <img
        src={current.coverUrl}
        alt=""
        loading="lazy"
        width={816}
        height={816}
        className="mx-auto aspect-square w-full max-w-sm rounded-2xl object-cover"
      />

      <div className="mt-6">
        <h2 className="truncate text-xl font-bold">{current.title}</h2>
        <p className="truncate text-sm text-muted-foreground">{current.artistName}</p>
        {liveRank && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium">
            실시간 {liveRank.rank}위
            <RankChange change={liveRank.rankChange} rank={liveRank.rank} previousRank={liveRank.previousRank} />
          </p>
        )}
        {(error || suspended || isLoading) && (
          <p className={`mt-2 text-xs ${error ? "text-destructive" : "text-muted-foreground"}`} role="status">
            {error ?? (suspended ? "인터뷰 영상 재생 중이라 음악이 일시정지됐습니다." : "불러오는 중...")}
          </p>
        )}
      </div>

      <div className="mt-5">
        <Slider
          value={[currentTime]}
          max={Math.max(duration, 1)}
          step={1}
          onValueChange={([v]) => seek(v ?? 0)}
          aria-label="재생 위치"
        />
        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-8">
        <button type="button" onClick={prev} aria-label="이전 곡">
          <SkipBack className="size-6" />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "일시정지" : "재생"}
          className="grid size-16 place-items-center rounded-full bg-primary"
        >
          {isPlaying ? <Pause className="size-7" /> : <Play className="size-7" />}
        </button>
        <button type="button" onClick={next} aria-label="다음 곡">
          <SkipForward className="size-6" />
        </button>
      </div>

      <Button
        variant="secondary"
        className="mt-6 w-full"
        size="lg"
        onClick={() => vote.open({ entryId: current.entryId, artistName: current.artistName, roundId: DEFAULT_ROUND_ID })}
      >
        <Heart className="size-4" /> 이 무대에 투표하기
      </Button>

      <section className="mt-8">
        <h3 className="text-sm font-bold">가사</h3>
        <LyricsView lines={publishedLines} currentTime={currentTime} onSeek={seek} className="mt-1" />
      </section>
    </div>
  );
}
