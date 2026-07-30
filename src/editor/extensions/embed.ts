import { mergeAttributes, Node } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';

import { EmbedNodeView } from '../components/embed-node-view';
import { SolidNodeViewRenderer } from '../utils/solid-node-view';

export type EditorEmbedOptions = {
  HTMLAttributes: Record<string, unknown>;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /** Insert an empty embed card (URL paste field) or one with attrs. */
      insertEmbed: (options?: {
        url?: string | null;
        embedUrl?: string | null;
        provider?: string | null;
        aspectRatio?: string | null;
        height?: number | null;
        caption?: string | null;
      }) => ReturnType;
    };
  }
}

/**
 * Block embed card: paste a YouTube / Spotify / Vimeo / … URL (or iframe HTML)
 * and render it as a sandboxed iframe.
 */
export const Embed = Node.create<EditorEmbedOptions>({
  name: 'embed',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
      embedUrl: { default: null },
      provider: { default: null },
      aspectRatio: { default: '16 / 9' },
      height: { default: null },
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
        tag: 'figure[data-type="embed"]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const iframe = element.querySelector('iframe');
          const src = iframe?.getAttribute('src');
          if (!src) return false;
          return {
            url: element.getAttribute('data-url') || src,
            embedUrl: src,
            provider: element.getAttribute('data-provider'),
            aspectRatio: element.getAttribute('data-aspect-ratio') || '16 / 9',
            height: element.getAttribute('data-height') ? Number(element.getAttribute('data-height')) : null,
            caption: element.querySelector('figcaption')?.textContent?.trim() || null,
          };
        },
      },
      {
        tag: 'div[data-type="embed-placeholder"]',
      },
      {
        tag: 'iframe[src]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const src = element.getAttribute('src');
          if (!src) return false;
          return {
            url: src,
            embedUrl: src,
            provider: 'iframe',
            aspectRatio: '16 / 9',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const caption = node.attrs.caption as string | null;
    const embedUrl = node.attrs.embedUrl as string | null;

    if (!embedUrl) {
      return ['div', { 'data-type': 'embed-placeholder' }];
    }

    const {
      caption: _c,
      'data-caption': _d,
      url,
      provider,
      aspectRatio,
      height,
      embedUrl: _e,
      ...rest
    } = HTMLAttributes as Record<string, unknown>;

    const figureAttrs = mergeAttributes(this.options.HTMLAttributes, rest, {
      'data-type': 'embed',
      'data-url': (url as string) || embedUrl,
      'data-provider': provider || undefined,
      'data-aspect-ratio': aspectRatio || '16 / 9',
      'data-height': height ?? undefined,
    });

    const iframe: DOMOutputSpec = [
      'iframe',
      {
        src: embedUrl,
        frameborder: '0',
        allowfullscreen: 'true',
        loading: 'lazy',
      },
    ];

    if (caption) {
      return ['figure', figureAttrs, iframe, ['figcaption', {}, caption]];
    }

    return ['figure', figureAttrs, iframe];
  },

  addNodeView() {
    return SolidNodeViewRenderer(EmbedNodeView);
  },

  addCommands() {
    return {
      insertEmbed:
        (options = {}) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: {
                url: options.url ?? null,
                embedUrl: options.embedUrl ?? null,
                provider: options.provider ?? null,
                aspectRatio: options.aspectRatio ?? '16 / 9',
                height: options.height ?? null,
                caption: options.caption ?? null,
              },
            })
            .command(({ tr, dispatch }) => {
              const node = tr.selection.$from.nodeBefore;
              if (node?.type.name !== this.name) return false;
              const pos = tr.selection.from - node.nodeSize;
              if (dispatch) {
                tr.setSelection(NodeSelection.create(tr.doc, pos));
              }
              return true;
            })
            .run(),
    };
  },
});
