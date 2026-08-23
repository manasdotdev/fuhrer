import { Node, mergeAttributes, type NodeViewProps } from '@tiptap/core';
import type { Component } from 'solid-js';

import { NodeViewWrapper, SolidNodeViewRenderer } from '../editor/solid';

/**
 * Demo Solid node view — a clickable counter embedded in the document.
 */
const CounterView: Component<NodeViewProps> = (props) => {
  const increase = () => {
    props.updateAttributes({
      count: (props.node.attrs.count as number) + 1,
    });
  };

  return (
    <NodeViewWrapper class='my-3 flex items-center gap-3 rounded border border-neutral-300 bg-neutral-50 px-3 py-2' contentEditable={false}>
      <span class='text-xs tracking-wide text-neutral-500 uppercase'>Solid node</span>
      <button
        type='button'
        class='rounded border border-neutral-400 bg-white px-2 py-1 text-sm hover:bg-neutral-100'
        onMouseDown={(event) => event.preventDefault()}
        onClick={increase}>
        Count: {props.node.attrs.count as number}
      </button>
      {props.selected ? <span class='text-xs text-neutral-400'>selected</span> : null}
    </NodeViewWrapper>
  );
};

export const CounterExtension = Node.create({
  name: 'counter',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      count: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute('count') ?? 0),
        renderHTML: (attributes) => ({ count: attributes.count }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="counter"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'counter' })];
  },

  addNodeView() {
    return SolidNodeViewRenderer(CounterView);
  },
});
