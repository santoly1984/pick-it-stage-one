import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Ticket } from "lucide-react";
import { auditionService, DEFAULT_ROUND_ID, rankingService, votingService } from "@/services";
import { RankingList } from "@/features/ranking/RankingList";
import { UpdatedAt } from "@/features/ranking/RankChange";
import { EntryCard } from "@/features/artist/EntryCard";
import { currentUser } from "@/mocks/data";
import hero from "@/assets/hero-stage.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "홈 — PICK IT" },
      { name: "description", content: "실시간 TOP 10과 진행 중인 오디션, 추천 무대를 한 곳에서." },
      { property: "og:title", content: "홈 — PICK IT" },
      { property: "og:description", content: "실시간 TOP 10과 진행 중인 오디션, 추천 무대를 한 곳에서." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: snapshot } = useQuery({
    queryKey: ["ranking", "public", DEFAULT_ROUND_ID, "live-vote", 10],
    queryFn: () => rankingService.getPublicRanking({ roundId: DEFAULT_ROUND_ID, kind: "live-vote", limit: 10 }),
  });
  const { data: entries = [] } = useQuery({
    queryKey: ["entries", DEFAULT_ROUND_ID],
    queryFn: () => auditionService.listEntries({ roundId: DEFAULT_ROUND_ID }),
  });
  const { data: balance } = useQuery({
    queryKey: ["balance", currentUser.id],
    queryFn: () => votingService.getBalance(currentUser.id),
  });

  const queue = entries.map((e) => e.id);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <p className="text-xl font-black tracking-tight">PICK IT</p>
        <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs">
          <Ticket className="size-3.5 text-accent" />
          무료 {balance?.free ?? "-"} · 일반 {balance?.standard ?? "-"}
        </div>
      </header>

      <section className="px-5 pt-3">
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img src={hero} alt="" width={1600} height={912} className="h-40 w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-background/45" />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <p className="text-[11px] tracking-[0.2em] text-accent">SEASON 1 · 2차 라운드</p>
            <p className="mt-1 text-lg font-bold">본선 투표가 진행 중입니다</p>
            <p className="text-xs text-muted-foreground">10월 15일 마감</p>
          </div>
        </div>
      </section>

      <section className="px-5 pt-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold">실시간 TOP 10</h2>
            {snapshot && <UpdatedAt iso={snapshot.updatedAt} />}
          </div>
          <Link to="/ranking" className="flex shrink-0 items-center text-xs text-muted-foreground">
            전체 랭킹 <ChevronRight className="size-3.5" />
          </Link>
        </div>
        {snapshot ? (
          <RankingList entries={snapshot.entries} className="mt-2" />
        ) : (
          <p className="py-6 text-sm text-muted-foreground">불러오는 중...</p>
        )}
      </section>

      <section className="pt-8">
        <h2 className="px-5 text-base font-bold">오늘의 추천 무대</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} queue={queue} />
          ))}
        </div>
      </section>

      <section className="px-5 py-8">
        <Link to="/apply" className="panel-2 flex items-center justify-between p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">나도 무대에 서고 싶다면</p>
            <p className="text-xs text-muted-foreground">2차 라운드 지원 접수 중</p>
          </div>
          <ChevronRight className="size-4 shrink-0" />
        </Link>
      </section>
    </div>
  );
}
