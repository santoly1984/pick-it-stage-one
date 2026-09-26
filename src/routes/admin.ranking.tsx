import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService, DEFAULT_ROUND_ID, rankingService, type RuleSimulationRow } from "@/services";
import { AdminSection, InternalOnly } from "@/features/admin/AdminSection";
import { RankChange } from "@/features/ranking/RankChange";
import { rankingKeys } from "@/features/ranking/queries";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EvaluationWeights } from "@/types";

export const Route = createFileRoute("/admin/ranking")({
  head: () => ({
    meta: [
      { title: "순위 관리 — PICK IT" },
      { name: "description", content: "라운드별 평가 비율을 시뮬레이션·검토하고 종합 순위를 확정합니다." },
      { property: "og:title", content: "순위 관리 — PICK IT" },
      { property: "og:description", content: "라운드별 평가 비율을 시뮬레이션·검토하고 종합 순위를 확정합니다." },
    ],
  }),
  component: AdminRanking,
});

const ROUNDS = [
  { id: "r_2", label: "2차 라운드" },
  { id: "r_1", label: "1차 라운드" },
];

const STATUS_LABEL = { example: "예시값 (mock)", draft: "초안 저장됨", approved: "승인됨" } as const;

type Step = "edit" | "review";

function AdminRanking() {
  const qc = useQueryClient();
  const [roundId, setRoundId] = useState(DEFAULT_ROUND_ID);
  const [weights, setWeights] = useState<EvaluationWeights | null>(null);
  const [step, setStep] = useState<Step>("edit");
  const [simulation, setSimulation] = useState<RuleSimulationRow[] | null>(null);

  const { data: rule } = useQuery({
    queryKey: ["admin", "rule", roundId],
    queryFn: () => adminService.getEvaluationRule(roundId),
  });

  useEffect(() => {
    if (rule) {
      setWeights({ voteWeight: rule.voteWeight, judgeWeight: rule.judgeWeight, technicalWeight: rule.technicalWeight });
      setStep("edit");
      setSimulation(null);
    }
  }, [rule]);

  // Current saved-rule ranking (not the simulation).
  const { data: snapshot } = useQuery({
    queryKey: ["admin", "ranking", roundId, rule?.updatedAt],
    queryFn: () => rankingService.getAdminRanking({ roundId, kind: "final" }),
    enabled: Boolean(rule),
  });
  const { data: progress = [] } = useQuery({
    queryKey: ["admin", "entry-progress", roundId],
    queryFn: () => adminService.listEntryJudgingProgress(roundId),
  });
  const judgingComplete = progress.length > 0 && progress.every((p) => p.submittedCount >= p.judgeCount);

  const simulate = useMutation({
    mutationFn: () => adminService.simulateEvaluationRule(roundId, weights!),
    onSuccess: (rows) => {
      setSimulation(rows);
      setStep("review");
    },
  });

  const saveDraft = useMutation({
    mutationFn: () => adminService.saveEvaluationRuleDraft(roundId, weights!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("평가 비율을 초안으로 저장했습니다");
    },
  });

  const finalize = useMutation({
    mutationFn: () => rankingService.finalizeRanking(roundId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: rankingKeys.publicAll });
      toast.success("종합 순위를 확정했습니다");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "확정 실패"),
  });

  if (!rule || !weights) return <p className="px-5 py-10 text-sm text-muted-foreground">불러오는 중...</p>;

  const sum = Math.round((weights.voteWeight + weights.judgeWeight + weights.technicalWeight) * 100);
  const dirty =
    weights.voteWeight !== rule.voteWeight ||
    weights.judgeWeight !== rule.judgeWeight ||
    weights.technicalWeight !== rule.technicalWeight;

  return (
    <div>
      <div className="flex gap-2 px-5 pt-5">
        {ROUNDS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoundId(r.id)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              roundId === r.id ? "border-primary bg-primary/20" : "border-border text-muted-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <AdminSection
        title="평가 비율 (라운드별)"
        description="값 조정 → 시뮬레이션 → 영향 검토 → 초안 저장 순서로 진행합니다."
        right={<Badge variant="secondary">{STATUS_LABEL[rule.status]}</Badge>}
      >
        {rule.status === "example" && (
          <p className="mb-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] text-accent">
            현재 값은 화면 검수를 위한 예시(mock)입니다. 실제 운영 비율은 아직 정해지지 않았습니다.
          </p>
        )}
        <div className="panel space-y-5 p-4">
          {(
            [
              ["voteWeight", "팬 투표"],
              ["judgeWeight", "심사 점수"],
              ["technicalWeight", "기술 점수"],
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
                disabled={step === "review"}
                onValueChange={([v]) => setWeights({ ...weights, [key]: (v ?? 0) / 100 })}
                aria-label={label}
              />
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <p className={`text-xs ${sum === 100 ? "text-muted-foreground" : "text-destructive"}`}>합계 {sum}%</p>
            <div className="flex shrink-0 gap-2">
              {step === "edit" ? (
                <Button size="sm" disabled={sum !== 100 || !dirty || simulate.isPending} onClick={() => simulate.mutate()}>
                  시뮬레이션
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setStep("edit")}>
                  다시 조정
                </Button>
              )}
            </div>
          </div>
        </div>

        {step === "review" && simulation && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold">변경 영향 검토</p>
            <ul className="panel divide-y divide-border">
              {simulation.map((r) => {
                const diff = r.currentRank - r.simulatedRank;
                return (
                  <li key={r.entryId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2.5 text-sm">
                    <span className="truncate">{r.artistName}</span>
                    <span className="shrink-0 text-xs tabular-nums">
                      {r.currentRank}위 → {r.simulatedRank}위{" "}
                      <span className={diff > 0 ? "text-up" : diff < 0 ? "text-down" : "text-flat"}>
                        {diff > 0 ? `▲${diff}` : diff < 0 ? `▼${-diff}` : "—"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <Button className="w-full" disabled={saveDraft.isPending} onClick={() => saveDraft.mutate()}>
              검토 완료 · 초안으로 저장
            </Button>
            <p className="text-[11px] text-muted-foreground">
              초안 저장은 운영 정책 확정이 아닙니다. 승인 절차는 후속 단계에서 정의합니다.
            </p>
          </div>
        )}
      </AdminSection>

      <AdminSection
        title="내부 종합 순위 (저장된 비율 기준)"
        description={judgingComplete ? "모든 심사 제출 완료" : "심사 미완료 — 결과 확정 및 공개 불가"}
        right={
          <Button size="sm" disabled={!judgingComplete || finalize.isPending} onClick={() => finalize.mutate()}>
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
