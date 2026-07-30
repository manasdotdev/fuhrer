import { FileUpload } from '@ark-ui/solid/file-upload';
import type { NodeViewProps } from '@tiptap/core';
import { Show, createMemo, type Component } from 'solid-js';

import { AudioIcon } from '../styles/icons';
import { readFileAsDataUrl } from '../utils/read-file-as-data-url';

import styles from '../styles/image-node.module.css';

export const AudioNodeView: Component<NodeViewProps> = (props) => {
  const src = createMemo(() => (props.node.attrs.src as string | null) ?? null);
  const caption = createMemo(() => (props.node.attrs.caption as string | null) ?? '');
  const hasAudio = createMemo(() => !!src());
  const selected = createMemo(() => props.selected);

  const onFileAccept = async (details: { files: File[] }) => {
    const file = details.files[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    props.updateAttributes({
      src: dataUrl,
      caption: caption() || file.name.replace(/\.[^.]+$/, '') || null,
    });
  };

  const selectCard = () => {
    const pos = props.getPos();
    if (typeof pos !== 'number') return;
    props.editor.chain().focus().setNodeSelection(pos).run();
  };

  return (
    <div class={styles.card} data-drag-handle draggable='true' onMouseDown={selectCard}>
      <figure class={styles.figure}>
        <Show
          when={hasAudio()}
          fallback={
            <div class={styles.empty}>
              <FileUpload.Root accept='audio/*' maxFiles={1} onFileAccept={onFileAccept}>
                <FileUpload.Dropzone class={styles.dropzone} data-file-upload-dropzone>
                  <span class={styles.dropzoneIcon} aria-hidden='true'>
                    <AudioIcon />
                  </span>
                  <p class={styles.dropzoneLabel}>Click to select an audio file</p>
                </FileUpload.Dropzone>
                <FileUpload.HiddenInput />
              </FileUpload.Root>
              <div class={styles.meta} contentEditable={false}>
                <input
                  type='text'
                  class={styles.metaInput}
                  value={caption()}
                  placeholder='Type caption for audio (optional)'
                  onMouseDown={(e) => e.stopPropagation()}
                  onInput={(e) => props.updateAttributes({ caption: e.currentTarget.value || null })}
                />
              </div>
            </div>
          }>
          <div class={styles.filled} classList={{ [styles.filledSelected]: selected() }}>
            <audio class={`${styles.player} ${styles.playerAudio}`} src={src()!} controls preload='metadata' draggable='false' />
            <Show when={selected()}>
              <div class={styles.meta} contentEditable={false}>
                <input
                  type='text'
                  class={styles.metaInput}
                  value={caption()}
                  placeholder='Type caption for audio (optional)'
                  onMouseDown={(e) => e.stopPropagation()}
                  onInput={(e) => props.updateAttributes({ caption: e.currentTarget.value || null })}
                />
              </div>
            </Show>
          </div>
          <Show when={!selected() && caption()}>
            <figcaption class={styles.caption}>{caption()}</figcaption>
          </Show>
        </Show>
      </figure>
    </div>
  );
};
