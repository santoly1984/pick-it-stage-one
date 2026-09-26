import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DEFAULT_JUDGE_ID, judgingService } from "@/services";
import { judgeScores } from "@/mocks/data";

export const Route = createFileRoute("/judge/round/$id")({
  head: () => ({
    meta: [
      { title: "라운드 심사 — PICK IT" },
      { name: "description", content: "라운드에 배정된 참가자 목록과 평가 진행 상태." },
      { property: "og:title", content: "라운드 심사 — PICK IT" },
      { property: "og:description", content: "라운드에 배정된 참가자 목록과 평가 진행 상태." },
    ],
  }),
  component: JudgeRound,
});

function JudgeRound() {
  const { id } = Route.useParams();
  const { data: entries = [] } = useQuery({
    queryKey: ["judge", "entries", id],
    queryFn: () => judgingService.listAssignedEntries(DEFAULT_JUDGE_ID, id),
  });

  const isDone = (entryId: string) =>
    judgeScores.some((s) => s.entryId === entryId && s.judgeId === DEFAULT_JUDGE_ID && s.status === "submitted");

  const doneCount = entries.filter((e) => isDone(e.id)).length;

  return (
    <div className="min-h-screen">
      <PageHeader title="참가자 목록" subtitle={`${doneCount} / ${entries.length} 평가 완료`} backTo="/judge" />
      <ul className="divide-y divide-border px-5">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              to="/judge/score/$entryId"
              params={{ entryId: entry.id }}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3"
            >
              <img
                src={entry.coverUrl}
                alt=""
                loading="lazy"
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{entry.artistName}</p>
                <p className="truncate text-xs text-muted-foreground">{entry.unit}</p>
              </div>
              {isDone(entry.id) ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-up">
                  <Check className="size-3.5" /> 완료
                </span>
              ) : (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
