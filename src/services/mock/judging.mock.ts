import type { JudgingService } from "@/services/contracts";
import { entries, evaluationRule, judgeScores, rounds } from "@/mocks/data";
import type { JudgeScore } from "@/types";
import { clone, delay, nowIso } from "./util";

export const mockJudgingService: JudgingService = {
  async listAssignedRounds() {
    return delay(clone(rounds.filter((r) => r.status !== "scheduled")));
  },
  async listAssignedEntries(_judgeId, roundId) {
    return delay(clone(entries.filter((e) => e.roundId === roundId)));
  },
  async getEvaluationRule() {
    return delay(clone(evaluationRule));
  },
  async getMyScore(judgeId, entryId) {
    return delay(clone(judgeScores.find((s) => s.judgeId === judgeId && s.entryId === entryId)));
  },
  async saveScore(input) {
    const idx = judgeScores.findIndex((s) => s.judgeId === input.judgeId && s.entryId === input.entryId);
    const next: JudgeScore = { ...input, id: `js_${input.entryId}_${input.judgeId}`, updatedAt: nowIso() };
    if (idx >= 0) judgeScores[idx] = next;
    else judgeScores.push(next);
    return delay(clone(next), 350);
  },
};
