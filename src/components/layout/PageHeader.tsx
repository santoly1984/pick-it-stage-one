import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  backTo,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {backTo && (
          <Link to={backTo} aria-label="뒤로" className="-ml-2 shrink-0 p-2 text-muted-foreground">
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </header>
  );
}
