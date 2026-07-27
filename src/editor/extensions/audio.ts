import { mergeAttributes } from '@tiptap/core';
import { Audio as TiptapAudio, type AudioOptions } from '@tiptap/extension-audio';
import type { DOMOutputSpec } from '@tiptap/pm/model';

import { AudioNodeView } from '../components/audio-node-view';
import { SolidNodeViewRenderer } from '../utils/solid-node-view';

export type EditorAudioOptions = AudioOptions;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audioCard: {
      /** Insert an empty audio card (dropzone) or one with attrs. */
      insertAudioCard: (options?: { src?: string | null; caption?: string | null }) => ReturnType;
    };
  }
}

/**
 * TipTap Audio with a Solid node view: Ark FileUpload dropzone when empty,
 * native player + caption when filled.
 * @see https://tiptap.dev/docs/editor/extensions/nodes/audio
 * @see https://ark-ui.com/docs/components/file-upload#dropzone
 */
export const Audio = TiptapAudio.extend<EditorAudioOptions>({
  name: 'audio',

  addOptions() {
    return {
      ...this.parent?.(),
      addPasteHandler: true,
      allowBase64: true,
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
      preload: 'metadata',
      controlslist: undefined,
      crossorigin: undefined,
      disableRemotePlayback: false,
      HTMLAttributes: {},
      inline: false,
    } satisfies AudioOptions;
  },

  addAttributes() {
    return {
      ...this.parent?.(),
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
        tag: this.options.allowBase64 ? 'figure:has(audio[src])' : 'figure:has(audio[src]:not([src^="data:"]))',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const audio = element.querySelector('audio');
          if (!audio?.getAttribute('src')) return false;
          return {
            src: audio.getAttribute('src'),
            caption: element.querySelector('figcaption')?.textContent?.trim() || null,
          };
        },
      },
      {
        tag: this.options.allowBase64 ? 'audio[src]' : 'audio[src]:not([src^="data:"])',
      },
      {
        tag: 'div[data-type="audio-placeholder"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const caption = node.attrs.caption as string | null;
    const { caption: _c, 'data-caption': _d, ...audioAttrs } = HTMLAttributes;

    if (!node.attrs.src) {
      return ['div', { 'data-type': 'audio-placeholder' }];
    }

    const audio: DOMOutputSpec = [
      'audio',
      mergeAttributes(this.options.HTMLAttributes, audioAttrs, {
        controls: this.options.controls,
        preload: this.options.preload,
      }),
    ];

    if (caption) {
      return ['figure', {}, audio, ['figcaption', {}, caption]];
    }

    return audio;
  },

  addNodeView() {
    return SolidNodeViewRenderer(AudioNodeView);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertAudioCard:
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
