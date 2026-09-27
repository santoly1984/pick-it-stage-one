import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { auditionService, DEFAULT_AUDITION_ID } from "@/services";
import { Button } from "@/components/ui/button";
import { publicRankingQuery } from "@/features/ranking/queries";

const featuredQuery = queryOptions({
  queryKey: ["welcome", "featured", "e_1", "e_2", "e_14", "e_16"],
  queryFn: () => auditionService.getPlayableEntries(["e_1", "e_2", "e_14", "e_16"]),
});
const programQuery = queryOptions({
  queryKey: ["welcome", "program"],
  queryFn: () => auditionService.getAudition(DEFAULT_AUDITION_ID),
});
const leadersQuery = publicRankingQuery("live-vote", 3);

const TITLE = "PICK IT — 새로운 목소리를 듣고 고르는 음악 플랫폼";
const DESC = "다양한 음악 오디션의 무대를 발견하고, 감상하고, 직접 선택하세요.";

export const Route = createFileRoute("/welcome")({
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(featuredQuery),
    context.queryClient.ensureQueryData(programQuery),
    context.queryClient.ensureQueryData(leadersQuery),
  ]),
  errorComponent: () => <div role="alert" className="px-6 py-12 text-center">무대를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>,
  notFoundComponent: () => <div className="px-6 py-12 text-center">무대를 찾을 수 없습니다.</div>,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { data: featured } = useSuspenseQuery(featuredQuery);
  const { data: program } = useSuspenseQuery(programQuery);
  const { data: leaders } = useSuspenseQuery(leadersQuery);

  return (
    <main className="px-5 pb-12 pt-6 sm:px-8 lg:px-10">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-5">
        <p className="min-w-0 truncate text-xl font-black">PICK IT<span className="text-accent">.</span></p>
        <Link to="/signin" className="shrink-0 text-sm font-semibold text-muted-foreground hover:text-foreground">로그인 <ArrowRight className="inline size-4" /></Link>
      </header>

      <section className="pt-10 sm:pt-14">
        <p className="text-xs font-bold text-accent">LISTEN · DISCOVER · PICK</p>
        <h1 className="mt-3 max-w-3xl text-[34px] font-bold leading-[1.18] sm:text-5xl lg:text-6xl">
          새로운 목소리를 듣고,<br /><span className="text-primary">마음에 남는 무대를 고르다.</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          다양한 음악 오디션의 노래와 이야기를 만나보세요. 듣고, 발견하고, 직접 선택하는 곳.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <Button asChild size="lg" className="h-12 px-5 text-sm sm:min-w-40"><Link to="/signin">시작하기 <ArrowRight /></Link></Button>
          <Button asChild variant="secondary" size="lg" className="h-12 px-4 text-sm sm:min-w-40"><Link to="/home">둘러보기</Link></Button>
        </div>
      </section>

      <section className="mt-11 sm:mt-16" aria-labelledby="welcome-stage-heading">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-accent">NOW PLAYING · DEMO</p>
            <h2 id="welcome-stage-heading" className="mt-1 text-xl font-bold sm:text-2xl">지금 들어볼 무대</h2>
          </div>
          <Link to="/home" className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">모두 보기 <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-4">
          {featured.map(({ entry, track }) => (
            <Link key={entry.id} to="/artist/$id" params={{ id: entry.id }} className="group min-w-0">
              <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                <img src={entry.coverUrl} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" width={320} height={320} />
              </div>
              <p className="mt-2 flex items-center justify-between gap-2 text-base font-bold"><span className="truncate">{entry.artistName}</span><ArrowRight className="size-4 shrink-0 text-primary" /></p>
              <p className="truncate text-sm text-muted-foreground">{track.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 border-t border-border pt-8 sm:mt-14 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-10" aria-label="진행 중인 오디션과 랭킹">
        <div className="min-w-0">
          <p className="text-xs font-bold text-accent">진행 중 · 시즌 1</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">{program?.subtitle ?? "현재 진행 중인 오디션"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">2차 본선 · 100명 데모 투표</p>
          <Button asChild variant="secondary" className="mt-5 h-10"><Link to="/ranking">프로그램 랭킹 보기 <ArrowRight /></Link></Button>
        </div>
        <div className="min-w-0 border-t border-border pt-5 sm:border-t-0 sm:pt-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold">실시간 TOP 3</h2><span className="text-xs text-muted-foreground">데모 데이터</span>
          </div>
          <div className="mt-3 divide-y divide-border">
            {leaders.entries.map((row) => (
              <Link to="/artist/$id" params={{ id: row.entryId }} key={row.entryId} className="flex min-w-0 items-center gap-3 py-2.5">
                <span className="w-5 shrink-0 text-center font-bold text-accent">{row.rank}</span>
                <img src={row.coverUrl} alt="" width={44} height={44} className="size-11 shrink-0 rounded-md object-cover" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{row.artistName}</span><span className="block truncate text-xs text-muted-foreground">{row.trackTitle}</span></span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
