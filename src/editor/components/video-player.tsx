import { Show, type JSX } from 'solid-js';

import { createVideoPlayer } from '../utilities/create-video-player';
import { formatPlaybackRate, formatVideoTime } from '../utilities/video-time';

import styles from '../styles/video-player.module.css';

type VideoPlayerProps = {
  src: string;
  onInteract?: () => void;
};

export const VideoPlayer = (props: VideoPlayerProps) => {
  const player = createVideoPlayer();

  const guardInteract = (event: Event) => {
    event.stopPropagation();
    props.onInteract?.();
  };

  const onControlsMouseDown: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    guardInteract(event);
  };

  return (
    <div class={styles.player}>
      <video
        ref={(el) => player.setVideoEl(el)}
        class={styles.video}
        src={props.src}
        playsInline
        preload='metadata'
        draggable={false}
        onPlay={player.videoHandlers.onPlay}
        onPause={player.videoHandlers.onPause}
        onEnded={player.videoHandlers.onEnded}
        onTimeUpdate={player.videoHandlers.onTimeUpdate}
        onLoadedMetadata={player.videoHandlers.onLoadedMetadata}
        onDurationChange={player.videoHandlers.onDurationChange}
        onVolumeChange={player.videoHandlers.onVolumeChange}
        onRateChange={player.videoHandlers.onRateChange}
      />

      <Show when={!player.playing()}>
        <button
          type='button'
          class={styles.centerPlay}
          contentEditable={false}
          aria-label='Play video'
          onMouseDown={(e) => {
            e.preventDefault();
            guardInteract(e);
          }}
          onClick={(e) => {
            e.preventDefault();
            guardInteract(e);
            player.togglePlayback();
          }}>
          <span class={styles.playTriangle} />
        </button>
      </Show>

      <div class={styles.controls} contentEditable={false} onMouseDown={onControlsMouseDown}>
        <button
          type='button'
          class={styles.iconButton}
          aria-label={player.playing() ? 'Pause' : 'Play'}
          onClick={(e) => {
            e.preventDefault();
            player.togglePlayback();
          }}>
          <Show when={player.playing()} fallback={<span class={styles.playTriangleSm} />}>
            <span class={styles.pauseBars} />
          </Show>
        </button>

        <span class={styles.time}>
          {formatVideoTime(player.currentTime())} / {formatVideoTime(player.duration())}
        </span>

        <input
          class={styles.seek}
          type='range'
          min={0}
          max={player.duration() || 0}
          step={0.05}
          value={player.currentTime()}
          style={{ '--progress': `${player.progress()}%` }}
          aria-label='Seek'
          onInput={(e) => player.seek(Number(e.currentTarget.value))}
        />

        <button
          type='button'
          class={styles.rateButton}
          aria-label='Playback speed'
          onClick={(e) => {
            e.preventDefault();
            player.cyclePlaybackRate();
          }}>
          {formatPlaybackRate(player.playbackRate())}
        </button>

        <button
          type='button'
          class={styles.iconButton}
          aria-label={player.muted() || player.volume() === 0 ? 'Unmute' : 'Mute'}
          onClick={(e) => {
            e.preventDefault();
            player.toggleMute();
          }}>
          <Show when={player.muted() || player.volume() === 0} fallback={<span class={styles.volumeIcon} />}>
            <span class={styles.muteIcon} />
          </Show>
        </button>

        <input
          class={styles.volume}
          type='range'
          min={0}
          max={1}
          step={0.01}
          value={player.muted() ? 0 : player.volume()}
          style={{ '--progress': `${(player.muted() ? 0 : player.volume()) * 100}%` }}
          aria-label='Volume'
          onInput={(e) => player.setVolume(Number(e.currentTarget.value))}
        />
      </div>
    </div>
  );
};
