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
import type {
  AdminRankingEntry,
  EvaluationWeights,
  RankChange,
  RankingEntry,
  RankingKind,
  RankingSnapshotVersion,
  RoundResultState,
} from "@/types";
import { assertRole } from "@/stores/session";
import { delay, nowIso } from "./util";

const previousRanks: Record<string, number> = {
  e_1: 3, e_2: 1, e_3: 2, e_4: 6, e_5: 4, e_6: 5,
  e_7: 9, e_8: 7, e_9: 8, e_10: 12, e_11: 10, e_12: 11,
};

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

/* ----------------------------- result lifecycle ----------------------------- */

type Explicit = "REVIEW" | "CONFIRMED" | "PUBLISHED";
interface RoundMeta {
  explicit: Explicit | null;
  confirmedAt?: string | undefined;
  publishedAt?: string | undefined;
  publishedRows?: RankingEntry[];
  changedAfterPublish: boolean;
  history: RankingSnapshotVersion[];
}
const meta = new Map<string, RoundMeta>();

function scoreCounts(roundId: string) {
  const pool = entries.filter((e) => e.roundId === roundId);
  const submitted = judgeScores.filter(
    (s) => s.status === "submitted" && pool.some((e) => e.id === s.entryId),
  ).length;
  return { submitted, required: pool.length * JUDGE_COUNT };
}

function snapshotOf(roundId: string, reason: string, version: number): RankingSnapshotVersion {
  return {
    version,
    roundId,
    createdAt: nowIso(),
    reason,
    provisional: !isJudgingComplete(roundId),
    rows: computeRanking(roundId, "final").map((r) => ({ entryId: r.entryId, artistName: r.artistName, rank: r.rank })),
  };
}

function metaOf(roundId: string): RoundMeta {
  let m = meta.get(roundId);
  if (!m) {
    m = { explicit: null, changedAfterPublish: false, history: [] };
    meta.set(roundId, m);
    m.history.unshift(snapshotOf(roundId, "초기 스냅샷", 1));
  }
  return m;
}

function pushSnapshot(roundId: string, reason: string) {
  const m = metaOf(roundId);
  m.history.unshift(snapshotOf(roundId, reason, (m.history[0]?.version ?? 0) + 1));
}

export function resultStateOf(roundId: string): RoundResultState {
  const m = metaOf(roundId);
  const { submitted, required } = scoreCounts(roundId);
  const derived = submitted === 0 ? "DRAFT" : submitted < required ? "JUDGING" : "SCORED";
  return {
    roundId,
    status: m.explicit ?? derived,
    provisional: submitted < required,
    submittedScores: submitted,
    requiredScores: required,
    changedAfterPublish: m.changedAfterPublish,
    confirmedAt: m.confirmedAt,
    publishedAt: m.publishedAt,
    currentVersion: m.history[0]?.version ?? 1,
  };
}

/**
 * Called by judging/admin mocks whenever source data (scores, applied rule) changes.
 * Recomputes a new snapshot version. REVIEW/CONFIRMED are invalidated (state conflict)
 * and fall back to the derived status; PUBLISHED keeps its frozen public snapshot.
 */
export function onSourceChanged(roundId: string, reason: string) {
  const m = metaOf(roundId);
  pushSnapshot(roundId, reason);
  if (m.explicit === "REVIEW" || m.explicit === "CONFIRMED") {
    m.explicit = null;
    m.confirmedAt = undefined;
  } else if (m.explicit === "PUBLISHED") {
    m.changedAfterPublish = true;
  }
}

export function isResultLocked(roundId: string) {
  const s = metaOf(roundId).explicit;
  return s === "CONFIRMED" || s === "PUBLISHED";
}

function transition(roundId: string, from: RoundResultState["status"][], to: Explicit | null, msg: string) {
  assertRole("admin");
  const current = resultStateOf(roundId);
  if (!from.includes(current.status)) throw new Error(`${msg} (현재 상태: ${current.status})`);
  const m = metaOf(roundId);
  m.explicit = to;
  return m;
}

export const mockRankingService: RankingService = {
  async getPublicRanking({ roundId, kind, limit }) {
    const m = metaOf(roundId);
    if (kind === "final") {
      // Public final = frozen snapshot captured at publish time only.
      const published = m.explicit === "PUBLISHED" && Boolean(m.publishedRows);
      return delay({
        id: `snap_pub_${roundId}_final`,
        auditionId: "a_1",
        roundId,
        kind,
        published,
        entries: published ? m.publishedRows!.slice(0, limit ?? undefined) : [],
        updatedAt: m.publishedAt ?? nowIso(),
      });
    }
    return delay({
      id: `snap_pub_${roundId}_live`,
      auditionId: "a_1",
      roundId,
      kind,
      published: true,
      entries: toPublic(computeRanking(roundId, "live-vote")).slice(0, limit ?? undefined),
      updatedAt: nowIso(),
    });
  },
  async getAdminRanking({ roundId, kind, weights }) {
    assertRole("admin");
    return delay({
      id: `snap_adm_${roundId}_${kind}`,
      auditionId: "a_1",
      roundId,
      kind,
      published: kind === "live-vote" || metaOf(roundId).explicit === "PUBLISHED",
      entries: computeRanking(roundId, kind, weights),
      updatedAt: nowIso(),
    });
  },
  async getResultState(roundId) {
    assertRole("admin");
    return delay(resultStateOf(roundId));
  },
  async listSnapshots(roundId) {
    assertRole("admin");
    return delay(structuredClone(metaOf(roundId).history));
  },
  async startReview(roundId) {
    transition(roundId, ["SCORED"], "REVIEW", "모든 심사가 제출된 뒤에만 검토를 시작할 수 있습니다.");
    return delay(resultStateOf(roundId), 300);
  },
  async cancelReview(roundId) {
    transition(roundId, ["REVIEW"], null, "검토 중일 때만 되돌릴 수 있습니다.");
    return delay(resultStateOf(roundId), 300);
  },
  async confirmResult(roundId) {
    if (!isJudgingComplete(roundId)) throw new Error("심사 미완료 결과는 확정할 수 없습니다.");
    const m = transition(roundId, ["REVIEW"], "CONFIRMED", "검토 단계에서만 확정할 수 있습니다.");
    m.confirmedAt = nowIso();
    pushSnapshot(roundId, "결과 확정");
    return delay(resultStateOf(roundId), 400);
  },
  async publishResult(roundId) {
    if (!isJudgingComplete(roundId)) throw new Error("심사 미완료 결과는 공개할 수 없습니다.");
    const m = transition(roundId, ["CONFIRMED"], "PUBLISHED", "확정된 결과만 공개할 수 있습니다.");
    m.publishedAt = nowIso();
    m.publishedRows = toPublic(computeRanking(roundId, "final"));
    m.changedAfterPublish = false;
    pushSnapshot(roundId, "공개(publish)");
    return delay(resultStateOf(roundId), 400);
  },
};
