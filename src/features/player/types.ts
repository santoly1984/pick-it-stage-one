export interface PlayerTrack {
  trackId: string;
  entryId: string;
  title: string;
  artistName: string;
  audioUrl: string;
  coverUrl: string;
  /** Round the entry competes in — votes go to this round, never a default. */
  roundId: string;
}
