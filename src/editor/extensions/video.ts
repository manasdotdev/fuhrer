import { mergeAttributes, Node } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';

import { VideoNodeView } from '../components/video-node-view';
import { SolidNodeViewRenderer } from '../utils/solid-node-view';

export type EditorVideoOptions = {
  allowBase64: boolean;
  controls: boolean;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  preload: 'auto' | 'metadata' | 'none' | null;
  HTMLAttributes: Record<string, unknown>;
  inline: boolean;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; caption?: string | null }) => ReturnType;
    };
    videoCard: {
      /** Insert an empty video card (dropzone) or one with attrs. */
      insertVideoCard: (options?: { src?: string | null; caption?: string | null }) => ReturnType;
    };
  }
}

/**
 * Native HTML video node with a Solid Ark FileUpload dropzone when empty.
 * TipTap does not ship an official video file node; this mirrors @tiptap/extension-audio.
 * @see https://ark-ui.com/docs/components/file-upload#dropzone
 */
export const Video = Node.create<EditorVideoOptions>({
  name: 'video',

  addOptions() {
    return {
      allowBase64: true,
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      preload: 'metadata',
      HTMLAttributes: {},
      inline: false,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: this.options.controls },
      autoplay: { default: this.options.autoplay },
      loop: { default: this.options.loop },
      muted: { default: this.options.muted },
      preload: { default: this.options.preload },
      caption: {
        default: null,
        parseHTML: (element) => {
          const figure = element.closest('figure');
          return figure?.querySelector('figcaption')?.textContent?.trim() || null;
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
        tag: this.options.allowBase64 ? 'figure:has(video[src])' : 'figure:has(video[src]:not([src^="data:"]))',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const video = element.querySelector('video');
          if (!video?.getAttribute('src')) return false;
          return {
            src: video.getAttribute('src'),
            caption: element.querySelector('figcaption')?.textContent?.trim() || null,
          };
        },
      },
      {
        tag: this.options.allowBase64 ? 'video[src]' : 'video[src]:not([src^="data:"])',
      },
      {
        tag: 'div[data-type="video-placeholder"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const caption = node.attrs.caption as string | null;
    const { caption: _c, 'data-caption': _d, ...videoAttrs } = HTMLAttributes;

    if (!node.attrs.src) {
      return ['div', { 'data-type': 'video-placeholder' }];
    }

    const video: DOMOutputSpec = [
      'video',
      mergeAttributes(this.options.HTMLAttributes, videoAttrs, {
        controls: this.options.controls,
        preload: this.options.preload,
      }),
    ];

    if (caption) {
      return ['figure', {}, video, ['figcaption', {}, caption]];
    }

    return video;
  },

  addNodeView() {
    return SolidNodeViewRenderer(VideoNodeView);
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
      insertVideoCard:
        (options = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src ?? null,
              caption: options.caption ?? null,
            },
          }),
    };
  },
});
