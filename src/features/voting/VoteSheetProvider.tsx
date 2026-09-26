/**
 * Global vote sheet. Any screen (including the player) opens it with
 * `useVoteSheet().open({ entryId, artistName })`.
 * Payment / ledger / idempotency are intentionally out of scope — the mock
 * VotingService just decrements an in-memory balance.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Check, Minus, Plus, Ticket } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { votingService } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { getSession } from "@/stores/session";
import { rankingKeys } from "@/features/ranking/queries";
import type { TicketBalance, TicketType } from "@/types";
import { useEffect } from "react";

interface VoteTarget {
  entryId: string;
  artistName: string;
  roundId: string;
}

interface VoteSheetApi {
  open: (target: VoteTarget) => void;
}

const VoteSheetContext = createContext<VoteSheetApi | null>(null);

type Step = "select" | "confirm" | "done";

export function VoteSheetProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<VoteTarget | null>(null);
  const [step, setStep] = useState<Step>("select");
  const [ticketType, setTicketType] = useState<TicketType>("free");
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState<TicketBalance | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const open = useCallback((next: VoteTarget) => {
    setTarget(next);
    setStep("select");
    setTicketType("free");
    setQuantity(1);
    setError(null);
  }, []);

  useEffect(() => {
    if (!target) return;
    void votingService.getBalance(getSession().userId).then(setBalance);
  }, [target]);

  const max = balance ? balance[ticketType] : 0;

  const submit = async () => {
    if (!target) return;
    setSubmitting(true);
    setError(null);
    try {
      await votingService.castVote({
        userId: getSession().userId,
        entryId: target.entryId,
        roundId: target.roundId,
        ticketType,
        quantity,
      });
      setBalance(await votingService.getBalance(getSession().userId));
      // Refresh every public ranking view (Home TOP, Ranking, Artist, Player) and balances.
      void qc.invalidateQueries({ queryKey: rankingKeys.publicAll });
      void qc.invalidateQueries({ queryKey: ["balance"] });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "투표에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const api = useMemo<VoteSheetApi>(() => ({ open }), [open]);

  return (
    <VoteSheetContext.Provider value={api}>
      {children}
      <Sheet open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-border bg-surface px-5 pb-8">
          <SheetHeader className="px-0 text-left">
            <SheetTitle className="text-lg">
              {step === "done" ? "투표 완료" : `${target?.artistName ?? ""} 님에게 투표`}
            </SheetTitle>
            <SheetDescription>
              {step === "done"
                ? "응원이 전달됐습니다. 실시간 순위에 곧 반영됩니다."
                : "보유한 투표권을 선택하고 수량을 정하세요."}
            </SheetDescription>
          </SheetHeader>

          {step !== "done" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {(["free", "standard"] as TicketType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTicketType(t);
                      setQuantity(1);
                    }}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      ticketType === t ? "border-primary bg-primary/15" : "border-border bg-surface-2",
                    )}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Ticket className="size-4" />
                      {t === "free" ? "무료 투표권" : "일반 투표권"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      보유 {balance ? balance[t] : "-"}장
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3">
                <span className="text-sm text-muted-foreground">수량</span>
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="수량 감소"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-lg font-semibold tabular-nums">{quantity}</span>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setQuantity((q) => Math.min(Math.max(max, 1), q + 1))}
                    aria-label="수량 증가"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              {step === "select" ? (
                <Button className="w-full" size="lg" disabled={max < 1} onClick={() => setStep("confirm")}>
                  {max < 1 ? "보유한 투표권이 없습니다" : "다음"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm">
                    <p>
                      <span className="text-muted-foreground">대상 </span>
                      {target?.artistName}
                    </p>
                    <p className="mt-1">
                      <span className="text-muted-foreground">사용 </span>
                      {ticketType === "free" ? "무료" : "일반"} 투표권 {quantity}장
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setStep("select")}>
                      뒤로
                    </Button>
                    <Button className="flex-1" disabled={submitting} onClick={submit}>
                      {submitting ? "처리 중..." : "투표 확정"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-4">
                <span className="grid size-10 place-items-center rounded-full bg-primary">
                  <Check className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {target?.artistName} · {ticketType === "free" ? "무료" : "일반"} {quantity}표
                  </p>
                  <p className="text-xs text-muted-foreground">
                    남은 투표권 무료 {balance?.free ?? 0} · 일반 {balance?.standard ?? 0}
                  </p>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={() => setTarget(null)}>
                닫기
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </VoteSheetContext.Provider>
  );
}

export function useVoteSheet() {
  const ctx = useContext(VoteSheetContext);
  if (!ctx) throw new Error("useVoteSheet must be used inside <VoteSheetProvider>");
  return ctx;
}
