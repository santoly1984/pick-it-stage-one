/** Internal -> public DTO mapping. The ONLY place a public entry is built. */
import type { Entry, PublicEntry } from "@/types";
import { getSession } from "@/stores/session";

export function toPublicEntry(e: Entry): PublicEntry {
  return {
    id: e.id,
    auditionId: e.auditionId,
    roundId: e.roundId,
    artistName: e.artistName,
    branch: e.branch,
    trackId: e.trackId,
    ...(e.interviewVideoUrl ? { interviewVideoUrl: e.interviewVideoUrl } : {}),
    coverUrl: e.coverUrl,
    story: e.story,
    tagline: e.tagline,
    isMine: e.challengerId === getSession().userId,
  };
}
