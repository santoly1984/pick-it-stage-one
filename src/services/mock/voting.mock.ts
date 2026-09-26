/**
 * MOCK VOTING
 * No payment, no ticket ledger, no idempotency here — that is server work.
 * Balance mutations are in-memory only.
 */
import type { VotingService } from "@/services/contracts";
import { ticketBalance, votes, rounds } from "@/mocks/data";
import type { Vote } from "@/types";
import { clone, delay, nowIso, uid } from "./util";

const balance = { ...ticketBalance };

export const mockVotingService: VotingService = {
  async getBalance() {
    return delay({ ...balance });
  },
  async castVote({ userId, entryId, roundId, ticketType, quantity }) {
    const round = rounds.find((r) => r.id === roundId);
    if (!round || round.status !== "live") throw new Error("투표 기간이 아닌 라운드입니다.");
    if (balance[ticketType] < quantity) throw new Error("보유한 투표권이 부족합니다.");
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
