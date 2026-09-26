/**
 * MOCK RANKING ENGINE
 *
 * Stands in for the future server-side Ranking/Scoring Engine.
 * The UI must never reproduce this math — it only renders what is returned.
 *
 *  - live-vote: fan votes only (includes mock votes cast in this session).
 *  - final: weighted composite; public only after every entry has all judge
 *    scores submitted AND the round has been finalized by an admin.
 */
import type { RankingService } from "@/services/contracts";
import { entries, evaluationRules, judgeScores, users, votes } from "@/mocks/data";
import type { AdminRankingEntry, EvaluationWeights, RankChange, RankingEntry, RankingKind } from "@/types";
import { assertRole } from "@/stores/session";
import { delay, nowIso } from "./util";

const previousRanks: Record<string, number> = {
  e_1: 3, e_2: 1, e_3: 2, e_4: 6, e_5: 4, e_6: 5,
  e_7: 9, e_8: 7, e_9: 8, e_10: 12, e_11: 10, e_12: 11,
};

const finalizedRounds = new Map<string, string>();
const JUDGE_COUNT = users.filter((u) => u.roles.includes("judge")).length;

function baseVotes(entryId: string) {
  const n = Number(entryId.split("_")[1] ?? 1);
  return 48_000 - n * 2_600 + Math.round(Math.abs(Math.sin(n * 2.7)) * 9_000);
}

function voteCountOf(entryId: string) {
  const cast = votes.filter((v) => v.entryId === entryId).reduce((s, v) => s + v.quantity, 0);
  // Mock weighting so a few demo votes visibly move the board.
  return baseVotes(entryId) + cast * 1_500;
}

function rankChangeOf(rank: number, previousRank: number | null): RankChange {
  if (previousRank == null) return "new";
  if (previousRank > rank) return "up";
  if (previousRank < rank) return "down";
  return "flat";
}

export function weightsFor(roundId: string): EvaluationWeights {
  const r = evaluationRules.find((x) => x.roundId === roundId) ?? evaluationRules[0]!;
  return { voteWeight: r.voteWeight, judgeWeight: r.judgeWeight, technicalWeight: r.technicalWeight };
}

export function isJudgingComplete(roundId: string) {
  return entries
    .filter((e) => e.roundId === roundId)
    .every(
      (e) => judgeScores.filter((s) => s.entryId === e.id && s.status === "submitted").length >= JUDGE_COUNT,
    );
}

export function computeRanking(roundId: string, kind: RankingKind, weights = weightsFor(roundId)): AdminRankingEntry[] {
  const pool = entries.filter((e) => e.roundId === roundId);
  const maxVotes = Math.max(...pool.map((e) => voteCountOf(e.id)), 1);

  const rows = pool.map((entry) => {
    const voteCount = voteCountOf(entry.id);
    const voteScore = Math.round((voteCount / maxVotes) * 1000) / 10;
    const mine = judgeScores.filter((s) => s.entryId === entry.id && s.status === "submitted");
    const judgeRaw = mine.length
      ? mine.reduce((sum, s) => sum + Object.values(s.scores).reduce((a, b) => a + b, 0), 0) / mine.length
      : 0;
    const judgeScore = Math.round(judgeRaw * 10) / 10;
    const n = Number(entry.id.split("_")[1] ?? 1);
    const technicalScore = Math.round((70 + Math.abs(Math.cos(n * 1.9)) * 28) * 10) / 10;
    const convertedScore =
      Math.round(
        (voteScore * weights.voteWeight + judgeScore * weights.judgeWeight + technicalScore * weights.technicalWeight) * 10,
      ) / 10;
    return { entry, voteCount, voteScore, judgeScore, technicalScore, convertedScore };
  });

  rows.sort((a, b) => (kind === "live-vote" ? b.voteCount - a.voteCount : b.convertedScore - a.convertedScore));
  const updatedAt = nowIso();

  return rows.map((row, i) => {
    const rank = i + 1;
    const previousRank = previousRanks[row.entry.id] ?? null;
    return {
      entryId: row.entry.id,
      artistName: row.entry.artistName,
      branch: row.entry.branch,
      coverUrl: row.entry.coverUrl,
      rank,
      previousRank,
      rankChange: rankChangeOf(rank, previousRank),
      updatedAt,
      voteCount: row.voteCount,
      voteScore: row.voteScore,
      judgeScore: row.judgeScore,
      technicalScore: row.technicalScore,
      convertedScore: row.convertedScore,
      totalScore: row.convertedScore,
      weightsApplied: weights,
      changeReason:
        previousRank == null
          ? "신규 진입"
          : previousRank > rank
            ? "투표 증가분 반영"
            : previousRank < rank
              ? "심사 점수 반영 후 상대 순위 하락"
              : "변동 없음",
    } satisfies AdminRankingEntry;
  });
}

/** Strips every internal field. The public API must not leak breakdown data. */
function toPublic(rows: AdminRankingEntry[]): RankingEntry[] {
  return rows.map(({ entryId, artistName, branch, coverUrl, rank, previousRank, rankChange, updatedAt }) => ({
    entryId,
    artistName,
    branch,
    coverUrl,
    rank,
    previousRank,
    rankChange,
    updatedAt,
  }));
}

export const mockRankingService: RankingService = {
  async getPublicRanking({ roundId, kind, limit }) {
    const publishable = kind === "live-vote" || (finalizedRounds.has(roundId) && isJudgingComplete(roundId));
    const rows = publishable ? toPublic(computeRanking(roundId, kind)).slice(0, limit ?? undefined) : [];
    return delay({
      id: `snap_pub_${roundId}_${kind}`,
      auditionId: "a_1",
      roundId,
      kind,
      published: publishable,
      entries: rows,
      updatedAt: kind === "final" ? (finalizedRounds.get(roundId) ?? nowIso()) : nowIso(),
    });
  },
  async getAdminRanking({ roundId, kind, weights }) {
    assertRole("admin");
    return delay({
      id: `snap_adm_${roundId}_${kind}`,
      auditionId: "a_1",
      roundId,
      kind,
      published: kind === "live-vote" || finalizedRounds.has(roundId),
      entries: computeRanking(roundId, kind, weights),
      updatedAt: nowIso(),
    });
  },
  async finalizeRanking(roundId) {
    assertRole("admin");
    if (!isJudgingComplete(roundId)) throw new Error("모든 심사가 제출되지 않아 확정할 수 없습니다.");
    const finalizedAt = nowIso();
    finalizedRounds.set(roundId, finalizedAt);
    return delay({ finalizedAt }, 600);
  },
};
