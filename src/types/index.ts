/**
 * PICK IT — domain types.
 *
 * These types are the contract between the UI and the service layer
 * (`src/services`). Backend implementations must satisfy them; the current
 * mock adapters in `src/mocks` do the same.
 *
 * VISIBILITY RULE (critical):
 *  - Public surfaces (fan / challenger) may only ever see `RankingEntry`.
 *  - Judge scores, technical scores, weights, converted scores and totals
 *    live in `AdminRankingEntry` / `JudgeScore` and are Admin-only.
 */

export type UserRole = "fan" | "challenger" | "judge" | "admin";

export interface User {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  /** A single account can hold both `fan` and `challenger`. */
  roles: UserRole[];
  unit?: string; // 부대
  createdAt: string;
}

export type AuditionStatus = "draft" | "open" | "voting" | "judging" | "closed";

export interface Audition {
  id: string;
  title: string;
  subtitle?: string;
  status: AuditionStatus;
  coverUrl?: string;
  startsAt: string;
  endsAt: string;
  roundIds: string[];
}

export type RoundStatus = "scheduled" | "live" | "scoring" | "finalized";

export interface Round {
  id: string;
  auditionId: string;
  name: string;
  order: number;
  status: RoundStatus;
  entryIds: string[];
  votingOpensAt: string;
  votingClosesAt: string;
}

/** Public-safe affiliation. Exact unit (부대) names/locations are internal only. */
export type MilitaryBranch = "육군" | "해군" | "공군" | "해병대" | "국직";

/** INTERNAL entry (Admin only). Contains exact unit. */
export interface Entry {
  id: string;
  auditionId: string;
  roundId: string;
  challengerId: string;
  artistName: string;
  unit: string;
  branch: MilitaryBranch;
  trackId: string;
  interviewVideoUrl?: string;
  coverUrl: string;
  story: string;
  /** Story flow shown together with the music */
  intro: string;
  motivation: string;
  songReason: string;
  tagline: string;
  submittedAt: string;
}

/** PUBLIC entry DTO — no exact unit, no challenger account id. */
export interface PublicEntry {
  id: string;
  auditionId: string;
  roundId: string;
  artistName: string;
  branch: MilitaryBranch;
  trackId: string;
  interviewVideoUrl?: string;
  coverUrl: string;
  story: string;
  /** Story flow shown together with the music */
  intro: string;
  motivation: string;
  songReason: string;
  tagline: string;
  /** true when the signed-in user is this entry's challenger (for reply badge) */
  isMine: boolean;
}

export interface Track {
  id: string;
  title: string;
  artistName: string;
  audioUrl: string;
  coverUrl: string;
  durationSec: number;
  lyricsStatus: LyricsStatus;
}

export type LyricsStatus = "empty" | "draft" | "processing" | "review" | "published";

export interface LyricLine {
  id: string;
  /** seconds from track start */
  startSec: number;
  endSec?: number;
  text: string;
}

export interface LyricsDocument {
  trackId: string;
  status: LyricsStatus;
  canonicalText: string;
  lines: LyricLine[];
  updatedAt: string;
}

/* ---------------------------------- vote --------------------------------- */

export type TicketType = "free" | "standard";

export interface TicketBalance {
  userId: string;
  free: number;
  standard: number;
  freeResetsAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  entryId: string;
  roundId: string;
  ticketType: TicketType;
  quantity: number;
  createdAt: string;
}

/* --------------------------------- judging -------------------------------- */

export interface EvaluationCriterion {
  id: string;
  label: string;
  max: number;
  description?: string;
}

/** Judge-entered scores. Never exposed on public surfaces. */
export interface JudgeScore {
  id: string;
  roundId: string;
  entryId: string;
  judgeId: string;
  scores: Record<string, number>; // criterionId -> raw score
  comment?: string;
  status: "draft" | "submitted";
  updatedAt: string;
}

export interface EvaluationWeights {
  voteWeight: number; // 0..1
  judgeWeight: number;
  technicalWeight: number;
}

/**
 * Per-round weighting. Admin-only.
 * Values shipped in mocks are EXAMPLES — operating policy is not decided.
 */
export interface EvaluationRule {
  id: string;
  auditionId: string;
  roundId: string;
  /**
   * "example" = placeholder mock values; "draft" = saved by admin, not yet applied;
   * "approved" = applied to the round in the mock (NOT an operating-policy approval).
   */
  status: "example" | "draft" | "approved";
  /** Pending draft weights (simulated + reviewed). Not used for ranking until applied. */
  draftWeights?: EvaluationWeights;
  voteWeight: number; // 0..1
  judgeWeight: number;
  technicalWeight: number;
  criteria: EvaluationCriterion[];
  updatedAt: string;
}

/* --------------------------------- ranking -------------------------------- */

export type RankChange = "up" | "down" | "flat" | "new";

/** PUBLIC ranking payload. Intentionally score-free. */
export interface RankingEntry {
  entryId: string;
  artistName: string;
  branch: MilitaryBranch;
  coverUrl: string;
  rank: number;
  previousRank: number | null;
  rankChange: RankChange;
  updatedAt: string;
}

/** ADMIN-only ranking payload with full breakdown. */
export interface AdminRankingEntry extends RankingEntry {
  voteCount: number;
  voteScore: number;
  judgeScore: number;
  technicalScore: number;
  convertedScore: number;
  totalScore: number;
  weightsApplied: EvaluationWeights;
  changeReason: string;
}

export type RankingKind = "live-vote" | "final";

export interface RankingSnapshot<T = RankingEntry> {
  id: string;
  auditionId: string;
  roundId: string;
  kind: RankingKind;
  /** false when the snapshot is not publishable (e.g. final before judging completes) */
  published: boolean;
  entries: T[];
  updatedAt: string;
}

/* -------------------------------- community ------------------------------- */

export interface Comment {
  id: string;
  entryId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  /** true when the author is the challenger of this entry */
  isVerifiedChallenger: boolean;
  body: string;
  createdAt: string;
  parentId?: string;
  reported?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  kind: "vote" | "ranking" | "comment" | "judging" | "system";
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  meta?: Record<string, string | number>;
  createdAt: string;
}

/* ------------------------------ service shapes ----------------------------- */

export interface JudgingProgress {
  roundId: string;
  judgeId: string;
  judgeName: string;
  assignedCount: number;
  submittedCount: number;
}

export interface EntryJudgingProgress {
  entryId: string;
  artistName: string;
  submittedCount: number;
  judgeCount: number;
}

/* ------------------------------ result lifecycle ----------------------------- */

/**
 * Round result lifecycle (admin-only).
 * DRAFT: no judge scores · JUDGING: partial (provisional) · SCORED: all submitted
 * REVIEW: admin reviewing · CONFIRMED: result locked · PUBLISHED: public final visible.
 */
export type ResultStatus = "DRAFT" | "JUDGING" | "SCORED" | "REVIEW" | "CONFIRMED" | "PUBLISHED";

export interface RoundResultState {
  roundId: string;
  status: ResultStatus;
  /** true while any judge score is missing — admin ranking is provisional. */
  provisional: boolean;
  submittedScores: number;
  requiredScores: number;
  /** Source data changed after publish; public still shows the frozen published snapshot. */
  changedAfterPublish: boolean;
  confirmedAt?: string;
  publishedAt?: string;
  currentVersion: number;
}

export interface RankingSnapshotVersion {
  version: number;
  roundId: string;
  createdAt: string;
  reason: string;
  provisional: boolean;
  rows: { entryId: string; artistName: string; rank: number }[];
}
