import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Ticket } from "lucide-react";
import { auditionService, DEFAULT_ROUND_ID, votingService } from "@/services";
import { publicRankingQuery } from "@/features/ranking/queries";
import { useSession } from "@/stores/session";
import { RankingList } from "@/features/ranking/RankingList";
import { UpdatedAt } from "@/features/ranking/RankChange";
import { EntryCard } from "@/features/artist/EntryCard";
import hero from "@/assets/hero-stage.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "홈 — PICK IT" },
      { name: "description", content: "진행 중인 오디션, 실시간 TOP 10, 오늘 들어볼 무대를 한 곳에서." },
      { property: "og:title", content: "홈 — PICK IT" },
      { property: "og:description", content: "진행 중인 오디션, 실시간 TOP 10, 오늘 들어볼 무대를 한 곳에서." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: snapshot } = useQuery(publicRankingQuery("live-vote", 10));
  const { data: entries = [] } = useQuery({
    queryKey: ["entries", DEFAULT_ROUND_ID],
    queryFn: () => auditionService.listEntries({ roundId: DEFAULT_ROUND_ID }),
  });
  const session = useSession();
  const { data: balance } = useQuery({
    queryKey: ["balance", session.userId],
    queryFn: () => votingService.getBalance(session.userId),
  });

  const [expanded, setExpanded] = useState(false);
  const queue = entries.map((e) => e.id);
  const tickets = balance ? balance.free + balance.standard : null;

  return (
    <div className="min-h-screen pb-6">
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <p className="text-xl font-black tracking-tight">PICK IT</p>
        <div className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium">
          <Ticket className="size-3.5 text-primary" />
          투표권 {tickets ?? "-"}장
        </div>
      </header>

      <section className="px-5 pt-4">
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          오늘은 어떤 목소리를
          <br />
          골라볼까요?
        </h1>
      </section>

      {/* Current audition — one program among many */}
      <section className="px-5 pt-6">
        <div className="panel overflow-hidden">
          <img src={hero} alt="" width={1600} height={912} className="h-36 w-full object-cover" />
          <div className="p-5">
            <p className="text-xs font-medium text-primary">진행 중인 오디션</p>
            <p className="mt-1 text-lg font-bold">시즌 1 · 군 장병 음악 오디션</p>
            <p className="mt-0.5 text-sm text-muted-foreground">2차 라운드 본선 투표 · 10월 15일 마감</p>
            <Link
              to="/ranking"
              className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              투표하러 가기
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pt-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          PICK IT은 여러 음악 오디션을 담을 수 있도록 설계되었습니다. 이후 프로그램은 확정되지 않았습니다.
        </p>
      </section>

      <section className="px-5 pt-10">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">실시간 TOP 10</h2>
            {snapshot && <UpdatedAt iso={snapshot.updatedAt} />}
          </div>
          <Link to="/ranking" className="flex shrink-0 items-center text-sm text-muted-foreground">
            TOP 100 <ChevronRight className="size-4" />
          </Link>
        </div>
        {snapshot ? (
          <>
            <RankingList entries={snapshot.entries.slice(0, expanded ? 10 : 5)} className="mt-3" />
            {snapshot.entries.length > 5 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-2 flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-surface text-sm font-medium text-muted-foreground"
              >
                {expanded ? "접기" : "6~10위 펼치기"}
                <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">불러오는 중...</p>
        )}
      </section>

      <section className="pt-10">
        <h2 className="px-5 text-lg font-bold">오늘 들어볼 무대</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} queue={queue} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-8">
        <Link to="/apply" className="panel flex items-center justify-between p-5">
          <div className="min-w-0">
            <p className="text-base font-semibold">오디션 지원 안내</p>
            <p className="mt-0.5 text-sm text-muted-foreground">현재 시즌 1 · 2차 라운드는 투표 진행 중입니다</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}
