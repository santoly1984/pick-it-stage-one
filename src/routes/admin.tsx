import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "대시보드", exact: true },
  { to: "/admin/auditions", label: "오디션" },
  { to: "/admin/entries", label: "참가자" },
  { to: "/admin/votes", label: "투표" },
  { to: "/admin/judging", label: "심사" },
  { to: "/admin/ranking", label: "순위" },
  { to: "/admin/lyrics", label: "가사" },
  { to: "/admin/users", label: "사용자" },
  { to: "/admin/audit", label: "감사로그" },
] as const;

/**
 * ADMIN AREA — the only place where score breakdowns may be rendered.
 * Real permission checks belong on the server in a later phase.
 */
function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen pb-6">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 px-5 pb-2 pt-4">
          <ShieldCheck className="size-4 text-accent" />
          <p className="text-sm font-bold">PICK IT 운영자 콘솔</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
