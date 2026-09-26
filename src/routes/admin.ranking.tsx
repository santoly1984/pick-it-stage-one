import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService, DEFAULT_AUDITION_ID, DEFAULT_ROUND_ID, rankingService } from "@/services";
import { AdminSection, InternalOnly } from "@/features/admin/AdminSection";
import { RankChange } from "@/features/ranking/RankChange";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/ranking")({
  head: () => ({
    meta: [
      { title: "순위 관리 — PICK IT" },
      { name: "description", content: "평가 비율을 조정하고 종합 순위 변동을 시뮬레이션한 뒤 확정합니다." },
      { property: "og:title", content: "순위 관리 — PICK IT" },
      { property: "og:description", content: "평가 비율을 조정하고 종합 순위 변동을 시뮬레이션한 뒤 확정합니다." },
    ],
  }),
  component: AdminRanking,
});

function AdminRanking() {
  const qc = useQueryClient();
  const { data: rule } = useQuery({
    queryKey: ["admin", "rule", DEFAULT_AUDITION_ID],
    queryFn: () => adminService.getEvaluationRule(DEFAULT_AUDITION_ID),
  });

  const [sim, setSim] = useState<{ vote: number; judge: number; technical: number } | null>(null);
  const weights = sim ?? {
    vote: rule?.voteWeight ?? 0.4,
    judge: rule?.judgeWeight ?? 0.45,
    technical: rule?.technicalWeight ?? 0.15,
  };

  const { data: snapshot } = useQuery({
    queryKey: ["admin", "ranking", DEFAULT_ROUND_ID, weights],
    queryFn: () =>
      rankingService.getAdminRanking({
        roundId: DEFAULT_ROUND_ID,
        kind: "final",
        weights: {
          voteWeight: weights.vote,
          judgeWeight: weights.judge,
          technicalWeight: weights.technical,
        },
      }),
  });

  const saveRule = useMutation({
    mutationFn: () =>
      adminService.updateEvaluationRule({
        ...rule!,
        voteWeight: weights.vote,
        judgeWeight: weights.judge,
        technicalWeight: weights.technical,
      }),
    onSuccess: () => {
      setSim(null);
      void qc.invalidateQueries({ queryKey: ["admin", "rule"] });
      toast.success("평가 비율을 저장했습니다");
    },
  });

  const finalize = useMutation({
    mutationFn: () => rankingService.finalizeRanking(DEFAULT_ROUND_ID),
    onSuccess: () => toast.success("종합 순위를 확정했습니다"),
  });

  const sum = Math.round((weights.vote + weights.judge + weights.technical) * 100);

  return (
    <div>
      <AdminSection title="평가 비율 설정" description="값을 바꾸면 아래 순위가 즉시 시뮬레이션됩니다.">
        <div className="panel space-y-5 p-4">
          {(
            [
              ["vote", "팬 투표"],
              ["judge", "심사 점수"],
              ["technical", "기술 점수"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <span className="truncate text-sm">{label}</span>
                <span className="shrink-0 text-sm tabular-nums">{Math.round(weights[key] * 100)}%</span>
              </div>
              <Slider
                className="mt-3"
                value={[Math.round(weights[key] * 100)]}
                max={100}
                step={5}
                onValueChange={([v]) => setSim({ ...weights, [key]: v / 100 })}
                aria-label={label}
              />
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <p className={`text-xs ${sum === 100 ? "text-muted-foreground" : "text-destructive"}`}>합계 {sum}%</p>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" size="sm" disabled={!sim} onClick={() => setSim(null)}>
                초기화
              </Button>
              <Button size="sm" disabled={!sim || sum !== 100 || saveRule.isPending} onClick={() => saveRule.mutate()}>
                비율 저장
              </Button>
            </div>
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title="내부 종합 순위"
        description="공개 화면에는 순위와 변동만 노출됩니다."
        right={
          <Button size="sm" disabled={finalize.isPending} onClick={() => finalize.mutate()}>
            결과 확정
          </Button>
        }
      >
        <div className="space-y-4">
          <InternalOnly />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>참가자</TableHead>
                  <TableHead className="text-right">투표</TableHead>
                  <TableHead className="text-right">심사</TableHead>
                  <TableHead className="text-right">기술</TableHead>
                  <TableHead className="text-right">환산</TableHead>
                  <TableHead>변동 원인</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot?.entries.map((e) => (
                  <TableRow key={e.entryId}>
                    <TableCell className="tabular-nums">
                      <span className="flex items-center gap-1.5">
                        {e.rank}
                        <RankChange change={e.rankChange} rank={e.rank} previousRank={e.previousRank} />
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{e.artistName}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.voteScore}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.judgeScore}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.technicalScore}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{e.convertedScore}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.changeReason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminSection>
    </div>
  );
}
