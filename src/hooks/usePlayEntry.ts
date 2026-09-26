import { useCallback } from "react";
import { toast } from "sonner";
import { usePlayer } from "@/features/player/PlayerProvider";
import { auditionService } from "@/services";
import type { PlayerTrack } from "@/features/player/types";

/** Plays one entry within a queue built from the given entry ids (via the service layer). */
export function usePlayEntry() {
  const { playQueue } = usePlayer();
  return useCallback(
    async (entryId: string, queueEntryIds?: string[]) => {
      const ids = queueEntryIds?.length ? queueEntryIds : [entryId];
      const rows = await auditionService.getPlayableEntries(ids);
      const queue: PlayerTrack[] = rows.map(({ entry, track }) => ({
        trackId: track.id,
        entryId: entry.id,
        title: track.title,
        artistName: entry.artistName,
        audioUrl: track.audioUrl,
        coverUrl: entry.coverUrl,
        roundId: entry.roundId,
      }));
      if (!queue.length) {
        toast.error("재생할 수 있는 음원이 없습니다");
        return;
      }
      playQueue(queue, Math.max(0, queue.findIndex((t) => t.entryId === entryId)));
    },
    [playQueue],
  );
}
