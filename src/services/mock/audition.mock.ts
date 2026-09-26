import type { AuditionService } from "@/services/contracts";
import { auditions, entries, rounds, tracks } from "@/mocks/data";
import { clone, delay, uid } from "./util";
import { toPublicEntry } from "./mappers";

/** PUBLIC adapter — returns PublicEntry (branch only, no exact unit). */
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
    return delay(list.map(toPublicEntry));
  },
  async getEntry(entryId) {
    const e = entries.find((x) => x.id === entryId);
    return delay(e ? toPublicEntry(e) : undefined);
  },
  async listTracks() {
    return delay(clone(tracks));
  },
  async getPlayableEntries(entryIds) {
    const rows = entryIds.flatMap((id) => {
      const e = entries.find((x) => x.id === id);
      const t = e && tracks.find((x) => x.id === e.trackId);
      return e && t ? [{ entry: toPublicEntry(e), track: clone(t) }] : [];
    });
    return delay(rows, 40);
  },
  async getTrack(trackId) {
    return delay(clone(tracks.find((t) => t.id === trackId)));
  },
  async listSameBranchEntries(entryId) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return delay([]);
    return delay(entries.filter((e) => e.branch === entry.branch && e.id !== entry.id).map(toPublicEntry));
  },
  async submitApplication() {
    return delay({ applicationId: uid("app") }, 500);
  },
};
