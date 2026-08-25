import { type DecorationWithType, type Editor, NodeView, type NodeViewProps, type NodeViewRenderer, type NodeViewRendererOptions, type NodeViewRendererProps } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Decoration, NodeView as ProseMirrorNodeView } from '@tiptap/pm/view';
import { type Component, createRoot } from 'solid-js';
import { type SetStoreFunction, createStore } from 'solid-js/store';
import { Dynamic, insert } from 'solid-js/web';

import { getEditorReactiveOwner } from './reactive-owner';
import { SolidNodeViewContext, type SolidNodeViewContextValue } from './solid-node-view-context';

export type SolidNodeViewProps = NodeViewProps;

export type SolidNodeViewRendererOptions = NodeViewRendererOptions & {
  /**
   * Custom update gate. Return `false` to tear down and recreate the node view.
   * Call `updateProps` yourself when you want to push store updates manually.
   */
  update?:
    | ((props: {
        oldNode: ProseMirrorNode;
        oldDecorations: readonly Decoration[];
        newNode: ProseMirrorNode;
        newDecorations: readonly Decoration[];
        updateProps: () => void;
      }) => boolean)
    | null;
  /**
   * Tag name for the outer Solid host element.
   */
  as?: string;
  /**
   * Extra class names on the outer host element.
   */
  className?: string;
};

export class SolidNodeView extends NodeView<Component<SolidNodeViewProps>, Editor, SolidNodeViewRendererOptions> {
  rootElement: HTMLElement | null = null;
  contentElement: HTMLElement | null = null;
  private setProps!: SetStoreFunction<SolidNodeViewProps>;
  private disposeRoot!: () => void;

  constructor(component: Component<SolidNodeViewProps>, props: NodeViewRendererProps, options?: Partial<SolidNodeViewRendererOptions>) {
    super(component, props, options);
    this.mountSolid();
  }

  private mountSolid(): void {
    const tagName = this.options.as ?? (this.node.isInline ? 'span' : 'div');

    this.rootElement = document.createElement(tagName);
    this.rootElement.classList.add('solid-renderer', `node-${this.node.type.name}`);

    if (this.options.className) {
      this.rootElement.classList.add(...this.options.className.split(/\s+/).filter(Boolean));
    }

    this.contentElement = this.node.isLeaf ? null : document.createElement(this.options.contentDOMElementTag ?? (this.node.isInline ? 'span' : 'div'));

    if (this.contentElement) {
      // TipTap #1197 — white-space inheritance fix for Chrome/Safari
      this.contentElement.style.whiteSpace = 'inherit';
    }

    createRoot(
      (dispose) => {
        this.disposeRoot = dispose;

        const [store, setProps] = createStore<SolidNodeViewProps>({
          editor: this.editor,
          node: this.node,
          decorations: this.decorations as DecorationWithType[],
          selected: false,
          extension: this.extension,
          getPos: () => this.getPos(),
          updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
          deleteNode: () => this.deleteNode(),
          view: this.view,
          innerDecorations: this.innerDecorations,
          HTMLAttributes: this.HTMLAttributes,
        });
        this.setProps = setProps;

        const onDragStart = this.onDragStart.bind(this);
        const nodeViewContentRef: SolidNodeViewContextValue['nodeViewContentRef'] = (element) => {
          if (element && this.contentElement && element.firstChild !== this.contentElement) {
            element.appendChild(this.contentElement);
          }
        };

        const context: SolidNodeViewContextValue = {
          onDragStart,
          nodeViewContentRef,
        };

        insert(
          this.rootElement!,
          <SolidNodeViewContext.Provider value={context}>
            <Dynamic component={this.component} {...store} />
          </SolidNodeViewContext.Provider>,
        );
      },
      getEditorReactiveOwner(this.editor) ?? undefined,
    );
  }

  override get dom(): HTMLElement {
    if (!this.rootElement?.firstElementChild?.hasAttribute('data-node-view-wrapper')) {
      throw new Error('Please use the NodeViewWrapper component for your node view.');
    }

    return this.rootElement;
  }

  override get contentDOM(): HTMLElement | null {
    if (this.node.isLeaf) {
      return null;
    }

    return this.contentElement;
  }

  update(node: ProseMirrorNode, decorations: DecorationWithType[]): boolean {
    if (typeof this.options.update === 'function') {
      const oldNode = this.node;
      const oldDecorations = this.decorations;

      this.node = node;
      this.decorations = decorations;

      return this.options.update({
        oldNode,
        oldDecorations,
        newNode: node,
        newDecorations: decorations,
        updateProps: () => this.pushProps({ node, decorations }),
      });
    }

    if (node.type !== this.node.type) {
      return false;
    }

    if (node === this.node && this.decorations === decorations) {
      return true;
    }

    this.node = node;
    this.decorations = decorations;
    this.pushProps({ node, decorations });

    return true;
  }

  selectNode(): void {
    this.pushProps({ selected: true });
    this.rootElement?.classList.add('ProseMirror-selectednode');
  }

  deselectNode(): void {
    this.pushProps({ selected: false });
    this.rootElement?.classList.remove('ProseMirror-selectednode');
  }

  destroy(): void {
    this.disposeRoot?.();
    this.contentElement = null;
    this.rootElement = null;
  }

  private pushProps(partial: Partial<SolidNodeViewProps>): void {
    this.setProps(partial as SolidNodeViewProps);
  }
}

/**
 * Create a ProseMirror node view backed by a Solid component.
 *
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views/react
 */
export function SolidNodeViewRenderer(component: Component<SolidNodeViewProps>, options?: Partial<SolidNodeViewRendererOptions>): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    return new SolidNodeView(component, props, options) as unknown as ProseMirrorNodeView;
  };
}
