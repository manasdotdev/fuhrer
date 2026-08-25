import { createSignal, type Accessor } from 'solid-js';

import { nextPlaybackRate } from './video-time';

export type VideoPlayerState = {
  playing: Accessor<boolean>;
  currentTime: Accessor<number>;
  duration: Accessor<number>;
  muted: Accessor<boolean>;
  volume: Accessor<number>;
  playbackRate: Accessor<number>;
  progress: Accessor<number>;
};

export type VideoPlayerActions = {
  setVideoEl: (el: HTMLVideoElement | undefined) => void;
  togglePlayback: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  cyclePlaybackRate: () => void;
  videoHandlers: {
    onPlay: () => void;
    onPause: () => void;
    onEnded: () => void;
    onTimeUpdate: (e: Event & { currentTarget: HTMLVideoElement }) => void;
    onLoadedMetadata: (e: Event & { currentTarget: HTMLVideoElement }) => void;
    onDurationChange: (e: Event & { currentTarget: HTMLVideoElement }) => void;
    onVolumeChange: (e: Event & { currentTarget: HTMLVideoElement }) => void;
    onRateChange: (e: Event & { currentTarget: HTMLVideoElement }) => void;
  };
};

export function createVideoPlayer(): VideoPlayerState & VideoPlayerActions {
  const [playing, setPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [muted, setMuted] = createSignal(false);
  const [volume, setVolumeState] = createSignal(1);
  const [playbackRate, setPlaybackRate] = createSignal(1);

  let videoEl: HTMLVideoElement | undefined;

  const progress = () => {
    const total = duration();
    if (!total) return 0;
    return Math.min(100, Math.max(0, (currentTime() / total) * 100));
  };

  const setVideoEl = (el: HTMLVideoElement | undefined) => {
    videoEl = el;
  };

  const togglePlayback = () => {
    const el = videoEl;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  };

  const seek = (time: number) => {
    const el = videoEl;
    if (!el) return;
    const next = Math.min(Math.max(0, time), el.duration || 0);
    el.currentTime = next;
    setCurrentTime(next);
  };

  const setVolume = (value: number) => {
    const el = videoEl;
    if (!el) return;
    const next = Math.min(1, Math.max(0, value));
    el.volume = next;
    el.muted = next === 0;
    setVolumeState(next);
    setMuted(el.muted);
  };

  const toggleMute = () => {
    const el = videoEl;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const cyclePlaybackRate = () => {
    const el = videoEl;
    if (!el) return;
    const next = nextPlaybackRate(el.playbackRate);
    el.playbackRate = next;
    setPlaybackRate(next);
  };

  return {
    playing,
    currentTime,
    duration,
    muted,
    volume,
    playbackRate,
    progress,
    setVideoEl,
    togglePlayback,
    seek,
    setVolume,
    toggleMute,
    cyclePlaybackRate,
    videoHandlers: {
      onPlay: () => setPlaying(true),
      onPause: () => setPlaying(false),
      onEnded: () => setPlaying(false),
      onTimeUpdate: (e) => setCurrentTime(e.currentTarget.currentTime),
      onLoadedMetadata: (e) => setDuration(e.currentTarget.duration || 0),
      onDurationChange: (e) => setDuration(e.currentTarget.duration || 0),
      onVolumeChange: (e) => {
        const el = e.currentTarget;
        setMuted(el.muted || el.volume === 0);
        setVolumeState(el.muted ? 0 : el.volume);
      },
      onRateChange: (e) => setPlaybackRate(e.currentTarget.playbackRate),
    },
  };
}
