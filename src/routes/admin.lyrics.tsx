import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminSection } from "@/features/admin/AdminSection";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { lyricsService } from "@/services";
import { tracks } from "@/mocks/data";
import type { LyricLine, LyricsDocument } from "@/types";

export const Route = createFileRoute("/admin/lyrics")({
  head: () => ({
    meta: [
      { title: "가사 싱크 — PICK IT" },
      { name: "description", content: "가사를 입력하고 자동 싱크 결과를 검수한 뒤 공개합니다." },
      { property: "og:title", content: "가사 싱크 — PICK IT" },
      { property: "og:description", content: "가사를 입력하고 자동 싱크 결과를 검수한 뒤 공개합니다." },
    ],
  }),
  component: AdminLyrics,
});

const STATUS_LABEL: Record<LyricsDocument["status"], string> = {
  empty: "미등록",
  draft: "작성 중",
  processing: "싱크 생성 중",
  review: "검수 필요",
  published: "공개됨",
};

function AdminLyrics() {
  const [trackId, setTrackId] = useState(tracks[0]?.id ?? "t_1");
  const [doc, setDoc] = useState<LyricsDocument | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["admin", "lyrics", trackId],
    queryFn: () => lyricsService.getLyrics(trackId),
  });

  useEffect(() => {
    if (data) {
      setDoc(data);
      setText(data.canonicalText);
    }
  }, [data]);

  const run = async (fn: () => Promise<LyricsDocument>, message: string) => {
    setBusy(true);
    try {
      const next = await fn();
      setDoc(next);
      toast.success(message);
      void refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "저장하지 못했습니다");
    } finally {
      setBusy(false);
    }
  };

  const dirtyLines = Boolean(data && doc && JSON.stringify(data.lines) !== JSON.stringify(doc.lines));

  const updateLine = (id: string, patch: Partial<LyricLine>) => {
    if (!doc) return;
    setDoc({ ...doc, lines: doc.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };

  return (
    <div>
      <AdminSection title="트랙 선택" description="가사를 등록할 출품 트랙을 고르세요.">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTrackId(t.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                t.id === trackId ? "border-primary bg-primary/20" : "border-border text-muted-foreground"
              }`}
            >
              {t.artistName} · {t.title}
            </button>
          ))}
        </div>
      </AdminSection>

      <AdminSection
        title="원본 가사 (canonical)"
        description="한 줄에 한 문장씩 입력합니다."
        right={doc ? <Badge variant="secondary">{STATUS_LABEL[doc.status]}</Badge> : undefined}
      >
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="font-mono text-sm" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => run(() => lyricsService.saveCanonicalText(trackId, text), "가사를 저장했습니다")}
          >
            저장
          </Button>
          <Button
            size="sm"
            disabled={busy || !text.trim() || text !== doc?.canonicalText}
            onClick={() => run(() => lyricsService.requestAutoSync(trackId), "자동 싱크가 생성됐습니다")}
          >
            {busy ? "처리 중..." : "자동 싱크 생성"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {doc && text !== doc.canonicalText ? "먼저 저장해야 자동 싱크를 생성할 수 있습니다. " : ""}
          자동 싱크는 mock 서비스로 동작합니다. 실제 AI 정렬 서버는 이후 단계에서 연결합니다.
        </p>
      </AdminSection>

      {doc && doc.lines.length > 0 && (
        <AdminSection title="줄별 타임스탬프 검수" description="시작 시간을 직접 수정할 수 있습니다.">
          <div className="space-y-2">
            {doc.lines.map((line) => (
              <div key={line.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
                <Input
                  type="number"
                  value={line.startSec}
                  onChange={(e) => updateLine(line.id, { startSec: Number(e.target.value) })}
                  className="h-9 tabular-nums"
                  aria-label="시작 초"
                />
                <Input
                  value={line.text}
                  onChange={(e) => updateLine(line.id, { text: e.target.value })}
                  className="h-9"
                  aria-label="가사 줄"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => run(() => lyricsService.updateLines(trackId, doc.lines), "타임스탬프를 저장했습니다")}
            >
              수정 저장
            </Button>
            <Button
              size="sm"
              disabled={busy || doc.status !== "review" || dirtyLines}
              onClick={() => run(() => lyricsService.publish(trackId), "검수를 마치고 가사를 공개했습니다")}
            >
              검수 완료 · 공개
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {dirtyLines
              ? "저장하지 않은 수정이 있습니다. 저장 후 공개할 수 있습니다."
              : doc.status === "published"
                ? "공개된 가사입니다. 수정 저장 시 다시 검수 단계로 돌아갑니다."
                : "타임스탬프는 앞 줄보다 커야 합니다."}
          </p>
        </AdminSection>
      )}
    </div>
  );
}
