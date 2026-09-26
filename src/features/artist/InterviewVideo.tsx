import { useEffect, useRef } from "react";
import { usePlayer } from "@/features/player/PlayerProvider";

/**
 * Interview video with audio focus:
 *  - play  -> global audio pauses (focus held by video)
 *  - pause -> focus released, audio stays paused (user chose to stop)
 *  - ended -> focus released and audio resumes if it was playing before
 *  - global audio play while video plays -> video pauses (single focus)
 */
export function InterviewVideo({ src, poster }: { src: string; poster?: string }) {
  const { suspendForVideo, releaseVideoFocus, isPlaying } = usePlayer();
  const ref = useRef<HTMLVideoElement>(null);
  const ownsFocus = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (isPlaying && v && !v.paused) v.pause();
  }, [isPlaying]);

  useEffect(
    () => () => {
      if (ownsFocus.current) releaseVideoFocus(false);
    },
    [releaseVideoFocus],
  );

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      controls
      playsInline
      preload="none"
      className="aspect-video w-full rounded-xl border border-border bg-surface object-cover"
      onPlay={() => {
        ownsFocus.current = true;
        suspendForVideo();
      }}
      onPause={(e) => {
        if (e.currentTarget.ended) return;
        ownsFocus.current = false;
        releaseVideoFocus(false);
      }}
      onEnded={() => {
        ownsFocus.current = false;
        releaseVideoFocus(true);
      }}
    />
  );
}
