import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-stage.jpg";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "PICK IT — 군 장병 음악 오디션" },
      { name: "description", content: "군 장병의 목소리를 무대에 올리는 오디션. 듣고, 응원하고, 투표하세요." },
      { property: "og:title", content: "PICK IT — 군 장병 음악 오디션" },
      { property: "og:description", content: "군 장병의 목소리를 무대에 올리는 오디션. 듣고, 응원하고, 투표하세요." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <img
        src={hero}
        alt=""
        width={1600}
        height={912}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-background/70" />

      <div className="relative flex flex-1 flex-col justify-end px-6 pb-12 pt-24">
        <p className="text-xs tracking-[0.3em] text-accent">MILITARY MUSIC AUDITION</p>
        <h1 className="mt-4 text-5xl font-black leading-tight">
          PICK
          <br />
          IT
        </h1>
        <div className="accent-rule mt-5" />
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          군 복무 중에도 음악은 멈추지 않습니다. 장병의 무대를 듣고, 응원하고, 직접 투표로 순위를 만들어 주세요.
        </p>

        <div className="mt-10 space-y-3">
          <Link
            to="/signin"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold"
          >
            시작하기
          </Link>
          <Link
            to="/home"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold"
          >
            둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}
