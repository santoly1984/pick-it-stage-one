import { createFileRoute, Link } from "@tanstack/react-router";
import { DiscGraphic } from "@/components/brand/DiscGraphic";

const TITLE = "PICK IT — 새로운 목소리를 듣고 고르는 음악 플랫폼";
const DESC = "다양한 음악 오디션의 무대를 발견하고, 감상하고, 직접 선택하세요.";

export const Route = createFileRoute("/welcome")({
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
  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-6 pt-8">
        <p className="text-lg font-black tracking-tight">PICK IT</p>
      </div>

      <div className="px-6 pt-10">
        <h1 className="text-[36px] font-bold leading-[1.25] tracking-tight">
          좋은 음악은
          <br />
          <span className="text-accent">당신이 골라요</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          새로운 목소리를 발견하고, 무대 뒤 이야기까지 듣고, 마음에 드는 무대에 투표하세요.
        </p>
      </div>

      <div className="mt-auto px-6 pt-8">
        <DiscGraphic />
        <p className="mt-4 text-xs text-muted-foreground">지금 진행 중 · 시즌 1 군 장병 음악 오디션</p>
      </div>

      <div className="space-y-2 px-6 pb-10 pt-6">
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
