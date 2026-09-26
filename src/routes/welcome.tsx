import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-stage.jpg";

const TITLE = "PICK IT — 새로운 목소리를 듣고 고르는 음악 플랫폼";
const DESC = "다양한 음악 오디션의 무대를 발견하고, 감상하고, 직접 선택하세요.";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-6 pt-8">
        <p className="text-lg font-black tracking-tight">PICK IT</p>
      </div>

      <div className="px-6 pt-10">
        <h1 className="text-[32px] font-bold leading-[1.3] tracking-tight">
          좋은 음악은
          <br />
          <span className="text-primary">당신이 골라요</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          새로운 목소리를 발견하고, 무대 뒤 이야기까지 듣고, 마음에 드는 무대에 투표하세요.
        </p>
      </div>

      <div className="px-6 pt-8">
        <img
          src={hero}
          alt="무대 조명 아래의 마이크"
          width={1600}
          height={912}
          className="aspect-[4/3] w-full rounded-3xl object-cover"
        />
        <div className="panel mt-3 flex items-center justify-between px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">지금 진행 중인 오디션</p>
            <p className="truncate text-sm font-semibold">시즌 1 · 군 장병 음악 오디션</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">투표 중</span>
        </div>
      </div>

      <div className="mt-auto space-y-2 px-6 pb-10 pt-10">
        <Link
          to="/signin"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
        >
          시작하기
        </Link>
        <Link
          to="/home"
          className="flex h-14 w-full items-center justify-center rounded-2xl text-base font-semibold text-muted-foreground"
        >
          먼저 둘러볼게요
        </Link>
      </div>
    </div>
  );
}
