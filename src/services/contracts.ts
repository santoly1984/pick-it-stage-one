/**
 * API CONTRACT LAYER
 *
 * Every screen talks to these interfaces only. Swapping the mock adapters in
 * `src/services/mock/*` for HTTP clients must not require UI changes.
 *
 * Scoring / ranking is deliberately NOT computed in the frontend:
 * `RankingService` returns already-ranked data, and the public method can only
 * return score-free `RankingEntry` objects.
 */
import type {
  AdminRankingEntry,
  AuditLog,
  Audition,
  Comment,
  Entry,
  EntryJudgingProgress,
  EvaluationRule,
  JudgeScore,
  JudgingProgress,
  LyricLine,
  LyricsDocument,
  Notification,
  RankingKind,
  RankingSnapshot,
  Round,
  TicketBalance,
  TicketType,
  Track,
  User,
  Vote,
} from "@/types";

export interface AuthService {
  getCurrentUser(): Promise<User>;
  signInWithMock(role: "fan" | "challenger" | "judge" | "admin"): Promise<User>;
  signOut(): Promise<void>;
}

export interface AuditionService {
  listAuditions(): Promise<Audition[]>;
  getAudition(id: string): Promise<Audition | undefined>;
  listRounds(auditionId: string): Promise<Round[]>;
  getRound(roundId: string): Promise<Round | undefined>;
  listEntries(params?: { roundId?: string; auditionId?: string }): Promise<Entry[]>;
  getEntry(entryId: string): Promise<Entry | undefined>;
  getTrack(trackId: string): Promise<Track | undefined>;
  listSameUnitEntries(entryId: string): Promise<Entry[]>;
  submitApplication(input: ApplicationInput): Promise<{ applicationId: string }>;
}

export interface ApplicationInput {
  artistName: string;
  unit: string;
  contact: string;
  songTitle: string;
  story: string;
  audioFileName?: string;
}

export interface RankingService {
  /** PUBLIC — score-free by contract. */
  getPublicRanking(params: {
    roundId: string;
    kind: RankingKind;
    limit?: number;
  }): Promise<RankingSnapshot>;
  /** ADMIN-ONLY — includes breakdown. Never call from public screens. */
  getAdminRanking(params: {
    roundId: string;
    kind: RankingKind;
    weights?: Pick<EvaluationRule, "voteWeight" | "judgeWeight" | "technicalWeight">;
  }): Promise<RankingSnapshot<AdminRankingEntry>>;
  finalizeRanking(roundId: string): Promise<{ finalizedAt: string }>;
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

export interface JudgingService {
  listAssignedRounds(judgeId: string): Promise<Round[]>;
  listAssignedEntries(judgeId: string, roundId: string): Promise<Entry[]>;
  getEvaluationRule(auditionId: string): Promise<EvaluationRule>;
  getMyScore(judgeId: string, entryId: string): Promise<JudgeScore | undefined>;
  saveScore(input: Omit<JudgeScore, "id" | "updatedAt">): Promise<JudgeScore>;
}

export interface AdminService {
  listJudgingProgress(roundId: string): Promise<JudgingProgress[]>;
  listEntryJudgingProgress(roundId: string): Promise<EntryJudgingProgress[]>;
  listJudgeScores(entryId: string): Promise<JudgeScore[]>;
  getEvaluationRule(auditionId: string): Promise<EvaluationRule>;
  updateEvaluationRule(rule: EvaluationRule): Promise<EvaluationRule>;
  listUsers(): Promise<User[]>;
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
