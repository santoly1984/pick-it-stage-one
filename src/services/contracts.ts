/**
 * API CONTRACT LAYER
 *
 * Every screen talks to these interfaces only. Swapping the mock adapters in
 * `src/services/mock/*` for HTTP clients must not require UI changes.
 *
 * Boundaries:
 *  - Public services (Audition, Ranking.getPublicRanking, Community) return
 *    PUBLIC DTOs only: branch-level affiliation, no scores.
 *  - Judging / Admin services are privileged. Mock adapters check the mock
 *    session role; the real backend MUST enforce roles server-side.
 *  - Scoring / ranking is never computed in the frontend.
 */
import type {
  AdminRankingEntry,
  AuditLog,
  Audition,
  Comment,
  Entry,
  EntryJudgingProgress,
  EvaluationRule,
  EvaluationWeights,
  JudgeScore,
  JudgingProgress,
  LyricLine,
  LyricsDocument,
  Notification,
  PublicEntry,
  RankingKind,
  RankingSnapshot,
  RankingSnapshotVersion,
  RoundResultState,
  Round,
  TicketBalance,
  TicketType,
  Track,
  Vote,
} from "@/types";

export interface AuditionService {
  listAuditions(): Promise<Audition[]>;
  getAudition(id: string): Promise<Audition | undefined>;
  listRounds(auditionId: string): Promise<Round[]>;
  getRound(roundId: string): Promise<Round | undefined>;
  listEntries(params?: { roundId?: string; auditionId?: string }): Promise<PublicEntry[]>;
  getEntry(entryId: string): Promise<PublicEntry | undefined>;
  getTrack(trackId: string): Promise<Track | undefined>;
  /** Recommendation at branch level (군종) — never exact unit. */
  listSameBranchEntries(entryId: string): Promise<PublicEntry[]>;
  submitApplication(input: ApplicationInput): Promise<{ applicationId: string }>;
}

export interface ApplicationInput {
  artistName: string;
  unit: string;
  contact: string;
  songTitle: string;
  story: string;
  intro?: string;
  motivation?: string;
  songReason?: string;
  audioFileName?: string;
}

export interface RankingService {
  /**
   * PUBLIC — score-free by contract.
   * `final` returns `published: false` and no entries until judging completes
   * and the result is finalized.
   */
  getPublicRanking(params: { roundId: string; kind: RankingKind; limit?: number }): Promise<RankingSnapshot>;
  /** ADMIN-ONLY — includes breakdown. */
  getAdminRanking(params: {
    roundId: string;
    kind: RankingKind;
    weights?: EvaluationWeights;
  }): Promise<RankingSnapshot<AdminRankingEntry>>;
  /** ADMIN — derived + explicit lifecycle state. */
  getResultState(roundId: string): Promise<RoundResultState>;
  /** ADMIN — mock snapshot history, newest first. Rank numbers are never edited directly. */
  listSnapshots(roundId: string): Promise<RankingSnapshotVersion[]>;
  /** SCORED -> REVIEW */
  startReview(roundId: string): Promise<RoundResultState>;
  /** REVIEW -> SCORED (back out) */
  cancelReview(roundId: string): Promise<RoundResultState>;
  /** REVIEW -> CONFIRMED. Real impl: second-approver flow server-side. */
  confirmResult(roundId: string): Promise<RoundResultState>;
  /** CONFIRMED -> PUBLISHED. Freezes the public final snapshot. */
  publishResult(roundId: string): Promise<RoundResultState>;
}

export interface VotingService {
  getBalance(userId: string): Promise<TicketBalance>;
  castVote(input: {
    userId: string;
    entryId: string;
    roundId: string;
    ticketType: TicketType;
    quantity: number;
  }): Promise<Vote>;
  listMyVotes(userId: string): Promise<Vote[]>;
}

/** JUDGE-ONLY. Judges receive public entry DTOs (least privilege). */
export interface JudgingService {
  listAssignedRounds(judgeId: string): Promise<Round[]>;
  listAssignedEntries(judgeId: string, roundId: string): Promise<PublicEntry[]>;
  getEntry(entryId: string): Promise<PublicEntry | undefined>;
  getCriteria(roundId: string): Promise<EvaluationRule["criteria"]>;
  getMyScore(judgeId: string, entryId: string): Promise<JudgeScore | undefined>;
  listMyScores(judgeId: string, roundId: string): Promise<JudgeScore[]>;
  saveScore(input: Omit<JudgeScore, "id" | "updatedAt">): Promise<JudgeScore>;
}

export interface RuleSimulationRow {
  entryId: string;
  artistName: string;
  currentRank: number;
  simulatedRank: number;
}

/** ADMIN-ONLY. */
export interface AdminService {
  listEntries(auditionId: string): Promise<Entry[]>;
  listJudgingProgress(roundId: string): Promise<JudgingProgress[]>;
  listEntryJudgingProgress(roundId: string): Promise<EntryJudgingProgress[]>;
  listJudgeScores(entryId: string): Promise<JudgeScore[]>;
  getEvaluationRule(roundId: string): Promise<EvaluationRule>;
  /** Dry run — never persists. */
  simulateEvaluationRule(roundId: string, weights: EvaluationWeights): Promise<RuleSimulationRow[]>;
  /** Saves as `draft` only (draftWeights). Does not affect ranking until applied. */
  saveEvaluationRuleDraft(roundId: string, weights: EvaluationWeights): Promise<EvaluationRule>;
  /** Applies the reviewed draft to the round (mock). Blocked once the result is CONFIRMED/PUBLISHED. */
  applyEvaluationRule(roundId: string): Promise<EvaluationRule>;
  listUsers(): Promise<import("@/types").User[]>;
  listAuditLogs(): Promise<AuditLog[]>;
  listVoteStats(roundId: string): Promise<{ entryId: string; artistName: string; free: number; standard: number; total: number }[]>;
}

export interface LyricsService {
  getLyrics(trackId: string): Promise<LyricsDocument>;
  saveCanonicalText(trackId: string, text: string): Promise<LyricsDocument>;
  /** Mock alignment. Real impl calls the AI alignment backend. */
  requestAutoSync(trackId: string): Promise<LyricsDocument>;
  updateLines(trackId: string, lines: LyricLine[]): Promise<LyricsDocument>;
  publish(trackId: string): Promise<LyricsDocument>;
}

export interface CommunityService {
  listComments(entryId?: string): Promise<Comment[]>;
  addComment(input: { entryId: string; body: string; parentId?: string }): Promise<Comment>;
  report(commentId: string, reason: string): Promise<void>;
}

export interface NotificationService {
  list(userId: string): Promise<Notification[]>;
}
