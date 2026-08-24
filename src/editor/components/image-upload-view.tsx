import { FileUpload } from '@ark-ui/solid/file-upload';
import type { Component, JSX } from 'solid-js';
import { createSignal } from 'solid-js';

import { BlockShell } from '../features/node-block';
import { imageAltFromFileName } from '../utils/upload-image';
import type { SolidNodeViewProps } from '../solid';

type ImageUploadExtensionOptions = {
  type: string;
  accept: string;
  limit: number;
  maxSize: number;
  upload: (file: File) => Promise<string>;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
};

type MetaField = 'caption' | 'alt';

const ImagePlaceholderIcon: Component = () => (
  <svg
    class='image-upload__icon'
    width='48'
    height='48'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    stroke-width='1.5'
    stroke-linecap='round'
    stroke-linejoin='round'
    aria-hidden='true'>
    <rect x='3' y='3' width='18' height='18' rx='2' />
    <circle cx='8.5' cy='8.5' r='1.5' />
    <path d='M21 15l-5-5L5 21' />
  </svg>
);

function stopNodeViewMouseDown(event: MouseEvent): void {
  event.stopPropagation();
}

/**
 * Empty-state image upload block (Ark UI FileUpload dropzone).
 * On accept, replaces this node with TipTap `image` node(s).
 *
 * @see https://ark-ui.com/docs/components/file-upload#dropzone
 * @see https://tiptap.dev/docs/ui-components/node-components/image-upload-node
 */
export const ImageUploadView: Component<SolidNodeViewProps> = (props) => {
  const [metaField, setMetaField] = createSignal<MetaField>('caption');

  const options = (): ImageUploadExtensionOptions => props.extension.options as ImageUploadExtensionOptions;

  const accept = () => (props.node.attrs.accept as string | undefined) ?? options().accept;
  const limit = () => (props.node.attrs.limit as number | undefined) ?? options().limit;
  const maxSize = () => {
    const size = (props.node.attrs.maxSize as number | undefined) ?? options().maxSize;
    return size > 0 ? size : undefined;
  };

  const replaceWithImages = async (files: File[]): Promise<void> => {
    const { upload, type, onError, onSuccess } = options();
    const pos = props.getPos();

    if (typeof pos !== 'number') {
      return;
    }

    try {
      const urls: string[] = [];

      for (const file of files) {
        const url = await upload(file);
        urls.push(url);
        onSuccess?.(url);
      }

      const caption = (props.node.attrs.caption as string | undefined) ?? '';
      const altAttr = (props.node.attrs.alt as string | undefined) ?? '';

      const imageNodes = urls.map((src, index) => ({
        type,
        attrs: {
          src,
          alt: altAttr || imageAltFromFileName(files[index]?.name ?? 'image'),
          title: caption || undefined,
        },
      }));

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + props.node.nodeSize })
        .insertContentAt(pos, imageNodes)
        .run();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Image upload failed'));
    }
  };

  const onMetaInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    const value = event.currentTarget.value;
    props.updateAttributes(metaField() === 'alt' ? { alt: value } : { caption: value });
  };

  const toggleMetaField = (): void => {
    setMetaField((current) => (current === 'caption' ? 'alt' : 'caption'));
  };

  const metaValue = (): string => {
    const key = metaField();
    return (props.node.attrs[key] as string | undefined) ?? '';
  };

  const metaPlaceholder = (): string => (metaField() === 'alt' ? 'Describe the image for accessibility' : 'Type caption for image (optional)');

  return (
    <BlockShell selected={props.selected} class='image-upload-block' draggable={false}>
      <FileUpload.Root
        class='image-upload'
        accept={accept()}
        maxFiles={limit()}
        maxFileSize={maxSize()}
        preventDocumentDrop
        onFileAccept={(details) => {
          void replaceWithImages(details.files);
        }}
        onFileReject={(details) => {
          const first = details.files[0];
          const code = first?.errors?.[0] ?? 'FILE_REJECTED';
          options().onError?.(new Error(`Image rejected: ${code}`));
        }}>
        <FileUpload.Dropzone class='image-upload__dropzone'>
          <div class='image-upload__prompt'>
            <ImagePlaceholderIcon />
            <span class='image-upload__label'>Click to select an image</span>
          </div>
        </FileUpload.Dropzone>

        <div class='image-upload__meta' onMouseDown={stopNodeViewMouseDown}>
          <input class='image-upload__meta-input' type='text' placeholder={metaPlaceholder()} value={metaValue()} onInput={onMetaInput} />

          <button type='button' class='image-upload__toggle' classList={{ 'is-alt': metaField() === 'alt' }} aria-pressed={metaField() === 'alt'} onClick={toggleMetaField}>
            Alt
          </button>
        </div>

        <FileUpload.HiddenInput />
      </FileUpload.Root>
    </BlockShell>
  );
};
