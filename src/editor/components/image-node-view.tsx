import { FileUpload } from '@ark-ui/solid/file-upload';
import type { NodeViewProps } from '@tiptap/core';
import { Show, createMemo, createSignal, type Component } from 'solid-js';

import { ImageIcon } from '../styles/icons';
import { readFileAsDataUrl } from '../utils/read-file-as-data-url';

import styles from '../styles/image-node.module.css';

export const ImageNodeView: Component<NodeViewProps> = (props) => {
  const [editingAlt, setEditingAlt] = createSignal(false);

  const src = createMemo(() => (props.node.attrs.src as string | null) ?? null);
  const alt = createMemo(() => (props.node.attrs.alt as string | null) ?? '');
  const caption = createMemo(() => (props.node.attrs.caption as string | null) ?? '');
  const hasImage = createMemo(() => !!src());
  const selected = createMemo(() => props.selected);

  const fieldValue = () => (editingAlt() ? alt() : caption());
  const fieldPlaceholder = () => (editingAlt() ? 'Describe image for accessibility' : 'Type caption for image (optional)');

  const onFieldInput = (value: string) => {
    if (editingAlt()) {
      props.updateAttributes({ alt: value || null });
      return;
    }
    props.updateAttributes({ caption: value || null });
  };

  const onFileAccept = async (details: { files: File[] }) => {
    const file = details.files[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    props.updateAttributes({
      src: dataUrl,
      alt: alt() || file.name.replace(/\.[^.]+$/, '') || null,
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
          when={hasImage()}
          fallback={
            <div class={styles.empty}>
              <FileUpload.Root accept='image/*' maxFiles={1} onFileAccept={onFileAccept}>
                <FileUpload.Dropzone class={styles.dropzone} data-file-upload-dropzone>
                  <span class={styles.dropzoneIcon} aria-hidden='true'>
                    <ImageIcon />
                  </span>
                  <p class={styles.dropzoneLabel}>Click to select an image</p>
                </FileUpload.Dropzone>
                <FileUpload.HiddenInput />
              </FileUpload.Root>
              <div class={styles.meta} contentEditable={false}>
                <input
                  type='text'
                  class={styles.metaInput}
                  value={fieldValue()}
                  placeholder={fieldPlaceholder()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onInput={(e) => onFieldInput(e.currentTarget.value)}
                />
                <button
                  type='button'
                  class={styles.altButton}
                  classList={{ [styles.altButtonActive]: editingAlt() }}
                  aria-pressed={editingAlt()}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setEditingAlt((v) => !v)}>
                  Alt
                </button>
              </div>
            </div>
          }>
          <div class={styles.filled} classList={{ [styles.filledSelected]: selected() }}>
            <img class={styles.preview} src={src()!} alt={alt()} draggable='false' />
            <Show when={selected()}>
              <div class={styles.meta} contentEditable={false}>
                <input
                  type='text'
                  class={styles.metaInput}
                  value={fieldValue()}
                  placeholder={fieldPlaceholder()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onInput={(e) => onFieldInput(e.currentTarget.value)}
                />
                <button
                  type='button'
                  class={styles.altButton}
                  classList={{ [styles.altButtonActive]: editingAlt() }}
                  aria-pressed={editingAlt()}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setEditingAlt((v) => !v)}>
                  Alt
                </button>
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
