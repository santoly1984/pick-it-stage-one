import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DEMO_ACCOUNTS, setSession, useSession } from "@/stores/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demo/roles")({
  head: () => ({
    meta: [
      { title: "데모 역할 전환 — PICK IT" },
      { name: "description", content: "개발·QA 검수용 mock 역할 전환 화면." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "데모 역할 전환 — PICK IT" },
      { property: "og:description", content: "개발·QA 검수용 mock 역할 전환 화면." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoRoles,
});

const OPTIONS = [
  { key: "fan", label: "팬", to: "/home", flow: "듣기 → 투표 → 랭킹 확인 · /judge·/admin 접근 차단" },
  { key: "challenger", label: "팬 + 참가자", to: "/home", flow: "팬 기능 + 지원서(/apply) · /judge·/admin 접근 차단" },
  { key: "judge", label: "심사위원 (데모 계정)", to: "/judge", flow: "라운드 → 참가자 → 평가 저장 → 다음 · /admin 접근 차단" },
  { key: "admin", label: "운영자 (데모 계정)", to: "/admin", flow: "진행률 → 규칙 시뮬레이션·적용 → 검토·확정·공개 · 가사 싱크" },
] as const;

/**
 * DEMO-ONLY. Switches the client-side mock session. Must be removed or
 * disabled once real authentication and server-side role checks exist.
 */
function DemoRoles() {
  const session = useSession();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <PageHeader title="데모 역할 전환" subtitle="개발·QA 전용" backTo="/signin" />
      <div className="space-y-4 px-5 py-6">
        <p className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs leading-relaxed text-accent">
          <FlaskConical className="mt-0.5 size-3.5 shrink-0" />
          실제 권한이 아닌 브라우저 mock 세션입니다. 실서비스에서는 서버가 역할을 검증해야 하며 이 화면은 제거됩니다.
        </p>
        {OPTIONS.map((o) => {
          const acc = DEMO_ACCOUNTS[o.key];
          const active = session.userId === acc.userId && session.roles.join() === acc.roles.join();
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => {
                setSession(acc);
                navigate({ to: o.to });
              }}
              className={cn(
                "w-full rounded-xl border p-4 text-left text-sm font-semibold",
                active ? "border-primary bg-primary/15" : "border-border bg-surface",
              )}
            >
              {o.label}
              <span className="block text-xs font-normal text-muted-foreground">{acc.roles.join(" + ")}</span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">{o.flow}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
