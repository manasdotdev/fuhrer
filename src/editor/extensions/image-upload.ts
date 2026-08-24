import { mergeAttributes, Node } from '@tiptap/core';

import { ImageUploadView } from '../components/image-upload-view';
import { withBlockHTMLAttributes } from '../features/node-block';
import { uploadImageAsDataUrl } from '../utils/upload-image';
import { SolidNodeViewRenderer } from '../solid';

export type ImageUploadFn = (file: File, onProgress?: (event: { progress: number }) => void, abortSignal?: AbortSignal) => Promise<string>;

export type ImageUploadOptions = {
  /** TipTap node name to insert after a successful upload. @default 'image' */
  type: string;
  /** Acceptable file types. @default 'image/*' */
  accept: string;
  /** Max files per upload. @default 1 */
  limit: number;
  /** Max file size in bytes; `0` = unlimited. @default 0 */
  maxSize: number;
  upload: ImageUploadFn;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
  HTMLAttributes: Record<string, unknown>;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: (options?: Partial<ImageUploadOptions>) => ReturnType;
    };
  }
}

/**
 * Placeholder block for picking / dropping an image, then replaced by an `image` node.
 *
 * @see https://tiptap.dev/docs/ui-components/node-components/image-upload-node
 */
export const ImageUpload = Node.create<ImageUploadOptions>({
  name: 'imageUpload',

  group: 'block',

  atom: true,

  // Empty placeholder — not draggable until replaced by a real image node.
  draggable: false,

  selectable: true,

  addOptions() {
    return {
      type: 'image',
      accept: 'image/*',
      limit: 1,
      maxSize: 0,
      upload: uploadImageAsDataUrl,
      onError: undefined,
      onSuccess: undefined,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      accept: {
        default: this.options.accept,
      },
      limit: {
        default: this.options.limit,
      },
      maxSize: {
        default: this.options.maxSize,
      },
      caption: {
        default: '',
      },
      alt: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'image-upload' }, withBlockHTMLAttributes(this.options.HTMLAttributes), HTMLAttributes)];
  },

  addNodeView() {
    return SolidNodeViewRenderer(ImageUploadView, {
      className: 'image-upload-host',
    });
  },

  addCommands() {
    return {
      setImageUploadNode:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }

        const { selection } = editor.state;
        const pos = selection.$from.pos;
        const nodeEl = editor.view.nodeDOM(pos);

        if (!(nodeEl instanceof HTMLElement)) {
          return false;
        }

        const dropzone = nodeEl.querySelector<HTMLElement>('[data-part="dropzone"]');
        dropzone?.click();
        return true;
      },
    };
  },
});
