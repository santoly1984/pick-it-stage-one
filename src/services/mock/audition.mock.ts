import type { AuditionService } from "@/services/contracts";
import { auditions, entries, rounds, tracks } from "@/mocks/data";
import { clone, delay, uid } from "./util";

export const mockAuditionService: AuditionService = {
  async listAuditions() {
    return delay(clone(auditions));
  },
  async getAudition(id) {
    return delay(clone(auditions.find((a) => a.id === id)));
  },
  async listRounds(auditionId) {
    return delay(clone(rounds.filter((r) => r.auditionId === auditionId)));
  },
  async getRound(roundId) {
    return delay(clone(rounds.find((r) => r.id === roundId)));
  },
  async listEntries(params) {
    let list = entries;
    if (params?.roundId) list = list.filter((e) => e.roundId === params.roundId);
    if (params?.auditionId) list = list.filter((e) => e.auditionId === params.auditionId);
    return delay(clone(list));
  },
  async getEntry(entryId) {
    return delay(clone(entries.find((e) => e.id === entryId)));
  },
  async getTrack(trackId) {
    return delay(clone(tracks.find((t) => t.id === trackId)));
  },
  async listSameUnitEntries(entryId) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return delay([]);
    return delay(clone(entries.filter((e) => e.unit === entry.unit && e.id !== entry.id)));
  },
  async submitApplication() {
    return delay({ applicationId: uid("app") }, 500);
  },
};
