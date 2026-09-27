import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services";
import { AdminSection } from "@/features/admin/AdminSection";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "사용자 관리 — PICK IT" },
      { name: "description", content: "계정과 역할 배정을 확인합니다." },
      { property: "og:title", content: "사용자 관리 — PICK IT" },
      { property: "og:description", content: "계정과 역할 배정을 확인합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const { data: users = [] } = useQuery({ queryKey: ["admin", "users"], queryFn: () => adminService.listUsers() });

  return (
    <AdminSection title="사용자" description="팬·참가자는 한 계정에서 함께 보유할 수 있습니다.">
      <ul className="divide-y divide-border">
        {users.map((u) => (
          <li key={u.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{u.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {u.handle}
                {u.unit ? ` · ${u.unit}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {u.roles.map((r) => (
                <Badge key={r} variant="secondary" className="text-[10px]">
                  {r}
                </Badge>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
