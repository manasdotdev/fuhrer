import { type Component, type JSX, type ValidComponent, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useSolidNodeView } from './solid-node-view-context';

export type NodeViewWrapperProps = JSX.HTMLAttributes<HTMLElement> & {
  as?: ValidComponent;
};

/**
 * Required root of every Solid node view.
 * Marks the host ProseMirror looks for via `data-node-view-wrapper`.
 *
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views/react
 */
export const NodeViewWrapper: Component<NodeViewWrapperProps> = (props) => {
  const [local, rest] = splitProps(props, ['as', 'style']);
  const { onDragStart } = useSolidNodeView();

  return (
    <Dynamic
      component={local.as ?? 'div'}
      {...rest}
      data-node-view-wrapper=''
      onDragStart={onDragStart}
      style={{
        ...(typeof local.style === 'object' && local.style ? local.style : {}),
        'white-space': 'normal',
      }}
    />
  );
};
