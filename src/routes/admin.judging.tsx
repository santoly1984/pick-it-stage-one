import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminService, DEFAULT_ROUND_ID } from "@/services";
import { AdminSection, InternalOnly } from "@/features/admin/AdminSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/judging")({
  head: () => ({
    meta: [
      { title: "심사 관리 — PICK IT" },
      { name: "description", content: "심사위원별 제출 현황과 참가자 평가 breakdown을 검토합니다." },
      { property: "og:title", content: "심사 관리 — PICK IT" },
      { property: "og:description", content: "심사위원별 제출 현황과 참가자 평가 breakdown을 검토합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminJudging,
});

function AdminJudging() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: entryProgress = [] } = useQuery({
    queryKey: ["admin", "entry-progress", DEFAULT_ROUND_ID],
    queryFn: () => adminService.listEntryJudgingProgress(DEFAULT_ROUND_ID),
  });
  const { data: rule } = useQuery({
    queryKey: ["admin", "rule", DEFAULT_ROUND_ID],
    queryFn: () => adminService.getEvaluationRule(DEFAULT_ROUND_ID),
  });
  const { data: scores = [] } = useQuery({
    queryKey: ["admin", "judge-scores", selected],
    queryFn: () => adminService.listJudgeScores(selected!),
    enabled: Boolean(selected),
  });

  return (
    <div>
      <AdminSection title="참가자별 심사 상태" description="행을 선택하면 내부 평가 breakdown이 표시됩니다.">
        <ul className="divide-y divide-border">
          {entryProgress.map((e) => (
            <li key={e.entryId}>
              <button
                type="button"
                onClick={() => setSelected(e.entryId === selected ? null : e.entryId)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-3 text-left"
              >
                <span className="truncate text-sm">{e.artistName}</span>
                <span
                  className={`shrink-0 text-xs tabular-nums ${e.submittedCount === e.judgeCount ? "text-up" : "text-muted-foreground"}`}
                >
                  {e.submittedCount} / {e.judgeCount}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </AdminSection>

      {selected && rule && (
        <AdminSection title="내부 평가 breakdown" description="심사위원별 항목 점수 · 운영자 전용">
          <div className="space-y-4">
            <InternalOnly />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>심사위원</TableHead>
                    {rule.criteria.map((c) => (
                      <TableHead key={c.id} className="text-right">
                        {c.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">합계</TableHead>
                    <TableHead className="text-right">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((s) => {
                    const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.judgeId}</TableCell>
                        {rule.criteria.map((c) => (
                          <TableCell key={c.id} className="text-right tabular-nums">
                            {s.scores[c.id] ?? "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold tabular-nums">{total}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {s.status === "submitted" ? "제출" : "작성 중"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {scores.map(
              (s) =>
                s.comment && (
                  <p key={`${s.id}-c`} className="panel p-3 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">{s.judgeId}</span> · {s.comment}
                  </p>
                ),
            )}
          </div>
        </AdminSection>
      )}
    </div>
  );
}
