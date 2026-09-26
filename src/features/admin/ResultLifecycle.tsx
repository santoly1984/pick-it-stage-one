import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "./AdminSection";
import type { RankingSnapshotVersion, ResultStatus, RoundResultState } from "@/types";

export type LifecycleAction = "startReview" | "cancelReview" | "confirmResult" | "publishResult";

export const STAGES: { key: ResultStatus; label: string }[] = [
  { key: "DRAFT", label: "초안" },
  { key: "JUDGING", label: "심사 중" },
  { key: "SCORED", label: "심사 완료" },
  { key: "REVIEW", label: "검토" },
  { key: "CONFIRMED", label: "확정" },
  { key: "PUBLISHED", label: "공개" },
];

/** Result lifecycle stepper + the single allowed next action. State comes from RankingService only. */
export function ResultLifecyclePanel({
  state,
  pending,
  onAction,
}: {
  state: RoundResultState;
  pending: boolean;
  onAction: (a: LifecycleAction) => void;
}) {
  const stageIndex = STAGES.findIndex((s) => s.key === state.status);
  return (
      <AdminSection
        title="결과 진행 단계"
        description={`심사 제출 ${state.submittedScores}/${state.requiredScores} · 스냅샷 v${state.currentVersion}`}
        right={<Badge variant={state.provisional ? "destructive" : "secondary"}>{state.provisional ? "잠정(provisional)" : state.status}</Badge>}
      >
        <ol className="grid grid-cols-6 gap-1 text-center text-[10px]">
          {STAGES.map((s, i) => (
            <li
              key={s.key}
              className={`rounded-md px-1 py-2 ${
                i === stageIndex ? "bg-primary text-primary-foreground font-semibold" : i < stageIndex ? "bg-primary/20" : "bg-surface text-muted-foreground"
              }`}
            >
              {s.label}
            </li>
          ))}
        </ol>
        {state.provisional && (
          <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-[11px] text-destructive">
            일부 심사만 입력된 잠정 결과입니다. 검토·확정·공개할 수 없으며 공개 최종 순위는 노출되지 않습니다.
          </p>
        )}
        {state.changedAfterPublish && (
          <p className="mt-3 rounded-lg bg-accent/15 px-3 py-2 text-[11px] text-accent">
            공개 이후 원본 평가가 바뀌었습니다. 공개 화면은 공개 시점 스냅샷을 유지합니다.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {state.status === "SCORED" && (
            <Button size="sm" disabled={pending} onClick={() => onAction("startReview")}>검토 시작</Button>
          )}
          {state.status === "REVIEW" && (
            <>
              <Button size="sm" disabled={pending} onClick={() => onAction("confirmResult")}>결과 확정</Button>
              <Button size="sm" variant="secondary" disabled={pending} onClick={() => onAction("cancelReview")}>검토 취소</Button>
            </>
          )}
          {state.status === "CONFIRMED" && (
            <Button size="sm" disabled={pending} onClick={() => onAction("publishResult")}>공개(publish)</Button>
          )}
          {(state.status === "DRAFT" || state.status === "JUDGING") && (
            <p className="text-xs text-muted-foreground">모든 심사가 제출되면 검토를 시작할 수 있습니다.</p>
          )}
          {state.status === "PUBLISHED" && (
            <p className="text-xs text-muted-foreground">공개 완료 · {state.publishedAt?.slice(0, 16).replace("T", " ")}</p>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          확정 단계의 2인 승인은 실제 서버에서 구현해야 합니다. 이 화면은 mock 단일 운영자 흐름입니다.
        </p>
      </AdminSection>

  );
}

export function SnapshotHistory({ history }: { history: RankingSnapshotVersion[] }) {
  return (
      <AdminSection title="스냅샷 기록" description="원본 변경·적용·확정·공개 때마다 새 버전이 생성됩니다.">
        <ul className="panel divide-y divide-border">
          {history.map((h) => (
            <li key={h.version} className="px-4 py-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">v{h.version} · {h.reason}</span>
                <span className="shrink-0 text-muted-foreground">
                  {h.provisional ? "잠정 · " : ""}
                  {h.createdAt.slice(11, 19)}
                </span>
              </div>
              <p className="mt-1 truncate text-muted-foreground">
                {h.rows.slice(0, 5).map((r) => `${r.rank}. ${r.artistName}`).join("  ")}
              </p>
            </li>
          ))}
        </ul>
      </AdminSection>
  );
}
