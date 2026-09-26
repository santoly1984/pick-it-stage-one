import type { ReactNode } from "react";

export function AdminSection({
  title,
  description,
  children,
  right,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="px-5 py-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function InternalOnly() {
  return (
    <p className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] text-accent">
      내부 전용 데이터입니다. 이 화면의 점수·가중치·환산 결과는 공개 화면에 노출되지 않습니다.
    </p>
  );
}
