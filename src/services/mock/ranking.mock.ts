/**
 * MOCK RANKING ENGINE
 *
 * Stands in for the future server-side Ranking/Scoring Engine.
 * The UI must never reproduce this math — it only renders what is returned.
 */
import type { RankingService } from "@/services/contracts";
import { entries, evaluationRule, judgeScores } from "@/mocks/data";
import type { AdminRankingEntry, RankChange, RankingEntry, RankingKind } from "@/types";
import { delay, nowIso } from "./util";

const previousRanks: Record<string, number> = {
  e_1: 3, e_2: 1, e_3: 2, e_4: 6, e_5: 4, e_6: 5,
  e_7: 9, e_8: 7, e_9: 8, e_10: 12, e_11: 10, e_12: 11,
};

function pseudoVotes(entryId: string, kind: RankingKind) {
  const n = Number(entryId.split("_")[1] ?? 1);
  const base = 48_000 - n * 2_600 + Math.round(Math.abs(Math.sin(n * 2.7)) * 9_000);
  return kind === "live-vote" ? base : Math.round(base * 0.94);
}

function rankChangeOf(rank: number, previousRank: number | null): RankChange {
  if (previousRank == null) return "new";
  if (previousRank > rank) return "up";
  if (previousRank < rank) return "down";
  return "flat";
}

function computeAdmin(
  roundId: string,
  kind: RankingKind,
  weights = {
    voteWeight: evaluationRule.voteWeight,
    judgeWeight: evaluationRule.judgeWeight,
    technicalWeight: evaluationRule.technicalWeight,
  },
): AdminRankingEntry[] {
  const pool = entries.filter((e) => e.roundId === roundId);
  const maxVotes = Math.max(...pool.map((e) => pseudoVotes(e.id, kind)), 1);

  const rows = pool.map((entry) => {
    const voteCount = pseudoVotes(entry.id, kind);
    const voteScore = Math.round((voteCount / maxVotes) * 1000) / 10;

    const mine = judgeScores.filter((s) => s.entryId === entry.id && s.status === "submitted");
    const judgeRaw = mine.length
      ? mine.reduce((sum, s) => sum + Object.values(s.scores).reduce((a, b) => a + b, 0), 0) / mine.length
      : 0;
    const judge = Math.round(judgeRaw * 10) / 10;

    const n = Number(entry.id.split("_")[1] ?? 1);
    const technicalScore = Math.round((70 + Math.abs(Math.cos(n * 1.9)) * 28) * 10) / 10;

    const convertedScore =
      Math.round(
        (voteScore * weights.voteWeight + judge * weights.judgeWeight + technicalScore * weights.technicalWeight) * 10,
      ) / 10;

    return {
      entry,
      voteCount,
      voteScore,
      judgeScore: judge,
      technicalScore,
      convertedScore,
    };
  });

  const ordered = [...rows].sort((a, b) =>
    kind === "live-vote" ? b.voteCount - a.voteCount : b.convertedScore - a.convertedScore,
  );

  const updatedAt = nowIso();

  return ordered.map((row, i) => {
    const rank = i + 1;
    const previousRank = previousRanks[row.entry.id] ?? null;
    return {
      entryId: row.entry.id,
      artistName: row.entry.artistName,
      unit: row.entry.unit,
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
            ? `실시간 투표 ${row.voteCount.toLocaleString()}표 증가분 반영`
            : previousRank < rank
              ? "심사 점수 반영 후 상대 순위 하락"
              : "변동 없음",
    } satisfies AdminRankingEntry;
  });
}

/** Strips every internal field. The public API must not leak breakdown data. */
function toPublic(rows: AdminRankingEntry[]): RankingEntry[] {
  return rows.map(({ entryId, artistName, unit, coverUrl, rank, previousRank, rankChange, updatedAt }) => ({
    entryId,
    artistName,
    unit,
    coverUrl,
    rank,
    previousRank,
    rankChange,
    updatedAt,
  }));
}

export const mockRankingService: RankingService = {
  async getPublicRanking({ roundId, kind, limit }) {
    const rows = computeAdmin(roundId, kind);
    const publicRows = toPublic(rows).slice(0, limit ?? rows.length);
    return delay({
      id: `snap_pub_${roundId}_${kind}`,
      auditionId: "a_1",
      roundId,
      kind,
      entries: publicRows,
      updatedAt: nowIso(),
    });
  },
  async getAdminRanking({ roundId, kind, weights }) {
    const rows = computeAdmin(roundId, kind, weights);
    return delay({
      id: `snap_adm_${roundId}_${kind}`,
      auditionId: "a_1",
      roundId,
      kind,
      entries: rows,
      updatedAt: nowIso(),
    });
  },
  async finalizeRanking() {
    return delay({ finalizedAt: nowIso() }, 600);
  },
};
