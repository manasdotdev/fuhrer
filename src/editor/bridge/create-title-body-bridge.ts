import type { Editor } from '@tiptap/core';
import { Selection } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { createSignal } from 'solid-js';

import type { CreateEditorOptions, EditorAccessor } from './types';

function isAtInputEnd(el: HTMLInputElement | HTMLTextAreaElement) {
  return el.selectionStart === el.value.length && el.selectionEnd === el.value.length;
}

function isAtDocStart(view: EditorView) {
  const { selection, doc } = view.state;
  return selection.empty && selection.from === Selection.atStart(doc).from;
}

function openLeadingParagraph(editor: Editor) {
  if (editor.isEmpty) {
    editor.chain().focus('start').run();
    return;
  }

  editor.chain().focus().insertContentAt(0, { type: 'paragraph' }).setTextSelection(1).run();
}

/**
 * Keyboard focus bridge between a title field and the body editor.
 *
 * - Title Enter → blank leading paragraph (shifts existing content down)
 * - Title ArrowDown at end → focus body start
 * - Body ArrowUp at doc start → focus title end
 */
export function createTitleBodyBridge() {
  const [titleEl, setTitleEl] = createSignal<HTMLTextAreaElement | HTMLInputElement>();
  const [editor, setEditor] = createSignal<Editor>();

  const focusTitle = () => {
    const el = titleEl();
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  };

  const focusEditorStart = () => {
    editor()?.chain().focus('start').run();
  };

  const onTitleKeyDown = (e: KeyboardEvent) => {
    const el = e.currentTarget as HTMLTextAreaElement | HTMLInputElement;

    if (e.key === 'Enter') {
      e.preventDefault();
      const ed = editor();
      if (ed) openLeadingParagraph(ed);
      return;
    }

    if (e.key === 'ArrowDown' && isAtInputEnd(el)) {
      e.preventDefault();
      focusEditorStart();
    }
  };

  const handleEditorKeyDown = (view: EditorView, event: KeyboardEvent) => {
    if (event.key !== 'ArrowUp') return false;
    if (!isAtDocStart(view)) return false;

    event.preventDefault();
    focusTitle();
    return true;
  };

  const withEditorOptions = (options: CreateEditorOptions = {}): CreateEditorOptions => {
    const callerHandleKeyDown = options.editorProps?.handleKeyDown;

    return {
      ...options,
      onCreate: (props) => {
        setEditor(props.editor);
        options.onCreate?.(props);
      },
      onDestroy: (props) => {
        setEditor(undefined);
        options.onDestroy?.(props);
      },
      editorProps: {
        ...options.editorProps,
        handleKeyDown: (view, event) => {
          if (handleEditorKeyDown(view, event)) return true;
          return callerHandleKeyDown?.(view, event) ?? false;
        },
      },
    };
  };

  return {
    titleEl,
    setTitleEl,
    onTitleKeyDown,
    editor: editor as EditorAccessor,
    withEditorOptions,
  };
}
