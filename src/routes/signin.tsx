import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Apple, Mail, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "로그인 — PICK IT" },
      { name: "description", content: "PICK IT에 로그인하고 좋아하는 무대를 발견하고 응원하세요." },
      { property: "og:title", content: "로그인 — PICK IT" },
      { property: "og:description", content: "PICK IT에 로그인하고 좋아하는 무대를 발견하고 응원하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

/** Auth is out of scope for this phase — buttons route straight to onboarding. */
function SignIn() {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/onboarding/role" });

  return (
    <div className="theme-light min-h-screen">
      <PageHeader title="로그인" backTo="/welcome" />
      <div className="space-y-6 px-6 py-10">
        <div>
          <h2 className="text-2xl font-bold">다시 만나 반가워요</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            이번 단계에서는 실제 인증 없이 화면 흐름만 확인할 수 있습니다.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { label: "카카오로 계속하기", icon: MessageSquare },
            { label: "Apple로 계속하기", icon: Apple },
            { label: "이메일로 계속하기", icon: Mail },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={go}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface text-sm font-semibold"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          계속 진행하면 이용약관과 개인정보 처리방침에 동의하게 됩니다.
        </p>

        <div className="space-y-3 pt-6 text-center">
          <Link to="/demo/roles" className="block text-xs text-muted-foreground underline underline-offset-4">
            검수용 데모 역할 전환 (개발·QA 전용)
          </Link>
          <Link to="/home" className="text-sm text-accent underline-offset-4 hover:underline">
            로그인 없이 둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}
