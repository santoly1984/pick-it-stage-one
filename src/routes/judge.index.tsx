import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DEFAULT_JUDGE_ID, judgingService } from "@/services";

export const Route = createFileRoute("/judge/")({
  head: () => ({
    meta: [
      { title: "심사위원 — PICK IT" },
      { name: "description", content: "배정된 라운드를 확인하고 평가를 진행하세요." },
      { property: "og:title", content: "심사위원 — PICK IT" },
      { property: "og:description", content: "배정된 라운드를 확인하고 평가를 진행하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JudgeHome,
});

function JudgeHome() {
  const { data: rounds = [] } = useQuery({
    queryKey: ["judge", "rounds", DEFAULT_JUDGE_ID],
    queryFn: () => judgingService.listAssignedRounds(DEFAULT_JUDGE_ID),
  });

  return (
    <div className="min-h-screen">
      <PageHeader title="심사 대시보드" subtitle="심사위원 A · 본인 평가만 표시" />
      <div className="space-y-3 px-5 py-5">
        <p className="text-xs text-muted-foreground">배정된 라운드</p>
        {rounds.map((round) => (
          <Link
            key={round.id}
            to="/judge/round/$id"
            params={{ id: round.id }}
            className="panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{round.name}</p>
              <p className="text-xs text-muted-foreground">
                참가자 {round.entryIds.length}명 · {round.status === "live" ? "심사 진행 중" : "종료"}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
