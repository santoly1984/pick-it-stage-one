import type { AdminService } from "@/services/contracts";
import { auditLogs, entries, evaluationRule, judgeScores, users } from "@/mocks/data";
import type { EvaluationRule } from "@/types";
import { clone, delay, nowIso } from "./util";

let rule: EvaluationRule = { ...evaluationRule };
const JUDGES = users.filter((u) => u.roles.includes("judge"));

export const mockAdminService: AdminService = {
  async listJudgingProgress(roundId) {
    const pool = entries.filter((e) => e.roundId === roundId);
    return delay(
      JUDGES.map((j) => ({
        roundId,
        judgeId: j.id,
        judgeName: j.displayName,
        assignedCount: pool.length,
        submittedCount: judgeScores.filter(
          (s) => s.judgeId === j.id && s.status === "submitted" && pool.some((e) => e.id === s.entryId),
        ).length,
      })),
    );
  },
  async listEntryJudgingProgress(roundId) {
    return delay(
      entries
        .filter((e) => e.roundId === roundId)
        .map((e) => ({
          entryId: e.id,
          artistName: e.artistName,
          judgeCount: JUDGES.length,
          submittedCount: judgeScores.filter((s) => s.entryId === e.id && s.status === "submitted").length,
        })),
    );
  },
  async listJudgeScores(entryId) {
    return delay(clone(judgeScores.filter((s) => s.entryId === entryId)));
  },
  async getEvaluationRule() {
    return delay(clone(rule));
  },
  async updateEvaluationRule(next) {
    rule = { ...next, updatedAt: nowIso() };
    auditLogs.unshift({
      id: `al_${Date.now()}`,
      actorId: "u_admin",
      actorName: "운영자",
      action: "evaluation_rule.update",
      target: rule.id,
      meta: { voteWeight: rule.voteWeight, judgeWeight: rule.judgeWeight, technicalWeight: rule.technicalWeight },
      createdAt: nowIso(),
    });
    return delay(clone(rule), 350);
  },
  async listUsers() {
    return delay(clone(users));
  },
  async listAuditLogs() {
    return delay(clone(auditLogs));
  },
  async listVoteStats(roundId) {
    return delay(
      entries
        .filter((e) => e.roundId === roundId)
        .map((e, i) => {
          const free = 4_200 + i * 310;
          const standard = 22_000 - i * 1_400;
          return { entryId: e.id, artistName: e.artistName, free, standard, total: free + standard };
        })
        .sort((a, b) => b.total - a.total),
    );
  },
};
