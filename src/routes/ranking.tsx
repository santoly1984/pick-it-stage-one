import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RankingList } from "@/features/ranking/RankingList";
import { UpdatedAt } from "@/features/ranking/RankChange";
import { DEFAULT_ROUND_ID, rankingService } from "@/services";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RankingKind } from "@/types";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "랭킹 — PICK IT" },
      { name: "description", content: "실시간 투표 순위와 최종 종합 순위를 TOP 10 / TOP 100으로 확인하세요." },
      { property: "og:title", content: "랭킹 — PICK IT" },
      { property: "og:description", content: "실시간 투표 순위와 최종 종합 순위를 확인하세요." },
    ],
  }),
  component: RankingPage,
});

function RankingPage() {
  const [kind, setKind] = useState<RankingKind>("live-vote");
  const [limit, setLimit] = useState(10);

  const { data: snapshot, isFetching } = useQuery({
    queryKey: ["ranking", "public", DEFAULT_ROUND_ID, kind, limit],
    queryFn: () => rankingService.getPublicRanking({ roundId: DEFAULT_ROUND_ID, kind, limit }),
  });

  return (
    <div className="min-h-screen">
      <PageHeader
        title="랭킹"
        subtitle="PICK IT 2026 시즌 1 · 2차 라운드"
        right={snapshot ? <UpdatedAt iso={snapshot.updatedAt} /> : undefined}
      />

      <div className="space-y-4 px-5 py-4">
        <Tabs value={kind} onValueChange={(v) => setKind(v as RankingKind)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live-vote">실시간 투표</TabsTrigger>
            <TabsTrigger value="final">최종 종합</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          {[10, 100].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLimit(n)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                limit === n ? "border-primary bg-primary/20" : "border-border text-muted-foreground"
              }`}
            >
              TOP {n}
            </button>
          ))}
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {kind === "live-vote"
            ? "실시간 투표 순위는 팬 투표만 반영한 잠정 순위입니다."
            : "최종 종합 순위는 심사와 투표가 모두 반영된 확정 순위입니다. 세부 점수는 공개되지 않습니다."}
        </p>

        {snapshot ? (
          <RankingList entries={snapshot.entries} />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {isFetching ? "불러오는 중..." : "표시할 순위가 없습니다."}
          </p>
        )}
      </div>
    </div>
  );
}
