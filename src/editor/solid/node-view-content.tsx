import { type Component, type JSX, type ValidComponent, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useSolidNodeView } from './solid-node-view-context';

export type NodeViewContentProps = JSX.HTMLAttributes<HTMLElement> & {
  as?: ValidComponent;
};

/**
 * Marks where ProseMirror should place editable child content inside a node view.
 *
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views/react
 */
export const NodeViewContent: Component<NodeViewContentProps> = (props) => {
  const [local, rest] = splitProps(props, ['as', 'style', 'ref']);
  const { nodeViewContentRef } = useSolidNodeView();

  return (
    <Dynamic
      component={local.as ?? 'div'}
      {...rest}
      ref={(el: HTMLElement) => {
        nodeViewContentRef?.(el);
        const ref = local.ref;
        if (typeof ref === 'function') {
          (ref as (el: HTMLElement) => void)(el);
        }
      }}
      data-node-view-content=''
      style={{
        ...(typeof local.style === 'object' && local.style ? local.style : {}),
        'white-space': 'pre-wrap',
      }}
    />
  );
};
