import type { Editor } from '@tiptap/core';
import { type Component, type JSX, createEffect, createSignal, getOwner, onCleanup, splitProps } from 'solid-js';

import { useOptionalEditorContext } from './editor-context';
import { setEditorReactiveOwner } from './reactive-owner';

export type EditorContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'ref'> & {
  /**
   * Editor instance. Falls back to `EditorProvider` context when omitted.
   */
  editor?: Editor | null | undefined;
  ref?: (el: HTMLDivElement) => void;
};

function isDomElement(value: Editor['options']['element']): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element;
}

/**
 * Adopts a TipTap editor's ProseMirror DOM into a Solid-managed container.
 *
 * Matches `@tiptap/react` `EditorContent`: the editor is created on a detached
 * element, then its view nodes are moved into this component's root.
 *
 * @see https://tiptap.dev/docs/editor/getting-started/install/react
 */
export const EditorContent: Component<EditorContentProps> = (props) => {
  const [local, rest] = splitProps(props, ['editor', 'ref']);
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const contextEditor = useOptionalEditorContext();

  createEffect(() => {
    const editor = local.editor ?? contextEditor?.();
    const element = container();

    if (!editor || editor.isDestroyed || !element) {
      return;
    }

    // Prefer the mount-site owner for node-view context inheritance.
    setEditorReactiveOwner(editor, getOwner());

    const editorElement = editor.options.element;
    if (isDomElement(editorElement) && editorElement !== element && editorElement.parentNode !== element) {
      // Move the existing ProseMirror DOM into the Solid container.
      element.append(...editorElement.childNodes);
      editor.setOptions({ element });
    }

    // Recreate node views under this owner so Solid contexts resolve correctly.
    queueMicrotask(() => {
      if (!editor.isDestroyed) {
        editor.createNodeViews();
      }
    });

    onCleanup(() => {
      if (!editor || editor.isDestroyed) {
        return;
      }

      editor.view.setProps({ nodeViews: {} });

      try {
        const parent = editor.view.dom.parentNode;
        if (!parent) {
          return;
        }

        // Detach into a fresh holder so the editor can remount later.
        const holder = document.createElement('div');
        holder.append(...parent.childNodes);
        editor.setOptions({ element: holder });
      } catch {
        // View may already be torn down during destroy().
      }
    });
  });

  return (
    <div
      {...rest}
      ref={(el) => {
        setContainer(el);
        local.ref?.(el);
      }}
    />
  );
};
