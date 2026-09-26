import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Gavel, Mic2, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/onboarding/role")({
  head: () => ({
    meta: [
      { title: "역할 선택 — PICK IT" },
      { name: "description", content: "팬, 참가자, 심사위원, 운영자 중 시작할 역할을 선택하세요." },
      { property: "og:title", content: "역할 선택 — PICK IT" },
      { property: "og:description", content: "팬, 참가자, 심사위원, 운영자 중 시작할 역할을 선택하세요." },
    ],
  }),
  component: RoleOnboarding,
});

const ROLES: { role: UserRole; title: string; desc: string; icon: typeof Users }[] = [
  { role: "fan", title: "팬", desc: "무대를 듣고 투표로 응원합니다.", icon: Users },
  { role: "challenger", title: "참가자", desc: "오디션에 지원하고 내 무대를 올립니다.", icon: Mic2 },
  { role: "judge", title: "심사위원", desc: "배정된 라운드를 평가합니다. 별도 권한이 필요합니다.", icon: Gavel },
  { role: "admin", title: "운영자", desc: "오디션 운영과 결과 확정을 담당합니다.", icon: ShieldCheck },
];

function RoleOnboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UserRole[]>(["fan"]);

  const toggle = (role: UserRole) => {
    // Fan + Challenger can be held together; judge/admin are exclusive.
    if (role === "judge" || role === "admin") {
      setSelected([role]);
      return;
    }
    setSelected((prev) => {
      const base = prev.filter((r) => r === "fan" || r === "challenger");
      return base.includes(role) ? (base.filter((r) => r !== role) as UserRole[]) : [...base, role];
    });
  };

  const destination = selected.includes("admin")
    ? "/admin"
    : selected.includes("judge")
      ? "/judge"
      : selected.includes("challenger")
        ? "/apply"
        : "/home";

  return (
    <div className="min-h-screen">
      <PageHeader title="어떻게 참여하시겠어요?" backTo="/signin" />
      <div className="space-y-6 px-5 py-6">
        <p className="text-sm text-muted-foreground">
          팬과 참가자는 함께 선택할 수 있습니다. 심사위원과 운영자는 별도 권한 계정입니다.
        </p>

        <div className="space-y-3">
          {ROLES.map(({ role, title, desc, icon: Icon }) => {
            const active = selected.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggle(role)}
                className={cn(
                  "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  active ? "border-primary bg-primary/15" : "border-border bg-surface",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-muted-foreground">{desc}</span>
                </span>
                {active && <Check className="size-4 shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected.length}
          onClick={() => navigate({ to: destination })}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold disabled:opacity-40"
        >
          계속하기
        </button>
      </div>
    </div>
  );
}
