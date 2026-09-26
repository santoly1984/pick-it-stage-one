import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageCircle, Music4, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/home", label: "홈", icon: Home },
  { to: "/ranking", label: "랭킹", icon: Trophy },
  { to: "/community", label: "커뮤니티", icon: MessageCircle },
  { to: "/player", label: "플레이어", icon: Music4 },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const visible = ITEMS.some((i) => pathname.startsWith(i.to)) || pathname.startsWith("/artist");
  if (!visible) return null;

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur">
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "text-accent")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
