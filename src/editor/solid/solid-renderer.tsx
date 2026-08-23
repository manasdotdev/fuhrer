import type { Editor } from '@tiptap/core';
import { type Component, createRoot } from 'solid-js';
import { type SetStoreFunction, createStore } from 'solid-js/store';
import { Dynamic, insert } from 'solid-js/web';

import { getEditorReactiveOwner } from './reactive-owner';

export type SolidRendererOptions<P extends Record<string, unknown>> = {
  editor: Editor;
  props?: P;
  as?: string;
  className?: string;
};

/**
 * Render a Solid component into a detached DOM element.
 * Used by node views, suggestion UIs, and other ProseMirror-owned hosts.
 */
export class SolidRenderer<P extends Record<string, unknown>> {
  id: string;
  editor: Editor;
  element: HTMLElement;
  dispose!: () => void;
  private setProps!: SetStoreFunction<P>;

  constructor(component: Component<P>, { editor, props, as = 'div', className = '' }: SolidRendererOptions<P>) {
    this.id = Math.floor(Math.random() * 0xffffffff).toString(16);
    this.editor = editor;
    this.element = document.createElement(as);
    this.element.classList.add('solid-renderer');

    if (className) {
      this.element.classList.add(...className.split(/\s+/).filter(Boolean));
    }

    createRoot(
      (dispose) => {
        const [reactiveProps, setProps] = createStore<P>({ ...(props ?? {}) } as P);
        this.setProps = setProps;
        this.dispose = dispose;

        insert(this.element, <Dynamic component={component} {...(reactiveProps as P)} />);
      },
      getEditorReactiveOwner(this.editor) ?? undefined,
    );
  }

  updateProps(props: Partial<P>): void {
    this.setProps(props as P);
  }

  destroy(): void {
    this.dispose();
    this.element.remove();
  }
}
