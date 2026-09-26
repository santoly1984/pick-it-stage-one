/**
 * GLOBAL AUDIO — exactly one <audio> instance for the whole app.
 *
 * Mounted once in `src/routes/__root.tsx`, above <Outlet />, so playback
 * survives route changes. FullPlayer and MiniPlayer are pure views over this
 * state. No voting or ranking logic lives here by design.
 *
 * Track switching is keyed by `trackId`, not by audio URL, so two tracks that
 * share a file still restart from 0.
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
  isLoading: boolean;
  currentTime: number;
  duration: number;
  /** Human-readable playback failure, cleared on next successful play. */
  error: string | null;
  /** true while an interview video holds audio focus */
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
  /** Jump to a queue position (restarts from 0). */
  playAt: (index: number) => void;
  /** Video took focus: pause audio and remember whether to resume. */
  suspendForVideo: () => void;
  /** Video released focus. `resume` restores playback if it was playing before. */
  releaseVideoFocus: (resume: boolean) => void;
}

const PlayerContext = createContext<PlayerApi | null>(null);

const INITIAL: PlayerState = {
  queue: [],
  index: 0,
  current: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  error: null,
  suspended: false,
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const resumeRef = useRef(false);
  const suspendedRef = useRef(false);
  const stateRef = useRef<PlayerState>(INITIAL);
  const [state, setStateRaw] = useState<PlayerState>(INITIAL);

  const setState = useCallback((fn: (s: PlayerState) => PlayerState) => {
    setStateRaw((s) => {
      const next = fn(s);
      stateRef.current = next;
      return next;
    });
  }, []);

  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || suspendedRef.current) return;
    audio.play().catch((err: unknown) => {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "AbortError") return; // superseded by another load
      setState((s) => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        error: name === "NotAllowedError" ? "재생 버튼을 눌러 시작해 주세요." : "음원을 재생할 수 없습니다.",
      }));
    });
  }, [setState]);

  /** Load by track id. Same URL + different id still restarts from 0. */
  const loadTrack = useCallback(
    (track: PlayerTrack | null, autoplay: boolean) => {
      const audio = audioRef.current;
      if (!audio || !track) return;
      if (loadedTrackIdRef.current !== track.trackId) {
        loadedTrackIdRef.current = track.trackId;
        if (audio.src !== track.audioUrl) audio.src = track.audioUrl;
        audio.currentTime = 0;
      }
      setState((s) => ({ ...s, currentTime: 0, error: null, isLoading: true }));
      if (autoplay) tryPlay();
    },
    [setState, tryPlay],
  );

  const goTo = useCallback(
    (index: number, autoplay = true) => {
      const s = stateRef.current;
      if (!s.queue.length) return;
      const i = (index + s.queue.length) % s.queue.length;
      const current = s.queue[i] ?? null;
      setState((prev) => ({ ...prev, index: i, current }));
      // Force restart even when re-selecting the same track id via next/prev.
      loadedTrackIdRef.current = null;
      loadTrack(current, autoplay);
    },
    [loadTrack, setState],
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setState((s) => ({ ...s, currentTime: audio.currentTime }));
    const onMeta = () => setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onPlaying = () => setState((s) => ({ ...s, isPlaying: true, isLoading: false, error: null }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onWaiting = () => setState((s) => ({ ...s, isLoading: true }));
    const onError = () =>
      setState((s) => ({ ...s, isPlaying: false, isLoading: false, error: "음원을 불러오지 못했습니다." }));
    const onEnded = () => {
      const s = stateRef.current;
      if (s.queue.length > 1) goTo(s.index + 1, true);
      else setState((p) => ({ ...p, isPlaying: false }));
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [goTo, setState]);

  /** Explicit user play takes focus back from any interview video. */
  const takeFocus = useCallback(() => {
    if (!suspendedRef.current) return;
    suspendedRef.current = false;
    resumeRef.current = false;
    setState((s) => ({ ...s, suspended: false }));
  }, [setState]);

  const playQueue = useCallback(
    (queue: PlayerTrack[], startIndex = 0) => {
      const current = queue[startIndex] ?? null;
      // A new explicit selection always restarts, even for the same track.
      loadedTrackIdRef.current = null;
      takeFocus();
      setState((s) => ({ ...s, queue, index: startIndex, current }));
      stateRef.current = { ...stateRef.current, queue, index: startIndex, current };
      loadTrack(current, true);
    },
    [loadTrack, setState, takeFocus],
  );

  const play = useCallback(() => {
    takeFocus();
    tryPlay();
  }, [takeFocus, tryPlay]);
  const pause = useCallback(() => audioRef.current?.pause(), []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !stateRef.current.current) return;
    if (audio.paused) {
      takeFocus();
      tryPlay();
    } else audio.pause();
  }, [takeFocus, tryPlay]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = seconds;
      setState((s) => ({ ...s, currentTime: seconds }));
    },
    [setState],
  );

  const next = useCallback(() => {
    takeFocus();
    goTo(stateRef.current.index + 1);
  }, [goTo, takeFocus]);
  const prev = useCallback(() => {
    takeFocus();
    goTo(stateRef.current.index - 1);
  }, [goTo, takeFocus]);
  const playAt = useCallback(
    (i: number) => {
      takeFocus();
      goTo(i);
    },
    [goTo, takeFocus],
  );

  const suspendForVideo = useCallback(() => {
    const audio = audioRef.current;
    if (!suspendedRef.current) resumeRef.current = Boolean(audio && !audio.paused);
    suspendedRef.current = true;
    audio?.pause();
    setState((s) => ({ ...s, suspended: true }));
  }, [setState]);

  const releaseVideoFocus = useCallback(
    (resume: boolean) => {
      if (!suspendedRef.current) return;
      suspendedRef.current = false;
      setState((s) => ({ ...s, suspended: false }));
      const shouldResume = resume && resumeRef.current;
      resumeRef.current = false;
      if (shouldResume) tryPlay();
    },
    [setState, tryPlay],
  );

  const value = useMemo<PlayerApi>(
    () => ({ ...state, playQueue, toggle, play, pause, seek, next, prev, playAt, suspendForVideo, releaseVideoFocus }),
    [state, playQueue, toggle, play, pause, seek, next, prev, playAt, suspendForVideo, releaseVideoFocus],
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
