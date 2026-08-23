import { Extension, isNodeSelection } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { BLOCK_CATALOG } from './catalog';

const BLOCK_DRAG_PREVIEW_KEY = new PluginKey('blockDragPreview');

const DEFAULT_BLOCK_NAMES = new Set(Object.values(BLOCK_CATALOG).map((block) => block.name));

export type BlockDragPreviewOptions = {
  /** Max width of the cursor drag thumbnail (px). */
  previewMaxWidth: number;
  /** TipTap node names that may be dragged. Everything else is blocked. */
  blockNames: Set<string> | string[];
};

function toNameSet(names: Set<string> | string[]): Set<string> {
  return names instanceof Set ? names : new Set(names);
}

/**
 * Canvas thumbnails — browsers often ignore CSS size when setDragImage()
 * is given a real <img>, and use the intrinsic pixel size instead.
 */
function createImageCanvasPreview(img: HTMLImageElement, maxWidth: number): HTMLCanvasElement {
  const naturalW = img.naturalWidth || img.width || maxWidth;
  const naturalH = img.naturalHeight || img.height || maxWidth;
  const width = Math.min(maxWidth, naturalW);
  const height = Math.max(1, Math.round((naturalH / naturalW) * width));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.cssText = 'position:absolute;top:-9999px;left:-9999px;pointer-events:none;';

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
  }

  return canvas;
}

function createElementPreview(source: HTMLElement, maxWidth: number): HTMLElement {
  const preview = source.cloneNode(true) as HTMLElement;
  preview.classList.remove('is-dragging', 'ProseMirror-selectednode');
  preview.removeAttribute('data-selected');
  preview.style.cssText = [
    'position:absolute',
    'top:-9999px',
    'left:-9999px',
    'margin:0',
    'pointer-events:none',
    `width:${maxWidth}px`,
    'max-width:none',
    'height:auto',
    'opacity:1',
    'filter:none',
    'outline:none',
    'overflow:hidden',
  ].join(';');
  return preview;
}

function createDragPreview(source: HTMLElement, maxWidth: number): HTMLElement {
  const img = source instanceof HTMLImageElement ? source : source.querySelector('img');

  if (img instanceof HTMLImageElement && (img.naturalWidth > 0 || img.complete)) {
    return createImageCanvasPreview(img, maxWidth);
  }

  return createElementPreview(source, maxWidth);
}

function markDragging(dom: HTMLElement): () => void {
  const targets = new Set<HTMLElement>([dom]);
  dom.querySelectorAll<HTMLElement>('.block-chrome').forEach((el) => targets.add(el));

  targets.forEach((el) => el.classList.add('is-dragging'));

  return () => {
    targets.forEach((el) => el.classList.remove('is-dragging'));
  };
}

/**
 * Block drag UX for catalog nodes only:
 * 1. Source fades / grays while dragging
 * 2. Cursor shows a small canvas thumbnail
 * 3. Non-catalog nodes (paragraph, text, …) cannot be dragged
 *
 * @see https://tiptap.dev/docs/editor/extensions/functionality/dropcursor
 */
export const BlockDragPreview = Extension.create<BlockDragPreviewOptions>({
  name: 'blockDragPreview',

  addOptions() {
    return {
      previewMaxWidth: 168,
      blockNames: DEFAULT_BLOCK_NAMES,
    };
  },

  addProseMirrorPlugins() {
    const { previewMaxWidth, blockNames } = this.options;
    const names = toNameSet(blockNames);

    return [
      new Plugin({
        key: BLOCK_DRAG_PREVIEW_KEY,
        props: {
          handleDOMEvents: {
            dragstart(view, event) {
              const { selection } = view.state;

              // Only catalog block NodeSelections may drag.
              if (!isNodeSelection(selection) || !names.has(selection.node.type.name)) {
                event.preventDefault();
                return true;
              }

              const dom = view.nodeDOM(selection.from);

              if (!(dom instanceof HTMLElement) || !event.dataTransfer) {
                event.preventDefault();
                return true;
              }

              const preview = createDragPreview(dom, previewMaxWidth);
              document.body.appendChild(preview);

              const previewWidth = preview instanceof HTMLCanvasElement ? preview.width : preview.getBoundingClientRect().width || previewMaxWidth;
              const previewHeight = preview instanceof HTMLCanvasElement ? preview.height : preview.getBoundingClientRect().height || 48;

              event.dataTransfer.setDragImage(preview, Math.round(previewWidth / 2), Math.min(24, Math.round(previewHeight / 2)));
              event.dataTransfer.effectAllowed = 'move';

              const clearDragging = markDragging(dom);

              const clear = () => {
                clearDragging();
                preview.remove();
                window.removeEventListener('dragend', clear);
                window.removeEventListener('drop', clear);
              };

              window.addEventListener('dragend', clear);
              window.addEventListener('drop', clear);

              return false;
            },
          },
        },
      }),
    ];
  },
});
