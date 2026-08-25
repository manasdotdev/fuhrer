import { FileUpload } from '@ark-ui/solid/file-upload';
import { Show, createSignal } from 'solid-js';

import { NodeViewWrapper, type SolidNodeViewProps } from '../solid-bindings';
import { ICONS } from '../styles/icons';

import styles from '../styles/image-upload.module.css';

type MetaField = 'caption' | 'alt';

export const ImageUploadView = (props: SolidNodeViewProps) => {
  const [metaField, setMetaField] = createSignal<MetaField>('caption');

  const src = () => props.node.attrs.src as string | null;
  const caption = () => (props.node.attrs.caption as string) ?? '';
  const alt = () => (props.node.attrs.alt as string) ?? '';

  const metaValue = () => (metaField() === 'caption' ? caption() : alt());
  const metaPlaceholder = () =>
    metaField() === 'caption' ? 'Type caption for image (optional)' : 'Type alt text for image (optional)';

  const onFile = (file: File) => {
    props.updateAttributes({ src: URL.createObjectURL(file) });
  };

  return (
    <NodeViewWrapper
      class={styles.card}
      data-selected={props.selected ? 'true' : 'false'}
      data-has-src={src() ? 'true' : 'false'}>
      <div class={styles.media}>
        <Show
          when={src()}
          fallback={
            <FileUpload.Root
              class={styles.root}
              maxFiles={1}
              accept='image/*'
              onFileAccept={(details) => {
                const file = details.files[0];
                if (file) onFile(file);
              }}>
              <FileUpload.Dropzone class={styles.dropzone} disableClick>
                <FileUpload.Trigger class={styles.trigger}>
                  <span class={styles.dropzoneIcon}>
                    <ICONS.Image />
                  </span>
                  <span class={styles.dropzoneLabel}>Click to select an image</span>
                </FileUpload.Trigger>
              </FileUpload.Dropzone>
              <FileUpload.HiddenInput />
            </FileUpload.Root>
          }>
          {(url) => (
            <div class={styles.figure} data-bubble-anchor='image-upload'>
              <img class={styles.image} src={url()} alt={alt()} draggable={false} />
            </div>
          )}
        </Show>
      </div>

      <Show when={props.selected}>
        <div
          class={styles.captionBar}
          contentEditable={false}
          onMouseDown={(e) => {
            e.stopPropagation();
            const pos = props.getPos();
            if (typeof pos === 'number') {
              props.editor.commands.setNodeSelection(pos);
            }
          }}>
          <input
            class={styles.captionInput}
            type='text'
            placeholder={metaPlaceholder()}
            value={metaValue()}
            onFocus={() => {
              const pos = props.getPos();
              if (typeof pos === 'number') {
                props.editor.commands.setNodeSelection(pos);
              }
            }}
            onInput={(e) => {
              const value = e.currentTarget.value;
              if (metaField() === 'caption') {
                props.updateAttributes({ caption: value });
              } else {
                props.updateAttributes({ alt: value });
              }
            }}
          />
          <button
            type='button'
            class={styles.altButton}
            classList={{ [styles.altButtonActive]: metaField() === 'alt' }}
            onClick={() => setMetaField((field) => (field === 'caption' ? 'alt' : 'caption'))}>
            Alt
          </button>
        </div>
      </Show>
    </NodeViewWrapper>
  );
};
