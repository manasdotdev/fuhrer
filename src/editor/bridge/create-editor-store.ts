import type { Editor } from '@tiptap/core';
import { createSignal, createEffect, onCleanup } from 'solid-js';

import type { EditorAccessor } from './types';

export function createEditorStore<T>(editor: EditorAccessor, selector: (editor: Editor) => T): () => T | undefined {
  const [value, setValue] = createSignal<T | undefined>();

  createEffect(() => {
    const ed = editor();
    if (!ed) {
      setValue(undefined);
      return;
    }

    const sync = () => {
      setValue(() => selector(ed));
    };

    sync();
    ed.on('transaction', sync);

    onCleanup(() => {
      ed.off('transaction', sync);
    });
  });

  return value;
}

export function useEditorIsActive(editor: EditorAccessor, name: string, attrs?: Record<string, unknown>): () => boolean | undefined {
  return createEditorStore(editor, (ed) => ed.isActive(name, attrs));
}
