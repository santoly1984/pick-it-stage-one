/**
 * Shared public ranking queries. Every public screen (Home, Ranking, Artist,
 * Player) reads from the same service + key prefix so one invalidation after
 * a vote refreshes them all.
 */
import { queryOptions, useQuery } from "@tanstack/react-query";
import { DEFAULT_ROUND_ID, rankingService } from "@/services";
import type { RankingKind } from "@/types";

export const rankingKeys = {
  publicAll: ["ranking", "public"] as const,
  public: (roundId: string, kind: RankingKind, limit?: number) =>
    ["ranking", "public", roundId, kind, limit ?? "all"] as const,
};

export const publicRankingQuery = (kind: RankingKind, limit?: number, roundId = DEFAULT_ROUND_ID) =>
  queryOptions({
    queryKey: rankingKeys.public(roundId, kind, limit),
    queryFn: () => rankingService.getPublicRanking({ roundId, kind, ...(limit ? { limit } : {}) }),
  });

/** Current live-vote rank of one entry, from the same public snapshot. */
export function useLiveRankOf(entryId: string | undefined) {
  const { data } = useQuery(publicRankingQuery("live-vote"));
  return entryId ? data?.entries.find((e) => e.entryId === entryId) : undefined;
}
