/**
 * MOCK VOTING
 * No payment, no ticket ledger, no idempotency here — that is server work.
 * Balance mutations are in-memory only.
 */
import type { VotingService } from "@/services/contracts";
import { ticketBalance, votes, rounds } from "@/mocks/data";
import type { Vote } from "@/types";
import { clone, delay, nowIso, uid } from "./util";
import { captureLiveRankingBeforeVote } from "./ranking.mock";

const balance = { ...ticketBalance };

export const mockVotingService: VotingService = {
  async getBalance() {
    return delay({ ...balance });
  },
  async castVote({ userId, entryId, roundId, ticketType, quantity }) {
    const round = rounds.find((r) => r.id === roundId);
    if (!round || round.status !== "live") throw new Error("투표 기간이 아닌 라운드입니다.");
    if (!round.entryIds.includes(entryId)) throw new Error("이 라운드의 참가자가 아닙니다.");
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("투표 수량이 올바르지 않습니다.");
    if (balance[ticketType] < quantity) throw new Error("보유한 투표권이 부족합니다.");
    captureLiveRankingBeforeVote(roundId);
    balance[ticketType] -= quantity;
    const vote: Vote = {
      id: uid("v"),
      userId,
      entryId,
      roundId,
      ticketType,
      quantity,
      createdAt: nowIso(),
    };
    votes.unshift(vote);
    return delay(vote, 450);
  },
  async listMyVotes(userId) {
    return delay(clone(votes.filter((v) => v.userId === userId)));
  },
};
