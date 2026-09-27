import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminService, DEFAULT_ROUND_ID } from "@/services";
import { AdminSection, InternalOnly } from "@/features/admin/AdminSection";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "운영자 대시보드 — PICK IT" },
      { name: "description", content: "심사 진행률과 라운드 운영 현황을 한눈에 확인합니다." },
      { property: "og:title", content: "운영자 대시보드 — PICK IT" },
      { property: "og:description", content: "심사 진행률과 라운드 운영 현황을 한눈에 확인합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: progress = [] } = useQuery({
    queryKey: ["admin", "judging-progress", DEFAULT_ROUND_ID],
    queryFn: () => adminService.listJudgingProgress(DEFAULT_ROUND_ID),
  });
  const { data: entryProgress = [] } = useQuery({
    queryKey: ["admin", "entry-progress", DEFAULT_ROUND_ID],
    queryFn: () => adminService.listEntryJudgingProgress(DEFAULT_ROUND_ID),
  });

  const totalAssigned = progress.reduce((s, p) => s + p.assignedCount, 0);
  const totalDone = progress.reduce((s, p) => s + p.submittedCount, 0);
  const pct = totalAssigned ? Math.round((totalDone / totalAssigned) * 100) : 0;

  return (
    <div>
      <AdminSection title="2차 라운드 심사 진행률" description={`${totalDone} / ${totalAssigned} 건 제출`}>
        <div className="panel p-4">
          <p className="text-3xl font-black tabular-nums">{pct}%</p>
          <Progress value={pct} className="mt-3" />
          <ul className="mt-4 space-y-2">
            {progress.map((p) => (
              <li key={p.judgeId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs">
                <span className="truncate text-muted-foreground">{p.judgeName}</span>
                <span className="tabular-nums">
                  {p.submittedCount} / {p.assignedCount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </AdminSection>

      <AdminSection
        title="참가자별 평가 완료"
        right={
          <Link to="/admin/judging" className="shrink-0 text-xs text-accent">
            상세
          </Link>
        }
      >
        <ul className="divide-y divide-border">
          {entryProgress.map((e) => (
            <li key={e.entryId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2.5 text-sm">
              <span className="truncate">{e.artistName}</span>
              <span
                className={`shrink-0 text-xs tabular-nums ${e.submittedCount === e.judgeCount ? "text-up" : "text-muted-foreground"}`}
              >
                {e.submittedCount} / {e.judgeCount}
              </span>
            </li>
          ))}
        </ul>
      </AdminSection>

      <div className="px-5">
        <InternalOnly />
      </div>
    </div>
  );
}
