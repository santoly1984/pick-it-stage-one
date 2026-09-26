import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useSession } from "@/stores/session";
import type { UserRole } from "@/types";

/**
 * Client-side gate for the mock session. Denies direct URL access when the
 * demo role is missing. Real enforcement must happen on the server.
 */
export function RoleGate({ role, children }: { role: UserRole; children: ReactNode }) {
  const session = useSession();

  if (!session.hydrated) {
    return <p className="px-5 py-16 text-center text-sm text-muted-foreground">권한 확인 중...</p>;
  }

  if (!session.roles.includes(role)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-surface-2">
          <Lock className="size-5" />
        </span>
        <p className="text-base font-semibold">접근 권한이 없습니다</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          {role === "admin" ? "운영자" : "심사위원"} 계정만 이용할 수 있는 화면입니다.
        </p>
        <Link to="/home" className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold">
          홈으로
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
