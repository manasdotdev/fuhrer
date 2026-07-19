import { Editor } from '@tiptap/core';
import { createSignal, onCleanup, createEffect, untrack } from 'solid-js';

import type { CreateEditorOptions, EditorAccessor } from './types';

function liveCallbacks(options: () => CreateEditorOptions): CreateEditorOptions {
  return {
    onBeforeCreate: (props) => options().onBeforeCreate?.(props),
    onCreate: (props) => options().onCreate?.(props),
    onMount: (props) => options().onMount?.(props),
    onUnmount: (props) => options().onUnmount?.(props),
    onContentError: (props) => options().onContentError?.(props),
    onUpdate: (props) => options().onUpdate?.(props),
    onSelectionUpdate: (props) => options().onSelectionUpdate?.(props),
    onTransaction: (props) => options().onTransaction?.(props),
    onFocus: (props) => options().onFocus?.(props),
    onBlur: (props) => options().onBlur?.(props),
    onDestroy: (props) => options().onDestroy?.(props),
    onPaste: (e, slice) => options().onPaste?.(e, slice),
    onDrop: (e, slice, moved) => options().onDrop?.(e, slice, moved),
    onDelete: (props) => options().onDelete?.(props),
  };
}

export function createEditor(element: () => HTMLElement | undefined, options: () => CreateEditorOptions): EditorAccessor {
  const [editor, setEditor] = createSignal<Editor | undefined>();

  // Recreate only when the mount element changes. Options are snapshotted at
  // create time (except editable + callbacks, which stay live).
  createEffect(() => {
    const el = element();
    if (!el) return;

    const opts = untrack(options);
    const instance = new Editor({
      element: el,
      ...opts,
      ...liveCallbacks(options),
    });

    setEditor(instance);

    onCleanup(() => {
      instance.destroy();
      setEditor(undefined);
    });
  });

  createEffect(() => {
    const ed = editor();
    const editable = options().editable ?? true;
    if (ed && ed.isEditable !== editable) {
      ed.setEditable(editable);
    }
  });

  return editor;
}
