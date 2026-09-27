import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RankingList } from "@/features/ranking/RankingList";
import { UpdatedAt } from "@/features/ranking/RankChange";
import { publicRankingQuery } from "@/features/ranking/queries";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RankingKind } from "@/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ranking")({
  validateSearch: (search: Record<string, unknown>): { kind?: RankingKind; limit?: 10 | 100; section?: number } => ({
    ...(search['kind'] === "final" ? { kind: "final" as const } : {}),
    ...(Number(search['limit']) === 100 ? { limit: 100 as const } : {}),
    ...(Number.isInteger(Number(search['section'])) && Number(search['section']) >= 1 && Number(search['section']) <= 10 ? { section: Number(search['section']) } : {}),
  }),
  head: () => ({
    meta: [
      { title: "랭킹 — PICK IT" },
      { name: "description", content: "실시간 투표 순위와 최종 종합 순위를 TOP 10 / TOP 100으로 확인하세요." },
      { property: "og:title", content: "랭킹 — PICK IT" },
      { property: "og:description", content: "실시간 투표 순위와 최종 종합 순위를 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RankingPage,
});

function RankingPage() {
  const { kind = "live-vote", limit = 10, section = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/ranking" });
  const { data: snapshot, isFetching } = useQuery(publicRankingQuery(kind, limit));
  const show = snapshot?.entries ?? [];
  const selectKind = (value: RankingKind) => void navigate({ search: (prev) => ({ ...prev, kind: value, section: 1 }) });
  const selectLimit = (value: 10 | 100) => void navigate({ search: (prev) => ({ ...prev, limit: value, section: 1 }) });

  useEffect(() => {
    if (limit !== 100 || section === 1 || !snapshot?.published) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`rank-${(section - 1) * 10 + 1}`)?.scrollIntoView({ block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [limit, section, snapshot?.published]);

  return (
    <div className="min-h-screen pb-6">
      <PageHeader
        title="랭킹"
        subtitle="시즌 1 · 군 장병 음악 오디션"
        {...(snapshot?.published ? { right: <UpdatedAt iso={snapshot.updatedAt} /> } : {})}
      />

      <div className="space-y-4 px-5 pb-8 pt-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>2차 본선 · 투표 진행 중</p><p>데모 데이터</p>
        </div>
        <Tabs value={kind} onValueChange={(v) => selectKind(v as RankingKind)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live-vote">실시간 투표</TabsTrigger>
            <TabsTrigger value="final">최종 종합</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
          {([10, 100] as const).map((n) => (
            <Button
              key={n}
              type="button"
              variant={limit === n ? "default" : "secondary"}
              size="sm"
              aria-pressed={limit === n}
              onClick={() => selectLimit(n)}
            >
              TOP {n}
            </Button>
          ))}
          </div>
          {snapshot?.published && <span className="text-xs text-muted-foreground">전체 {snapshot.entries.length}명</span>}
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {kind === "live-vote"
            ? "샘플 투표를 반영한 잠정 순위입니다. 실제 참가자·득표 데이터가 아닙니다."
            : "최종 종합 순위는 심사와 투표가 모두 반영된 확정 순위입니다. 세부 점수는 공개되지 않습니다."}
        </p>

        {snapshot && !snapshot.published ? (
          <p className="panel px-4 py-10 text-center text-sm text-muted-foreground">
            심사가 모두 완료되고 결과가 확정되면 최종 종합 순위가 공개됩니다.
          </p>
        ) : snapshot ? (
          <>
            {limit === 100 && <div className="flex gap-1 overflow-x-auto pb-1" aria-label="순위 구간 이동">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <Button key={n} type="button" size="sm" variant={section === n ? "default" : "ghost"} aria-label={`${(n - 1) * 10 + 1}위부터 ${n * 10}위`} aria-pressed={section === n} onClick={() => { if (section === n) document.getElementById(`rank-${(n - 1) * 10 + 1}`)?.scrollIntoView({ block: "start" }); else void navigate({ search: (prev) => ({ ...prev, section: n }) }); }} className="shrink-0 px-2.5 tabular-nums">{(n - 1) * 10 + 1}–{n * 10}</Button>
              ))}
            </div>}
            <RankingList entries={show} />
            {limit === 100 && <p className="text-center text-xs text-muted-foreground">1–100위 / 100위</p>}
          </>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {isFetching ? "불러오는 중..." : "표시할 순위가 없습니다."}
          </p>
        )}
      </div>
    </div>
  );
}
