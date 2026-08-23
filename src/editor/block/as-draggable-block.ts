import { withBlockHTMLAttributes } from './chrome';

/**
 * Minimal TipTap extension surface used by `asDraggableBlock`.
 * Avoids fighting TipTap's deep generic `Node<Options, Storage>` types.
 */
type BlockSource = {
  extend: (config: { draggable: true }) => {
    configure: (options?: Record<string, unknown>) => unknown;
  };
};

/**
 * Wrap an existing TipTap node so it behaves as a catalog block:
 * - `draggable: true` (entire block list)
 * - shared `block-chrome` class for hover / selected styles
 *
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing
 * @see https://tiptap.dev/docs/editor/core-concepts/schema#draggable
 */
export function asDraggableBlock<T>(extension: T & BlockSource, options: Record<string, unknown> = {}): T {
  const { HTMLAttributes, ...rest } = options;

  return extension.extend({ draggable: true }).configure({
    ...rest,
    HTMLAttributes: withBlockHTMLAttributes((HTMLAttributes as Record<string, unknown> | undefined) ?? {}),
  }) as T;
}
