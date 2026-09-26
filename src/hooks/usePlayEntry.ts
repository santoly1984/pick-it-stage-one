import { useCallback } from "react";
import { usePlayer } from "@/features/player/PlayerProvider";
import { entries as allEntries, tracks } from "@/mocks/data";
import type { PlayerTrack } from "@/features/player/types";

/** Maps mock entries into player queue items. Replace with API data later. */
export function toPlayerTrack(entryId: string): PlayerTrack | null {
  const entry = allEntries.find((e) => e.id === entryId);
  const track = entry && tracks.find((t) => t.id === entry.trackId);
  if (!entry || !track) return null;
  return {
    trackId: track.id,
    entryId: entry.id,
    title: track.title,
    artistName: entry.artistName,
    audioUrl: track.audioUrl,
    coverUrl: entry.coverUrl,
  };
}

/** Plays one entry within a queue built from the given entry ids. */
export function usePlayEntry() {
  const { playQueue } = usePlayer();
  return useCallback(
    (entryId: string, queueEntryIds?: string[]) => {
      const ids = queueEntryIds?.length ? queueEntryIds : [entryId];
      const queue = ids.map(toPlayerTrack).filter(Boolean) as PlayerTrack[];
      const index = Math.max(0, queue.findIndex((t) => t.entryId === entryId));
      playQueue(queue, index);
    },
    [playQueue],
  );
}
