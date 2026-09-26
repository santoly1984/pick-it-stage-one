/**
 * Service registry — the single swap point between mock and real backends.
 * Replace the right-hand side with an HTTP adapter; screens stay untouched.
 */
import { mockAdminService } from "./mock/admin.mock";
import { mockAuditionService } from "./mock/audition.mock";
import { mockCommunityService, mockNotificationService } from "./mock/community.mock";
import { mockJudgingService } from "./mock/judging.mock";
import { mockLyricsService } from "./mock/lyrics.mock";
import { mockRankingService } from "./mock/ranking.mock";
import { mockVotingService } from "./mock/voting.mock";

export const auditionService = mockAuditionService;
export const rankingService = mockRankingService;
export const votingService = mockVotingService;
export const judgingService = mockJudgingService;
export const adminService = mockAdminService;
export const lyricsService = mockLyricsService;
export const communityService = mockCommunityService;
export const notificationService = mockNotificationService;

export * from "./contracts";

/**
 * PHASE-1 SAMPLE CONTEXT. Single audition/season with r_2 as the live round.
 * Replace with audition/round selection (route params or a "current round"
 * API) when multiple programs exist. Votes always use the entry's own roundId.
 */
export const DEFAULT_AUDITION_ID = "a_1";
export const DEFAULT_ROUND_ID = "r_2";
/** Only this round accepts votes in the mock (r_1 is finalized). */
export const LIVE_VOTING_ROUND_ID = DEFAULT_ROUND_ID;
export const DEFAULT_JUDGE_ID = "u_judge1";
