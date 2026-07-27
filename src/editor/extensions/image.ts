import { mergeAttributes } from '@tiptap/core';
import { Image as TiptapImage, type ImageOptions } from '@tiptap/extension-image';
import type { DOMOutputSpec } from '@tiptap/pm/model';

import { ImageNodeView } from '../components/image-node-view';
import { SolidNodeViewRenderer } from '../utils/solid-node-view';

export type EditorImageOptions = ImageOptions;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageCard: {
      /** Insert an empty image card (dropzone) or one with attrs. */
      insertImageCard: (options?: { src?: string | null; alt?: string | null; caption?: string | null }) => ReturnType;
    };
  }
}

/**
 * TipTap Image with a Solid node view: Ark FileUpload dropzone when empty,
 * preview + caption/alt controls when filled.
 * @see https://tiptap.dev/docs/editor/extensions/nodes/image
 * @see https://ark-ui.com/docs/components/file-upload#dropzone
 */
export const Image = TiptapImage.extend<EditorImageOptions>({
  name: 'image',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
      resize: false,
    } satisfies ImageOptions;
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (element) => {
          const figure = element.closest('figure');
          const figcaption = figure?.querySelector('figcaption');
          return figcaption?.textContent?.trim() || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.caption) return {};
          return { 'data-caption': attributes.caption };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'figure:has(img[src])' : 'figure:has(img[src]:not([src^="data:"]))',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const img = element.querySelector('img');
          if (!img?.getAttribute('src')) return false;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            caption: element.querySelector('figcaption')?.textContent?.trim() || null,
          };
        },
      },
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
      },
      {
        tag: 'div[data-type="image-placeholder"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const caption = node.attrs.caption as string | null;
    const { caption: _captionAttr, 'data-caption': _dataCaption, ...imgAttrs } = HTMLAttributes;
    const img: DOMOutputSpec = ['img', mergeAttributes(this.options.HTMLAttributes, imgAttrs)];

    if (!node.attrs.src) {
      return ['div', { 'data-type': 'image-placeholder' }];
    }

    if (caption) {
      return ['figure', {}, img, ['figcaption', {}, caption]];
    }

    return img;
  },

  addNodeView() {
    return SolidNodeViewRenderer(ImageNodeView);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertImageCard:
        (options = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src ?? null,
              alt: options.alt ?? null,
              caption: options.caption ?? null,
            },
          }),
    };
  },
});
