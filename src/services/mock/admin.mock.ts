import type { AdminService } from "@/services/contracts";
import { auditLogs, entries, evaluationRules, judgeScores, users } from "@/mocks/data";
import { assertRole } from "@/stores/session";
import { clone, delay, nowIso } from "./util";
import { computeRanking, isResultLocked, onSourceChanged } from "./ranking.mock";

const JUDGES = users.filter((u) => u.roles.includes("judge"));

/** ADMIN-ONLY adapter. Every call checks the mock session role. */
export const mockAdminService: AdminService = {
  async listEntries(auditionId) {
    assertRole("admin");
    return delay(clone(entries.filter((e) => e.auditionId === auditionId)));
  },
  async listJudgingProgress(roundId) {
    assertRole("admin");
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
    assertRole("admin");
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
    assertRole("admin");
    return delay(clone(judgeScores.filter((s) => s.entryId === entryId)));
  },
  async getEvaluationRule(roundId) {
    assertRole("admin");
    const rule = evaluationRules.find((r) => r.roundId === roundId);
    if (!rule) throw new Error(`No evaluation rule for round ${roundId}`);
    return delay(clone(rule));
  },
  async simulateEvaluationRule(roundId, weights) {
    assertRole("admin");
    const current = computeRanking(roundId, "final");
    const simulated = computeRanking(roundId, "final", weights);
    return delay(
      simulated.map((row) => ({
        entryId: row.entryId,
        artistName: row.artistName,
        simulatedRank: row.rank,
        currentRank: current.find((c) => c.entryId === row.entryId)?.rank ?? row.rank,
      })),
    );
  },
  async saveEvaluationRuleDraft(roundId, weights) {
    assertRole("admin");
    const rule = evaluationRules.find((r) => r.roundId === roundId);
    if (!rule) throw new Error(`No evaluation rule for round ${roundId}`);
    if (isResultLocked(roundId)) throw new Error("확정/공개된 라운드의 규칙은 변경할 수 없습니다.");
    Object.assign(rule, { draftWeights: { ...weights }, status: "draft", updatedAt: nowIso() });
    auditLogs.unshift({
      id: `al_${Date.now()}`,
      actorId: "u_admin",
      actorName: "운영자",
      action: "evaluation_rule.save_draft",
      target: rule.id,
      meta: { ...weights },
      createdAt: nowIso(),
    });
    return delay(clone(rule), 350);
  },
  async applyEvaluationRule(roundId) {
    assertRole("admin");
    const rule = evaluationRules.find((r) => r.roundId === roundId);
    if (!rule) throw new Error(`No evaluation rule for round ${roundId}`);
    if (rule.status !== "draft" || !rule.draftWeights) throw new Error("적용할 검토 완료 초안이 없습니다.");
    if (isResultLocked(roundId)) throw new Error("확정/공개된 라운드의 규칙은 변경할 수 없습니다.");
    Object.assign(rule, rule.draftWeights, { draftWeights: undefined, status: "approved", updatedAt: nowIso() });
    onSourceChanged(roundId, "평가 규칙 적용(mock)");
    auditLogs.unshift({
      id: `al_${Date.now()}`,
      actorId: "u_admin",
      actorName: "운영자",
      action: "evaluation_rule.apply",
      target: rule.id,
      meta: { voteWeight: rule.voteWeight, judgeWeight: rule.judgeWeight, technicalWeight: rule.technicalWeight },
      createdAt: nowIso(),
    });
    return delay(clone(rule), 350);
  },
  async listUsers() {
    assertRole("admin");
    return delay(clone(users));
  },
  async listAuditLogs() {
    assertRole("admin");
    return delay(clone(auditLogs));
  },
  async listVoteStats(roundId) {
    assertRole("admin");
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
