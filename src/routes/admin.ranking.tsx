import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService, DEFAULT_ROUND_ID, rankingService, type RuleSimulationRow } from "@/services";
import { AdminSection, InternalOnly } from "@/features/admin/AdminSection";
import { ResultLifecyclePanel, SnapshotHistory, type LifecycleAction } from "@/features/admin/ResultLifecycle";
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
      { name: "description", content: "라운드별 평가 규칙과 결과를 초안·검토·확정·공개 단계로 관리합니다." },
      { property: "og:title", content: "순위 관리 — PICK IT" },
      { property: "og:description", content: "라운드별 평가 규칙과 결과를 초안·검토·확정·공개 단계로 관리합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminRanking,
});

const ROUNDS = [
  { id: "r_2", label: "2차 라운드" },
  { id: "r_1", label: "1차 라운드" },
];

const RULE_STATUS = { example: "예시값 (mock)", draft: "검토 초안", approved: "적용됨 (mock)" } as const;


type Step = "edit" | "review";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "처리하지 못했습니다");

function AdminRanking() {
  const qc = useQueryClient();
  const [roundId, setRoundId] = useState(DEFAULT_ROUND_ID);
  const [weights, setWeights] = useState<EvaluationWeights | null>(null);
  const [step, setStep] = useState<Step>("edit");
  const [simulation, setSimulation] = useState<RuleSimulationRow[] | null>(null);

  const { data: rule, isError: ruleError } = useQuery({
    queryKey: ["admin", "rule", roundId],
    queryFn: () => adminService.getEvaluationRule(roundId),
  });

  useEffect(() => {
    if (rule) {
      const src = rule.draftWeights ?? rule;
      setWeights({ voteWeight: src.voteWeight, judgeWeight: src.judgeWeight, technicalWeight: src.technicalWeight });
      setStep("edit");
      setSimulation(null);
    }
  }, [rule]);

  const { data: state } = useQuery({
    queryKey: ["admin", "result-state", roundId],
    queryFn: () => rankingService.getResultState(roundId),
  });
  const { data: snapshot } = useQuery({
    queryKey: ["admin", "ranking", roundId],
    queryFn: () => rankingService.getAdminRanking({ roundId, kind: "final" }),
  });
  const { data: history = [] } = useQuery({
    queryKey: ["admin", "snapshots", roundId],
    queryFn: () => rankingService.listSnapshots(roundId),
  });

  const refreshAll = () => {
    void qc.invalidateQueries({ queryKey: ["admin"] });
    void qc.invalidateQueries({ queryKey: rankingKeys.publicAll });
  };

  const simulate = useMutation({
    mutationFn: () => adminService.simulateEvaluationRule(roundId, weights!),
    onSuccess: (rows) => {
      setSimulation(rows);
      setStep("review");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const saveDraft = useMutation({
    mutationFn: () => adminService.saveEvaluationRuleDraft(roundId, weights!),
    onSuccess: () => {
      refreshAll();
      toast.success("검토한 비율을 초안으로 저장했습니다");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const apply = useMutation({
    mutationFn: () => adminService.applyEvaluationRule(roundId),
    onSuccess: () => {
      refreshAll();
      toast.success("초안을 라운드에 적용했습니다 (mock) · 새 스냅샷 생성");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const lifecycle = useMutation({
    mutationFn: (action: LifecycleAction) =>
      rankingService[action](roundId),
    onSuccess: (_s, action) => {
      refreshAll();
      toast.success(
        { startReview: "검토를 시작했습니다", cancelReview: "검토를 취소했습니다", confirmResult: "결과를 확정했습니다", publishResult: "결과를 공개했습니다" }[action],
      );
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (ruleError) return <p className="px-5 py-10 text-sm text-destructive">평가 규칙을 불러오지 못했습니다.</p>;
  if (!rule || !weights || !state) return <p className="px-5 py-10 text-sm text-muted-foreground">불러오는 중...</p>;

  const locked = state.status === "CONFIRMED" || state.status === "PUBLISHED";
  const sum = Math.round((weights.voteWeight + weights.judgeWeight + weights.technicalWeight) * 100);
  const base = rule.draftWeights ?? rule;
  const dirty =
    weights.voteWeight !== base.voteWeight ||
    weights.judgeWeight !== base.judgeWeight ||
    weights.technicalWeight !== base.technicalWeight;

  return (
    <div>
      <div className="flex gap-2 px-5 pt-5">
        {ROUNDS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoundId(r.id)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              roundId === r.id ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ---------------- result lifecycle ---------------- */}
      <ResultLifecyclePanel state={state} pending={lifecycle.isPending} onAction={(a) => lifecycle.mutate(a)} />

      {/* ---------------- evaluation rule ---------------- */}
      <AdminSection
        title="평가 규칙 (라운드별)"
        description="조정 → 시뮬레이션(현재/예상 순위) → 검토 후 초안 저장 → 적용"
        right={<Badge variant="secondary">{RULE_STATUS[rule.status]}</Badge>}
      >
        {rule.status === "example" && (
          <p className="mb-3 rounded-lg bg-accent/10 px-3 py-2 text-[11px] text-accent">
            현재 값은 화면 검수를 위한 예시(mock)입니다. 실제 운영 비율은 정해지지 않았습니다.
          </p>
        )}
        {locked && (
          <p className="mb-3 rounded-lg bg-surface px-3 py-2 text-[11px] text-muted-foreground">
            확정/공개된 라운드는 규칙을 바꿀 수 없습니다.
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
                disabled={step === "review" || locked}
                onValueChange={([v]) => setWeights({ ...weights, [key]: (v ?? 0) / 100 })}
                aria-label={label}
              />
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <p className={`text-xs ${sum === 100 ? "text-muted-foreground" : "text-destructive"}`}>합계 {sum}%</p>
            <div className="flex shrink-0 gap-2">
              {step === "edit" ? (
                <Button size="sm" disabled={locked || sum !== 100 || simulate.isPending} onClick={() => simulate.mutate()}>
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
            <p className="text-sm font-semibold">현재 순위 → 예상 순위</p>
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
            <Button className="w-full" disabled={saveDraft.isPending || (!dirty && rule.status === "draft")} onClick={() => saveDraft.mutate()}>
              검토 완료 · 초안으로 저장
            </Button>
          </div>
        )}

        {rule.status === "draft" && rule.draftWeights && step === "edit" && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">
              저장된 초안: 투표 {Math.round(rule.draftWeights.voteWeight * 100)}% · 심사{" "}
              {Math.round(rule.draftWeights.judgeWeight * 100)}% · 기술 {Math.round(rule.draftWeights.technicalWeight * 100)}%
              (적용 전까지 순위에 반영되지 않음)
            </p>
            <Button className="w-full" disabled={locked || apply.isPending} onClick={() => apply.mutate()}>
              초안 적용 (mock)
            </Button>
          </div>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">적용은 mock 반영일 뿐 운영 정책 승인이 아닙니다.</p>
      </AdminSection>

      {/* ---------------- internal ranking ---------------- */}
      <AdminSection
        title="내부 종합 순위"
        description="원본 평가·적용 규칙에서 mock 재계산됩니다. 순위 숫자는 직접 수정할 수 없습니다."
        right={state.provisional ? <Badge variant="destructive">잠정</Badge> : undefined}
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
                    <TableCell className="whitespace-nowrap font-medium">{e.artistName}</TableCell>
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

      <SnapshotHistory history={history} />
    </div>
  );
}
