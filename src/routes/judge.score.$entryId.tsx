import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DEFAULT_JUDGE_ID, DEFAULT_ROUND_ID, judgingService } from "@/services";
import { usePlayEntry } from "@/hooks/usePlayEntry";
import { InterviewVideo } from "@/features/artist/InterviewVideo";

export const Route = createFileRoute("/judge/score/$entryId")({
  head: () => ({
    meta: [
      { title: "평가 입력 — PICK IT" },
      { name: "description", content: "참가자의 무대를 확인하고 항목별 점수를 입력하세요." },
      { property: "og:title", content: "평가 입력 — PICK IT" },
      { property: "og:description", content: "참가자의 무대를 확인하고 항목별 점수를 입력하세요." },
    ],
  }),
  component: JudgeScorePage,
});

function JudgeScorePage() {
  const { entryId } = Route.useParams();
  const navigate = useNavigate();
  const play = usePlayEntry();

  const qc = useQueryClient();
  const { data: entry } = useQuery({
    queryKey: ["judge", "entry", entryId],
    queryFn: () => judgingService.getEntry(entryId),
  });
  const { data: criteria } = useQuery({
    queryKey: ["judge", "criteria", entry?.roundId ?? DEFAULT_ROUND_ID],
    queryFn: () => judgingService.getCriteria(entry?.roundId ?? DEFAULT_ROUND_ID),
  });
  const { data: existing } = useQuery({
    queryKey: ["judge-score", DEFAULT_JUDGE_ID, entryId],
    queryFn: () => judgingService.getMyScore(DEFAULT_JUDGE_ID, entryId),
  });

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setScores(existing.scores);
      setComment(existing.comment ?? "");
    }
  }, [existing]);

  const siblings = useQuery({
    queryKey: ["judge", "entries", entry?.roundId],
    queryFn: () => judgingService.listAssignedEntries(DEFAULT_JUDGE_ID, entry!.roundId),
    enabled: Boolean(entry?.roundId),
  });

  const nextEntryId = useMemo(() => {
    const list = siblings.data ?? [];
    const i = list.findIndex((e) => e.id === entryId);
    return i >= 0 ? (list[i + 1]?.id ?? null) : null;
  }, [siblings.data, entryId]);

  const save = async (goNext: boolean) => {
    if (!entry) return;
    setSaving(true);
    try {
    await judgingService.saveScore({
      roundId: entry.roundId,
      entryId: entry.id,
      judgeId: DEFAULT_JUDGE_ID,
      scores,
      comment,
      status: "submitted",
    });
    } catch (e) {
      setSaving(false);
      toast.error(e instanceof Error ? e.message : "평가를 저장하지 못했습니다");
      return;
    }
    setSaving(false);
    void qc.invalidateQueries({ queryKey: ["judge"] });
    // Internal admin progress/ranking recompute in the mock; public live-vote is unaffected.
    void qc.invalidateQueries({ queryKey: ["admin"] });
    toast.success("평가를 저장했습니다");
    if (goNext && nextEntryId) navigate({ to: "/judge/score/$entryId", params: { entryId: nextEntryId } });
    else navigate({ to: "/judge/round/$id", params: { id: entry.roundId } });
  };

  if (!entry || !criteria) {
    return (
      <div className="min-h-screen">
        <PageHeader title="평가" backTo="/judge" />
        <p className="px-5 py-10 text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  const total = criteria.reduce((sum, c) => sum + (scores[c.id] ?? 0), 0);
  const maxTotal = criteria.reduce((sum, c) => sum + c.max, 0);

  return (
    <div className="min-h-screen">
      <PageHeader title={entry.artistName} subtitle={entry.branch} backTo="/judge" />

      <div className="space-y-6 px-5 py-5">
        <div className="panel grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3">
          <img src={entry.coverUrl} alt="" loading="lazy" width={56} height={56} className="size-14 rounded-md object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{entry.tagline}</p>
            <p className="text-xs text-muted-foreground">음원 확인</p>
          </div>
          <Button size="icon" onClick={() => play(entry.id)} aria-label="음원 재생">
            <Play className="size-4" />
          </Button>
        </div>

        {entry.interviewVideoUrl && <InterviewVideo src={entry.interviewVideoUrl} poster={entry.coverUrl} />}

        <div className="space-y-5">
          {criteria.map((c) => {
            const value = scores[c.id] ?? 0;
            return (
              <div key={c.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums">
                    {value} <span className="text-muted-foreground">/ {c.max}</span>
                  </p>
                </div>
                <Slider
                  className="mt-3"
                  value={[value]}
                  max={c.max}
                  step={1}
                  onValueChange={([v]) => setScores((s) => ({ ...s, [c.id]: v ?? 0 }))}
                  aria-label={c.label}
                />
              </div>
            );
          })}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">심사 코멘트</p>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="참가자에게 전달되지 않는 내부 메모입니다." />
        </div>

        <div className="panel flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">내 평가 합계</span>
          <span className="text-lg font-bold tabular-nums">
            {total} <span className="text-sm text-muted-foreground">/ {maxTotal}</span>
          </span>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" disabled={saving} onClick={() => save(false)}>
            저장
          </Button>
          <Button className="flex-1" disabled={saving || !nextEntryId} onClick={() => save(true)}>
            저장 후 다음
          </Button>
        </div>
      </div>
    </div>
  );
}
