import type { NodeViewProps, NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { DecorationSource, NodeView as PMNodeView } from '@tiptap/pm/view';
import type { Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { render } from 'solid-js/web';

/**
 * Mount a Solid component as a ProseMirror node view.
 * Props stay reactive via a store so TipTap update/select can push changes.
 */
export function SolidNodeViewRenderer(component: Component<NodeViewProps>): NodeViewRenderer {
  return (props) => new SolidNodeView(component, props);
}

class SolidNodeView implements PMNodeView {
  private readonly component: Component<NodeViewProps>;
  private readonly editor: NodeViewRendererProps['editor'];
  private readonly getPos: NodeViewRendererProps['getPos'];
  private readonly extension: NodeViewRendererProps['extension'];
  private readonly view: NodeViewRendererProps['view'];
  private readonly HTMLAttributes: Record<string, unknown>;

  private node: ProseMirrorNode;
  private decorations: readonly import('@tiptap/pm/view').Decoration[];
  private innerDecorations: DecorationSource;
  private selected = false;

  private readonly setProps: ReturnType<typeof createStore<NodeViewProps>>[1];
  private readonly dispose: () => void;
  dom: HTMLElement;

  constructor(component: Component<NodeViewProps>, props: NodeViewRendererProps) {
    this.component = component;
    this.editor = props.editor;
    this.getPos = props.getPos;
    this.extension = props.extension;
    this.view = props.view;
    this.HTMLAttributes = props.HTMLAttributes;
    this.node = props.node;
    this.decorations = props.decorations;
    this.innerDecorations = props.innerDecorations;

    const [store, setProps] = createStore<NodeViewProps>(this.buildProps());
    this.setProps = setProps;

    const root = document.createElement('div');
    root.dataset.nodeViewWrapper = '';
    root.style.whiteSpace = 'normal';
    this.dom = root;

    const Comp = this.component;
    this.dispose = render(() => <Comp {...store} />, root);
  }

  private buildProps(): NodeViewProps {
    return {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations as NodeViewProps['decorations'],
      innerDecorations: this.innerDecorations,
      view: this.view,
      getPos: this.getPos,
      extension: this.extension,
      HTMLAttributes: this.HTMLAttributes,
      selected: this.selected,
      updateAttributes: (attributes) => {
        const pos = this.getPos();
        if (typeof pos !== 'number') return;
        this.editor.commands.command(({ tr }) => {
          tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, ...attributes });
          return true;
        });
      },
      deleteNode: () => {
        const pos = this.getPos();
        if (typeof pos !== 'number') return;
        this.editor.commands.command(({ tr }) => {
          tr.delete(pos, pos + this.node.nodeSize);
          return true;
        });
      },
    };
  }

  private sync() {
    this.setProps(this.buildProps());
  }

  update(node: ProseMirrorNode, decorations: readonly import('@tiptap/pm/view').Decoration[], innerDecorations: DecorationSource) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.decorations = decorations;
    this.innerDecorations = innerDecorations;
    this.sync();
    return true;
  }

  selectNode() {
    this.selected = true;
    this.setProps('selected', true);
  }

  deselectNode() {
    this.selected = false;
    this.setProps('selected', false);
  }

  stopEvent(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target) return false;

    if (target.closest('input, textarea, select, button, audio, video, [contenteditable="true"], [data-file-upload-dropzone]')) {
      return true;
    }

    if (event.type.startsWith('drag') || event.type === 'drop') {
      return true;
    }

    return false;
  }

  ignoreMutation() {
    return true;
  }

  destroy() {
    this.dispose();
  }
}
