import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { auditionService, DEFAULT_AUDITION_ID } from "@/services";
import { AdminSection } from "@/features/admin/AdminSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/entries")({
  head: () => ({
    meta: [
      { title: "참가자 관리 — PICK IT" },
      { name: "description", content: "출품작과 참가자 정보를 검토합니다." },
      { property: "og:title", content: "참가자 관리 — PICK IT" },
      { property: "og:description", content: "출품작과 참가자 정보를 검토합니다." },
    ],
  }),
  component: AdminEntries,
});

function AdminEntries() {
  const { data: entries = [] } = useQuery({
    queryKey: ["entries", "all"],
    queryFn: () => auditionService.listEntries({ auditionId: DEFAULT_AUDITION_ID }),
  });

  return (
    <AdminSection title="참가자 / 출품작" description={`총 ${entries.length}건`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>활동명</TableHead>
              <TableHead>부대</TableHead>
              <TableHead>라운드</TableHead>
              <TableHead>접수일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.artistName}</TableCell>
                <TableCell className="text-muted-foreground">{e.unit}</TableCell>
                <TableCell className="text-muted-foreground">{e.roundId === "r_2" ? "2차" : "1차"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(e.submittedAt).toLocaleDateString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminSection>
  );
}
