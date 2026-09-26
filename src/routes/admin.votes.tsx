import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminService, DEFAULT_ROUND_ID } from "@/services";
import { AdminSection, InternalOnly } from "@/features/admin/AdminSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/votes")({
  head: () => ({
    meta: [
      { title: "투표 관리 — PICK IT" },
      { name: "description", content: "참가자별 투표 집계 현황을 확인합니다." },
      { property: "og:title", content: "투표 관리 — PICK IT" },
      { property: "og:description", content: "참가자별 투표 집계 현황을 확인합니다." },
    ],
  }),
  component: AdminVotes,
});

function AdminVotes() {
  const { data: stats = [] } = useQuery({
    queryKey: ["admin", "vote-stats", DEFAULT_ROUND_ID],
    queryFn: () => adminService.listVoteStats(DEFAULT_ROUND_ID),
  });

  return (
    <AdminSection title="투표 집계" description="2차 라운드 · mock 집계" right={undefined}>
      <div className="space-y-4">
        <InternalOnly />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>참가자</TableHead>
                <TableHead className="text-right">무료</TableHead>
                <TableHead className="text-right">일반</TableHead>
                <TableHead className="text-right">합계</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s) => (
                <TableRow key={s.entryId}>
                  <TableCell className="font-medium">{s.artistName}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.free.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.standard.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{s.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminSection>
  );
}
