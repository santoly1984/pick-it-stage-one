import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { auditionService, DEFAULT_AUDITION_ID } from "@/services";
import { AdminSection } from "@/features/admin/AdminSection";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/auditions")({
  head: () => ({
    meta: [
      { title: "오디션 관리 — PICK IT" },
      { name: "description", content: "오디션과 라운드의 일정·상태를 관리합니다." },
      { property: "og:title", content: "오디션 관리 — PICK IT" },
      { property: "og:description", content: "오디션과 라운드의 일정·상태를 관리합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAuditions,
});

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ko-KR");

function AdminAuditions() {
  const { data: auditions = [] } = useQuery({ queryKey: ["auditions"], queryFn: () => auditionService.listAuditions() });
  const { data: rounds = [] } = useQuery({
    queryKey: ["rounds", DEFAULT_AUDITION_ID],
    queryFn: () => auditionService.listRounds(DEFAULT_AUDITION_ID),
  });

  return (
    <div>
      <AdminSection title="오디션" description="시즌 단위로 오디션을 운영합니다.">
        <div className="space-y-3">
          {auditions.map((a) => (
            <div key={a.id} className="panel p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.subtitle}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {a.status}
                </Badge>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {fmt(a.startsAt)} – {fmt(a.endsAt)}
              </p>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="라운드" description="투표 기간과 심사 상태.">
        <div className="space-y-3">
          {rounds.map((r) => (
            <div key={r.id} className="panel p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <Badge variant="secondary" className="shrink-0">
                  {r.status}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                투표 {fmt(r.votingOpensAt)} – {fmt(r.votingClosesAt)} · 참가자 {r.entryIds.length}명
              </p>
            </div>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
