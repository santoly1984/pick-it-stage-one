import { useRef } from "react";
import { usePlayer } from "@/features/player/PlayerProvider";

/**
 * Interview video. Playing it pauses the global audio; when the video ends or
 * pauses, audio playback is restored if it was running before.
 */
export function InterviewVideo({ src, poster }: { src: string; poster?: string }) {
  const { suspendForVideo, resumeAfterVideo } = usePlayer();
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      controls
      playsInline
      preload="none"
      className="aspect-video w-full rounded-xl border border-border bg-surface object-cover"
      onPlay={suspendForVideo}
      onPause={resumeAfterVideo}
      onEnded={resumeAfterVideo}
    />
  );
}
