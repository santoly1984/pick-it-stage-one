/**
 * GLOBAL AUDIO — exactly one <audio> instance for the whole app.
 *
 * Mounted once in `src/routes/__root.tsx`, above <Outlet />, so playback
 * survives route changes. FullPlayer and MiniPlayer are pure views over this
 * state. No voting or ranking logic lives here by design.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PlayerTrack } from "./types";

interface PlayerState {
  queue: PlayerTrack[];
  index: number;
  current: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  /** true while an interview video has taken over audio focus */
  suspended: boolean;
}

interface PlayerApi extends PlayerState {
  playQueue: (queue: PlayerTrack[], startIndex?: number) => void;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  next: () => void;
  prev: () => void;
  /** Called by the interview video: pauses audio and remembers resume state. */
  suspendForVideo: () => void;
  /** Restores audio playback if it was playing before the video started. */
  resumeAfterVideo: () => void;
}

const PlayerContext = createContext<PlayerApi | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resumeRef = useRef(false);

  const [state, setState] = useState<PlayerState>({
    queue: [],
    index: 0,
    current: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    suspended: false,
  });

  // Create the single audio element on the client only.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setState((s) => ({ ...s, currentTime: audio.currentTime }));
    const onMeta = () => setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onEnded = () => setState((s) => ({ ...s, isPlaying: false }));

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, []);

  const loadAndPlay = useCallback((track: PlayerTrack | null, autoplay: boolean) => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.src !== track.audioUrl) {
      audio.src = track.audioUrl;
      audio.currentTime = 0;
    }
    if (autoplay) void audio.play().catch(() => undefined);
  }, []);

  const playQueue = useCallback(
    (queue: PlayerTrack[], startIndex = 0) => {
      const current = queue[startIndex] ?? null;
      setState((s) => ({ ...s, queue, index: startIndex, current, currentTime: 0, suspended: false }));
      loadAndPlay(current, true);
    },
    [loadAndPlay],
  );

  const play = useCallback(() => {
    void audioRef.current?.play().catch(() => undefined);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.current) return;
    if (audio.paused) void audio.play().catch(() => undefined);
    else audio.pause();
  }, [state.current]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setState((s) => ({ ...s, currentTime: seconds }));
  }, []);

  const step = useCallback(
    (delta: number) => {
      setState((s) => {
        if (!s.queue.length) return s;
        const index = (s.index + delta + s.queue.length) % s.queue.length;
        const current = s.queue[index] ?? null;
        loadAndPlay(current, true);
        return { ...s, index, current, currentTime: 0 };
      });
    },
    [loadAndPlay],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const suspendForVideo = useCallback(() => {
    const audio = audioRef.current;
    resumeRef.current = Boolean(audio && !audio.paused);
    audio?.pause();
    setState((s) => ({ ...s, suspended: true }));
  }, []);

  const resumeAfterVideo = useCallback(() => {
    setState((s) => ({ ...s, suspended: false }));
    if (resumeRef.current) {
      resumeRef.current = false;
      void audioRef.current?.play().catch(() => undefined);
    }
  }, []);

  const value = useMemo<PlayerApi>(
    () => ({ ...state, playQueue, toggle, play, pause, seek, next, prev, suspendForVideo, resumeAfterVideo }),
    [state, playQueue, toggle, play, pause, seek, next, prev, suspendForVideo, resumeAfterVideo],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
