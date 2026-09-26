import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services";
import { AdminSection } from "@/features/admin/AdminSection";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "감사 로그 — PICK IT" },
      { name: "description", content: "운영 변경 이력을 추적합니다." },
      { property: "og:title", content: "감사 로그 — PICK IT" },
      { property: "og:description", content: "운영 변경 이력을 추적합니다." },
    ],
  }),
  component: AdminAudit,
});

function AdminAudit() {
  const { data: logs = [] } = useQuery({ queryKey: ["admin", "audit"], queryFn: () => adminService.listAuditLogs() });

  return (
    <AdminSection title="감사 로그" description="평가 비율 변경, 가사 공개, 심사 제출 등 주요 행위 기록.">
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="panel p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <p className="truncate text-sm font-medium">{log.action}</p>
              <p className="shrink-0 text-[11px] text-muted-foreground">
                {new Date(log.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {log.actorName} · 대상 {log.target}
              {log.meta ? ` · ${JSON.stringify(log.meta)}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
