import { type Component, type JSX, type ParentProps, splitProps } from 'solid-js';

import { NodeViewWrapper, type NodeViewWrapperProps } from '../../solid/node-view-wrapper';
import { mergeBlockChromeClass } from './chrome';

export type BlockShellProps = ParentProps<
  NodeViewWrapperProps & {
    /** From SolidNodeView `selected` prop */
    selected?: boolean;
  }
>;

/**
 * Shared Solid node-view shell for catalog blocks.
 * Applies `block-chrome` + `data-selected` for CSS hover / selection.
 *
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views/react
 */
export const BlockShell: Component<BlockShellProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'selected', 'children', 'style']);

  return (
    <NodeViewWrapper
      {...rest}
      class={mergeBlockChromeClass(local.class)}
      data-selected={local.selected ? '' : undefined}
      style={{
        ...(typeof local.style === 'object' && local.style ? (local.style as JSX.CSSProperties) : {}),
      }}>
      {local.children}
    </NodeViewWrapper>
  );
};
