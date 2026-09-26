import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Heart, Play } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { auditionService, DEFAULT_ROUND_ID } from "@/services";
import { usePlayEntry } from "@/hooks/usePlayEntry";
import { useVoteSheet } from "@/features/voting/VoteSheetProvider";
import { InterviewVideo } from "@/features/artist/InterviewVideo";
import { CommentThread } from "@/features/community/CommentThread";
import { Button } from "@/components/ui/button";
import { useLiveRankOf } from "@/features/ranking/queries";
import { RankChange } from "@/features/ranking/RankChange";

export const Route = createFileRoute("/artist/$id/")({
  head: () => ({
    meta: [
      { title: "참가자 — PICK IT" },
      { name: "description", content: "참가자의 무대와 이야기를 듣고 투표로 응원하세요." },
      { property: "og:title", content: "참가자 — PICK IT" },
      { property: "og:description", content: "참가자의 무대와 이야기를 듣고 투표로 응원하세요." },
    ],
  }),
  component: ArtistDetail,
});

function ArtistDetail() {
  const { id } = Route.useParams();
  const play = usePlayEntry();
  const vote = useVoteSheet();
  const liveRank = useLiveRankOf(id);

  const { data: entry } = useQuery({ queryKey: ["entry", id], queryFn: () => auditionService.getEntry(id) });
  const { data: sameBranch = [] } = useQuery({
    queryKey: ["same-branch", id],
    queryFn: () => auditionService.listSameBranchEntries(id),
  });

  if (!entry) {
    return (
      <div className="min-h-screen">
        <PageHeader title="참가자" backTo="/ranking" />
        <p className="px-5 py-10 text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader title={entry.artistName} subtitle={entry.branch} backTo="/ranking" />

      <section className="px-5 py-4">
        <img
          src={entry.coverUrl}
          alt={`${entry.artistName} 커버`}
          loading="lazy"
          width={816}
          height={816}
          className="aspect-square w-full rounded-2xl object-cover"
        />
        {liveRank && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
            실시간 {liveRank.rank}위
            <RankChange change={liveRank.rankChange} rank={liveRank.rank} previousRank={liveRank.previousRank} />
          </p>
        )}
        <h2 className="mt-3 text-xl font-bold">{entry.tagline}</h2>
        <div className="accent-rule mt-3" />

        <div className="mt-5 flex gap-3">
          <Button className="flex-1" size="lg" onClick={() => play(entry.id)}>
            <Play className="size-4" /> 무대 듣기
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => vote.open({ entryId: entry.id, artistName: entry.artistName, roundId: DEFAULT_ROUND_ID })}
          >
            <Heart className="size-4" /> 투표하기
          </Button>
        </div>
      </section>

      <section className="px-5 pb-2">
        <h3 className="text-sm font-bold">참가자 스토리</h3>
        <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {entry.story}
        </p>
        <Link
          to="/artist/$id/story"
          params={{ id: entry.id }}
          className="mt-2 inline-flex items-center text-xs text-accent"
        >
          전체 스토리 보기 <ChevronRight className="size-3.5" />
        </Link>
      </section>

      {entry.interviewVideoUrl && (
        <section className="px-5 py-6">
          <h3 className="mb-2 text-sm font-bold">인터뷰 영상</h3>
          <InterviewVideo src={entry.interviewVideoUrl} poster={entry.coverUrl} />
          <p className="mt-2 text-xs text-muted-foreground">영상 재생 시 음악은 자동으로 일시정지됩니다.</p>
        </section>
      )}

      {sameBranch.length > 0 && (
        <section className="pb-6">
          <h3 className="px-5 text-sm font-bold">같은 군의 목소리</h3>
          <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
            {sameBranch.map((e) => (
              <Link key={e.id} to="/artist/$id" params={{ id: e.id }} className="w-32 shrink-0">
                <img
                  src={e.coverUrl}
                  alt=""
                  loading="lazy"
                  width={128}
                  height={128}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <p className="mt-2 truncate text-xs font-semibold">{e.artistName}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 pb-10">
        <h3 className="mb-3 text-sm font-bold">응원 댓글</h3>
        <CommentThread entryId={entry.id} />
      </section>
    </div>
  );
}
