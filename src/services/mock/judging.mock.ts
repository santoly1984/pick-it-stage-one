import type { JudgingService } from "@/services/contracts";
import { criteria, entries, judgeScores, rounds } from "@/mocks/data";
import type { JudgeScore } from "@/types";
import { assertRole } from "@/stores/session";
import { clone, delay, nowIso } from "./util";
import { toPublicEntry } from "./mappers";
import { onSourceChanged } from "./ranking.mock";

/** JUDGE-ONLY adapter. Every call checks the mock session role. */
export const mockJudgingService: JudgingService = {
  async listAssignedRounds() {
    assertRole("judge");
    return delay(clone(rounds.filter((r) => r.status !== "scheduled")));
  },
  async listAssignedEntries(_judgeId, roundId) {
    assertRole("judge");
    return delay(entries.filter((e) => e.roundId === roundId).map(toPublicEntry));
  },
  async getEntry(entryId) {
    assertRole("judge");
    const e = entries.find((x) => x.id === entryId);
    return delay(e ? toPublicEntry(e) : undefined);
  },
  async getCriteria() {
    assertRole("judge");
    // Judges see criteria only — never weights.
    return delay(clone(criteria));
  },
  async getMyScore(judgeId, entryId) {
    assertRole("judge");
    return delay(clone(judgeScores.find((s) => s.judgeId === judgeId && s.entryId === entryId)));
  },
  async listMyScores(judgeId, roundId) {
    assertRole("judge");
    return delay(clone(judgeScores.filter((s) => s.judgeId === judgeId && s.roundId === roundId)));
  },
  async saveScore(input) {
    assertRole("judge");
    const idx = judgeScores.findIndex((s) => s.judgeId === input.judgeId && s.entryId === input.entryId);
    const next: JudgeScore = { ...input, id: `js_${input.entryId}_${input.judgeId}`, updatedAt: nowIso() };
    if (idx >= 0) judgeScores[idx] = next;
    else judgeScores.push(next);
    onSourceChanged(input.roundId, `심사 ${next.status === "submitted" ? "제출" : "임시저장"} · ${input.judgeId} → ${input.entryId}`);
    return delay(clone(next), 350);
  },
};
