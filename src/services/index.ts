/**
 * Service registry — the single swap point between mock and real backends.
 * Replace the right-hand side with an HTTP adapter; screens stay untouched.
 */
import { mockAdminService } from "./mock/admin.mock";
import { mockAuditionService } from "./mock/audition.mock";
import { mockAuthService } from "./mock/auth.mock";
import { mockCommunityService, mockNotificationService } from "./mock/community.mock";
import { mockJudgingService } from "./mock/judging.mock";
import { mockLyricsService } from "./mock/lyrics.mock";
import { mockRankingService } from "./mock/ranking.mock";
import { mockVotingService } from "./mock/voting.mock";

export const authService = mockAuthService;
export const auditionService = mockAuditionService;
export const rankingService = mockRankingService;
export const votingService = mockVotingService;
export const judgingService = mockJudgingService;
export const adminService = mockAdminService;
export const lyricsService = mockLyricsService;
export const communityService = mockCommunityService;
export const notificationService = mockNotificationService;

export * from "./contracts";

/** Ids used across the scaffold while there is no routing-by-selection yet. */
export const DEFAULT_AUDITION_ID = "a_1";
export const DEFAULT_ROUND_ID = "r_2";
export const DEFAULT_JUDGE_ID = "u_judge1";
